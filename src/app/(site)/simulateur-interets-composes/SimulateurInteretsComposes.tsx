"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  calculerInteretsComposes,
  type Fiscalite,
  type Frequence,
} from "@/lib/interets-composes";

// ── Formatage € (espace fine insécable comme séparateur de milliers) ───────────
function fmtEur(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}

// ── Slider avec saisie manuelle au clic sur la valeur ──────────────────────────
// Tous les paramètres réutilisent ce composant : la valeur affichée à droite du
// libellé est cliquable → devient un <input> éditable, puis le slider se cale.
interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  format?: (v: number) => string;
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  format,
}: SliderInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const commit = () => {
    const parsed = parseFloat(draft.replace(",", ".").replace(/\s/g, ""));
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
    setEditing(false);
  };

  const display = format ? format(value) : `${value}${suffix ?? ""}`;
  // Position de la pastille (%) pour styliser la piste remplie.
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="font-inter text-sm text-cervus-dark/70">{label}</label>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-28 text-right font-inter text-sm font-semibold text-[#5D4738] bg-white border border-[#795D48]/40 rounded-[10px] px-2 py-1 outline-none focus:border-[#795D48]"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            title="Cliquez pour saisir une valeur"
            className="font-inter text-sm font-semibold text-[#5D4738] px-2 py-1 rounded-[10px] hover:bg-[#795D48]/10 transition-colors tabular-nums"
          >
            {display}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="cervus-range w-full"
        style={{
          background: `linear-gradient(to right, #795D48 0%, #795D48 ${pct}%, #E4DACE ${pct}%, #E4DACE 100%)`,
        }}
      />
    </div>
  );
}

// ── Sélecteur de pilules exclusives ────────────────────────────────────────────
interface PillGroupProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}
function PillGroup<T extends string>({
  value,
  onChange,
  options,
}: PillGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-[50px] font-inter text-sm transition-colors border-[1.5px] ${
              active
                ? "bg-[#795D48] border-[#795D48] text-white"
                : "bg-transparent border-[#795D48]/30 text-cervus-dark/70 hover:border-[#795D48]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SimulateurInteretsComposes() {
  const [capitalInitial, setCapitalInitial] = useState(10000);
  const [versementPeriodique, setVersementPeriodique] = useState(200);
  const [frequence, setFrequence] = useState<Frequence>("mensuel");
  const [tauxAnnuel, setTauxAnnuel] = useState(5);
  const [dureeAnnees, setDureeAnnees] = useState(20);
  const [inflationActive, setInflationActive] = useState(false);
  const [inflationTaux, setInflationTaux] = useState(2);
  const [fiscalite, setFiscalite] = useState<Fiscalite>("aucune");

  const res = useMemo(
    () =>
      calculerInteretsComposes({
        capitalInitial,
        versementPeriodique,
        frequence,
        tauxAnnuel,
        dureeAnnees,
        inflationActive,
        inflationTaux,
        fiscalite,
      }),
    [
      capitalInitial,
      versementPeriodique,
      frequence,
      tauxAnnuel,
      dureeAnnees,
      inflationActive,
      inflationTaux,
      fiscalite,
    ]
  );

  // Part des intérêts dans le capital final (la « magie » des intérêts composés).
  const partInterets =
    res.capitalFinalBrut > 0
      ? Math.round((res.interets / res.capitalFinalBrut) * 100)
      : 0;

  const fiscaliteActive = fiscalite !== "aucune";

  return (
    <div className="flex flex-col gap-8">
      {/* ── PANNEAU ENTRÉES + RÉSULTATS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Entrées */}
        <div className="rounded-3xl bg-cervus-bronze border border-[#E4DACE] p-6 sm:p-8 flex flex-col gap-6">
          <SliderInput
            label="Capital initial"
            value={capitalInitial}
            onChange={setCapitalInitial}
            min={0}
            max={500000}
            step={500}
            format={fmtEur}
          />

          <div className="flex flex-col gap-3">
            <SliderInput
              label="Versement périodique"
              value={versementPeriodique}
              onChange={setVersementPeriodique}
              min={0}
              max={10000}
              step={50}
              format={fmtEur}
            />
            <PillGroup<Frequence>
              value={frequence}
              onChange={setFrequence}
              options={[
                { value: "mensuel", label: "Mensuel" },
                { value: "annuel", label: "Annuel" },
              ]}
            />
          </div>

          <SliderInput
            label="Taux de rendement annuel"
            value={tauxAnnuel}
            onChange={setTauxAnnuel}
            min={0}
            max={10}
            step={0.1}
            format={(v) => `${v.toFixed(1).replace(".", ",")} %`}
          />

          <SliderInput
            label="Durée"
            value={dureeAnnees}
            onChange={setDureeAnnees}
            min={1}
            max={40}
            step={1}
            format={(v) => `${v} ans`}
          />

          {/* Inflation togglable */}
          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={() => setInflationActive((v) => !v)}
              className="flex items-center gap-3 group w-fit"
            >
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  inflationActive ? "bg-[#795D48]" : "bg-[#D4C9BE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    inflationActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
              <span className="font-inter text-sm text-cervus-dark/70">
                Tenir compte de l&apos;inflation
              </span>
            </button>
            {inflationActive && (
              <SliderInput
                label="Inflation annuelle"
                value={inflationTaux}
                onChange={setInflationTaux}
                min={0}
                max={10}
                step={0.1}
                format={(v) => `${v.toFixed(1).replace(".", ",")} %`}
              />
            )}
          </div>

          {/* Imposition des gains */}
          <div className="flex flex-col gap-3 pt-1">
            <p className="font-inter text-xs text-cervus-dark/45 uppercase tracking-widest">
              Imposition des gains (optionnel)
            </p>
            <PillGroup<Fiscalite>
              value={fiscalite}
              onChange={setFiscalite}
              options={[
                { value: "aucune", label: "Aucune" },
                { value: "pfu", label: "PFU 30 %" },
                { value: "ps", label: "Prélèvements sociaux 17,2 %" },
              ]}
            />
          </div>
        </div>

        {/* Résultats */}
        <div className="flex flex-col gap-5">
          {/* Chiffre phare : capital final */}
          <div className="rounded-3xl bg-[#5D4738] text-white p-6 sm:p-8">
            <p className="font-inter text-xs uppercase tracking-widest text-white/55">
              Capital au terme {fiscaliteActive ? "(brut)" : ""}
            </p>
            <p className="font-cormorant text-5xl sm:text-6xl font-light mt-2 tabular-nums">
              {fmtEur(res.capitalFinalBrut)}
            </p>
            <p className="font-inter text-sm text-white/70 mt-3">
              dont{" "}
              <span className="text-white font-semibold">
                {fmtEur(res.interets)}
              </span>{" "}
              d&apos;intérêts — soit {partInterets} % du total
            </p>
          </div>

          {/* Versements vs intérêts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-cervus-bronze border border-[#E4DACE] p-5">
              <p className="font-inter text-[11px] uppercase tracking-widest text-cervus-dark/45">
                Total versé
              </p>
              <p className="font-cormorant text-3xl font-light text-cervus-dark mt-1 tabular-nums">
                {fmtEur(res.totalVerse)}
              </p>
            </div>
            <div className="rounded-2xl bg-cervus-bronze border border-[#E4DACE] p-5">
              <p className="font-inter text-[11px] uppercase tracking-widest text-cervus-dark/45">
                Intérêts gagnés
              </p>
              <p className="font-cormorant text-3xl font-light text-[#795D48] mt-1 tabular-nums">
                {fmtEur(res.interets)}
              </p>
            </div>
          </div>

          {/* Net après fiscalité (si touche active) */}
          {fiscaliteActive && (
            <div className="rounded-2xl bg-white border border-[#E4DACE] p-5 flex items-baseline justify-between gap-3">
              <div>
                <p className="font-inter text-[11px] uppercase tracking-widest text-cervus-dark/45">
                  Capital net après imposition des gains
                </p>
                <p className="font-inter text-[11px] text-cervus-dark/45 mt-0.5">
                  impôt estimé : {fmtEur(res.impotSurGains)}
                </p>
              </div>
              <p className="font-cormorant text-3xl font-light text-cervus-dark tabular-nums">
                {fmtEur(res.capitalNet)}
              </p>
            </div>
          )}

          {/* Euros constants (si inflation active) */}
          {inflationActive && (
            <div className="rounded-2xl bg-white border border-[#E4DACE] p-5 flex items-baseline justify-between gap-3">
              <p className="font-inter text-[13px] text-cervus-dark/60">
                Pouvoir d&apos;achat en euros constants
                <span className="text-cervus-dark/40">
                  {" "}
                  (inflation {inflationTaux.toFixed(1).replace(".", ",")} %)
                </span>
              </p>
              <p className="font-cormorant text-3xl font-light text-cervus-dark tabular-nums">
                {fmtEur(res.capitalReel)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── GRAPHIQUE ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <p className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest">
          Évolution — versements cumulés vs intérêts cumulés
        </p>
        <div className="h-72 sm:h-80 w-full rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)] p-5 pl-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={res.courbe}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="icVerse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5D4738" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#5D4738" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="icInterets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#795D48" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#795D48" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0ece8"
                vertical={false}
              />
              <XAxis
                dataKey="annee"
                tick={{
                  fontSize: 10,
                  fontFamily: "var(--font-inter)",
                  fill: "#b0a090",
                }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(v) => `${v} an${v > 1 ? "s" : ""}`}
              />
              <YAxis
                tickFormatter={(v) =>
                  Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                }
                tick={{
                  fontSize: 10,
                  fontFamily: "var(--font-inter)",
                  fill: "#b0a090",
                }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value, name) => [
                  fmtEur(Number(value)),
                  name === "totalVerse" ? "Versements cumulés" : "Intérêts cumulés",
                ]}
                labelFormatter={(label) => `Année ${label}`}
                contentStyle={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  border: "1px solid #e8e2da",
                  borderRadius: 8,
                  boxShadow: "none",
                }}
              />
              <Legend
                iconType="plainline"
                wrapperStyle={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  paddingTop: 8,
                }}
                formatter={(value) => (
                  <span style={{ color: "#5D4738" }}>
                    {value === "totalVerse"
                      ? "Versements cumulés"
                      : "Intérêts cumulés"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="totalVerse"
                stackId="1"
                stroke="#5D4738"
                strokeWidth={2}
                fill="url(#icVerse)"
                dot={false}
                activeDot={{ r: 3, fill: "#5D4738" }}
              />
              <Area
                type="monotone"
                dataKey="interets"
                stackId="1"
                stroke="#795D48"
                strokeWidth={2}
                fill="url(#icInterets)"
                dot={false}
                activeDot={{ r: 4, fill: "#795D48" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mention obligatoire */}
      <p className="font-inter text-[11px] leading-relaxed text-cervus-dark/45">
        Simulation pédagogique indicative — ne constitue pas un conseil en
        investissement. Les rendements sont hypothétiques et ne préjugent pas des
        performances futures.
      </p>
    </div>
  );
}
