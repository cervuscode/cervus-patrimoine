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
  const anneeValid = annee >= 1950 && annee <= 2000;
  const nAnnees = anneeValid ? Math.max(0, 64 - (CURRENT_YEAR - annee)) : 0;
  const canContinue = anneeValid && nAnnees > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Quelle est votre année de naissance ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Elle détermine le nombre d&apos;années de cotisation jusqu&apos;à vos 64 ans.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="number"
          min={1950}
          max={2000}
          value={data.anneeNaissance}
          onChange={(e) => onChange({ anneeNaissance: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
          placeholder="Ex : 1985"
          autoFocus
          className="w-full h-12 border border-cervus-cream rounded-sm bg-white px-4 font-inter text-base text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
        {anneeValid && nAnnees > 0 && (
          <p className="font-inter text-xs text-cervus-gold">
            {nAnnees} an{nAnnees > 1 ? "s" : ""} de versements jusqu&apos;à vos 64 ans
          </p>
        )}
        {data.anneeNaissance && anneeValid && nAnnees <= 0 && (
          <p className="font-inter text-xs text-red-500">
            Vous avez déjà 64 ans ou plus — la simulation PER ne s&apos;applique pas.
          </p>
        )}
        {data.anneeNaissance && !anneeValid && data.anneeNaissance.length >= 4 && (
          <p className="font-inter text-xs text-red-500">
            Veuillez saisir une année entre 1950 et 2000.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-cervus-dark/40 hover:text-cervus-dark/70 transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
