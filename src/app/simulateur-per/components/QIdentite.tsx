import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QIdentite({ data, onChange, onNext, onPrev }: Props) {
  const canContinue = data.prenom.trim() !== "" && data.nom.trim() !== "";

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Votre identité
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Pour personnaliser votre rapport.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">Prénom</label>
          <input
            type="text"
            value={data.prenom}
            onChange={(e) => onChange({ prenom: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Votre prénom"
            autoFocus
            className="w-full h-11 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 font-inter text-sm text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">Nom de famille</label>
          <input
            type="text"
            value={data.nom}
            onChange={(e) => onChange({ nom: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Votre nom"
            className="w-full h-11 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 font-inter text-sm text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
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
