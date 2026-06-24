import {
  buildHistorical,
  buildLumpSum,
  buildContribution,
  G3_RATES,
} from "../resilience-marches";
import {
  FONDS_EUROS_NOW,
  FONDS_EUROS_RATES,
  FONDS_EUROS_START,
  LIVRET_A_NOW,
  LIVRET_A_RATES,
  MSCI_WORLD,
  MSCI_WORLD_NET,
  SP500,
} from "../market-data";

const row = (rows: Array<{ x: number }>, year: number) => {
  const r = rows.find((d) => d.x === year);
  if (!r) throw new Error(`row ${year} absente`);
  return r as Record<string, number | undefined> & { x: number };
};

describe("market-data — intégrité des séries", () => {
  it("MSCI et S&P : 1969→2025, années strictement croissantes", () => {
    expect(MSCI_WORLD[0].year).toBe(1969);
    expect(MSCI_WORLD[MSCI_WORLD.length - 1].year).toBe(2025);
    expect(SP500[0].year).toBe(1969);
    for (let i = 1; i < MSCI_WORLD.length; i++) {
      expect(MSCI_WORLD[i].year).toBe(MSCI_WORLD[i - 1].year + 1);
    }
  });
  it("Livret A couvre 1970→2026 ; fonds euros démarre en 1994", () => {
    expect(LIVRET_A_RATES[1970]).toBe(4.125);
    expect(LIVRET_A_RATES[2026]).toBe(1.52);
    expect(FONDS_EUROS_START).toBe(1994);
    expect(FONDS_EUROS_RATES[1993]).toBeUndefined();
    expect(FONDS_EUROS_RATES[1994]).toBe(6.9);
  });
});

describe("buildHistorical — base 100", () => {
  const { rows } = buildHistorical({ base100: true, includeProfils: false });

  it("toutes les séries valent 100 à l'année de base 1970 (sauf fonds euros, absent)", () => {
    const r = row(rows, 1970);
    expect(r.msci).toBe(100);
    expect(r.sp500).toBe(100);
    expect(r.livretA).toBe(100);
    expect(r.fondsEuros).toBeUndefined();
  });
  it("Livret A composé conforme à la table (1971 = 100 × 1,0425)", () => {
    expect(row(rows, 1971).livretA).toBeCloseTo(104.25, 2);
  });
  it("fonds euros indexé à 100 en 1994, puis composé (1995 = 105,9)", () => {
    expect(row(rows, 1994).fondsEuros).toBe(100);
    expect(row(rows, 1995).fondsEuros).toBeCloseTo(105.9, 2);
  });
  it("MSCI base 100 = ratio des valeurs natives", () => {
    const v1970 = MSCI_WORLD.find((d) => d.year === 1970)!.value;
    const v2000 = MSCI_WORLD.find((d) => d.year === 2000)!.value;
    expect(row(rows, 2000).msci).toBeCloseTo((v2000 / v1970) * 100, 1);
  });
});

describe("buildHistorical — nominal & profils", () => {
  it("mode nominal : prix bruts ; Livret A = capital synthétique 10 000 en 1970", () => {
    const { rows } = buildHistorical({ base100: false, includeProfils: false });
    expect(row(rows, 1970).msci).toBe(9691.5);
    expect(row(rows, 1970).sp500).toBe(90.05);
    expect(row(rows, 1970).livretA).toBe(10000);
  });
  it("profils ajoutés et composés à taux constant (Prudent 1971 = 103)", () => {
    const { rows, series } = buildHistorical({ base100: true, includeProfils: true });
    expect(series).toContain("dynamique");
    expect(row(rows, 1970).prudent).toBe(100);
    expect(row(rows, 1971).prudent).toBeCloseTo(103, 2);
    expect(row(rows, 1971).dynamique).toBeCloseTo(105, 2);
  });
});

describe("buildLumpSum — 10 000 € il y a 20 ans", () => {
  const res = buildLumpSum({ amount: 10000, years: 20, endYear: 2025 });

  it("fenêtre 2005→2025, capital de départ = montant", () => {
    expect(res.startYear).toBe(2005);
    expect(res.endYear).toBe(2025);
    expect(row(res.rows, 2005).msci).toBe(10000);
  });
  it("MSCI final = montant × ratio des valeurs (2025/2005)", () => {
    const v05 = MSCI_WORLD.find((d) => d.year === 2005)!.value;
    const v25 = MSCI_WORLD.find((d) => d.year === 2025)!.value;
    expect(res.finals.msci).toBeCloseTo((10000 * v25) / v05, 0);
  });
  it("profil dynamique = 10 000 × 1,05^20", () => {
    expect(res.finals.dynamique).toBeCloseTo(10000 * Math.pow(1.05, 20), 0);
  });
  it("actions > placements sûrs sur la période", () => {
    expect(res.finals.msci!).toBeGreaterThan(res.finals.livretA!);
    expect(res.finals.sp500!).toBeGreaterThan(res.finals.fondsEuros!);
  });
});

describe("buildContribution — projection de versements", () => {
  it("capitalisation mensuelle : 1000 € sans versement, 1 an à 4 % → 1040", () => {
    const r = buildContribution({ versementInitial: 1000, versementMensuel: 0, horizonAnnees: 1 });
    expect(r.finals.equilibre).toBeCloseTo(1040, 0);
  });
  it("total versé = initial + mensuel × 12 × horizon", () => {
    const r = buildContribution({ versementInitial: 10000, versementMensuel: 200, horizonAnnees: 20 });
    expect(r.totalVerse).toBe(10000 + 200 * 12 * 20);
    expect(r.rows).toHaveLength(21); // années 0..20
  });
  it("inclut MSCI World (7,4 %) comme série la plus performante du graphique 3", () => {
    const r = buildContribution({ versementInitial: 0, versementMensuel: 300, horizonAnnees: 25 });
    expect(r.series).toContain("msci");
    expect(r.finals.msci).toBeDefined();
    // MSCI 7,4 % > Dynamique 5 % > … > Livret A 1,5 %.
    expect(r.finals.msci!).toBeGreaterThan(r.finals.dynamique!);
  });
  it("MSCI G3 : 1000 € sans versement, 1 an à 7,4 % → 1074", () => {
    const r = buildContribution({ versementInitial: 1000, versementMensuel: 0, horizonAnnees: 1 });
    expect(r.finals.msci).toBeCloseTo(1074, 0);
  });
  it("ordre des rendements : Livret A 1,5 % < fonds euros 2,5 % < Prudent 3 % < … < Dynamique 5 % < MSCI 7,4 %", () => {
    const r = buildContribution({ versementInitial: 0, versementMensuel: 300, horizonAnnees: 25 });
    expect(r.finals.livretA!).toBeLessThan(r.finals.fondsEuros!);
    expect(r.finals.fondsEuros!).toBeLessThan(r.finals.prudent!);
    expect(r.finals.prudent!).toBeLessThan(r.finals.equilibre!);
    expect(r.finals.equilibre!).toBeLessThan(r.finals.dynamique!);
    expect(r.finals.dynamique!).toBeLessThan(r.finals.msci!);
  });
  it("taux fixes G3 alignés sur market-data (dont MSCI net 7,4 %)", () => {
    expect(G3_RATES.livretA).toBe(LIVRET_A_NOW);
    expect(G3_RATES.fondsEuros).toBe(FONDS_EUROS_NOW);
    expect(G3_RATES.msci).toBe(MSCI_WORLD_NET);
    expect(G3_RATES.livretA).toBe(1.5);
    expect(G3_RATES.fondsEuros).toBe(2.5);
    expect(G3_RATES.msci).toBe(7.4);
  });
});
