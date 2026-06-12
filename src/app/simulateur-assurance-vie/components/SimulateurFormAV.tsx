"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AVFormData, AV_INITIAL } from "../types";
import { calculerAV, AVComputed, AVInput } from "@/lib/av-engine";
import QParametresAV from "./QParametresAV";
import QIdentiteAV from "./QIdentiteAV";
import QEmailAV from "./QEmailAV";
import QTelephoneAV from "./QTelephoneAV";
import ResultPageAV from "./ResultPageAV";

const STEP_LABELS = ["Paramètres", "Coordonnées", "Email", "Téléphone"];

export default function SimulateurFormAV() {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [animDir, setAnimDir] = useState<1 | -1>(1);
  const [data, setData] = useState<AVFormData>(AV_INITIAL);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Calcul live via le moteur validé, dès que les paramètres sont suffisants.
  const computed: AVComputed | null = useMemo(() => {
    const initial = parseFloat(data.versementInitial) || 0;
    const mensuel = parseFloat(data.versementMensuel) || 0;
    if ((initial <= 0 && mensuel <= 0) || data.marie === null || data.dureeAnnees <= 0) {
      return null;
    }
    const input: AVInput = {
      versementInitial: initial,
      versementMensuel: mensuel,
      dureeAnnees: data.dureeAnnees,
      profil: data.profil,
      marie: data.marie,
    };
    return calculerAV(input);
  }, [data]);

  function patch(update: Partial<AVFormData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  function goTo(next: number) {
    setAnimDir(next > step ? 1 : -1);
    setStep(next);
    setAnimKey((k) => k + 1);
  }

  function handleSubmit() {
    setSubmitting(true);
    // TODO (étape 3) : POST /api/submit-av (ou /api/submit avec produit="AV")
    //   → Brevo (attributs AV dédiés), webhook Make (produit=AV), syncPipedrive(..., "AV").
    //   + early-contact AV à l'arrivée sur l'écran téléphone.
    // Pour l'instant : on affiche directement les résultats (front complet, sans CRM).
    setTimeout(() => {
      setSubmitting(false);
      setShowResult(true);
    }, 350);
  }

  if (showResult && computed) {
    return <ResultPageAV data={data} computed={computed} />;
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Indicateur d'étape */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col gap-1.5 w-full">
              <div
                className="h-1 rounded-full transition-colors duration-300"
                style={{ backgroundColor: i <= step ? "#795D48" : "#D4C9BE" }}
              />
              <span
                className={`font-inter text-[10px] uppercase tracking-wide ${
                  i === step ? "text-[#795D48] font-medium" : "text-[#555555]/40"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={animKey}
            initial={{ x: animDir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: animDir * -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ willChange: "transform, opacity" }}
          >
            {step === 0 && (
              <QParametresAV data={data} computed={computed} onChange={patch} onNext={() => goTo(1)} />
            )}
            {step === 1 && (
              <QIdentiteAV data={data} onChange={patch} onNext={() => goTo(2)} onPrev={() => goTo(0)} />
            )}
            {step === 2 && (
              <QEmailAV data={data} onChange={patch} onNext={() => goTo(3)} onPrev={() => goTo(1)} />
            )}
            {step === 3 && (
              <QTelephoneAV
                data={data}
                onChange={patch}
                onPrev={() => goTo(2)}
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
