import { motion } from "framer-motion";
import { SimulateurData } from "../types";

const btn = (selected: boolean) =>
  `flex-1 py-4 rounded-xl border font-inter text-sm font-medium transition-colors duration-150 ${
    selected
      ? "border-2 border-[#795D48] bg-[#F5EFE8] text-[#795D48] font-semibold"
      : "border border-[#E5E0DA] bg-white text-[#555555] hover:border-[#795D48]/40"
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
          Êtes-vous le parent qui a la garde principale ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          La garde principale ouvre droit à la case T et une part entière supplémentaire.
        </p>
      </div>

      <div className="flex gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 1.03 }}
          transition={{ duration: 0.15 }}
          onClick={() => { onChange({ gardeParentale: true }); setTimeout(() => onNext(), 150); }}
          className={btn(data.gardeParentale === true)}
        >
          Oui
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 1.03 }}
          transition={{ duration: 0.15 }}
          onClick={() => { onChange({ gardeParentale: false }); setTimeout(() => onNext(), 150); }}
          className={btn(data.gardeParentale === false)}
        >
          Non
        </motion.button>
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
