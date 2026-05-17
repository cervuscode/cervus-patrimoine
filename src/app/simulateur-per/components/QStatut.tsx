import { motion } from "framer-motion";
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
      ? "border-2 border-[#795D48] bg-[#F5EFE8] text-[#795D48] font-semibold"
      : "border border-[#E5E0DA] bg-white text-[#555555] hover:border-[#795D48]/40"
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
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Quelle est votre situation familiale ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Elle détermine votre quotient familial et votre imposition.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STATUTS.map(({ value, label }) => (
          <motion.button
            key={value}
            type="button"
            whileTap={{ scale: 1.03 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onChange({ statut: value });
              setTimeout(() => onNext(), 150);
            }}
            className={btn(data.statut === value)}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
