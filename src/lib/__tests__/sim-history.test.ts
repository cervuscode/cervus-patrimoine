import {
  formatSyntheseNote,
  impotDraft,
  perFullDraft,
  perQuickDraft,
  signatureOf,
  summarizeRecord,
  type ImpotRecord,
  type PerFullRecord,
  type PerQuickRecord,
  type SimRecord,
} from "../sim-history";

const impot = (over: Partial<ImpotRecord["inputs"]> = {}): ImpotRecord => ({
  id: "z",
  ts: 0,
  simId: "impot",
  label: "Impôt sur le revenu",
  inputs: {
    statut: "Marié(e)",
    nbEnfants: 1,
    garde: "classique",
    demiPartHandicap: false,
    revenuImposable: 70000,
    ...over,
  },
  result: { impotNet: 5957, tmi: 30, partsTotal: 2.5, tauxMoyen: 0.0851, plafonnementActif: true },
});

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

describe("builders draft (source unique sims connectés ↔ présentation)", () => {
  it("perQuickDraft mappe inputs + result (taux pris du result)", () => {
    const d = perQuickDraft(
      { versementMensuel: 300, versementInitial: 100, horizon: 23, profil: "equilibre" },
      { taux: 0.05, tmi: 30, economieFiscale: 1080, capitalFinal: 168540, totalVerse: 82900 }
    );
    expect(d.simId).toBe("per-quick");
    expect(d.inputs).toEqual({
      versementMensuel: 300,
      versementInitial: 100,
      horizon: 23,
      taux: 0.05,
      profil: "equilibre",
    });
    expect(d.result).toEqual({ tmi: 30, economieFiscale: 1080, capitalFinal: 168540, totalVerse: 82900 });
  });

  it("perFullDraft aplatit les 3 sorties (rente nette mensuelle = annuelle/12 arrondie)", () => {
    const d = perFullDraft(
      { versementMensuel: 400, versementInitial: 0, horizon: 23, profil: "equilibre", trancheSortie: 30, ageConversion: 67 },
      {
        taux: 0.04,
        capitalFinal: 215300,
        sortie1: { capitalNet: 158200 },
        sortie2: { equivalentMensuel: 920, capitalNet: 184000 },
        sortie3: { disponible: true, renteMensuelle: 760, renteNetteAnnuelle: 7680 },
      }
    );
    expect(d.simId).toBe("per-full");
    expect(d.inputs.taux).toBe(0.04);
    expect(d.inputs.trancheSortie).toBe(30);
    expect(d.result.sortie1Net).toBe(158200);
    expect(d.result.sortie2RetraitMensuel).toBe(920);
    expect(d.result.sortie3RenteNetteMensuelle).toBe(640);
  });

  it("draft de présentation et de sim connecté avec mêmes valeurs → même signature (dédup cross-onglet)", () => {
    const a = perQuickDraft(
      { versementMensuel: 300, versementInitial: 0, horizon: 23, profil: "equilibre" },
      { taux: 0.04, tmi: 30, economieFiscale: 1080, capitalFinal: 168540, totalVerse: 82800 }
    );
    const b = perQuickDraft(
      { versementMensuel: 300, versementInitial: 0, horizon: 23, profil: "equilibre" },
      { taux: 0.04, tmi: 30, economieFiscale: 1080, capitalFinal: 168540, totalVerse: 82800 }
    );
    expect(signatureOf(a)).toBe(signatureOf(b));
  });
});

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
  it("impôt : un champ changé → signature différente", () => {
    expect(signatureOf(impot({ revenuImposable: 80000 }))).not.toBe(signatureOf(impot()));
    expect(signatureOf(impot())).toBe(signatureOf(impot()));
  });
  it("impôt ne collisionne pas avec les sims PER", () => {
    expect(signatureOf(impot())).not.toBe(signatureOf(quick()));
    expect(signatureOf(impot())).not.toBe(signatureOf(full));
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
  it("Impôt — situation + impôt net + TMI + plafonnement", () => {
    const s = summarizeRecord(impot());
    expect(s).toContain("Impôt sur le revenu");
    expect(s).toContain("Marié(e)");
    expect(s).toContain("1 enfant");
    expect(s).toContain("impôt net");
    expect(s).toContain("TMI 30 %");
    expect(s).toContain("plafonnement QF actif");
  });
  it("Impôt — demi-part invalidité mentionnée, plafonnement omis si inactif", () => {
    const s = summarizeRecord(
      impot({ demiPartHandicap: true, nbEnfants: 0 })
    );
    expect(s).toContain("demi-part invalidité");
  });
});

describe("impotDraft — builder", () => {
  it("mappe entrées + résultats vers un enregistrement impôt", () => {
    const d = impotDraft(
      { statut: "Célibataire", nbEnfants: 0, garde: "classique", demiPartHandicap: false, revenuImposable: 30000 },
      { impotNet: 2022, tmi: 11, partsTotal: 1, tauxMoyen: 0.0674, plafonnementActif: false }
    );
    expect(d.simId).toBe("impot");
    expect(d.label).toBe("Impôt sur le revenu");
    expect(d.inputs.revenuImposable).toBe(30000);
    expect(d.result.impotNet).toBe(2022);
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
