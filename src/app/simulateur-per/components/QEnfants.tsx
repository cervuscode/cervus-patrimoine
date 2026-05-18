import { motion } from "framer-motion";
import { SimulateurData } from "../types";

const btn = (selected: boolean) =>
  `w-14 h-14 rounded-xl border font-inter text-sm font-medium transition-colors duration-150 ${
    selected
      ? "border-2 border-[#795D48] bg-[#F5EFE8] text-[#795D48] font-semibold"
      : "border border-[#D4C9BE] bg-[#EDE8E3] text-[#555555] hover:border-[#795D48]/40"
  }`;

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: (n?: number) => void;
  onPrev: () => void;
}

export default function QEnfants({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Combien d&apos;enfants avez-vous à charge ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Le quotient familial réduit votre imposition.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 1.08 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onChange({ nbEnfants: n });
              setTimeout(() => onNext(n), 150);
            }}
            className={btn(data.nbEnfants === n)}
          >
            {n === 6 ? "6+" : n}
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
