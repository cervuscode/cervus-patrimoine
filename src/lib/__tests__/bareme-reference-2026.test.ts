import {
  TABLE_IMPOT_NET,
  REVENUS_REF,
  lookupImpotReference,
} from "../bareme-reference-2026";
import { calculerTMI } from "../fiscal-engine";

describe("lookupImpotReference — TMI effective calculée en direct", () => {
  const celib2 = TABLE_IMPOT_NET.find((s) => s.id === "celib-2")!;
  const couple0 = TABLE_IMPOT_NET.find((s) => s.id === "couple-0")!;

  it("célibataire 2 enfants 45 000 € → TMI 30 % (bug du screenshot corrigé)", () => {
    const r = lookupImpotReference(celib2, 45000)!;
    expect(r.tmi).toBe(30); // affichait 11 % (rattachement colonne 40k)
    expect(r.interpole).toBe(true);
  });

  it("célibataire 2 enfants 40 000 € → TMI 11 % (plafonnement pas encore actif)", () => {
    expect(lookupImpotReference(celib2, 40000)!.tmi).toBe(11);
  });

  it("couple 0 enfant 45 000 € → TMI 11 % (aucun plafonnement)", () => {
    expect(lookupImpotReference(couple0, 45000)!.tmi).toBe(11);
  });

  it("revenu nul → TMI 0", () => {
    expect(lookupImpotReference(celib2, 0)!.tmi).toBe(0);
  });
});

describe("TABLE_IMPOT_NET — la colonne TMI en dur correspond au moteur", () => {
  it("chaque case non-nulle : TMI grille === calculerTMI(R, partsBase, parts, ctx)", () => {
    for (const sit of TABLE_IMPOT_NET) {
      const ctx = sit.caseT ? { caseT: true } : {};
      sit.cells.forEach((cell, i) => {
        if (!cell) return;
        const attendu = calculerTMI(REVENUS_REF[i], sit.partsBase, sit.parts, ctx);
        expect({ id: sit.id, revenu: REVENUS_REF[i], tmi: cell[1] }).toEqual({
          id: sit.id,
          revenu: REVENUS_REF[i],
          tmi: attendu,
        });
      });
    }
  });
});
