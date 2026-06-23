/**
 * Régénération des CSV annuels dérivés de `docs/market-data/` (Lot 10).
 *
 * Lit les fichiers BRUTS (non committés, trop lourds) et extrait la valeur de
 * DÉCEMBRE de chaque année → CSV annuels légers + log des tableaux à recopier
 * dans `src/lib/market-data.ts`.
 *
 * ⚠️ DEV-ONLY : jamais importé par l'application. Les bruts doivent être présents
 * localement. Chemins surchargeables par variables d'env.
 *
 * Bruts attendus :
 *   - MSCI World mensuel  : CSV `Date,MSCI World` au format `MM/YYYY,valeur`
 *       (env MSCI_RAW, défaut ~/Downloads/chart (2).csv)
 *   - S&P 500 Shiller     : XLS `ie_data.xls`, feuille Data, colonnes Date/P
 *       → ici on attend un CSV déjà exporté `Date,P` (1871.01 style)
 *       (env SHILLER_RAW, défaut docs/market-data/sp500-shiller-raw.csv)
 *
 * Exécution :  npx --yes tsx scripts/build-market-data.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

const OUT_DIR = resolve(process.cwd(), "docs/market-data");

/** MSCI : `MM/YYYY,valeur` → valeur de décembre par an. */
function buildMsci(rawPath: string): Array<[number, number]> {
  const txt = readFileSync(rawPath, "utf8");
  const out: Array<[number, number]> = [];
  for (const line of txt.split("\n").slice(1)) {
    const m = line.match(/^12\/(\d{4}),([\d.]+)/);
    if (m) out.push([Number(m[1]), Math.round(Number(m[2]) * 100) / 100]);
  }
  return out;
}

/** Shiller : `Date(YYYY.MM),P` → P de décembre par an, fenêtre 1969→2025. */
function buildShiller(rawPath: string): Array<[number, number]> {
  const txt = readFileSync(rawPath, "utf8");
  const out: Array<[number, number]> = [];
  for (const line of txt.split("\n")) {
    const m = line.match(/^(\d{4})\.(\d{2}),([\d.]+)/);
    if (!m) continue;
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (month === 12 && year >= 1969 && year <= 2025) {
      out.push([year, Math.round(Number(m[3]) * 100) / 100]);
    }
  }
  return out;
}

function writeCsv(name: string, rows: Array<[number, number]>): void {
  const csv = "year,value\n" + rows.map(([y, v]) => `${y},${v}`).join("\n") + "\n";
  writeFileSync(resolve(OUT_DIR, name), csv);
}

function logArray(label: string, rows: Array<[number, number]>): void {
  console.log(`\n// ${label}`);
  console.log(rows.map(([y, v]) => `{ year: ${y}, value: ${v} }`).join(", "));
}

function main(): void {
  const msciRaw = process.env.MSCI_RAW || resolve(homedir(), "Downloads/chart (2).csv");
  const shillerRaw = process.env.SHILLER_RAW || resolve(OUT_DIR, "sp500-shiller-raw.csv");

  const msci = buildMsci(msciRaw);
  writeCsv("msci-world-annual.csv", msci);
  logArray(`MSCI_WORLD (${msci.length} ans)`, msci);

  try {
    const sp = buildShiller(shillerRaw);
    writeCsv("sp500-shiller-annual.csv", sp);
    logArray(`SP500 (${sp.length} ans)`, sp);
  } catch {
    console.log(
      "\n(S&P) brut introuvable — exporte d'abord ie_data.xls (feuille Data) en CSV Date,P."
    );
  }

  console.log("\nCSV annuels réécrits dans docs/market-data/.");
}

main();
