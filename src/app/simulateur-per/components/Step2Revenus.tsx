import { SimulateurData } from "../types";
import { ComputedResults } from "../types";
import Disclaimer from "./Disclaimer";

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
  onChange: (patch: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TMI_COLORS: Record<number, string> = {
  0: "bg-cervus-cream text-cervus-dark/60",
  11: "bg-amber-50 text-amber-700 border border-amber-200",
  30: "bg-orange-50 text-orange-700 border border-orange-200",
  41: "bg-red-50 text-red-700 border border-red-200",
  45: "bg-red-100 text-red-800 border border-red-200",
};

function NumberInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-sm text-cervus-dark/70">{label}</label>
      {hint && <span className="font-inter text-xs text-cervus-dark/40">{hint}</span>}
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="w-full h-11 border border-cervus-cream rounded-sm bg-white px-4 pr-10 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€</span>
      </div>
    </div>
  );
}

export default function Step2Revenus({ data, computed, onChange, onNext, onPrev }: Props) {
  const hasRevenu =
    parseFloat(data.salaires) > 0 ||
    parseFloat(data.bnc) > 0 ||
    parseFloat(data.bic) > 0 ||
    parseFloat(data.foncier) > 0;

  const tmiColor = TMI_COLORS[computed.tmi] ?? TMI_COLORS[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
            Vos revenus
          </h2>
          <p className="font-inter text-sm text-cervus-dark/50">
            Saisissez une ou plusieurs sources. Les montants sont cumulables.
          </p>
        </div>
        {/* TMI badge */}
        {hasRevenu && (
          <div className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-sm font-inter ${tmiColor}`}>
            <span className="text-[10px] uppercase tracking-wider opacity-70">TMI</span>
            <span className="text-2xl font-semibold leading-tight">{computed.tmi}%</span>
          </div>
        )}
      </div>

      {/* Salaires */}
      <div className="flex flex-col gap-4 p-5 border border-cervus-cream rounded-sm">
        <p className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">Salaires</p>
        <NumberInput
          label="Salaire net avant impôt"
          value={data.salaires}
          onChange={(v) => onChange({ salaires: v })}
          placeholder="Ex : 55 000"
        />
        {parseFloat(data.salaires) > 0 && (
          <div className="flex flex-col gap-3">
            <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
              Abattement
            </label>
            <div className="flex gap-3">
              {[
                { value: "forfait10" as const, label: "Forfait 10 %" },
                { value: "fraisReels" as const, label: "Frais réels" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ abattementSalaires: value })}
                  className={`flex-1 py-2.5 rounded-sm border font-inter text-sm transition-colors ${
                    data.abattementSalaires === value
                      ? "border-cervus-gold bg-cervus-gold/5 text-cervus-gold"
                      : "border-cervus-cream text-cervus-dark/70 hover:border-cervus-gold/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {data.abattementSalaires === "fraisReels" && (
              <NumberInput
                label="Frais réels (€)"
                value={data.fraisReels}
                onChange={(v) => onChange({ fraisReels: v })}
                placeholder="Ex : 3 500"
              />
            )}
          </div>
        )}
      </div>

      {/* BNC */}
      <div className="flex flex-col gap-3 p-5 border border-cervus-cream rounded-sm">
        <p className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">BNC</p>
        <NumberInput
          label="Bénéfice net"
          hint="Après abattement micro-BNC ou bénéfice net réel"
          value={data.bnc}
          onChange={(v) => onChange({ bnc: v })}
        />
      </div>

      {/* BIC */}
      <div className="flex flex-col gap-3 p-5 border border-cervus-cream rounded-sm">
        <p className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">BIC</p>
        <NumberInput
          label="Bénéfice net"
          hint="Après abattement micro-BIC ou bénéfice net réel"
          value={data.bic}
          onChange={(v) => onChange({ bic: v })}
        />
      </div>

      {/* Foncier */}
      <div className="flex flex-col gap-3 p-5 border border-cervus-cream rounded-sm">
        <p className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">Revenus fonciers</p>
        <NumberInput
          label="Revenu net"
          hint="Après abattement micro-foncier ou charges déduites"
          value={data.foncier}
          onChange={(v) => onChange({ foncier: v })}
        />
      </div>

      {/* Revenu global recap */}
      {hasRevenu && (
        <div className="flex justify-between items-center p-4 bg-cervus-cream/50 rounded-sm border border-cervus-cream">
          <span className="font-inter text-sm text-cervus-dark/60">Revenu global imposable</span>
          <span className="font-cormorant text-xl font-semibold text-cervus-dark">
            {computed.revenuImposable.toLocaleString("fr-FR")} €
          </span>
        </div>
      )}

      <Disclaimer />

      <div className="flex justify-between mt-2">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-cervus-cream text-cervus-dark/60 font-inter text-sm rounded hover:border-cervus-gold/40 transition-colors"
        >
          Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!hasRevenu}
          className="px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
