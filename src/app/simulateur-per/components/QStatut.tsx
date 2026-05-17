import { SimulateurData, Statut } from "../types";

// Célibataire et Divorcé déclenchent la question de garde si enfants > 0
const STATUTS: { value: Statut; label: string }[] = [
  { value: "celibataire", label: "Célibataire" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "marie", label: "Marié(e)" },
  { value: "pacse", label: "Pacsé(e)" },
];

const btn = (selected: boolean) =>
  `px-4 py-3 rounded-xl border font-inter text-sm text-left transition-colors duration-150 ${
    selected
      ? "border-cervus-gold bg-[#F5EFE8] text-cervus-gold"
      : "border-cervus-cream bg-white text-cervus-dark/70 hover:border-cervus-gold/40"
  }`;

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

      <div className="grid grid-cols-2 gap-3">
        {STATUTS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              onChange({ statut: value });
              onNext();
            }}
            className={btn(data.statut === value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
