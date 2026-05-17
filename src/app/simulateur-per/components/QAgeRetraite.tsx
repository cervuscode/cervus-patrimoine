import { SimulateurData } from "../types";

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QAgeRetraite({ data, onChange, onNext, onPrev }: Props) {
  const age = parseInt(data.ageRetraite);
  const annee = parseInt(data.anneeNaissance);
  const ageValid = age >= 55 && age <= 75;
  const nAnnees = ageValid && annee ? Math.max(0, age - (CURRENT_YEAR - annee)) : 0;
  const canContinue = ageValid && nAnnees > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          À quel âge envisagez-vous de partir à la retraite ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          L&apos;âge légal est 64 ans, mais vous pouvez partir plus tôt ou plus tard.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="number"
          min={55}
          max={75}
          value={data.ageRetraite}
          onChange={(e) => onChange({ ageRetraite: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
          autoFocus
          className="w-full h-12 border border-cervus-cream rounded-xl bg-white px-4 font-inter text-base text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
        {canContinue && (
          <p className="font-inter text-xs text-cervus-gold">
            Soit {nAnnees} an{nAnnees > 1 ? "s" : ""} de versements jusqu&apos;à votre retraite
          </p>
        )}
        {data.ageRetraite && !ageValid && (
          <p className="font-inter text-xs text-red-500">
            Saisissez un âge entre 55 et 75 ans.
          </p>
        )}
        {ageValid && nAnnees <= 0 && (
          <p className="font-inter text-xs text-red-500">
            L&apos;âge de départ est déjà atteint — la simulation ne s&apos;applique pas.
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
          className="px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded-xl hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
