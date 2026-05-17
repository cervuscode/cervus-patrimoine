import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QEmail({ data, onChange, onNext, onPrev }: Props) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Votre adresse email
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Votre rapport complet vous y sera envoyé.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && emailValid && onNext()}
          placeholder="votre@email.fr"
          autoFocus
          className="w-full h-12 border border-cervus-cream rounded-xl bg-white px-4 font-inter text-base text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
        {data.email && !emailValid && (
          <p className="font-inter text-xs text-red-500">
            Adresse email invalide.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-cervus-dark/40 hover:text-cervus-dark/70 transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!emailValid}
          className="px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded-xl hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Suivant
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
