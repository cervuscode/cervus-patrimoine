import {
  computeReduction,
  decoupeParTranche,
  DEFAULT_REDUCTION_INPUTS,
  type ReductionInputs,
} from "../reduction-impot";

function inputs(over: Partial<ReductionInputs>): ReductionInputs {
  return { ...DEFAULT_REDUCTION_INPUTS, ...over };
}

describe("reduction-impot — découpe par tranche (affichage)", () => {
  it("célibataire 60 000 € (1 part) : 3 tranches occupées, somme = revenu", () => {
    const slices = decoupeParTranche(60000, 1);
    expect(slices.map((s) => s.taux)).toEqual([0, 0.11, 0.3]);
    expect(slices[0].montant).toBeCloseTo(11600, 0);
    expect(slices[1].montant).toBeCloseTo(17979, 0);
    expect(slices[2].montant).toBeCloseTo(60000 - 29579, 0);
    const somme = slices.reduce((a, s) => a + s.montant, 0);
    expect(somme).toBeCloseTo(60000, 0);
  });

  it("couple 2 parts : seuils doublés (le 11 % démarre à 23 200 € foyer)", () => {
    const slices = decoupeParTranche(60000, 2);
    // 0 % jusqu'à 11600×2 = 23 200 ; 11 % de 23 200 à 29579×2 = 59 158 ;
    // petit reste à 30 % de 59 158 à 60 000.
    expect(slices.map((s) => s.taux)).toEqual([0, 0.11, 0.3]);
    expect(slices[0].montant).toBeCloseTo(23200, 0);
    expect(slices[1].montant).toBeCloseTo(59158 - 23200, 0);
    expect(slices[2].montant).toBeCloseTo(60000 - 59158, 0);
  });
});

describe("reduction-impot — computeReduction (cas de validation 60k/6k)", () => {
  it("célibataire 60 000 € + 6 000 € PER → économie 1 800 €/an, TMI 30 % inchangée", () => {
    const r = computeReduction(inputs({ revenuImposable: 60000, versementPer: 6000 }));
    expect(r.revenuApres).toBe(54000);
    expect(r.montantEfface).toBe(6000);
    expect(r.economie).toBe(1800);
    expect(r.avant.tmi).toBe(30);
    expect(r.apres.tmi).toBe(30);
    expect(r.tmiChange).toBe(false);
    // Le versement sort uniquement de la tranche 30 %.
    expect(r.tranchesEffacees).toHaveLength(1);
    expect(r.tranchesEffacees[0].taux).toBe(0.3);
    expect(r.tranchesEffacees[0].montant).toBeCloseTo(6000, 0);
  });

  it("versement faisant franchir un seuil → changement de TMI 30 % → 11 %", () => {
    // Célibataire : seuil 30 %/11 % à 29 579 €. Revenu 32 000, versement 6 000 →
    // après = 26 000 (< 29 579) → la tranche marginale redescend à 11 %.
    const r = computeReduction(inputs({ revenuImposable: 32000, versementPer: 6000 }));
    expect(r.avant.tmi).toBe(30);
    expect(r.apres.tmi).toBe(11);
    expect(r.tmiChange).toBe(true);
    // La portion retirée mord sur deux tranches (30 % puis 11 %).
    expect(r.tranchesEffacees.map((t) => t.taux)).toEqual([0.3, 0.11]);
  });

  it("versement > revenu → revenu après borné à 0, montant effacé = revenu", () => {
    const r = computeReduction(inputs({ revenuImposable: 20000, versementPer: 50000 }));
    expect(r.revenuApres).toBe(0);
    expect(r.montantEfface).toBe(20000);
    expect(r.apres.impotNet).toBe(0);
    expect(r.economie).toBe(r.avant.impotNet);
  });

  it("revenu nul → aucun découpage, économie nulle", () => {
    const r = computeReduction(inputs({ revenuImposable: 0, versementPer: 6000 }));
    expect(r.slicesAvant).toHaveLength(0);
    expect(r.economie).toBe(0);
    expect(r.tranchesEffacees).toHaveLength(0);
  });

  it("les chiffres viennent du vrai moteur (impôt après = impôt sur revenu réduit)", () => {
    const r = computeReduction(inputs({ revenuImposable: 60000, versementPer: 6000 }));
    const direct = computeReduction(inputs({ revenuImposable: 54000, versementPer: 0 }));
    expect(r.apres.impotNet).toBe(direct.avant.impotNet);
  });
});
