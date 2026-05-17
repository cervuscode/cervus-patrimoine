import { motion } from "framer-motion";
import { SimulateurData, Profil } from "../types";

const PROFILS: { value: Profil; label: string; taux: string; desc: string }[] = [
  {
    value: "prudent",
    label: "Prudent",
    taux: "3 %/an",
    desc: "Fonds euros et obligations — capital sécurisé, rendement stable",
  },
  {
    value: "equilibre",
    label: "Équilibré",
    taux: "4 %/an",
    desc: "Mix fonds euros et UC — rendement modéré, risque limité",
  },
  {
    value: "dynamique",
    label: "Dynamique",
    taux: "5 %/an",
    desc: "Majoritairement en actions (ETF) — potentiel élevé, risque important",
  },
];

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QProfil({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Quel est votre profil investisseur ?
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Il détermine le rendement annuel retenu pour votre projection.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PROFILS.map(({ value, label, taux, desc }) => (
          <motion.button
            key={value}
            type="button"
            whileTap={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onChange({ profil: value });
              setTimeout(() => onNext(), 150);
            }}
            className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-colors duration-150 ${
              data.profil === value
                ? "border-2 border-[#795D48] bg-[#F5EFE8]"
                : "border border-[#E5E0DA] bg-white hover:border-[#795D48]/40"
            }`}
          >
            <div
              className={`w-4 h-4 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                data.profil === value ? "border-[#795D48]" : "border-[#E5E0DA]"
              }`}
            >
              {data.profil === value && <div className="w-2 h-2 rounded-full bg-[#795D48]" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className={`font-inter text-sm font-medium ${data.profil === value ? "text-[#795D48] font-semibold" : "text-[#0f0f0f]"}`}>{label}</span>
                <span className="font-inter text-xs text-[#795D48] bg-[#795D48]/10 px-2 py-0.5 rounded-full">
                  {taux}
                </span>
              </div>
              <span className="font-inter text-xs text-[#555555]">{desc}</span>
            </div>
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
