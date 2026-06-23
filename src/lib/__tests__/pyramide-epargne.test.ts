import {
  computePyramide,
  statutEcart,
  DEFAULT_PYRAMIDE_INPUTS,
  MOIS_PRECAUTION,
  SEUIL_BAS,
  SEUIL_HAUT,
  type PyramideInputs,
} from "../pyramide-epargne";

function inputs(p: Partial<PyramideInputs> = {}): PyramideInputs {
  return { ...DEFAULT_PYRAMIDE_INPUTS, ...p };
}

function niveau(r: ReturnType<typeof computePyramide>, key: string) {
  const n = r.niveaux.find((x) => x.key === key);
  if (!n) throw new Error(`niveau ${key} absent`);
  return n;
}

describe("computePyramide — répartition par niveau", () => {
  it("range les enveloppes dans les bons niveaux et déduit l'AV UC", () => {
    const r = computePyramide(
      inputs({
        livretsReglementes: 10_000,
        livretsBoostes: 2_000,
        autreEpargne: 3_000, // précaution = 15 000
        encoursAv: 50_000,
        encoursFondsEuros: 30_000, // projet = 30 000 ; UC = 20 000
        encoursPea: 15_000,
        encoursPer: 5_000, // long terme = 20 000 + 15 000 + 5 000 = 40 000
        cto: 8_000,
        crypto: 2_000, // dynamique = 10 000
      })
    );
    expect(niveau(r, "precaution").montantReel).toBe(15_000);
    expect(niveau(r, "projet").montantReel).toBe(30_000);
    expect(niveau(r, "longTerme").montantReel).toBe(40_000);
    expect(niveau(r, "dynamique").montantReel).toBe(10_000);
  });

  it("patrimoine total = somme de toutes les enveloppes (le fonds euros ne compte qu'une fois)", () => {
    const r = computePyramide(
      inputs({
        livretsReglementes: 10_000,
        autreEpargne: 5_000,
        encoursAv: 50_000,
        encoursFondsEuros: 30_000,
        encoursPea: 15_000,
        encoursPer: 5_000,
        cto: 8_000,
        crypto: 2_000,
      })
    );
    // 10 000 + 5 000 + 50 000 + 15 000 + 5 000 + 8 000 + 2 000 = 95 000
    expect(r.patrimoineTotal).toBe(95_000);
    // somme des 4 niveaux = total
    const somme = r.niveaux.reduce((s, n) => s + n.montantReel, 0);
    expect(somme).toBe(95_000);
  });

  it("AV UC clampée à 0 si le fonds euros déclaré dépasse l'AV totale", () => {
    const r = computePyramide(inputs({ encoursAv: 20_000, encoursFondsEuros: 30_000 }));
    // projet = fonds euros saisi (30 000), long terme UC = max(0, 20 000 − 30 000) = 0
    expect(niveau(r, "projet").montantReel).toBe(30_000);
    expect(niveau(r, "longTerme").montantReel).toBe(0);
  });
});

describe("computePyramide — cibles théoriques", () => {
  it("cible de précaution = 6 × capacité d'épargne", () => {
    const r = computePyramide(inputs({ capaciteEpargneMensuelle: 1_000, livretsReglementes: 6_000 }));
    expect(r.ciblePrecaution).toBe(MOIS_PRECAUTION * 1_000);
    expect(r.ciblePrecaution).toBe(6_000);
  });

  it("surplus réparti 40/40/20 au-delà de la précaution", () => {
    const r = computePyramide(
      inputs({
        capaciteEpargneMensuelle: 1_000, // cible précaution 6 000
        livretsReglementes: 6_000, // total 6 000 + 94 000 = 100 000
        encoursAv: 94_000,
        encoursFondsEuros: 0,
      })
    );
    expect(r.patrimoineTotal).toBe(100_000);
    expect(r.surplus).toBe(94_000); // 100 000 − 6 000
    expect(niveau(r, "projet").cibleMontant).toBeCloseTo(94_000 * 0.4);
    expect(niveau(r, "longTerme").cibleMontant).toBeCloseTo(94_000 * 0.4);
    expect(niveau(r, "dynamique").cibleMontant).toBeCloseTo(94_000 * 0.2);
  });

  it("sans capacité d'épargne : aucune cible, tous les statuts neutres", () => {
    const r = computePyramide(inputs({ livretsReglementes: 20_000, encoursAv: 30_000 }));
    expect(r.ciblePrecaution).toBeNull();
    expect(r.surplus).toBe(0);
    for (const n of r.niveaux) {
      expect(n.cibleMontant).toBeNull();
      expect(n.statut).toBe("neutre");
    }
  });

  it("surplus nul (patrimoine absorbé par la précaution) → cibles surplus à 0", () => {
    const r = computePyramide(
      inputs({ capaciteEpargneMensuelle: 5_000, livretsReglementes: 10_000 })
    );
    // cible précaution 30 000 > total 10 000 → surplus 0
    expect(r.surplus).toBe(0);
    expect(niveau(r, "projet").cibleMontant).toBe(0);
  });
});

describe("statutEcart — seuils ±20 %", () => {
  it("ratio dans [0,8 ; 1,2] → ok", () => {
    expect(statutEcart(1)).toBe("ok");
    expect(statutEcart(SEUIL_BAS)).toBe("ok");
    expect(statutEcart(SEUIL_HAUT)).toBe("ok");
  });
  it("ratio > 1,2 → sur-représenté", () => {
    expect(statutEcart(1.5)).toBe("sur");
    expect(statutEcart(Infinity)).toBe("sur");
  });
  it("ratio < 0,8 → sous-représenté", () => {
    expect(statutEcart(0.5)).toBe("sous");
  });
  it("ratio null → neutre", () => {
    expect(statutEcart(null)).toBe("neutre");
  });

  it("précaution sur-représentée déclenche le statut orange", () => {
    const r = computePyramide(
      inputs({ capaciteEpargneMensuelle: 500, livretsReglementes: 30_000 })
    );
    // cible précaution 3 000 ; réel 30 000 → ratio 10 → sur
    expect(niveau(r, "precaution").statut).toBe("sur");
  });
});
