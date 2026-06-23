import {
  computePlafondTNS,
  computePlafondTotal,
  HUIT_PASS,
  PER_TNS_PLAFOND_MAX,
} from "../plafond-per";
import { PASS_2026, PER_PLANCHER, PER_PLAFOND_MAX } from "../per-quick";

// PASS 2026 = 48 060 € → plancher 4 806, plafond salarié max 38 448, TNS max 88 911.

describe("constantes PASS 2026", () => {
  it("plancher et plafonds calés sur le PASS 2026", () => {
    expect(PASS_2026).toBe(48060);
    expect(PER_PLANCHER).toBe(4806); // 10 % × 48 060
    expect(PER_PLAFOND_MAX).toBe(38448); // 10 % × 8 × 48 060
    expect(HUIT_PASS).toBe(384480);
  });
});

describe("computePlafondTNS — Madelin (art. 154 bis)", () => {
  it("bénéfice < PASS → plancher 10 % PASS (4 806 €)", () => {
    const r = computePlafondTNS(30000, 0); // 10 % = 3 000 ; 15 % × max(0,30000−48060)=0
    expect(r.plafond).toBe(PER_PLANCHER);
    expect(r.detail.plancherApplique).toBe(true);
    expect(r.detail.plafondMaxApplique).toBe(false);
  });

  it("bénéfice entre 1 et 8 PASS → 10 % bénéfice + 15 % (bénéfice − PASS)", () => {
    // bénéfice 80 000 : 10 % × 80 000 = 8 000 ; 15 % × (80 000 − 48 060) = 15 % × 31 940 = 4 791
    const r = computePlafondTNS(50000, 30000);
    expect(r.detail.benefice).toBe(80000);
    expect(r.detail.part10).toBeCloseTo(8000, 5);
    expect(r.detail.part15).toBeCloseTo(4791, 5);
    expect(r.plafond).toBeCloseTo(12791, 5);
    expect(r.detail.plancherApplique).toBe(false);
  });

  it("bénéfice ≥ 8 PASS → plafond maximum 88 911 € (bénéfice capé à 8 PASS)", () => {
    const r = computePlafondTNS(500000, 0); // capé à 384 480
    expect(r.detail.beneficePlafonne).toBe(HUIT_PASS);
    // 10 % × 384 480 = 38 448 ; 15 % × (384 480 − 48 060) = 15 % × 336 420 = 50 463
    expect(r.plafond).toBeCloseTo(88911, 5);
    expect(r.plafond).toBe(PER_TNS_PLAFOND_MAX);
    expect(r.detail.plafondMaxApplique).toBe(true);
  });

  it("bénéfice exactement 8 PASS = même résultat que > 8 PASS (cap)", () => {
    const exact = computePlafondTNS(HUIT_PASS, 0).plafond;
    const above = computePlafondTNS(HUIT_PASS + 100000, 0).plafond;
    expect(exact).toBeCloseTo(88911, 5);
    expect(above).toBe(exact);
  });
});

describe("computePlafondTotal — cumul salarié + TNS", () => {
  it("non-TNS : plafondTNS = 0, total = salarié", () => {
    const r = computePlafondTotal({ revenuImposable: 100000, foncier: 0, estTNS: false });
    expect(r.plafondSalarie).toBe(10000);
    expect(r.plafondTNS).toBe(0);
    expect(r.plafondTotal).toBe(10000);
  });

  it("salarié : exclusion du foncier de l'assiette", () => {
    const r = computePlafondTotal({ revenuImposable: 120000, foncier: 20000, estTNS: false });
    expect(r.plafondSalarie).toBe(10000); // (120k − 20k) × 10 %
  });

  it("mixte (salaire + BNC/BIC) : les deux plafonds s'additionnent", () => {
    // proNet 90 000 → salarié 9 000 ; TNS bénéfice 50 000 → 5 000 + 15 % × (50 000 − 48 060)=291 → 5 291
    const r = computePlafondTotal({
      revenuImposable: 90000,
      foncier: 0,
      bnc: 50000,
      bic: 0,
      estTNS: true,
    });
    expect(r.plafondSalarie).toBe(9000);
    expect(r.plafondTNS).toBeCloseTo(5291, 5);
    expect(r.plafondTotal).toBeCloseTo(14291, 5);
  });

  it("TNS pur (pas de salaire) : plancher salarié 4 806 € + Madelin", () => {
    const r = computePlafondTotal({ revenuImposable: 0, bnc: 0, bic: 70000, estTNS: true });
    expect(r.plafondSalarie).toBe(PER_PLANCHER); // plancher 10 % PASS
    // bénéfice 70 000 → 7 000 + 15 % × (70 000 − 48 060) = 15 % × 21 940 = 3 291 → 10 291
    expect(r.plafondTNS).toBeCloseTo(10291, 5);
    expect(r.plafondTotal).toBeCloseTo(PER_PLANCHER + 10291, 5);
  });

  it("plafond salarié borné à 8 PASS (gros revenu)", () => {
    const r = computePlafondTotal({ revenuImposable: 600000, foncier: 0, estTNS: false });
    expect(r.plafondSalarie).toBe(PER_PLAFOND_MAX); // 38 448
  });
});
