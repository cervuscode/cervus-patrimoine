"use client";

import { useState } from "react";
import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: (d?: SimulateurData) => void;
  onPrev: () => void;
}

export default function QEmail({ data, onChange, onNext, onPrev }: Props) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const [checking, setChecking] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#";

  async function handleNext() {
    if (!emailValid) return;
    setChecking(true);
    try {
      const res = await fetch("/api/check-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (json.exists) {
        setShowDuplicate(true);
        return;
      }
    } catch {
      // Si l'appel échoue, on laisse passer
    } finally {
      setChecking(false);
    }
    onNext(data);
  }

  if (showDuplicate) {
    return (
      <div className="flex flex-col gap-8 pt-8">
        <div>
          <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-2 leading-tight">
            Vous avez déjà effectué une simulation.
          </h2>
          <p className="font-inter text-sm text-[#555555] leading-relaxed">
            Pour explorer d&apos;autres scénarios personnalisés, échangez directement avec un expert.
          </p>
        </div>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-8 py-4 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-[50px] hover:bg-[#6a5040] transition-colors text-center"
        >
          Parler à un expert →
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-8">
      {/* Badge progression */}
      <div className="inline-flex items-center gap-2 self-start bg-[#795D48]/10 border border-[#795D48]/20 rounded-full px-3 py-1">
        <span className="font-inter text-xs text-[#795D48] font-medium">Vos résultats sont prêts</span>
        <span className="font-inter text-xs text-[#795D48]/60">plus que 1 étape</span>
      </div>

      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Votre adresse email
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Votre rapport complet vous y sera envoyé.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && emailValid && handleNext()}
          placeholder="votre@email.fr"
          autoFocus
          className="w-full h-12 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 font-inter text-base text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
        />
        {data.email && !emailValid && (
          <p className="font-inter text-xs text-red-500">
            Adresse email invalide.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={!emailValid || checking}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-[50px] hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {checking ? "Vérification…" : "Suivant"}
          {!checking && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
