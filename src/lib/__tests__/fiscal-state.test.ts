import {
  computeFiscalState,
  mapStatutToParts,
  STATUT_MARITAL_OPTIONS,
} from "../fiscal-state";
import { calculerParts, calculerRevenuImposable, calculerTMI } from "../fiscal-engine";

describe("computeFiscalState — priorité champ explicite", () => {
  it("parts explicites = TOTAL ; partsBase reconstruit du statut (couple → 2)", () => {
    const fs = computeFiscalState({ revenuImposable: 60000, partsFiscales: 2, statutMarital: "Marié(e)" });
    expect(fs.revenuNetImposable).toBe(60000);
    expect(fs.partsBase).toBe(2); // couple
    expect(fs.partsTotal).toBe(2);
    expect(fs.tmi).toBe(calculerTMI(60000, 2, 2));
  });

  it("parts explicites sans statut → personne seule (partsBase 1)", () => {
    const fs = computeFiscalState({ revenuImposable: 60000, partsFiscales: 2 });
    expect(fs.partsBase).toBe(1); // défaut célibataire
    expect(fs.partsTotal).toBe(2);
    expect(fs.tmi).toBe(calculerTMI(60000, 1, 2));
  });

  it("repli revenu : calculerRevenuImposable depuis salaire mensuel si revenu absent", () => {
    const fs = computeFiscalState({ partsFiscales: 1, salaireMensuel: 4000 });
    const attendu = calculerRevenuImposable({ salaires: 48000, abattementSalaires: "forfait10" });
    expect(fs.revenuNetImposable).toBe(attendu); // 48000 − 4800 = 43200
    expect(attendu).toBe(43200);
  });

  it("repli parts : calculerParts(statut, enfants) si partsFiscales absent", () => {
    const fs = computeFiscalState({ revenuImposable: 70000, statutMarital: "Marié(e)", nbEnfants: 2 });
    const p = calculerParts("marie", 2);
    expect(fs.partsBase).toBe(p.partsBase); // 2
    expect(fs.partsTotal).toBe(p.partsTotal); // 3
    expect(fs.tmi).toBe(calculerTMI(70000, p.partsBase, p.partsTotal));
  });

  it("revenu nul → TMI 0", () => {
    expect(computeFiscalState({}).tmi).toBe(0);
  });
});

describe("TMI effective — plafonnement du quotient familial (non-régression bug 11/30)", () => {
  it("célibataire 2 enfants 45 000 € → TMI 30 % (plafonnement actif)", () => {
    const fs = computeFiscalState({ revenuImposable: 45000, statutMarital: "Célibataire", nbEnfants: 2 });
    expect(fs.partsBase).toBe(1);
    expect(fs.partsTotal).toBe(2);
    expect(fs.tmi).toBe(30); // ⚠️ le bug affichait 11 %
  });

  it("célibataire 2 enfants 40 000 € → TMI 11 % (plafonnement pas encore actif — borne)", () => {
    const fs = computeFiscalState({ revenuImposable: 40000, statutMarital: "Célibataire", nbEnfants: 2 });
    expect(fs.tmi).toBe(11);
  });

  it("couple 0 enfant 45 000 € (2 parts) → TMI 11 % (aucun plafonnement)", () => {
    const fs = computeFiscalState({ revenuImposable: 45000, statutMarital: "Marié(e)", nbEnfants: 0 });
    expect(fs.partsBase).toBe(2);
    expect(fs.partsTotal).toBe(2);
    expect(fs.tmi).toBe(11);
  });

  it("parts explicites 2 + statut célibataire 45 000 € → TMI 30 % (base 1 reconstruite)", () => {
    const fs = computeFiscalState({ revenuImposable: 45000, partsFiscales: 2, statutMarital: "Célibataire" });
    expect(fs.partsBase).toBe(1);
    expect(fs.tmi).toBe(30);
  });
});

describe("mapStatutToParts — correspondance directe + repli", () => {
  it("libellés du menu → enum exact", () => {
    expect(mapStatutToParts("Célibataire")).toBe("celibataire");
    expect(mapStatutToParts("Marié(e)")).toBe("marie");
    expect(mapStatutToParts("Pacsé(e)")).toBe("pacse");
    expect(mapStatutToParts("Divorcé(e)")).toBe("divorce");
    expect(mapStatutToParts("Veuf(ve)")).toBe("celibataire"); // 1 part
  });

  it("repli tolérant pour anciennes valeurs texte libre", () => {
    expect(mapStatutToParts("marié")).toBe("marie");
    expect(mapStatutToParts("PACS")).toBe("pacse");
    expect(mapStatutToParts("parent isolé")).toBe("parent_isole");
    expect(mapStatutToParts("Concubin")).toBe("celibataire");
    expect(mapStatutToParts(undefined)).toBe("celibataire");
  });

  it("chaque option du menu mappe vers un enum valide de calculerParts", () => {
    for (const o of STATUT_MARITAL_OPTIONS) {
      expect(mapStatutToParts(o.label)).toBe(o.statut);
    }
  });
});
