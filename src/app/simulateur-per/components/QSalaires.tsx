import { SimulateurData } from "../types";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QSalaires({ data, onChange, onNext, onPrev }: Props) {
  const montant = parseFloat(data.salaireMensuel);
  const canContinue = montant > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Quel est votre salaire net mensuel ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Montant net avant impôt, hors primes exceptionnelles. On l&apos;annualise automatiquement (× 12).
        </p>
      </div>

      {/* Montant mensuel */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.salaireMensuel}
            onChange={(e) => onChange({ salaireMensuel: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Ex : 3 500"
            autoFocus
            className="w-full h-12 border border-cervus-cream rounded-xl bg-white px-4 pr-10 font-inter text-base text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€/mois</span>
        </div>
        {montant > 0 && (
          <p className="font-inter text-xs text-cervus-gold">
            soit {(montant * 12).toLocaleString("fr-FR")} €/an retenus pour le calcul
          </p>
        )}
      </div>

      {/* Abattement */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onChange({ abattementSalaires: data.abattementSalaires === "forfait10" ? "fraisReels" : "forfait10", fraisReels: "" })}
            className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
              data.abattementSalaires === "forfait10"
                ? "border-cervus-gold bg-cervus-gold"
                : "border-cervus-cream hover:border-cervus-gold/40"
            }`}
          >
            {data.abattementSalaires === "forfait10" && (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="font-inter text-sm text-cervus-dark/70">
            Abattement forfaitaire 10 % (salarié standard)
          </span>
        </div>

        {data.abattementSalaires === "fraisReels" && (
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
              Frais réels annuels (€)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={data.fraisReels}
                onChange={(e) => onChange({ fraisReels: e.target.value })}
                placeholder="Ex : 3 500"
                className="w-full h-11 border border-cervus-cream rounded-xl bg-white px-4 pr-10 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
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
