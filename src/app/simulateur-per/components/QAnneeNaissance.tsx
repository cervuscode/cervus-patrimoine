import { SimulateurData } from "../types";

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QAnneeNaissance({ data, onChange, onNext, onPrev }: Props) {
  const annee = parseInt(data.anneeNaissance);
  const ageRetraite = parseInt(data.ageRetraite) || 64;
  const anneeValid = annee >= 1940 && annee <= CURRENT_YEAR - 18;
  const nAnnees = anneeValid ? Math.max(0, ageRetraite - (CURRENT_YEAR - annee)) : 0;
  const canContinue = anneeValid && nAnnees > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Quelle est votre année de naissance ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Elle détermine votre horizon de cotisation.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="number"
          min={1940}
          max={CURRENT_YEAR - 18}
          value={data.anneeNaissance}
          onChange={(e) => onChange({ anneeNaissance: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
          placeholder="Ex : 1985"
          autoFocus
          className="w-full h-12 border border-[#E5E0DA] rounded-xl bg-white px-4 font-inter text-base text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
        />
        {canContinue && (
          <p className="font-inter text-xs text-[#795D48]">
            Soit {nAnnees} an{nAnnees > 1 ? "s" : ""} de versements jusqu&apos;à votre retraite
          </p>
        )}
        {data.anneeNaissance && anneeValid && nAnnees <= 0 && (
          <p className="font-inter text-xs text-red-500">
            Vous avez déjà atteint l&apos;âge de retraite — la simulation ne s&apos;applique pas.
          </p>
        )}
        {data.anneeNaissance && !anneeValid && data.anneeNaissance.length >= 4 && (
          <p className="font-inter text-xs text-red-500">
            Veuillez saisir une année valide.
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
          onClick={onNext}
          disabled={!canContinue}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-xl hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
