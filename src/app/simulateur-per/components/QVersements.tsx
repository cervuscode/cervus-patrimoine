import { SimulateurData, ComputedResults } from "../types";

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QVersements({ data, computed, onChange, onNext, onPrev }: Props) {
  const mensuel = parseFloat(data.versementMensuel);
  const initial = parseFloat(data.versementInitial) || 0;
  const canContinue = mensuel > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Vos versements PER
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Le versement mensuel est obligatoire. L&apos;apport initial est optionnel.
        </p>
      </div>

      {/* Versement initial */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Versement initial (apport unique) — optionnel
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.versementInitial}
            onChange={(e) => onChange({ versementInitial: e.target.value })}
            placeholder="0"
            className="w-full h-11 border border-cervus-cream rounded-xl bg-white px-4 pr-10 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€</span>
        </div>
        {initial > 0 && (
          <p className="font-inter text-xs text-cervus-dark/40">
            Capitalisé sur toute la durée à {(computed.tauxAnnuel * 100).toFixed(0)} %/an
          </p>
        )}
      </div>

      {/* Versement mensuel */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Versement mensuel
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.versementMensuel}
            onChange={(e) => onChange({ versementMensuel: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Ex : 300"
            autoFocus
            className="w-full h-12 border border-cervus-cream rounded-xl bg-white px-4 pr-20 font-inter text-base text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€/mois</span>
        </div>
        {mensuel > 0 && computed.economieFiscale > 0 && (
          <p className="font-inter text-xs text-cervus-gold">
            soit {computed.versementAnnuel.toLocaleString("fr-FR")} €/an — économie fiscale estimée :{" "}
            <strong>{computed.economieFiscale.toLocaleString("fr-FR")} €/an</strong>
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
