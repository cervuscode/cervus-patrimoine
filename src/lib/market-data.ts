/**
 * Données de marché du Lot 10 « Résilience des marchés » — valeurs CODÉES EN DUR.
 *
 * Module pur isomorphe (aucun secret, aucun import serveur) → importable client et
 * serveur. Ne consomme AUCUN moteur. Mise à jour annuelle = ce seul fichier.
 *
 * Séries annuelles = point de DÉCEMBRE de chaque année (extraction documentée dans
 * `docs/market-data/README.md`, script `scripts/build-market-data.ts`).
 *
 * Sources :
 *  - MSCI World  : MSCI Inc. (base 10 000 en déc. 1969).
 *  - S&P 500     : Robert J. Shiller (Yale), prix nominal `P`.
 *  - Livret A    : Banque de France (taux MOYEN annuel 1970→2026).
 *  - Fonds euros : France Assureurs (rendement moyen net, SÉRIE DEPUIS 1994).
 */

export interface YearValue {
  year: number;
  value: number;
}

/** MSCI World — valeur de décembre par an (1969→2025), base 10 000 en déc. 1969. */
export const MSCI_WORLD: YearValue[] = [
  { year: 1969, value: 10000 }, { year: 1970, value: 9691.5 }, { year: 1971, value: 10245.1 },
  { year: 1972, value: 12279.81 }, { year: 1973, value: 8647.4 }, { year: 1974, value: 5942.18 },
  { year: 1975, value: 8443.52 }, { year: 1976, value: 8703.33 }, { year: 1977, value: 7909.04 },
  { year: 1978, value: 8053.61 }, { year: 1979, value: 8610.03 }, { year: 1980, value: 11961.84 },
  { year: 1981, value: 13591.62 }, { year: 1982, value: 16931.7 }, { year: 1983, value: 23950.13 },
  { year: 1984, value: 28678.47 }, { year: 1985, value: 33210.72 }, { year: 1986, value: 39397.43 },
  { year: 1987, value: 37769.07 }, { year: 1988, value: 49748.82 }, { year: 1989, value: 58876.27 },
  { year: 1990, value: 41629.63 }, { year: 1991, value: 51853.68 }, { year: 1992, value: 51662.02 },
  { year: 1993, value: 69370.94 }, { year: 1994, value: 67848.8 }, { year: 1995, value: 77868.12 },
  { year: 1996, value: 90710.72 }, { year: 1997, value: 117343.89 }, { year: 1998, value: 137997.31 },
  { year: 1999, value: 201753.34 }, { year: 2000, value: 189114.81 }, { year: 2001, value: 166079.72 },
  { year: 2002, value: 111814.21 }, { year: 2003, value: 123578.96 }, { year: 2004, value: 131456.29 },
  { year: 2005, value: 166178.86 }, { year: 2006, value: 178723.53 }, { year: 2007, value: 174340.26 },
  { year: 2008, value: 109333.15 }, { year: 2009, value: 137296.13 }, { year: 2010, value: 165435.79 },
  { year: 2011, value: 161378.86 }, { year: 2012, value: 183306.04 }, { year: 2013, value: 222153.8 },
  { year: 2014, value: 264803.04 }, { year: 2015, value: 292731.13 }, { year: 2016, value: 325047.02 },
  { year: 2017, value: 349689.64 }, { year: 2018, value: 334365.3 }, { year: 2019, value: 435092.27 },
  { year: 2020, value: 461666.75 }, { year: 2021, value: 609313.39 }, { year: 2022, value: 529637.9 },
  { year: 2023, value: 632839.95 }, { year: 2024, value: 798779.09 }, { year: 2025, value: 855235.01 },
];

/** S&P 500 (S&P Composite) — prix nominal `P` de décembre par an (1969→2025). */
export const SP500: YearValue[] = [
  { year: 1969, value: 91.11 }, { year: 1970, value: 90.05 }, { year: 1971, value: 99.17 },
  { year: 1972, value: 117.5 }, { year: 1973, value: 94.78 }, { year: 1974, value: 67.07 },
  { year: 1975, value: 88.7 }, { year: 1976, value: 104.7 }, { year: 1977, value: 93.82 },
  { year: 1978, value: 96.11 }, { year: 1979, value: 107.8 }, { year: 1980, value: 133.5 },
  { year: 1981, value: 123.8 }, { year: 1982, value: 139.4 }, { year: 1983, value: 164.4 },
  { year: 1984, value: 164.5 }, { year: 1985, value: 207.3 }, { year: 1986, value: 248.6 },
  { year: 1987, value: 241 }, { year: 1988, value: 276.5 }, { year: 1989, value: 348.6 },
  { year: 1990, value: 328.75 }, { year: 1991, value: 388.51 }, { year: 1992, value: 435.64 },
  { year: 1993, value: 465.95 }, { year: 1994, value: 455.19 }, { year: 1995, value: 614.57 },
  { year: 1996, value: 743.25 }, { year: 1997, value: 962.37 }, { year: 1998, value: 1190.05 },
  { year: 1999, value: 1428.68 }, { year: 2000, value: 1330.93 }, { year: 2001, value: 1144.93 },
  { year: 2002, value: 899.18 }, { year: 2003, value: 1080.64 }, { year: 2004, value: 1199.21 },
  { year: 2005, value: 1262.07 }, { year: 2006, value: 1416.42 }, { year: 2007, value: 1479.22 },
  { year: 2008, value: 877.56 }, { year: 2009, value: 1110.38 }, { year: 2010, value: 1241.53 },
  { year: 2011, value: 1243.32 }, { year: 2012, value: 1422.29 }, { year: 2013, value: 1807.78 },
  { year: 2014, value: 2054.27 }, { year: 2015, value: 2054.08 }, { year: 2016, value: 2246.63 },
  { year: 2017, value: 2664.34 }, { year: 2018, value: 2567.31 }, { year: 2019, value: 3176.75 },
  { year: 2020, value: 3695.31 }, { year: 2021, value: 4674.77 }, { year: 2022, value: 3912.38 },
  { year: 2023, value: 4685.05 }, { year: 2024, value: 6010.91 }, { year: 2025, value: 6853.03 },
];

/** Livret A — taux MOYEN annuel (%) 1970→2026 (Banque de France). */
export const LIVRET_A_RATES: Record<number, number> = {
  1970: 4.125, 1971: 4.25, 1972: 4.25, 1973: 4.25, 1974: 6.25, 1975: 7.5, 1976: 6.5,
  1977: 6.5, 1978: 6.5, 1979: 6.5, 1980: 7.25, 1981: 7.75, 1982: 8.5, 1983: 8.1,
  1984: 7.1, 1985: 6.25, 1986: 5.0, 1987: 4.5, 1988: 4.5, 1989: 4.5, 1990: 4.5,
  1991: 4.5, 1992: 4.5, 1993: 4.5, 1994: 4.5, 1995: 4.5, 1996: 3.7, 1997: 3.5,
  1998: 3.2, 1999: 2.7, 2000: 2.6, 2001: 3.0, 2002: 3.0, 2003: 2.7, 2004: 2.25,
  2005: 2.15, 2006: 2.45, 2007: 2.85, 2008: 3.7, 2009: 1.9, 2010: 1.45, 2011: 2.1,
  2012: 2.25, 2013: 1.6, 2014: 1.15, 2015: 0.9, 2016: 0.75, 2017: 0.75, 2018: 0.75,
  2019: 0.75, 2020: 0.52, 2021: 0.5, 2022: 1.38, 2023: 2.92, 2024: 3.0, 2025: 2.16,
  2026: 1.52,
};

/** Fonds euros — rendement moyen annuel net (%), SÉRIE DEPUIS 1994 (France Assureurs). */
export const FONDS_EUROS_RATES: Record<number, number> = {
  1994: 6.9, 1995: 5.9, 1996: 5.8, 1997: 5.7, 1998: 5.6, 1999: 5.2, 2000: 5.3,
  2001: 5.3, 2002: 4.8, 2003: 4.5, 2004: 4.4, 2005: 4.2, 2006: 4.1, 2007: 4.1,
  2008: 4.0, 2009: 3.6, 2010: 3.4, 2011: 3.0, 2012: 2.9, 2013: 2.8, 2014: 2.5,
  2015: 2.3, 2016: 1.9, 2017: 1.8, 2018: 1.8, 2019: 1.5, 2020: 1.3, 2021: 1.3,
  2022: 1.9, 2023: 2.6, 2024: 2.5, 2025: 2.65,
};

/** Première année de données fiables pour le fonds euros (France Assureurs). */
export const FONDS_EUROS_START = 1994;

/** Taux fixes ACTUELS pour la projection du graphique 3 (%). */
export const LIVRET_A_NOW = 1.5; // taux en vigueur depuis le 1er février 2026
export const FONDS_EUROS_NOW = 2.5; // moyenne marché 2024-2025
// Moyenne annualisée MSCI World 1985-2025, nette de 1% frais de gestion — validé Auguste Dechery
export const MSCI_WORLD_NET = 7.4;

/** Taux annuels constants des profils de gestion (%). */
export const PROFIL_RATES = { prudent: 3, equilibre: 4, dynamique: 5 } as const;
export type ProfilKey = keyof typeof PROFIL_RATES;

/** Identifiant stable d'une série affichable. */
export type SerieKey =
  | "msci"
  | "sp500"
  | "livretA"
  | "fondsEuros"
  | "prudent"
  | "equilibre"
  | "dynamique";

/** Métadonnées d'affichage (libellé + couleur charte) par série. */
export const SERIE_META: Record<SerieKey, { label: string; color: string }> = {
  msci: { label: "MSCI World", color: "#795D48" },
  sp500: { label: "S&P 500", color: "#a07d62" },
  // Livret A / Fonds euros HORS charte (bleu/vert) pour se détacher nettement des
  // actions (bronze) et des profils (crème→bronze) sur fond sombre — lisibilité Lot 10.
  livretA: { label: "Livret A", color: "#4a90d9" },
  fondsEuros: { label: "Fonds euros", color: "#46b07a" },
  prudent: { label: "Prudent (3 %)", color: "#cbb9a8" },
  equilibre: { label: "Équilibré (4 %)", color: "#b08d5b" },
  dynamique: { label: "Dynamique (5 %)", color: "#6f5236" },
};

/** Mention source obligatoire, rendue sous chaque graphique. */
export const SOURCE_MENTION =
  "S&P 500 : Robert J. Shiller (Yale) · MSCI World : MSCI Inc. · Livret A : Banque de France · " +
  "Fonds euros : France Assureurs — Données indicatives, performances passées ne préjugent pas " +
  "des performances futures.";

/** Annotation spécifique fonds euros (série courte). */
export const FONDS_EUROS_ANNOTATION = "Fonds euros : série depuis 1994 — France Assureurs.";

/** Bornes de la série historique annuelle (commune MSCI / S&P / Livret A). */
export const HIST_START = 1970;
export const HIST_END = 2025;
