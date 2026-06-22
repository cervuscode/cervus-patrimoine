import {
  computePerSortie,
  defaultTrancheSortie,
  ligneConversionLaPlusProche,
  fractionImposableRente,
  decodePerSortieInputs,
  encodePerSortieInputs,
  PFU_TAUX,
  type PerSortieInputs,
} from "../per-sortie";

describe("defaultTrancheSortie — TMI effective via le toggle couple", () => {
  it("45 000 € / 2 parts : seul (base 1) → 30 % ; couple (base 2) → 11 %", () => {
    expect(defaultTrancheSortie(45000, 2, false)).toBe(30); // plafonnement QF actif
    expect(defaultTrancheSortie(45000, 2, true)).toBe(11); // couple, aucun plafonnement
  });

  it("revenu nul → 0", () => {
    expect(defaultTrancheSortie(0, 1)).toBe(0);
  });
});

// Câblage : consommation seule de fiscal-engine (déjà couvert par ses 76 tests).
// Cas de référence : vm=300, vi=5000, h=20 ans, profil équilibré (4 %), tranche 30 %.
const base: PerSortieInputs = {
  revenuImposable: 60000,
  parts: 2,
  anneeNaissance: 1972,
  versementMensuel: 300,
  versementInitial: 5000,
  horizon: 20,
  profil: "equilibre",
  trancheSortie: 30,
  ageConversion: 67,
};

describe("computePerSortie — accumulation", () => {
  it("capital, versements cumulés et plus-value", () => {
    const r = computePerSortie(base);
    expect(r.capitalFinal).toBe(120108);
    expect(r.versementsCumules).toBe(77000); // 5000 + 300×12×20
    expect(r.plusValue).toBe(43108);
  });
});

describe("Sortie 1 — capital intégral", () => {
  it("versements à la tranche, PV au PFU 30 %", () => {
    const r = computePerSortie(base);
    expect(r.sortie1.impotVersements).toBe(23100); // 77000 × 30 %
    expect(r.sortie1.impotPlusValue).toBe(12932); // 43108 × 30 %
    expect(r.sortie1.impotTotal).toBe(36032);
    expect(r.sortie1.capitalNet).toBe(84076);
    expect(PFU_TAUX).toBe(0.3);
  });
});

describe("Sortie 2 — fractionnement 20 ans, non-sorti à 2 %", () => {
  it("retrait fixe = capital/20, intérêts taxés PFU, résiduel inclus", () => {
    const r = computePerSortie(base);
    expect(r.sortie2.flux).toHaveLength(20);
    expect(r.sortie2.retraitAnnuel).toBe(6005); // 120108 / 20
    expect(r.sortie2.interetsFondsEuro).toBe(29640);
    expect(r.sortie2.capitalBrutTotal).toBe(149748); // capital + intérêts
    expect(r.sortie2.impotTotal).toBe(44925);
    expect(r.sortie2.capitalNet).toBe(104824);
  });
});

describe("Sortie 3 — rente Abeille", () => {
  it("taux de conversion exact pour une ligne de la table (1972, 67 ans)", () => {
    const r = computePerSortie(base);
    expect(r.sortie3.disponible).toBe(true);
    expect(r.sortie3.tauxApplique).toBe(0.0337);
    expect(r.sortie3.fractionImposable).toBe(0.4); // 60-69 ans
    expect(r.sortie3.renteAnnuelle).toBe(4048); // 120108 × 3,37 %
    expect(r.sortie3.impotPS).toBe(278); // 1619,06 × 17,2 %
    // net ≈ rente − IR − PS (à 1 € près : le net arrondit la différence non arrondie)
    expect(
      Math.abs(
        r.sortie3.renteNetteAnnuelle -
          (r.sortie3.renteAnnuelle - r.sortie3.impotIR - r.sortie3.impotPS)
      )
    ).toBeLessThanOrEqual(1);
    expect(r.sortie3.renteNetteAnnuelle).toBeLessThan(r.sortie3.renteAnnuelle);
  });

  it("conversion à 64 ans non proposée pour 1957 (taux64 null) → indisponible", () => {
    const r = computePerSortie({ ...base, anneeNaissance: 1957, ageConversion: 64 });
    expect(r.sortie3.disponible).toBe(false);
    expect(r.sortie3.renteAnnuelle).toBe(0);
  });
});

describe("Tables de référence", () => {
  it("rattachement à la tranche de 5 ans la plus proche (pas d'interpolation)", () => {
    expect(ligneConversionLaPlusProche(1970).naissance).toBe(1972);
    expect(ligneConversionLaPlusProche(1965).naissance).toBe(1967);
    expect(ligneConversionLaPlusProche(1955).naissance).toBe(1957);
    expect(ligneConversionLaPlusProche(1972).naissance).toBe(1972);
  });

  it("fraction imposable RVTO par âge au 1er versement", () => {
    expect(fractionImposableRente(45)).toBe(0.7);
    expect(fractionImposableRente(55)).toBe(0.5);
    expect(fractionImposableRente(64)).toBe(0.4);
    expect(fractionImposableRente(67)).toBe(0.4);
    expect(fractionImposableRente(72)).toBe(0.3);
  });
});

describe("encode / decode", () => {
  it("roundtrip stable", () => {
    expect(decodePerSortieInputs(encodePerSortieInputs(base))).toEqual(base);
  });
  it("défauts robustes + âge de conversion clampé à 64|67", () => {
    const d = decodePerSortieInputs({ ac: "70" });
    expect(d.ageConversion).toBe(67);
    expect(d.parts).toBe(1);
    expect(d.profil).toBe("equilibre");
  });
});
