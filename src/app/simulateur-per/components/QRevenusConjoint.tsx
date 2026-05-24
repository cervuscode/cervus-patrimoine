import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QRevenusConjoint({ data, onChange, onNext, onPrev }: Props) {
  const montant = parseFloat(data.revenusConjoint);
  const isValid = !data.revenusConjoint || montant >= 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Revenu net mensuel de votre conjoint(e) ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Optionnel — permet d&apos;affiner le calcul du foyer fiscal. Laissez vide si non applicable.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.revenusConjoint}
            onChange={(e) => onChange({ revenusConjoint: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && isValid && onNext()}
            placeholder="Ex : 2 500"
            autoFocus
            className="w-full h-12 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 pr-10 font-inter text-base text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-[#555555]/40">€/mois</span>
        </div>
        {montant > 0 && (
          <p className="font-inter text-xs text-[#795D48]">
            soit {(montant * 12).toLocaleString("fr-FR")} €/an ajoutés au foyer fiscal
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-[50px] hover:bg-[#6a5040] transition-colors flex items-center gap-2"
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
