import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QIdentite({ data, onChange, onNext, onPrev }: Props) {
  const canContinue = data.prenom.trim() !== "" && data.nom.trim() !== "";

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Votre identité
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Pour personnaliser votre rapport.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">Prénom</label>
          <input
            type="text"
            value={data.prenom}
            onChange={(e) => onChange({ prenom: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Votre prénom"
            autoFocus
            className="w-full h-11 border border-cervus-cream rounded-xl bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">Nom de famille</label>
          <input
            type="text"
            value={data.nom}
            onChange={(e) => onChange({ nom: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Votre nom"
            className="w-full h-11 border border-cervus-cream rounded-xl bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
          />
        </div>
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
          disabled={!canContinue}
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
