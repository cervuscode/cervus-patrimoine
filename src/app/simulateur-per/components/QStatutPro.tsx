"use client";

import { motion } from "framer-motion";
import { SimulateurData, StatutPro } from "../types";

const OPTIONS: { value: StatutPro; label: string }[] = [
  { value: "salarie",       label: "Salarié" },
  { value: "fonctionnaire", label: "Fonctionnaire" },
  { value: "independant",   label: "Indépendant" },
  { value: "liberal",       label: "Profession libérale" },
];

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QStatutPro({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Quel est votre statut professionnel ?
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ value, label }) => (
          <motion.button
            key={value}
            type="button"
            whileTap={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onChange({ statutPro: value });
              setTimeout(() => onNext(), 150);
            }}
            className={`w-full p-4 rounded-xl border text-left font-inter text-sm font-medium transition-colors duration-150 ${
              data.statutPro === value
                ? "border-2 border-[#795D48] bg-[#F5EFE8] text-[#795D48]"
                : "border border-[#D4C9BE] bg-[#EDE8E3] text-[#0f0f0f] hover:border-[#795D48]/40"
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <button
        onClick={onPrev}
        className="self-start font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors"
      >
        ← Précédent
      </button>
    </div>
  );
}
