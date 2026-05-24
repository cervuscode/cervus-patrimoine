import {
  impotBrut,
  impotReel,
  calculerTMI,
  calculerParts,
  calculerRevenuImposable,
  projectionPER,
  economieFiscaleAnnuelle,
} from "@/lib/fiscal-engine";

// ── impotBrut ─────────────────────────────────────────────────────────────────
describe("impotBrut", () => {
  it("retourne 0 pour un revenu dans la tranche à 0 %", () => {
    expect(impotBrut(10000, 1)).toBe(0);
  });

  it("Célibataire 30 000 € → ~2 104 €", () => {
    // 11600×0 + (29579-11600)×11% + (30000-29579)×30% ≈ 2104
    const impot = impotBrut(30000, 1);
    expect(impot).toBeCloseTo(2104, 0);
  });
});

// ── impotReel — valeurs de référence vérifiées sur le barème IR 2025 ──────────
describe("impotReel", () => {
  it("Célibataire 30k€ → ~2 104 €", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(impotReel(30000, partsBase, partsTotal)).toBeCloseTo(2104, 0);
  });

  it("Couple sans enfant 70k€ → ~7 208 € (barème 2025)", () => {
    // (70000/2 = 35000 par part) : 11600×0 + (29579-11600)×11% + (35000-29579)×30% ≈ 3604 × 2
    const { partsBase, partsTotal } = calculerParts("marie", 0);
    expect(impotReel(70000, partsBase, partsTotal)).toBeCloseTo(7208, 0);
  });

  it("Couple + 1 enfant 70k€ → ~5 417 € (plafonnement QF actif)", () => {
    // Sans enfants: 7208 | Avec 2.5 parts: 4510 | Économie: 2698 > plafond 1791
    // → impôt réel = 7208 - 1791 = 5417
    const { partsBase, partsTotal } = calculerParts("marie", 1);
    expect(impotReel(70000, partsBase, partsTotal)).toBeCloseTo(5417, 0);
  });

  it("Célibataire 90k€ → ~21 100 €", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    const impot = impotReel(90000, partsBase, partsTotal);
    expect(impot).toBeGreaterThan(20000);
    expect(impot).toBeLessThan(22000);
  });

  it("Célibataire 200k€ → ~66 524 € (barème 2025)", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(impotReel(200000, partsBase, partsTotal)).toBeCloseTo(66524, 0);
  });

  it("Couple sans enfant 60k€ → plafonnement QF non atteint", () => {
    // À 60k, avec 2 parts = 30k/part → TMI 30%
    const { partsBase, partsTotal } = calculerParts("marie", 1);
    const impot = impotReel(60000, partsBase, partsTotal);
    expect(impot).toBeGreaterThan(0);
    expect(impot).toBeLessThan(impotReel(60000, 2, 2)); // moins qu'un couple sans enfant
  });
});

// ── calculerTMI ───────────────────────────────────────────────────────────────
describe("calculerTMI", () => {
  it("Célibataire 15k€ → TMI 11 % (tranche 11%)", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(calculerTMI(15000, partsBase, partsTotal)).toBe(11);
  });

  it("Célibataire 30k€ → TMI 30 % (30k dépasse la borne 29 315€)", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(calculerTMI(30000, partsBase, partsTotal)).toBe(30);
  });

  it("Couple 70k€ → TMI 30 %", () => {
    const { partsBase, partsTotal } = calculerParts("marie", 0);
    expect(calculerTMI(70000, partsBase, partsTotal)).toBe(30);
  });

  it("Couple + 1 enfant 70k€ → TMI 30 % (plafonnement actif)", () => {
    const { partsBase, partsTotal } = calculerParts("marie", 1);
    expect(calculerTMI(70000, partsBase, partsTotal)).toBe(30);
  });

  it("Célibataire 90k€ → TMI 41 %", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(calculerTMI(90000, partsBase, partsTotal)).toBe(41);
  });

  it("Célibataire 10k€ → TMI 0 % (tranche zéro)", () => {
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(calculerTMI(10000, partsBase, partsTotal)).toBe(0);
  });
});

// ── calculerParts ─────────────────────────────────────────────────────────────
describe("calculerParts", () => {
  it("Célibataire sans enfant → 1/1", () => {
    expect(calculerParts("celibataire", 0)).toEqual({ partsBase: 1, partsTotal: 1 });
  });

  it("Divorcé sans enfant → 1/1", () => {
    expect(calculerParts("divorce", 0)).toEqual({ partsBase: 1, partsTotal: 1 });
  });

  it("Célibataire 2 enfants → 1/2", () => {
    expect(calculerParts("celibataire", 2)).toEqual({ partsBase: 1, partsTotal: 2 });
  });

  it("Marié sans enfant → 2/2", () => {
    expect(calculerParts("marie", 0)).toEqual({ partsBase: 2, partsTotal: 2 });
  });

  it("Marié 2 enfants → 2/3", () => {
    expect(calculerParts("marie", 2)).toEqual({ partsBase: 2, partsTotal: 3 });
  });

  it("Pacsé 1 enfant → 2/2.5", () => {
    expect(calculerParts("pacse", 1)).toEqual({ partsBase: 2, partsTotal: 2.5 });
  });

  it("Parent isolé sans enfant → 1/1", () => {
    expect(calculerParts("parent_isole", 0)).toEqual({ partsBase: 1, partsTotal: 1 });
  });

  it("Parent isolé 1 enfant → 1/2 (case T : 1 part entière)", () => {
    expect(calculerParts("parent_isole", 1)).toEqual({ partsBase: 1, partsTotal: 2 });
  });

  it("Parent isolé 2 enfants → 1/2.5", () => {
    expect(calculerParts("parent_isole", 2)).toEqual({ partsBase: 1, partsTotal: 2.5 });
  });

  it("Célibataire 3 enfants → 1/3 (+1 pt à partir du 3ème)", () => {
    expect(calculerParts("celibataire", 3)).toEqual({ partsBase: 1, partsTotal: 3.0 });
  });

  it("Marié 3 enfants → 2/4 (+1 pt à partir du 3ème)", () => {
    expect(calculerParts("marie", 3)).toEqual({ partsBase: 2, partsTotal: 4.0 });
  });

  it("Parent isolé 3 enfants → 1/3.5 (+1 pt à partir du 3ème)", () => {
    expect(calculerParts("parent_isole", 3)).toEqual({ partsBase: 1, partsTotal: 3.5 });
  });
});

// ── calculerRevenuImposable ───────────────────────────────────────────────────
describe("calculerRevenuImposable", () => {
  it("Salaire 4 000 € — abattement minimum 495 €", () => {
    const r = calculerRevenuImposable({ salaires: 4000, abattementSalaires: "forfait10" });
    expect(r).toBe(3505); // 4000 - 495
  });

  it("Salaire 50 000 € — abattement 10 % normal", () => {
    const r = calculerRevenuImposable({ salaires: 50000, abattementSalaires: "forfait10" });
    expect(r).toBe(45000); // 50000 - 5000
  });

  it("Salaire 200 000 € — abattement plafonné à 14 171 €", () => {
    const r = calculerRevenuImposable({ salaires: 200000, abattementSalaires: "forfait10" });
    expect(r).toBe(185829); // 200000 - 14171
  });

  it("Frais réels déduits", () => {
    const r = calculerRevenuImposable({
      salaires: 60000,
      abattementSalaires: "fraisReels",
      fraisReels: 8000,
    });
    expect(r).toBe(52000);
  });

  it("Sources cumulées BNC + BIC + Foncier", () => {
    const r = calculerRevenuImposable({
      salaires: 0,
      abattementSalaires: "forfait10",
      bnc: 20000,
      bic: 10000,
      foncier: 5000,
    });
    expect(r).toBe(35000);
  });

  it("Aucun revenu → 0", () => {
    const r = calculerRevenuImposable({ salaires: 0, abattementSalaires: "forfait10" });
    expect(r).toBe(0);
  });
});

// ── projectionPER ─────────────────────────────────────────────────────────────
describe("projectionPER", () => {
  it("200 €/mois pendant 30 ans à 4 % — capital positif et courbe croissante", () => {
    const { capitalFinal, courbe } = projectionPER(200, 0.04, 30);
    expect(capitalFinal).toBeGreaterThan(100000);
    expect(courbe).toHaveLength(30);
    expect(courbe[29].capital).toBeGreaterThan(courbe[0].capital);
  });

  it("Durée 0 ans → tableau vide, capital 0", () => {
    const { capitalFinal, courbe } = projectionPER(200, 0.04, 0);
    expect(capitalFinal).toBe(0);
    expect(courbe).toHaveLength(0);
  });

  it("Profil Prudent (3%) < Dynamique (5%) à durée égale", () => {
    const { capitalFinal: prudent } = projectionPER(300, 0.03, 25);
    const { capitalFinal: dynamique } = projectionPER(300, 0.05, 25);
    expect(dynamique).toBeGreaterThan(prudent);
  });
});

// ── economieFiscaleAnnuelle ───────────────────────────────────────────────────
describe("economieFiscaleAnnuelle", () => {
  it("300 €/mois à TMI 30 % → 1 080 €/an", () => {
    expect(economieFiscaleAnnuelle(300, 30)).toBe(1080);
  });

  it("500 €/mois à TMI 41 % → 2 460 €/an", () => {
    expect(economieFiscaleAnnuelle(500, 41)).toBe(2460);
  });

  it("TMI 0 % → économie 0", () => {
    expect(economieFiscaleAnnuelle(300, 0)).toBe(0);
  });
});
