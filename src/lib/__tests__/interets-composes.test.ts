import {
  calculerInteretsComposes,
  InteretsComposesParams,
} from "../interets-composes";

// Base commune : aucun versement, taux/durée surchargés par cas.
const base: InteretsComposesParams = {
  capitalInitial: 0,
  versementPeriodique: 0,
  frequence: "annuel",
  tauxAnnuel: 5,
  dureeAnnees: 10,
  inflationActive: false,
  inflationTaux: 2,
  fiscalite: "aucune",
};

describe("calculerInteretsComposes", () => {
  // Cas 1 — référence manuelle : 10 000 € à 5 % sur 10 ans, sans versement.
  // 10000 × 1,05^10 = 16 288,95 → 16 289 €.
  test("10 000 € à 5 % sur 10 ans (annuel, sans versement) = 16 289 €", () => {
    const r = calculerInteretsComposes({ ...base, capitalInitial: 10000 });
    expect(r.capitalFinalBrut).toBe(16289);
    expect(r.totalVerse).toBe(10000);
    expect(r.interets).toBe(6289);
    expect(r.courbe).toHaveLength(11); // années 0 → 10
  });

  // Cas 2 — équivalence mensuel/annuel : le taux mensuel équivalent doit reproduire
  // exactement le taux annuel quand il n'y a pas de versement.
  test("capitalisation mensuelle au taux équivalent = annuelle (sans versement)", () => {
    const annuel = calculerInteretsComposes({ ...base, capitalInitial: 10000 });
    const mensuel = calculerInteretsComposes({
      ...base,
      capitalInitial: 10000,
      frequence: "mensuel",
    });
    expect(mensuel.capitalFinalBrut).toBe(annuel.capitalFinalBrut); // 16 289
  });

  // Cas 3 — versements purs sans rendement : 100 €/mois pendant 10 ans à 0 %.
  // 100 × 12 × 10 = 12 000 € versés, 0 € d'intérêts.
  test("100 €/mois sur 10 ans à 0 % = 12 000 € versés, 0 € d'intérêts", () => {
    const r = calculerInteretsComposes({
      ...base,
      frequence: "mensuel",
      versementPeriodique: 100,
      tauxAnnuel: 0,
    });
    expect(r.totalVerse).toBe(12000);
    expect(r.capitalFinalBrut).toBe(12000);
    expect(r.interets).toBe(0);
  });

  // Cas 4 — annuité de fin de période : 1 000 €/an à 5 % sur 10 ans, sans capital
  // initial. FV = 1000 × ((1,05^10 − 1) / 0,05) = 12 577,89 → 12 578 €.
  test("1 000 €/an à 5 % sur 10 ans (annuel) = 12 578 € (annuité fin de période)", () => {
    const r = calculerInteretsComposes({
      ...base,
      versementPeriodique: 1000,
      tauxAnnuel: 5,
    });
    expect(r.capitalFinalBrut).toBe(12578);
    expect(r.totalVerse).toBe(10000);
    expect(r.interets).toBe(2578);
  });

  // Cas 5 — fiscalité PFU 30 % sur les gains uniquement (cas 1).
  // gains 6 288,95 → impôt 0,30 × 6 288,95 = 1 886,68 → 1 887 € ; net 14 402 €.
  test("PFU 30 % ne s'applique qu'aux gains (cas 10 000 € / 5 % / 10 ans)", () => {
    const r = calculerInteretsComposes({
      ...base,
      capitalInitial: 10000,
      fiscalite: "pfu",
    });
    expect(r.impotSurGains).toBe(1887);
    expect(r.capitalNet).toBe(14402);
  });

  // Cas 6 — inflation 2 % : pouvoir d'achat du capital en euros constants.
  // 16 288,95 / 1,02^10 = 16 288,95 / 1,218994 = 13 362,85 → 13 363 €.
  test("inflation 2 % → euros constants (cas 10 000 € / 5 % / 10 ans)", () => {
    const r = calculerInteretsComposes({
      ...base,
      capitalInitial: 10000,
      inflationActive: true,
      inflationTaux: 2,
    });
    expect(r.capitalReel).toBe(13363);
  });
});
