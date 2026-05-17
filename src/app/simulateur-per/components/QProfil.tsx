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
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Quel est votre profil investisseur ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Il détermine le rendement annuel retenu pour votre projection.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PROFILS.map(({ value, label, taux, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              onChange({ profil: value });
              onNext();
            }}
            className={`flex items-start gap-4 p-4 rounded-sm border text-left transition-colors duration-150 ${
              data.profil === value
                ? "border-cervus-gold bg-cervus-gold/5"
                : "border-cervus-cream hover:border-cervus-gold/40"
            }`}
          >
            <div
              className={`w-4 h-4 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                data.profil === value ? "border-cervus-gold" : "border-cervus-cream"
              }`}
            >
              {data.profil === value && <div className="w-2 h-2 rounded-full bg-cervus-gold" />}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-inter text-sm font-medium text-cervus-dark">{label}</span>
                <span className="font-inter text-xs text-cervus-gold bg-cervus-gold/10 px-2 py-0.5 rounded-full">
                  {taux}
                </span>
              </div>
              <span className="font-inter text-xs text-cervus-dark/50">{desc}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onPrev}
        className="self-start font-inter text-sm text-cervus-dark/40 hover:text-cervus-dark/70 transition-colors"
      >
        ← Précédent
      </button>
    </div>
  );
}
