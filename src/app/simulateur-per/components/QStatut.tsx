import { SimulateurData, Statut } from "../types";

const STATUTS: { value: Statut; label: string }[] = [
  { value: "celibataire", label: "Célibataire" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "marie", label: "Marié(e)" },
  { value: "pacse", label: "Pacsé(e)" },
  { value: "parent_isole", label: "Parent isolé" },
];

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
}

export default function QStatut({ data, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Quelle est votre situation familiale ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Elle détermine votre quotient familial et votre imposition.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STATUTS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              onChange({ statut: value });
              onNext();
            }}
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
  );
}
