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

  it("Couple + 1 enfant 70k€ → ~5 401 € (plafonnement QF actif, barème 2026)", () => {
    // Sans enfants: 7208 | Avec 2.5 parts: 4510 | Économie: 2698 > plafond 1807
    // → impôt réel = 7208 - 1807 = 5401
    const { partsBase, partsTotal } = calculerParts("marie", 1);
    expect(impotReel(70000, partsBase, partsTotal)).toBeCloseTo(5401, 0);
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

  // ── Décote (impôt net = brut − décote, barème 2026) ─────────────────────────
  it("Couple 35k€ → 402 € (décote couple : brut 1298 − décote 896)", () => {
    const { partsBase, partsTotal } = calculerParts("marie", 0);
    expect(impotReel(35000, partsBase, partsTotal)).toBeCloseTo(402, 0);
  });

  it("Parent isolé 1 enfant 40k€ → 1 787 € (décote célib : brut 1848 − décote 61)", () => {
    const { partsBase, partsTotal } = calculerParts("parent_isole", 1);
    expect(impotReel(40000, partsBase, partsTotal, { caseT: true })).toBeCloseTo(1787, 0);
  });

  // ── Plafond case T différencié (parent isolé, barème 2026) ───────────────────
  it("Parent isolé 1 enfant 200k€ → 62 262 € (plafond case T 4262)", () => {
    // Économie QF >> plafond → impôt = sans enfant (66524) − 4262
    const { partsBase, partsTotal } = calculerParts("parent_isole", 1);
    expect(impotReel(200000, partsBase, partsTotal, { caseT: true })).toBeCloseTo(62262, 0);
  });

  it("Parent isolé 2 enfants 200k€ → 60 455 € (plafond case T 4262 + 1 demi-part 1807)", () => {
    // Plafond total = 4262 + 1807 = 6069 → impôt = 66524 − 6069
    const { partsBase, partsTotal } = calculerParts("parent_isole", 2);
    expect(impotReel(200000, partsBase, partsTotal, { caseT: true })).toBeCloseTo(60455, 0);
  });

  it("Parent isolé 3 enfants 200k€ → 56 841 € (case T 4262 + 3 demi-parts 1807)", () => {
    // parts 1/3.5 → demi-parts ordinaires = (2.5×2)−2 = 3
    // Plafond total = 4262 + 3×1807 = 9683 → impôt = 66524 − 9683 = 56841
    const { partsBase, partsTotal } = calculerParts("parent_isole", 3);
    expect(impotReel(200000, partsBase, partsTotal, { caseT: true })).toBeCloseTo(56841, 0);
  });
});

// ── calculerTMI ───────────────────────────────────────────────────────────────
describe("calculerTMI", () => {
  it("Célibataire 15k€ → TMI 0 % (impôt net nul après décote, barème 2026)", () => {
    // À 15k : brut 374, décote 727 > brut → net 0 ; marginal sur +1000 € = 0
    const { partsBase, partsTotal } = calculerParts("celibataire", 0);
    expect(calculerTMI(15000, partsBase, partsTotal)).toBe(0);
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

  // Demi-part handicap : +0,5 UNIQUEMENT sur partsTotal, jamais sur partsBase.
  it("Célibataire 0 enfant + handicap → 1/1.5", () => {
    expect(calculerParts("celibataire", 0, true)).toEqual({ partsBase: 1, partsTotal: 1.5 });
  });

  it("Couple 2 enfants + handicap → 2/3.5", () => {
    expect(calculerParts("marie", 2, true)).toEqual({ partsBase: 2, partsTotal: 3.5 });
  });

  it("Couple 4 enfants + handicap → 2/5.5 (cas BOFiP)", () => {
    expect(calculerParts("marie", 4, true)).toEqual({ partsBase: 2, partsTotal: 5.5 });
  });

  it("handicap=false (défaut) ne change rien", () => {
    expect(calculerParts("celibataire", 0, false)).toEqual({ partsBase: 1, partsTotal: 1 });
  });
});

// ── Demi-part handicap/invalidité (plafond 1807 + réduction complémentaire 1801) ─
describe("demi-part handicap", () => {
  // Référence OFFICIELLE BOFiP BOI-IR-LIQ-20-20-20 §185 :
  // couple marié, 4 enfants dont 1 invalide, revenu net imposable 130 000 €.
  // parts = 5,5 (couple 2 + enfants 3 + handicap 0,5) → impôt = 10 758 €.
  it("BOFiP §185 : couple 4 enf dont 1 invalide, 130k → 10 758 € (au centime)", () => {
    const { partsBase, partsTotal } = calculerParts("marie", 4, true);
    expect(partsTotal).toBe(5.5);
    expect(Math.round(impotReel(130000, partsBase, partsTotal, { handicap: true }))).toBe(10758);
  });

  // Plafond NE mord PAS (economieReelle 1668 <= 1807) → pas de réduction compl,
  // mais l'impôt AVEC handicap reste strictement < SANS (le +0,5 part agit).
  it("Célib 0 enf 35k : SANS = 3604, AVEC < 3604 (le +0,5 agit, plafond ne mord pas)", () => {
    const sans = calculerParts("celibataire", 0, false);
    const avec = calculerParts("celibataire", 0, true);
    const impSans = Math.round(impotReel(35000, sans.partsBase, sans.partsTotal));
    const impAvec = Math.round(impotReel(35000, avec.partsBase, avec.partsTotal, { handicap: true }));
    expect(impSans).toBe(3604);
    expect(impAvec).toBeLessThan(impSans);
    expect(impAvec).toBe(1915);
  });

  it("Couple 2 enf 90k : SANS = 9594, AVEC < 9594", () => {
    const sans = calculerParts("marie", 2, false);
    const avec = calculerParts("marie", 2, true);
    const impSans = Math.round(impotReel(90000, sans.partsBase, sans.partsTotal));
    const impAvec = Math.round(impotReel(90000, avec.partsBase, avec.partsTotal, { handicap: true }));
    expect(impSans).toBe(9594);
    expect(impAvec).toBeLessThan(impSans);
    expect(impAvec).toBe(5986);
  });

  // Plafond mord à plein : écart AVEC vs SANS = 1807 (QF plafonné) + 1801 (réduc).
  it("Célib 0 enf 200k : SANS = 66524, AVEC = 62916 (écart exact 3608 = 1807 + 1801)", () => {
    const sans = calculerParts("celibataire", 0, false);
    const avec = calculerParts("celibataire", 0, true);
    const impSans = Math.round(impotReel(200000, sans.partsBase, sans.partsTotal));
    const impAvec = Math.round(impotReel(200000, avec.partsBase, avec.partsTotal, { handicap: true }));
    expect(impSans).toBe(66524);
    expect(impAvec).toBe(62916);
    expect(impSans - impAvec).toBe(3608);
  });

  it("Couple 1 enf 250k AVEC handicap → 64686 €", () => {
    const { partsBase, partsTotal } = calculerParts("marie", 1, true);
    expect(partsTotal).toBe(3);
    expect(Math.round(impotReel(250000, partsBase, partsTotal, { handicap: true }))).toBe(64686);
  });

  // Non-régression : ctx sans handicap = comportement historique inchangé.
  it("Couple 1 enf 250k SANS handicap = 68294 € (réduc compl. ne s'applique pas)", () => {
    const { partsBase, partsTotal } = calculerParts("marie", 1, false);
    expect(Math.round(impotReel(250000, partsBase, partsTotal))).toBe(68294);
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
