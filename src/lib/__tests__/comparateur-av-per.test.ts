import {
  computeComparateur,
  DEFAULT_COMPARATEUR_INPUTS,
  SEUIL_QUASI_PARITE_PCT,
  type ComparateurInputs,
} from "../comparateur-av-per";

function inputs(over: Partial<ComparateurInputs>): ComparateurInputs {
  return { ...DEFAULT_COMPARATEUR_INPUTS, ...over };
}

// Cas de référence commun : effort net 210 €/mois, équilibré 4 %, 20 ans, célibataire.
const base = {
  effortNetMensuel: 210,
  effortNetInitial: 0,
  horizon: 20,
  profil: "equilibre" as const,
  marie: false,
};

describe("comparateur-av-per — Option B (effort net égal)", () => {
  it("facteur de levier exact : effort 210 € à TMI 30 % → versement PER 300 €/mois", () => {
    // tranche de sortie = TMI 30 (défaut neutre).
    const r = computeComparateur(inputs({ ...base, revenuImposable: 60000, trancheSortie: 30 }));
    expect(r.tmi).toBe(30);
    expect(r.facteurLevier).toBeCloseTo(1 / 0.7, 5);
    expect(r.perMensuel).toBe(300); // 210 / 0,70
    expect(r.economieMensuelle).toBe(90); // 300 − 210
    // AV reçoit l'effort net tel quel (pas de majoration).
    expect(r.av.primesVersees).toBe(210 * 12 * 20);
  });

  it("TMI 30 % → PER nettement devant (effet de levier)", () => {
    const r = computeComparateur(inputs({ ...base, revenuImposable: 60000, trancheSortie: 30 }));
    expect(r.gagnant).toBe("per");
    expect(r.per.capitalNet).toBeGreaterThan(r.av.capitalNetSans);
    expect(r.ecartPct).toBeGreaterThan(SEUIL_QUASI_PARITE_PCT); // hors quasi-parité
  });

  it("TMI 11 % → quasi-parité (écart ~0,7 % ≤ 1 %) → verdict « egal » (souplesse AV)", () => {
    const r = computeComparateur(inputs({ ...base, revenuImposable: 20000, trancheSortie: 11 }));
    expect(r.tmi).toBe(11);
    expect(r.ecartPct).toBeLessThanOrEqual(SEUIL_QUASI_PARITE_PCT);
    expect(r.gagnant).toBe("egal");
  });

  it("TMI 0 % → AV devant (aucun levier, PER taxe la PV au PFU)", () => {
    // Revenu sous le seuil d'imposition → TMI 0, facteur de levier = 1.
    const r = computeComparateur(inputs({ ...base, revenuImposable: 12000, trancheSortie: 0 }));
    expect(r.tmi).toBe(0);
    expect(r.facteurLevier).toBe(1);
    expect(r.perMensuel).toBe(210); // pas de majoration
    expect(r.gagnant).toBe("av");
    expect(r.av.capitalNetSans).toBeGreaterThan(r.per.capitalNet);
  });

  it("horizon < 8 ans : consomme av-engine à jour (calcul sans erreur, fiscalité < 8 ans)", () => {
    const r = computeComparateur(
      inputs({ ...base, revenuImposable: 60000, trancheSortie: 30, horizon: 5 })
    );
    expect(Number.isFinite(r.per.capitalNet)).toBe(true);
    expect(Number.isFinite(r.av.capitalNetSans)).toBe(true);
    expect(r.av.capitalNetSans).toBeGreaterThan(0);
  });

  it("TMI injectée (mode connecté) prioritaire sur le calcul local", () => {
    const r = computeComparateur(
      inputs({ ...base, revenuImposable: 0, trancheSortie: 30 }),
      { tmi: 41 }
    );
    expect(r.tmi).toBe(41);
    expect(r.facteurLevier).toBeCloseTo(1 / 0.59, 5);
  });

  it("TMI effective : `marie` reconstruit partsBase (plafonnement QF, bug 11/30)", () => {
    // 45 000 €, 2 parts. Parent seul 2 enfants (marie false → base 1) → TMI 30 %
    // (plafonnement actif) ; couple 0 enfant (marie true → base 2) → TMI 11 %.
    const seul = computeComparateur(inputs({ ...base, revenuImposable: 45000, parts: 2, marie: false }));
    const couple = computeComparateur(inputs({ ...base, revenuImposable: 45000, parts: 2, marie: true }));
    expect(seul.tmi).toBe(30);
    expect(couple.tmi).toBe(11);
  });

  it("apport initial net majoré comme l'effort mensuel (même facteur)", () => {
    const r = computeComparateur(
      inputs({ revenuImposable: 60000, trancheSortie: 30, effortNetMensuel: 0, effortNetInitial: 7000, horizon: 20, profil: "equilibre", marie: false })
    );
    expect(r.perInitial).toBe(10000); // 7000 / 0,70
    expect(r.economieInitiale).toBe(3000);
  });
});
