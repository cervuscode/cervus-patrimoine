import { RDV_FIELDS, SECTION_ORDER, SECTION_LABELS } from "../rdv-fields";

describe("RDV_FIELDS — registre des champs Découverte RDV", () => {
  it("ids uniques", () => {
    const ids = RDV_FIELDS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("decName (noms Pipedrive) uniques", () => {
    const names = RDV_FIELDS.map((f) => f.decName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("chaque section utilisée est déclarée dans SECTION_ORDER + SECTION_LABELS", () => {
    for (const f of RDV_FIELDS) {
      expect(SECTION_ORDER).toContain(f.section);
      expect(SECTION_LABELS[f.section]).toBeTruthy();
    }
  });

  it("Chantier D : les 6 enveloppes patrimoine + le résiduel sont présents (Person/money)", () => {
    const expected = [
      "encoursAv",
      "encoursPea",
      "livretsReglementes",
      "livretsBoostes",
      "cto",
      "crypto",
      "autreEpargne",
    ];
    for (const id of expected) {
      const f = RDV_FIELDS.find((x) => x.id === id);
      expect(f).toBeDefined();
      expect(f!.section).toBe("patrimoine");
      expect(f!.entity).toBe("person");
      expect(f!.kind).toBe("money");
    }
  });

  it("Chantier C : champ RFR réel présent (Person/money, section revenus, Découverte-only)", () => {
    const f = RDV_FIELDS.find((x) => x.id === "rfrReel");
    expect(f).toBeDefined();
    expect(f!.entity).toBe("person");
    expect(f!.kind).toBe("money");
    expect(f!.section).toBe("revenus");
    expect(f!.simName).toBeUndefined(); // jamais de miroir Simulation
  });

  it("avExistante retiré du registre (remplacé par encoursAv)", () => {
    expect(RDV_FIELDS.find((x) => x.id === "avExistante")).toBeUndefined();
  });

  it("autreEpargne conservé (relabel) avec son decName Pipedrive inchangé", () => {
    const f = RDV_FIELDS.find((x) => x.id === "autreEpargne");
    expect(f).toBeDefined();
    expect(f!.label).toBe("Autre épargne financière");
    expect(f!.decName).toBe("Autre épargne (Découverte RDV)");
    expect(f!.section).toBe("patrimoine");
  });
});
