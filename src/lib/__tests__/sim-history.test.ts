import {
  formatSyntheseNote,
  signatureOf,
  summarizeRecord,
  type PerFullRecord,
  type PerQuickRecord,
  type SimRecord,
} from "../sim-history";

const quick = (over: Partial<PerQuickRecord["inputs"]> = {}, cap = 168540): PerQuickRecord => ({
  id: "x",
  ts: 0,
  simId: "per-quick",
  label: "PER rapide",
  inputs: { versementMensuel: 300, versementInitial: 0, horizon: 23, taux: 0.04, profil: "equilibre", ...over },
  result: { tmi: 30, economieFiscale: 1080, capitalFinal: cap, totalVerse: 82800 },
});

const full: PerFullRecord = {
  id: "y",
  ts: 0,
  simId: "per-full",
  label: "PER complet",
  inputs: {
    versementMensuel: 400,
    versementInitial: 0,
    horizon: 23,
    taux: 0.04,
    profil: "equilibre",
    trancheSortie: 30,
    ageConversion: 67,
  },
  result: {
    capitalFinal: 215300,
    sortie1Net: 158200,
    sortie2RetraitMensuel: 920,
    sortie2Net: 184000,
    sortie3Disponible: true,
    sortie3RenteMensuelle: 760,
    sortie3RenteNetteMensuelle: 640,
  },
};

describe("signatureOf — dédup", () => {
  it("identiques → même signature", () => {
    expect(signatureOf(quick())).toBe(signatureOf(quick()));
  });
  it("un seul paramètre changé → signature différente", () => {
    expect(signatureOf(quick({ versementMensuel: 400 }, 224720))).not.toBe(signatureOf(quick()));
  });
  it("per-quick et per-full ne collisionnent pas", () => {
    expect(signatureOf(quick())).not.toBe(signatureOf(full));
  });
});

describe("summarizeRecord", () => {
  it("PER rapide — hypothèses + résultats", () => {
    const s = summarizeRecord(quick());
    expect(s).toContain("PER rapide");
    expect(s).toContain("300 €/mois");
    expect(s).toContain("horizon 23 ans");
    expect(s).toContain("Équilibré");
    expect(s).toContain("capital projeté");
  });
  it("PER complet — 3 sorties résumées", () => {
    const s = summarizeRecord(full);
    expect(s).toContain("PER complet");
    expect(s).toContain("sortie tranche 30 %");
    expect(s).toContain("sortie intégrale");
    expect(s).toContain("fractionnement");
    expect(s).toContain("rente viagère");
  });
  it("rente non disponible → mention explicite", () => {
    const s = summarizeRecord({ ...full, result: { ...full.result, sortie3Disponible: false } });
    expect(s).toContain("non proposée");
  });
});

describe("formatSyntheseNote", () => {
  const decouverte = [
    { label: "Situation", value: "Statut marital Marié(e) · Nombre d'enfants 2" },
    { label: "Vide", value: "  " },
  ];
  const at = new Date(2026, 5, 21, 15, 42);

  it("en-tête avec code + date ; lignes Découverte vides ignorées", () => {
    const note = formatSyntheseNote({ code: "C-0042", generatedAt: at, decouverte, history: [] });
    expect(note).toContain("C-0042");
    expect(note).toContain("21/06/2026");
    expect(note).toContain("Marié(e)");
    expect(note).not.toContain("Vide");
  });

  it("historique vide → pas de section Simulations", () => {
    const note = formatSyntheseNote({ code: "C-0042", generatedAt: at, decouverte, history: [] });
    expect(note).not.toContain("Simulations consultées");
  });

  it("historique rempli → section + nombre + entrées", () => {
    const history: SimRecord[] = [quick(), full];
    const note = formatSyntheseNote({ code: "C-0042", generatedAt: at, decouverte, history });
    expect(note).toContain("Simulations consultées</b> (2)");
    expect(note).toContain("PER rapide");
    expect(note).toContain("PER complet");
  });

  it("échappe le HTML des valeurs Découverte", () => {
    const note = formatSyntheseNote({
      code: "C-0042",
      generatedAt: at,
      decouverte: [{ label: "Note", value: "a <b>x</b> & y" }],
      history: [],
    });
    expect(note).toContain("a &lt;b&gt;x&lt;/b&gt; &amp; y");
  });
});
