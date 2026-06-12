"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const earlyContactFired = useRef(false);

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

  // Fiche Brevo anticipée (avant OTP) dès l'arrivée sur l'écran téléphone (step 3),
  // si email saisi et calcul disponible. Mirroir du PER (early-contact).
  useEffect(() => {
    if (step === 3 && !earlyContactFired.current && data.email && computed) {
      earlyContactFired.current = true;
      fetch("/api/early-contact-av", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { ...data, consentementRdv: true, consentementRgpd: true },
          computed,
        }),
      }).catch(() => {});
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  function patch(update: Partial<AVFormData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  function goTo(next: number) {
    setAnimDir(next > step ? 1 : -1);
    setStep(next);
    setAnimKey((k) => k + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/submit-av", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { ...data, consentementRdv: true, consentementRgpd: true },
          computed,
        }),
      });
    } catch {
      // Non bloquant : on affiche les résultats quoi qu'il arrive.
    } finally {
      setSubmitting(false);
      setShowResult(true);
    }
  }

  if (showResult && computed) {
    return <ResultPageAV data={data} computed={computed} />;
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Indicateur d'étape — le libellé n'apparaît qu'une fois l'étape atteinte
          (on ne dévoile pas "Téléphone" d'emblée). Étapes futures : numéro neutre. */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const reached = i <= step;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col gap-1.5 w-full">
                <div
                  className="h-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: reached ? "#795D48" : "#D4C9BE" }}
                />
                <span
                  className={`font-inter text-[10px] uppercase tracking-wide ${
                    i === step ? "text-[#795D48] font-medium" : "text-[#555555]/40"
                  }`}
                >
                  {reached ? label : `Étape ${i + 1}`}
                </span>
              </div>
            </div>
          );
        })}
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
              <QParametresAV data={data} onChange={patch} onNext={() => goTo(1)} />
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
