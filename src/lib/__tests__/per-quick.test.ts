import {
  computePerQuick,
  computePlafondPER,
  decodePerInputs,
  encodePerInputs,
  PER_PLANCHER,
  PER_PLAFOND_MAX,
  TAUX_PAR_PROFIL,
  DEFAULT_PER_INPUTS,
  type PerQuickInputs,
} from "../per-quick";
import {
  calculerTMI,
  economieFiscaleAnnuelle,
  projectionPER,
} from "../fiscal-engine";

// Le helper est un CÂBLAGE (consommation seule de fiscal-engine, déjà couvert par
// ses 76 tests). On teste donc le mapping entrées → fonctions moteur, pas les
// valeurs fiscales elles-mêmes.

const base: PerQuickInputs = {
  revenuImposable: 60000,
  parts: 2,
  versementMensuel: 300,
  versementInitial: 5000,
  horizon: 20,
  profil: "equilibre",
};

describe("computePerQuick — câblage fiscal-engine", () => {
  it("TMI effective : partsBase reconstruit depuis `couple` (défaut personne seule)", () => {
    // base.parts = 2, couple absent → partsBase 1 (personne seule, ex. parent 2 enfants)
    const r = computePerQuick(base);
    expect(r.tmi).toBe(calculerTMI(60000, 1, 2));
  });

  it("toggle couple : base 2 (couple) vs base 1 (seul) à parts identiques", () => {
    // 45 000 €, 2 parts : couple 0 enfant (base 2) → 11 % ; parent seul 2 enfants
    // (base 1) → 30 % (plafonnement du quotient familial actif). C'est le bug corrigé.
    const seul = computePerQuick({ ...base, revenuImposable: 45000, parts: 2, couple: false });
    const couple = computePerQuick({ ...base, revenuImposable: 45000, parts: 2, couple: true });
    expect(seul.tmi).toBe(30);
    expect(couple.tmi).toBe(11);
  });

  it("opts.tmi (connecté) prime sur le calcul local", () => {
    const r = computePerQuick({ ...base, couple: false }, { tmi: 41 });
    expect(r.tmi).toBe(41);
  });

  it("économie fiscale = economieFiscaleAnnuelle(versement, TMI)", () => {
    const r = computePerQuick(base);
    expect(r.economieFiscale).toBe(economieFiscaleAnnuelle(300, r.tmi));
  });

  it("capital projeté = projectionPER(versement, taux profil, horizon, initial)", () => {
    const r = computePerQuick(base);
    const proj = projectionPER(300, TAUX_PAR_PROFIL.equilibre, 20, 5000);
    expect(r.capitalFinal).toBe(proj.capitalFinal);
    expect(r.courbe).toHaveLength(20);
    expect(r.taux).toBe(TAUX_PAR_PROFIL.equilibre);
  });

  it("taux du slider (Lot I) prioritaire sur le profil, clampé 0–10 %", () => {
    expect(computePerQuick({ ...base, taux: 0.07 }).taux).toBe(0.07);
    expect(computePerQuick({ ...base, taux: 0.25 }).taux).toBe(0.1); // clamp max 10 %
    expect(computePerQuick({ ...base, taux: -1 }).taux).toBe(0); // clamp min 0 %
    // Absent → défaut du profil (rétro-compatible).
    expect(computePerQuick(base).taux).toBe(TAUX_PAR_PROFIL.equilibre);
  });

  it("total versé = initial + mensuel × 12 × horizon", () => {
    const r = computePerQuick(base);
    expect(r.totalVerse).toBe(5000 + 300 * 12 * 20);
  });

  it("revenu nul → TMI 0 et économie 0", () => {
    const r = computePerQuick({ ...base, revenuImposable: 0 });
    expect(r.tmi).toBe(0);
    expect(r.economieFiscale).toBe(0);
  });

  it("clampe parts ≥ 1, horizon ≥ 1, valeurs négatives → 0", () => {
    const r = computePerQuick({
      revenuImposable: -100,
      parts: 0,
      versementMensuel: -50,
      versementInitial: -10,
      horizon: 0,
      profil: "prudent",
    });
    expect(r.courbe).toHaveLength(1); // horizon clampé à 1
    expect(r.capitalFinal).toBeGreaterThanOrEqual(0);
    expect(r.taux).toBe(TAUX_PAR_PROFIL.prudent);
  });

  it("profil inconnu → équilibré par défaut", () => {
    const r = computePerQuick({ ...base, profil: "bidon" as unknown as PerQuickInputs["profil"] });
    expect(r.taux).toBe(TAUX_PAR_PROFIL.equilibre);
  });
});

describe("computePlafondPER — plafond de déductibilité (DGFiP, PASS 2025)", () => {
  it("plancher PASS appliqué quand 10 % du revenu < 4 710 €", () => {
    const r = computePlafondPER(20000, 0); // 10 % = 2 000 < 4 710
    expect(r.plafond).toBe(PER_PLANCHER); // 4 710
    expect(r.plancherApplique).toBe(true);
  });

  it("zone normale : plafond = 10 % du revenu pro", () => {
    expect(computePlafondPER(100000, 0).plafond).toBe(10000);
  });

  it("plafond 8×PASS appliqué quand 10 % du revenu > 37 680 €", () => {
    const r = computePlafondPER(500000, 0); // 10 % = 50 000 > 37 680
    expect(r.plafond).toBe(PER_PLAFOND_MAX); // 37 680
    expect(r.plafondMaxApplique).toBe(true);
  });

  it("exclusion du foncier de l'assiette (revenu 120k − foncier 20k → 10 000, pas 12 000)", () => {
    const proNet = 120000 - 20000;
    expect(computePlafondPER(proNet, 0).plafond).toBe(10000);
    expect(computePlafondPER(120000, 0).plafond).toBe(12000); // sans exclusion (contre-exemple)
  });

  it("dépassement : versement annuel > plafond → flag + montant", () => {
    const r = computePlafondPER(100000, 15000); // plafond 10 000
    expect(r.depassement).toBe(true);
    expect(r.depassementMontant).toBe(5000);
  });

  it("pas de dépassement quand le versement reste dans le plafond", () => {
    expect(computePlafondPER(100000, 8000).depassement).toBe(false);
  });
});

describe("encode / decode query params", () => {
  it("roundtrip stable", () => {
    const decoded = decodePerInputs(encodePerInputs(base));
    expect(decoded).toEqual(base);
  });

  it("params manquants → défauts robustes", () => {
    const decoded = decodePerInputs(new URLSearchParams());
    expect(decoded.parts).toBe(1);
    expect(decoded.horizon).toBe(DEFAULT_PER_INPUTS.horizon);
    expect(decoded.profil).toBe("equilibre");
    expect(decoded.revenuImposable).toBe(0);
  });

  it("accepte un Record<string,string> (searchParams Next)", () => {
    const decoded = decodePerInputs({ r: "50000", p: "1.5", vm: "200", vi: "0", h: "15", pr: "dynamique" });
    expect(decoded.revenuImposable).toBe(50000);
    expect(decoded.parts).toBe(1.5);
    expect(decoded.profil).toBe("dynamique");
  });
});
