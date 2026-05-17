import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QEnfants({ data, onChange, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Combien d&apos;enfants avez-vous à charge ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Le quotient familial réduit votre imposition.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              onChange({ nbEnfants: n });
              onNext();
            }}
            className={`w-14 h-14 rounded-sm border font-inter text-sm font-medium transition-colors duration-150 ${
              data.nbEnfants === n
                ? "border-cervus-gold bg-cervus-gold/5 text-cervus-gold"
                : "border-cervus-cream text-cervus-dark/70 hover:border-cervus-gold/40"
            }`}
          >
            {n === 6 ? "6+" : n}
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
