"use client";

import { useState } from "react";
import {
  SimulateurData,
  ComputedResults,
  SimStep,
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
import Step1Famille from "./Step1Famille";
import Step2Revenus from "./Step2Revenus";
import Step3Projection from "./Step3Projection";
import Step4Contact from "./Step4Contact";
import ResultPage from "./ResultPage";

const CURRENT_YEAR = new Date().getFullYear();

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
  const [step, setStep] = useState<SimStep>(1);
  const [data, setData] = useState<SimulateurData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const computed = compute(data);

  function patch(update: Partial<SimulateurData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, computed }),
      });
    } catch {
      // Non-blocking — show results regardless
    } finally {
      setSubmitting(false);
      setStep("result");
    }
  }

  async function handleSendEmail() {
    setEmailLoading(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, computed }),
      });
      setEmailSent(true);
    } catch {
      // silent
    } finally {
      setEmailLoading(false);
    }
  }

  if (step === "result") {
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

  return (
    <div className="flex flex-col gap-0">
      <StepIndicator current={step as number} />
      {step === 1 && (
        <Step1Famille
          data={data}
          onChange={patch}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Revenus
          data={data}
          computed={computed}
          onChange={patch}
          onNext={() => setStep(3)}
          onPrev={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3Projection
          data={data}
          computed={computed}
          onChange={patch}
          onNext={() => setStep(4)}
          onPrev={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4Contact
          data={data}
          onChange={patch}
          onSubmit={handleSubmit}
          onPrev={() => setStep(3)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
