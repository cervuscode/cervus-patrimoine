import { SimulateurData } from "../types";

const btn = (selected: boolean) =>
  `flex-1 py-4 rounded-xl border font-inter text-sm font-medium transition-colors duration-150 ${
    selected
      ? "border-cervus-gold bg-[#F5EFE8] text-cervus-gold"
      : "border-cervus-cream bg-white text-cervus-dark/70 hover:border-cervus-gold/40"
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
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Êtes-vous le parent qui a la garde principale ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          La garde principale ouvre droit à la case T et une part entière supplémentaire.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { onChange({ gardeParentale: true }); onNext(); }}
          className={btn(data.gardeParentale === true)}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => { onChange({ gardeParentale: false }); onNext(); }}
          className={btn(data.gardeParentale === false)}
        >
          Non
        </button>
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
