import { SimulateurData } from "../types";

const btnYesNo = (selected: boolean) =>
  `flex-1 py-4 rounded-xl border font-inter text-sm font-medium transition-colors duration-150 ${
    selected
      ? "border-cervus-gold bg-[#F5EFE8] text-cervus-gold"
      : "border-cervus-cream bg-white text-cervus-dark/70 hover:border-cervus-gold/40"
  }`;

function NumberInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-sm font-medium text-cervus-dark/70">{label}</label>
      <span className="font-inter text-xs text-cervus-dark/40">{hint}</span>
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full h-11 border border-cervus-cream rounded-xl bg-white px-4 pr-10 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€</span>
      </div>
    </div>
  );
}

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QAutresRevenus({ data, onChange, onNext, onPrev }: Props) {
  const hasAtLeastOne =
    parseFloat(data.bnc) > 0 || parseFloat(data.bic) > 0 || parseFloat(data.foncier) > 0;

  const canContinue =
    data.autresRevenus === false || (data.autresRevenus === true && hasAtLeastOne);

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Avez-vous d&apos;autres sources de revenus ?
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Revenus fonciers, activité indépendante (BNC/BIC)…
        </p>
      </div>

      {/* Oui / Non */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            onChange({ autresRevenus: true });
          }}
          className={btnYesNo(data.autresRevenus === true)}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => {
            onChange({ autresRevenus: false, bnc: "", bic: "", foncier: "" });
            onNext();
          }}
          className={btnYesNo(data.autresRevenus === false)}
        >
          Non
        </button>
      </div>

      {/* Champs conditionnels */}
      {data.autresRevenus === true && (
        <div className="flex flex-col gap-5 p-5 border border-cervus-cream rounded-xl">
          <NumberInput
            label="BNC — Bénéfice net"
            hint="Après abattement micro-BNC ou bénéfice net réel"
            value={data.bnc}
            onChange={(v) => onChange({ bnc: v })}
          />
          <NumberInput
            label="BIC — Bénéfice net"
            hint="Après abattement micro-BIC ou bénéfice net réel"
            value={data.bic}
            onChange={(v) => onChange({ bic: v })}
          />
          <NumberInput
            label="Foncier — Revenu net"
            hint="Après abattement micro-foncier ou charges déduites"
            value={data.foncier}
            onChange={(v) => onChange({ foncier: v })}
          />
          {!hasAtLeastOne && (
            <p className="font-inter text-xs text-cervus-dark/40 italic">
              Saisissez au moins un montant pour continuer.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-cervus-dark/40 hover:text-cervus-dark/70 transition-colors"
        >
          ← Précédent
        </button>
        {data.autresRevenus === true && (
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
        )}
      </div>
    </div>
  );
}
