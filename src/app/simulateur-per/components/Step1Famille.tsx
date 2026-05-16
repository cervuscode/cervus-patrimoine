import { SimulateurData, Statut } from "../types";
import Disclaimer from "./Disclaimer";

interface Props {
  data: SimulateurData;
  onChange: (patch: Partial<SimulateurData>) => void;
  onNext: () => void;
}

const STATUTS: { value: Statut; label: string }[] = [
  { value: "celibataire", label: "Célibataire" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "marie", label: "Marié(e)" },
  { value: "pacse", label: "Pacsé(e)" },
  { value: "parent_isole", label: "Parent isolé" },
];

export default function Step1Famille({ data, onChange, onNext }: Props) {
  const canContinue = data.statut !== "";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Votre situation familiale
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Elle détermine votre quotient familial et votre imposition.
        </p>
      </div>

      {/* Statut marital */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Statut marital
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STATUTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ statut: value })}
              className={`px-4 py-3 rounded-sm border font-inter text-sm text-left transition-colors duration-150 ${
                data.statut === value
                  ? "border-cervus-gold bg-cervus-gold/5 text-cervus-gold"
                  : "border-cervus-cream text-cervus-dark/70 hover:border-cervus-gold/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Nombre d'enfants */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Nombre d&apos;enfants à charge
        </label>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ nbEnfants: n })}
              className={`w-12 h-12 rounded-sm border font-inter text-sm font-medium transition-colors duration-150 ${
                data.nbEnfants === n
                  ? "border-cervus-gold bg-cervus-gold/5 text-cervus-gold"
                  : "border-cervus-cream text-cervus-dark/70 hover:border-cervus-gold/40"
              }`}
            >
              {n === 6 ? "6+" : n}
            </button>
          ))}
        </div>
      </div>

      <Disclaimer />

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="self-end mt-2 px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
      >
        Suivant
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
