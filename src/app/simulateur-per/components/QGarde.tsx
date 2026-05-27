import { motion } from "framer-motion";
import { SimulateurData } from "../types";

type GardeOption = 'garde_principale' | 'parent_isole' | 'garde_partagee';

const OPTIONS: Array<{ value: GardeOption; label: string; desc: string }> = [
  {
    value: 'garde_principale',
    label: 'Garde principale',
    desc: '+0,5 part par enfant — règle standard',
  },
  {
    value: 'parent_isole',
    label: 'Parent isolé (case T)',
    desc: 'Part entière pour le 1er enfant + avantage fiscal',
  },
  {
    value: 'garde_partagee',
    label: 'Garde partagée',
    desc: '+0,25 part par enfant',
  },
];

const btn = (selected: boolean) =>
  `w-full px-5 py-4 rounded-xl border text-left transition-colors duration-150 ${
    selected
      ? "border-2 border-[#795D48] bg-[#F5EFE8]"
      : "border border-[#D4C9BE] bg-[#EDE8E3] hover:border-[#795D48]/40"
  }`;

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QGarde({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Quelle est votre situation de garde ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Détermine le nombre de parts fiscales pour vos enfants.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            whileTap={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onChange({ gardeParentale: opt.value });
              setTimeout(() => onNext(), 150);
            }}
            className={btn(data.gardeParentale === opt.value)}
          >
            <span className={`font-inter text-sm font-semibold block ${data.gardeParentale === opt.value ? "text-[#795D48]" : "text-[#0f0f0f]"}`}>
              {opt.label}
            </span>
            <span className="font-inter text-xs text-[#555555]/70 mt-0.5 block">
              {opt.desc}
            </span>
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
