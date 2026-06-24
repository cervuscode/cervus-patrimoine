/**
 * Moteur PUR de « Résilience des marchés » (Lot 10) — 3 jeux de données pour
 * recharts. Ne consomme AUCUN moteur (ni fiscal-engine) : il indexe / compose des
 * séries de `market-data.ts`. Isomorphe (aucun secret) → client + serveur.
 *
 *  - Graph 1 : lignes historiques annuelles 1970→2025 (réel), base 100 ou nominal,
 *    profils optionnels.
 *  - Graph 2 : « si j'avais investi 10 000 € il y a 20 ans » — vrais rendements
 *    année par année.
 *  - Graph 3 : projection de versements (initial + mensuel) sur un horizon, taux
 *    fixes actuels (profils 3/4/5 %, Livret A 1,5 %, fonds euros 2,5 %).
 */

import {
  FONDS_EUROS_NOW,
  FONDS_EUROS_RATES,
  FONDS_EUROS_START,
  HIST_END,
  HIST_START,
  LIVRET_A_NOW,
  LIVRET_A_RATES,
  MSCI_WORLD,
  MSCI_WORLD_NET,
  PROFIL_RATES,
  SP500,
  type SerieKey,
  type YearValue,
} from "./market-data";

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Hypothèses du graphique 3 (saisie utilisateur), partagées sim/présentation. */
export interface ResilienceInputs {
  versementInitial: number;
  versementMensuel: number;
  horizon: number;
}

export const DEFAULT_RESILIENCE_INPUTS: ResilienceInputs = {
  versementInitial: 0,
  versementMensuel: 200,
  horizon: 20,
};

/** Ligne d'un graphe : x + une valeur par série (absente = ligne interrompue). */
export type ChartRow = { x: number } & Partial<Record<SerieKey, number>>;

export interface ChartData {
  rows: ChartRow[];
  /** Séries présentes (ordre d'affichage des toggles). */
  series: SerieKey[];
}

// ── Helpers de série ───────────────────────────────────────────────────────────

function valueAt(data: YearValue[], year: number): number | undefined {
  return data.find((d) => d.year === year)?.value;
}

/** Série de prix indexée : base 100 en 1970, ou valeur nominale brute. */
function priceMap(data: YearValue[], base100: boolean): Map<number, number> {
  const v0 = valueAt(data, HIST_START) ?? 1;
  const m = new Map<number, number>();
  for (const { year, value } of data) {
    if (year < HIST_START || year > HIST_END) continue;
    m.set(year, round2(base100 ? (value / v0) * 100 : value));
  }
  return m;
}

/** Série de taux composée à partir d'un capital de base, année par année. */
function rateMap(
  rates: Record<number, number>,
  startYear: number,
  base: number
): Map<number, number> {
  const m = new Map<number, number>();
  let cap = base;
  m.set(startYear, round2(cap));
  for (let y = startYear + 1; y <= HIST_END; y++) {
    cap *= 1 + (rates[y] ?? 0) / 100;
    m.set(y, round2(cap));
  }
  return m;
}

/** Série à taux constant composée annuellement. */
function constantRateMap(annualPct: number, startYear: number, base: number): Map<number, number> {
  const m = new Map<number, number>();
  let cap = base;
  m.set(startYear, round2(cap));
  for (let y = startYear + 1; y <= HIST_END; y++) {
    cap *= 1 + annualPct / 100;
    m.set(y, round2(cap));
  }
  return m;
}

// ── Graphique 1 : historique annuel ─────────────────────────────────────────────

export interface HistoricalOpts {
  /** `true` = toutes les séries ramenées à 100 (en 1970, ou 1994 pour le fonds euros). */
  base100: boolean;
  /** `true` = ajoute les profils théoriques Prudent/Équilibré/Dynamique. */
  includeProfils: boolean;
}

/** Base d'affichage : 100 (base100) ou 10 000 € (capital synthétique nominal). */
function histBase(base100: boolean): number {
  return base100 ? 100 : 10000;
}

export function buildHistorical({ base100, includeProfils }: HistoricalOpts): ChartData {
  const base = histBase(base100);
  const msci = priceMap(MSCI_WORLD, base100);
  const sp = priceMap(SP500, base100);
  const livretA = rateMap(LIVRET_A_RATES, HIST_START, base);
  // Fonds euros : série courte → base 100 (ou 10 000) en 1994, absente avant.
  const fondsEuros = rateMap(FONDS_EUROS_RATES, FONDS_EUROS_START, base);
  const prudent = constantRateMap(PROFIL_RATES.prudent, HIST_START, base);
  const equilibre = constantRateMap(PROFIL_RATES.equilibre, HIST_START, base);
  const dynamique = constantRateMap(PROFIL_RATES.dynamique, HIST_START, base);

  const rows: ChartRow[] = [];
  for (let y = HIST_START; y <= HIST_END; y++) {
    const row: ChartRow = { x: y };
    if (msci.has(y)) row.msci = msci.get(y);
    if (sp.has(y)) row.sp500 = sp.get(y);
    if (livretA.has(y)) row.livretA = livretA.get(y);
    if (fondsEuros.has(y)) row.fondsEuros = fondsEuros.get(y);
    if (includeProfils) {
      row.prudent = prudent.get(y);
      row.equilibre = equilibre.get(y);
      row.dynamique = dynamique.get(y);
    }
    rows.push(row);
  }

  const series: SerieKey[] = ["msci", "sp500", "livretA", "fondsEuros"];
  if (includeProfils) series.push("prudent", "equilibre", "dynamique");
  return { rows, series };
}

// ── Graphique 2 : capital unique investi il y a 20 ans ──────────────────────────

export interface LumpSumOpts {
  /** Montant investi en une fois (€). */
  amount?: number;
  /** Durée (années). */
  years?: number;
  /** Année de fin (= « aujourd'hui »), défaut dernière année de données. */
  endYear?: number;
}

export interface LumpSumResult extends ChartData {
  startYear: number;
  endYear: number;
  amount: number;
  /** Capital final par série (à l'année de fin). */
  finals: Partial<Record<SerieKey, number>>;
}

/** Capital d'un placement de prix : amount × value_y / value_start. */
function lumpPrice(data: YearValue[], amount: number, startYear: number, endYear: number): Map<number, number> {
  const v0 = valueAt(data, startYear);
  const m = new Map<number, number>();
  if (v0 == null) return m;
  for (let y = startYear; y <= endYear; y++) {
    const v = valueAt(data, y);
    if (v != null) m.set(y, round2((amount * v) / v0));
  }
  return m;
}

/** Capital d'un placement à taux réels année par année. */
function lumpRate(rates: Record<number, number>, amount: number, startYear: number, endYear: number): Map<number, number> {
  const m = new Map<number, number>();
  let cap = amount;
  m.set(startYear, round2(cap));
  for (let y = startYear + 1; y <= endYear; y++) {
    cap *= 1 + (rates[y] ?? 0) / 100;
    m.set(y, round2(cap));
  }
  return m;
}

function lumpConstant(annualPct: number, amount: number, startYear: number, endYear: number): Map<number, number> {
  const m = new Map<number, number>();
  let cap = amount;
  m.set(startYear, round2(cap));
  for (let y = startYear + 1; y <= endYear; y++) {
    cap *= 1 + annualPct / 100;
    m.set(y, round2(cap));
  }
  return m;
}

export function buildLumpSum(opts: LumpSumOpts = {}): LumpSumResult {
  const amount = opts.amount ?? 10000;
  const years = opts.years ?? 20;
  const endYear = opts.endYear ?? HIST_END;
  const startYear = endYear - years;

  const maps: Record<SerieKey, Map<number, number>> = {
    msci: lumpPrice(MSCI_WORLD, amount, startYear, endYear),
    sp500: lumpPrice(SP500, amount, startYear, endYear),
    livretA: lumpRate(LIVRET_A_RATES, amount, startYear, endYear),
    fondsEuros: lumpRate(FONDS_EUROS_RATES, amount, startYear, endYear),
    prudent: lumpConstant(PROFIL_RATES.prudent, amount, startYear, endYear),
    equilibre: lumpConstant(PROFIL_RATES.equilibre, amount, startYear, endYear),
    dynamique: lumpConstant(PROFIL_RATES.dynamique, amount, startYear, endYear),
  };
  const series: SerieKey[] = ["msci", "sp500", "livretA", "fondsEuros", "prudent", "equilibre", "dynamique"];

  const rows: ChartRow[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const row: ChartRow = { x: y };
    for (const k of series) if (maps[k].has(y)) row[k] = maps[k].get(y);
    rows.push(row);
  }
  const finals: Partial<Record<SerieKey, number>> = {};
  for (const k of series) finals[k] = maps[k].get(endYear);

  return { rows, series, startYear, endYear, amount, finals };
}

// ── Graphique 3 : projection de versements (taux fixes actuels) ──────────────────

export interface ContributionOpts {
  versementInitial: number;
  versementMensuel: number;
  horizonAnnees: number;
}

export interface ContributionResult extends ChartData {
  horizonAnnees: number;
  totalVerse: number;
  /** Capital final par série (à l'horizon). */
  finals: Partial<Record<SerieKey, number>>;
}

/** Taux annuel fixe (%) de chaque série du graphique 3. */
export const G3_RATES: Record<
  "msci" | "prudent" | "equilibre" | "dynamique" | "livretA" | "fondsEuros",
  number
> = {
  // MSCI World à taux fixe = moyenne annualisée nette de frais (référence actions).
  msci: MSCI_WORLD_NET,
  prudent: PROFIL_RATES.prudent,
  equilibre: PROFIL_RATES.equilibre,
  dynamique: PROFIL_RATES.dynamique,
  livretA: LIVRET_A_NOW,
  fondsEuros: FONDS_EUROS_NOW,
};

/**
 * Capitalisation MENSUELLE composée : capital initial + versements mensuels en fin
 * de mois, au taux mensuel équivalent (1+annuel)^(1/12)−1. Renvoie le capital à la
 * fin de chaque année (0..horizon).
 */
function projectMonthly(
  annualPct: number,
  initial: number,
  monthly: number,
  horizonAnnees: number
): Map<number, number> {
  const mRate = Math.pow(1 + annualPct / 100, 1 / 12) - 1;
  const m = new Map<number, number>();
  let cap = initial;
  m.set(0, round2(cap));
  for (let month = 1; month <= horizonAnnees * 12; month++) {
    cap = cap * (1 + mRate) + monthly;
    if (month % 12 === 0) m.set(month / 12, round2(cap));
  }
  return m;
}

export function buildContribution(opts: ContributionOpts): ContributionResult {
  const horizonAnnees = Math.max(0, Math.round(opts.horizonAnnees));
  const initial = Math.max(0, opts.versementInitial);
  const monthly = Math.max(0, opts.versementMensuel);

  // MSCI World (référence actions, taux fixe net) en tête, puis profils, sûrs.
  const series: SerieKey[] = ["msci", "prudent", "equilibre", "dynamique", "livretA", "fondsEuros"];
  const maps: Partial<Record<SerieKey, Map<number, number>>> = {};
  for (const k of series) maps[k] = projectMonthly(G3_RATES[k as keyof typeof G3_RATES], initial, monthly, horizonAnnees);

  const rows: ChartRow[] = [];
  for (let y = 0; y <= horizonAnnees; y++) {
    const row: ChartRow = { x: y };
    for (const k of series) row[k] = maps[k]!.get(y);
    rows.push(row);
  }
  const finals: Partial<Record<SerieKey, number>> = {};
  for (const k of series) finals[k] = maps[k]!.get(horizonAnnees);

  return {
    rows,
    series,
    horizonAnnees,
    totalVerse: initial + monthly * horizonAnnees * 12,
    finals,
  };
}
