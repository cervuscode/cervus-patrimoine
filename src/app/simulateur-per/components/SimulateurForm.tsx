"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SimulateurData,
  ComputedResults,
  INITIAL_DATA,
  PROFIL_TAUX,
} from "../types";
import {
  calculerParts,
  calculerRevenuImposable,
  calculerTMI,
  projectionPER,
  economieFiscaleAnnuelle,
} from "@/lib/fiscal-engine";
import StepIndicator from "./StepIndicator";
import ResultPage from "./ResultPage";
import QStatut from "./QStatut";
import QEnfants from "./QEnfants";
import QGarde from "./QGarde";
import QSalaires from "./QSalaires";
import QAutresRevenus from "./QAutresRevenus";
import QAnneeNaissance from "./QAnneeNaissance";
import QAgeRetraite from "./QAgeRetraite";
import QVersements from "./QVersements";
import QProfil from "./QProfil";
import QObjectif from "./QObjectif";
import QStatutPro from "./QStatutPro";
import QLoading from "./QLoading";
import QIdentite from "./QIdentite";
import QEmail from "./QEmail";
import QTelephone from "./QTelephone";

// Q0  Statut              → step 1
// Q1  Enfants             → step 1
// Q2  Garde (conditional) → step 1
// Q3  Salaires            → step 2
// Q4  Autres revenus      → step 2
// Q5  Année naissance     → step 3
// Q6  Âge retraite        → step 3
// Q7  Versements          → step 3
// Q8  Profil              → step 3
// Q9  Objectif            → step 4
// Q10 Statut pro          → step 4
// Q11 Identité            → step 4
// Q12 Email               → step 4
// Q13 Téléphone + OTP     → step 4
const QUESTION_STEP = [1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4] as const;
const CURRENT_YEAR = new Date().getFullYear();

// Détermine le statut fiscal effectif (intègre la garde parentale)
function effectiveStatut(data: SimulateurData) {
  if (
    (data.statut === "celibataire" || data.statut === "divorce") &&
    data.nbEnfants > 0 &&
    data.gardeParentale === true
  ) {
    return "parent_isole" as const;
  }
  return data.statut as Exclude<typeof data.statut, "">;
}

function compute(data: SimulateurData): ComputedResults {
  const statut = effectiveStatut(data);
  const { partsBase, partsTotal } =
    statut ? calculerParts(statut, data.nbEnfants) : { partsBase: 1, partsTotal: 1 };

  const revenuImposable = calculerRevenuImposable({
    salaires: (parseFloat(data.salaireMensuel) || 0) * 12,
    abattementSalaires: data.abattementSalaires,
    fraisReels: parseFloat(data.fraisReels) || 0,
    bnc: parseFloat(data.bnc) || 0,
    bic: parseFloat(data.bic) || 0,
    foncier: parseFloat(data.foncier) || 0,
  });

  const tmi = revenuImposable > 0 ? calculerTMI(revenuImposable, partsBase, partsTotal) : 0;

  const annee = parseInt(data.anneeNaissance);
  const ageRetraiteNum = parseInt(data.ageRetraite) || 64;
  const nAnnees =
    annee >= 1940 && annee <= CURRENT_YEAR - 18
      ? Math.max(0, ageRetraiteNum - (CURRENT_YEAR - annee))
      : 0;

  const tauxAnnuel = PROFIL_TAUX[data.profil];
  const versementMensuel = parseFloat(data.versementMensuel) || 0;
  const versementInitial = parseFloat(data.versementInitial) || 0;
  const versementAnnuel = versementMensuel * 12;

  const { capitalFinal, courbe } =
    nAnnees > 0 && versementMensuel > 0
      ? projectionPER(versementMensuel, tauxAnnuel, nAnnees, versementInitial)
      : { capitalFinal: 0, courbe: [] };

  const economieFiscale = economieFiscaleAnnuelle(versementMensuel, tmi);

  return {
    partsBase,
    partsTotal,
    revenuImposable,
    tmi,
    nAnnees,
    ageRetraiteNum,
    tauxAnnuel,
    capitalFinal,
    courbe,
    economieFiscale,
    versementAnnuel,
  };
}

export default function SimulateurForm() {
  const [qIndex, setQIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState<1 | -1>(1);
  const [data, setData] = useState<SimulateurData>(INITIAL_DATA);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const computed = compute(data);

  function patch(update: Partial<SimulateurData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  function goTo(newQ: number) {
    setAnimDir(newQ > qIndex ? 1 : -1);
    setQIndex(newQ);
    setAnimKey((k) => k + 1);
  }

  // Avance depuis Q1 (enfants) : sauter Q2 (garde) si marié/pacsé ou nbEnfants === 0
  function afterEnfants(nbEnfants: number) {
    const needsGarde =
      (data.statut === "celibataire" || data.statut === "divorce") && nbEnfants > 0;
    goTo(needsGarde ? 2 : 3);
  }

  // Retour depuis Q3 (salaires) : revenir à Q2 ou Q1 selon le cas
  function prevFromSalaires() {
    const needsGarde =
      (data.statut === "celibataire" || data.statut === "divorce") && data.nbEnfants > 0;
    goTo(needsGarde ? 2 : 1);
  }

  // Crée une fiche Brevo anticipée dès validation de l'email (avant OTP)
  function triggerEarlyContact(currentData: SimulateurData) {
    const snap = compute(currentData);
    fetch("/api/early-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { ...currentData, consentementRdv: true, consentementRgpd: true },
        computed: snap,
      }),
    }).catch(() => {});
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { ...data, consentementRdv: true, consentementRgpd: true },
          computed,
        }),
      });
    } catch {
      // Non-blocking — show results regardless
    } finally {
      setSubmitting(false);
      setShowResult(true);
    }
  }

  async function handleSendEmail(altEmail?: string) {
    setEmailLoading(true);
    const targetData = altEmail ? { ...data, email: altEmail } : data;
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { ...targetData, consentementRdv: true, consentementRgpd: true },
          computed,
        }),
      });
      setEmailSent(true);
    } catch {
      // silent
    } finally {
      setEmailLoading(false);
    }
  }

  if (showResult) {
    return (
      <ResultPage
        data={data}
        computed={computed}
        onSendEmail={handleSendEmail}
        emailSent={emailSent}
        emailLoading={emailLoading}
      />
    );
  }

  const currentStep = QUESTION_STEP[qIndex];

  return (
    <div className="flex flex-col gap-0">
      <StepIndicator current={currentStep} />
      <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animKey}
        initial={{ x: `${animDir * 60}px`, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: `${animDir * -60}px`, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {qIndex === 0 && (
          <QStatut data={data} onChange={patch} onNext={() => goTo(1)} />
        )}
        {qIndex === 1 && (
          <QEnfants
            data={data}
            onChange={patch}
            onNext={(n) => afterEnfants(n ?? data.nbEnfants)}
            onPrev={() => goTo(0)}
          />
        )}
        {qIndex === 2 && (
          <QGarde data={data} onChange={patch} onNext={() => goTo(3)} onPrev={() => goTo(1)} />
        )}
        {qIndex === 3 && (
          <QSalaires data={data} onChange={patch} onNext={() => goTo(4)} onPrev={prevFromSalaires} />
        )}
        {qIndex === 4 && (
          <QAutresRevenus data={data} onChange={patch} onNext={() => goTo(5)} onPrev={() => goTo(3)} />
        )}
        {qIndex === 5 && (
          <QAnneeNaissance data={data} onChange={patch} onNext={() => goTo(6)} onPrev={() => goTo(4)} />
        )}
        {qIndex === 6 && (
          <QAgeRetraite data={data} onChange={patch} onNext={() => goTo(7)} onPrev={() => goTo(5)} />
        )}
        {qIndex === 7 && (
          <QVersements data={data} computed={computed} onChange={patch} onNext={() => goTo(8)} onPrev={() => goTo(6)} />
        )}
        {qIndex === 8 && (
          <QProfil data={data} onChange={patch} onNext={() => goTo(9)} onPrev={() => goTo(7)} />
        )}
        {qIndex === 9 && (
          <QObjectif data={data} onChange={patch} onNext={() => goTo(10)} onPrev={() => goTo(8)} />
        )}
        {qIndex === 10 && (
          <QStatutPro data={data} onChange={patch} onNext={() => goTo(11)} onPrev={() => goTo(9)} />
        )}
        {qIndex === 11 && (
          <QLoading onNext={() => goTo(12)} />
        )}
        {qIndex === 12 && (
          <QIdentite data={data} onChange={patch} onNext={() => goTo(13)} onPrev={() => goTo(10)} />
        )}
        {qIndex === 13 && (
          <QEmail
            data={data}
            onChange={patch}
            onNext={(d) => {
              triggerEarlyContact(d ?? data);
              goTo(14);
            }}
            onPrev={() => goTo(12)}
          />
        )}
        {qIndex === 14 && (
          <QTelephone
            data={data}
            onChange={patch}
            onPrev={() => goTo(13)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
