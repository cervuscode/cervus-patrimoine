"use client";

// Contrôles partagés des vues de présentation (Lot F).
// Identité = lecture seule (chips) ; Hypothèses = éditables en direct.

export function IdentityChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 px-4 py-2">
      <p className="text-[11px] uppercase tracking-wider text-cervus-bronze/50">{label}</p>
      <p className="font-cormorant text-xl text-cervus-bronze">{value}</p>
    </div>
  );
}

export function HypoNumber({
  label,
  value,
  onChange,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: string;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-cervus-gold-light">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step={step ?? "1"}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const n = parseFloat(e.target.value.replace(",", "."));
            onChange(Number.isFinite(n) ? n : 0);
          }}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-lg border border-cervus-gold/40 bg-cervus-dark/60 px-3 py-2.5 text-base text-cervus-bronze focus:border-cervus-gold focus:outline-none"
        />
        {suffix && <span className="text-sm text-cervus-bronze/50">{suffix}</span>}
      </div>
    </label>
  );
}

export function HypoPills<T extends string>({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  active: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-cervus-gold-light">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            onClick={() => onSelect(o.value)}
            className={`flex-1 rounded-[50px] border px-3 py-2 text-xs font-medium transition-colors ${
              active === o.value
                ? "border-cervus-gold bg-cervus-gold text-cervus-bronze"
                : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
            } disabled:cursor-not-allowed disabled:opacity-30`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BigResult({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 ${
        highlight ? "border-cervus-gold/60 bg-cervus-gold/10" : "border-cervus-gold/25 bg-cervus-dark/40"
      }`}
    >
      <p className="text-sm text-cervus-bronze/60">{label}</p>
      <p className="mt-2 font-cormorant text-3xl font-semibold text-cervus-bronze sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
