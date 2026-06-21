import {
  computeImpot,
  resolveParts,
  normalizeGarde,
  normalizeStatutLabel,
  DEFAULT_IMPOT_INPUTS,
  type ImpotInputs,
} from "../impot-sim";

function make(over: Partial<ImpotInputs>): ImpotInputs {
  return { ...DEFAULT_IMPOT_INPUTS, ...over };
}

// Valeurs de référence = sorties ACTUELLES du moteur (fiscal-engine.ts, barème 2026).
// NB : les valeurs « ~ » du commentaire en pied de fiscal-engine.ts datent d'un
// barème antérieur (seuil 30 % différent) — le moteur reste la seule source de vérité.
describe("computeImpot — croisement des cas du barème 2026", () => {
  it("célibataire, 0 enfant, 30 000 € → ~2 104 €, TMI 30 %, 1 part", () => {
    const r = computeImpot(make({ statut: "Célibataire", revenuImposable: 30000 }));
    expect(r.impotNet).toBeGreaterThan(2050);
    expect(r.impotNet).toBeLessThan(2150);
    expect(r.tmi).toBe(30); // 30 000 > 29 579 → tranche 30 %
    expect(r.partsTotal).toBe(1);
    expect(r.plafonnementActif).toBe(false);
  });

  it("marié, 0 enfant, 70 000 € → ~7 208 €, TMI 30 %, 2 parts", () => {
    const r = computeImpot(make({ statut: "Marié(e)", revenuImposable: 70000 }));
    expect(r.impotNet).toBeGreaterThan(7150);
    expect(r.impotNet).toBeLessThan(7270);
    expect(r.tmi).toBe(30);
    expect(r.partsTotal).toBe(2);
  });

  it("marié, 1 enfant, 70 000 € → 2,5 parts, plafonnement QF ACTIF", () => {
    const r = computeImpot(make({ statut: "Marié(e)", nbEnfants: 1, revenuImposable: 70000 }));
    expect(r.partsTotal).toBe(2.5);
    expect(r.impotNet).toBeGreaterThan(5340);
    expect(r.impotNet).toBeLessThan(5460);
    expect(r.plafonnementActif).toBe(true);
  });

  it("marié, 1 enfant, 60 000 € → 2,5 parts, plafonnement PAS encore actif", () => {
    const r = computeImpot(make({ statut: "Marié(e)", nbEnfants: 1, revenuImposable: 60000 }));
    expect(r.partsTotal).toBe(2.5);
    expect(r.tmi).toBe(11);
    expect(r.plafonnementActif).toBe(false);
  });

  it("célibataire, 0 enfant, 90 000 € → ~20 701 €, TMI 41 %", () => {
    const r = computeImpot(make({ statut: "Célibataire", revenuImposable: 90000 }));
    expect(r.impotNet).toBeGreaterThan(20600);
    expect(r.impotNet).toBeLessThan(20800);
    expect(r.tmi).toBe(41);
  });

  it("célibataire, 0 enfant, 200 000 € → ~66 524 €, TMI 45 %", () => {
    const r = computeImpot(make({ statut: "Célibataire", revenuImposable: 200000 }));
    expect(r.impotNet).toBeGreaterThan(66400);
    expect(r.impotNet).toBeLessThan(66650);
    expect(r.tmi).toBe(45);
  });

  it("taux moyen = impôt net / revenu", () => {
    const r = computeImpot(make({ statut: "Célibataire", revenuImposable: 30000 }));
    expect(r.tauxMoyen).toBeCloseTo(r.impotNet / 30000, 6);
  });

  it("revenu nul → impôt 0, TMI 0", () => {
    const r = computeImpot(make({ revenuImposable: 0 }));
    expect(r.impotNet).toBe(0);
    expect(r.tmi).toBe(0);
    expect(r.tauxMoyen).toBe(0);
  });
});

describe("resolveParts — statut + garde + case T + handicap", () => {
  it("célibataire 1 enfant garde classique → célibataire, 1,5 parts", () => {
    const p = resolveParts(make({ statut: "Célibataire", nbEnfants: 1, garde: "classique" }));
    expect(p.statutEffectif).toBe("celibataire");
    expect(p.partsTotal).toBe(1.5);
    expect(p.caseT).toBe(false);
  });

  it("célibataire 1 enfant garde alternée → garde_partagee, 1,25 parts", () => {
    const p = resolveParts(make({ statut: "Célibataire", nbEnfants: 1, garde: "alternee" }));
    expect(p.statutEffectif).toBe("garde_partagee");
    expect(p.partsTotal).toBe(1.25);
    expect(p.caseT).toBe(false);
  });

  it("célibataire 1 enfant parent isolé → parent_isole + case T, 2 parts", () => {
    const p = resolveParts(make({ statut: "Célibataire", nbEnfants: 1, garde: "isole" }));
    expect(p.statutEffectif).toBe("parent_isole");
    expect(p.partsTotal).toBe(2);
    expect(p.caseT).toBe(true);
  });

  it("marié → garde ignorée (couple)", () => {
    const p = resolveParts(make({ statut: "Marié(e)", nbEnfants: 1, garde: "isole" }));
    expect(p.statutEffectif).toBe("marie");
    expect(p.caseT).toBe(false);
    expect(p.partsTotal).toBe(2.5);
  });

  it("demi-part handicap → +0,5 sur partsTotal uniquement", () => {
    const p = resolveParts(make({ statut: "Célibataire", nbEnfants: 0, demiPartHandicap: true }));
    expect(p.partsBase).toBe(1);
    expect(p.partsTotal).toBe(1.5);
  });
});

describe("normalisation des libellés", () => {
  it("normalizeStatutLabel renvoie un libellé exact du menu", () => {
    expect(normalizeStatutLabel("Marié(e)")).toBe("Marié(e)");
    expect(normalizeStatutLabel("marié")).toBe("Marié(e)");
    expect(normalizeStatutLabel("PACS")).toBe("Pacsé(e)");
    expect(normalizeStatutLabel("Veuf(ve)")).toBe("Veuf(ve)");
    expect(normalizeStatutLabel(undefined)).toBe("Célibataire");
    expect(normalizeStatutLabel("n'importe quoi")).toBe("Célibataire");
  });

  it("normalizeGarde mappe les valeurs texte", () => {
    expect(normalizeGarde("Garde alternée")).toBe("alternee");
    expect(normalizeGarde("partagée")).toBe("alternee");
    expect(normalizeGarde("parent isolé")).toBe("isole");
    expect(normalizeGarde(undefined)).toBe("classique");
  });
});
