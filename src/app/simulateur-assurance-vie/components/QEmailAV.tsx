"use client";

import { AVFormData } from "../types";

interface Props {
  data: AVFormData;
  onChange: (p: Partial<AVFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QEmailAV({ data, onChange, onNext, onPrev }: Props) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  function handleNext() {
    if (!emailValid) return;
    // TODO (étape 3) : appeler POST /api/check-contact { email } PAR PRODUIT (AV)
    // pour détecter un doublon de simulation AV (sans bloquer une simu PER existante),
    // et afficher l'écran "déjà effectué" si nécessaire.
    onNext();
  }

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="inline-flex items-center gap-2 self-start bg-[#795D48]/10 border border-[#795D48]/20 rounded-full px-3 py-1">
        <span className="font-inter text-xs text-[#795D48] font-medium">Vos résultats sont prêts</span>
        <span className="font-inter text-xs text-[#795D48]/60">plus que 1 étape</span>
      </div>

      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Votre adresse email
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Votre rapport d&apos;assurance-vie vous y sera envoyé.
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
          <p className="font-inter text-xs text-red-500">Adresse email invalide.</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onPrev} className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors">
          ← Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={!emailValid}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-[50px] hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Suivant
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
