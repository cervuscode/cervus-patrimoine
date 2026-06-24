import {
  computeAvSim,
  DEFAULT_AV_INPUTS,
  AV_DUREE_MAX,
  asAvProfil,
  normalizeAvProfil,
  type AvSimInputs,
} from "../av-sim";

function inputs(over: Partial<AvSimInputs>): AvSimInputs {
  return { ...DEFAULT_AV_INPUTS, ...over };
}

// Cas de référence (calé sur les sorties RÉELLES de av-engine via calculerAV) :
// 10 000 € initial + 200 €/mois, équilibré 4 %, 20 ans, célibataire.
const REF = inputs({
  versementInitial: 10000,
  versementMensuel: 200,
  dureeAnnees: 20,
  profil: "equilibre",
  marie: false,
});

describe("av-sim — wrapper conseiller standalone de av-engine", () => {
  it("expose les 3 capitaux + gain optimisation = sorties réelles du moteur", () => {
    const r = computeAvSim(REF);
    expect(r.capitalFinalBrut).toBe(94680);
    expect(r.capitalNet).toBe(85965);
    expect(r.capitalNetOptimise).toBe(87074);
    expect(r.gainOptimisation).toBe(1109);
    expect(r.optimisationUtile).toBe(true);
    // Le capital net optimisé ne peut jamais être en dessous du capital net simple.
    expect(r.capitalNetOptimise).toBeGreaterThanOrEqual(r.capitalNet);
    // Le net est inférieur au brut (fiscalité de sortie).
    expect(r.capitalNet).toBeLessThan(r.capitalFinalBrut);
  });

  it("total versé = initial + mensuel × 12 × durée", () => {
    const r = computeAvSim(REF);
    expect(r.totalVerse).toBe(10000 + 200 * 12 * 20); // 58 000
  });

  it("courbe = valeur du contrat année par année, dernier point = capital brut au terme", () => {
    const r = computeAvSim(REF);
    expect(r.courbe.length).toBe(21); // années 0 → 20
    const last = r.courbe[r.courbe.length - 1];
    expect(last.annee).toBe(20);
    expect(last.valeur).toBe(r.capitalFinalBrut);
  });

  it("profil « responsable » (absent des sims PER) traité comme 4 % = équilibré", () => {
    const eq = computeAvSim(inputs({ versementMensuel: 300, dureeAnnees: 15, profil: "equilibre", marie: true }));
    const resp = computeAvSim(inputs({ versementMensuel: 300, dureeAnnees: 15, profil: "responsable", marie: true }));
    expect(resp.capitalFinalBrut).toBe(eq.capitalFinalBrut);
  });

  it("durée bornée à 40 ans (clamp haut)", () => {
    const r = computeAvSim(inputs({ versementMensuel: 100, dureeAnnees: 99, profil: "prudent", marie: false }));
    const last = r.courbe[r.courbe.length - 1];
    expect(last.annee).toBe(AV_DUREE_MAX);
    expect(r.totalVerse).toBe(100 * 12 * AV_DUREE_MAX); // 48 000
  });

  it("versements négatifs ramenés à 0 (pas de capital négatif)", () => {
    const r = computeAvSim(inputs({ versementInitial: -5000, versementMensuel: -50, dureeAnnees: 10 }));
    expect(r.totalVerse).toBe(0);
    expect(r.capitalFinalBrut).toBe(0);
  });

  it("asAvProfil / normalizeAvProfil : robustesse des libellés", () => {
    expect(asAvProfil("dynamique")).toBe("dynamique");
    expect(asAvProfil("inconnu")).toBe("equilibre");
    expect(normalizeAvProfil("Prudent")).toBe("prudent");
    expect(normalizeAvProfil("Équilibré")).toBe("equilibre");
    expect(normalizeAvProfil("Responsable")).toBe("responsable");
    expect(normalizeAvProfil("Dynamique")).toBe("dynamique");
    expect(normalizeAvProfil(undefined)).toBe("equilibre");
  });
});
