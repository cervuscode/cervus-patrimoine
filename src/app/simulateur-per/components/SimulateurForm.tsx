"use client";

import { useState } from "react";
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
import QRevenus from "./QRevenus";
import QAnneeNaissance from "./QAnneeNaissance";
import QVersement from "./QVersement";
import QProfil from "./QProfil";
import QCoordonnees from "./QCoordonnees";
import QTelephone from "./QTelephone";

const CURRENT_YEAR = new Date().getFullYear();
// Maps each question index (0–7) to its progress step (1–4)
const QUESTION_STEP = [1, 1, 2, 3, 3, 3, 4, 4] as const;

function compute(data: SimulateurData): ComputedResults {
  const { partsBase, partsTotal } =
    data.statut !== ""
      ? calculerParts(data.statut, data.nbEnfants)
      : { partsBase: 1, partsTotal: 1 };

  const revenuImposable = calculerRevenuImposable({
    salaires: parseFloat(data.salaires) || 0,
    abattementSalaires: data.abattementSalaires,
    fraisReels: parseFloat(data.fraisReels) || 0,
    bnc: parseFloat(data.bnc) || 0,
    bic: parseFloat(data.bic) || 0,
    foncier: parseFloat(data.foncier) || 0,
  });

  const tmi = revenuImposable > 0 ? calculerTMI(revenuImposable, partsBase, partsTotal) : 0;
  const annee = parseInt(data.anneeNaissance);
  const nAnnees = annee >= 1950 && annee <= 2000 ? Math.max(0, 64 - (CURRENT_YEAR - annee)) : 0;
  const tauxAnnuel = PROFIL_TAUX[data.profil];
  const versementMensuel = parseFloat(data.versementMensuel) || 0;
  const versementAnnuel = versementMensuel * 12;

  const { capitalFinal, courbe } =
    nAnnees > 0 && versementMensuel > 0
      ? projectionPER(versementMensuel, tauxAnnuel, nAnnees)
      : { capitalFinal: 0, courbe: [] };

  const economieFiscale = economieFiscaleAnnuelle(versementMensuel, tmi);

  return {
    partsBase,
    partsTotal,
    revenuImposable,
    tmi,
    nAnnees,
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
  const [animDir, setAnimDir] = useState<"fwd" | "back">("fwd");
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
    setAnimDir(newQ > qIndex ? "fwd" : "back");
    setQIndex(newQ);
    setAnimKey((k) => k + 1);
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

  async function handleSendEmail() {
    setEmailLoading(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { ...data, consentementRdv: true, consentementRgpd: true },
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
  const animClass = animDir === "fwd" ? "animate-slide-in-up" : "animate-slide-in-down";

  return (
    <div className="flex flex-col gap-0">
      <StepIndicator current={currentStep} />
      <div key={animKey} className={animClass}>
        {qIndex === 0 && (
          <QStatut data={data} onChange={patch} onNext={() => goTo(1)} />
        )}
        {qIndex === 1 && (
          <QEnfants data={data} onChange={patch} onNext={() => goTo(2)} onPrev={() => goTo(0)} />
        )}
        {qIndex === 2 && (
          <QRevenus data={data} computed={computed} onChange={patch} onNext={() => goTo(3)} onPrev={() => goTo(1)} />
        )}
        {qIndex === 3 && (
          <QAnneeNaissance data={data} onChange={patch} onNext={() => goTo(4)} onPrev={() => goTo(2)} />
        )}
        {qIndex === 4 && (
          <QVersement data={data} computed={computed} onChange={patch} onNext={() => goTo(5)} onPrev={() => goTo(3)} />
        )}
        {qIndex === 5 && (
          <QProfil data={data} onChange={patch} onNext={() => goTo(6)} onPrev={() => goTo(4)} />
        )}
        {qIndex === 6 && (
          <QCoordonnees data={data} onChange={patch} onNext={() => goTo(7)} onPrev={() => goTo(5)} />
        )}
        {qIndex === 7 && (
          <QTelephone
            data={data}
            onChange={patch}
            onPrev={() => goTo(6)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
