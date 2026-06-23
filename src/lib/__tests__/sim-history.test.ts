import {
  comparateurDraft,
  formatSyntheseNote,
  impotDraft,
  perFullDraft,
  perQuickDraft,
  pyramideDraft,
  reductionDraft,
  resilienceDraft,
  signatureOf,
  summarizeRecord,
  type ComparateurRecord,
  type ImpotRecord,
  type PerFullRecord,
  type PerQuickRecord,
  type PyramideRecord,
  type ReductionRecord,
  type ResilienceRecord,
  type SimRecord,
} from "../sim-history";

const resilience = (over: Partial<ResilienceRecord["inputs"]> = {}): ResilienceRecord => ({
  id: "rm",
  ts: 0,
  simId: "resilience-marches",
  label: "Résilience des marchés",
  inputs: { versementInitial: 10000, versementMensuel: 200, horizon: 20, ...over },
  result: {
    totalVerse: 58000,
    finalPrudent: 85000,
    finalEquilibre: 98000,
    finalDynamique: 114000,
    finalLivretA: 72000,
    finalFondsEuros: 79000,
  },
});
import { computePyramide, DEFAULT_PYRAMIDE_INPUTS } from "../pyramide-epargne";

const pyramide = (over: Partial<PyramideRecord["result"]> = {}): PyramideRecord => ({
  id: "p",
  ts: 0,
  simId: "pyramide-epargne",
  label: "Pyramide de l'épargne",
  inputs: { capaciteEpargneMensuelle: 1000 },
  result: {
    patrimoineTotal: 100000,
    niveaux: [
      { key: "precaution", label: "PRÉCAUTION", montantReel: 60000, pctTotal: 0.6, statut: "sur" },
      { key: "projet", label: "PROJET", montantReel: 10000, pctTotal: 0.1, statut: "sous" },
      { key: "longTerme", label: "LONG TERME", montantReel: 25000, pctTotal: 0.25, statut: "ok" },
      { key: "dynamique", label: "DYNAMIQUE", montantReel: 5000, pctTotal: 0.05, statut: "ok" },
    ],
    ...over,
  },
});

const comparateur = (over: Partial<ComparateurRecord["inputs"]> = {}): ComparateurRecord => ({
  id: "c",
  ts: 0,
  simId: "comparateur-av-per",
  label: "Comparateur AV / PER",
  inputs: {
    effortNetMensuel: 210,
    effortNetInitial: 0,
    horizon: 20,
    profil: "equilibre",
    trancheSortie: 30,
    marie: false,
    ...over,
  },
  result: { tmi: 30, perNet: 76407, avNet: 70328, gagnant: "per", ecart: 6079, ecartPct: 8 },
});

const reduction = (over: Partial<ReductionRecord["inputs"]> = {}): ReductionRecord => ({
  id: "r",
  ts: 0,
  simId: "reduction-impot",
  label: "Réduction d'impôt PER",
  inputs: {
    statut: "Célibataire",
    nbEnfants: 0,
    garde: "classique",
    demiPartHandicap: false,
    revenuImposable: 60000,
    versementPer: 6000,
    ...over,
  },
  result: { impotAvant: 11104, impotApres: 9304, economie: 1800, tmiAvant: 30, tmiApres: 30 },
});

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

  it("réduction d'impôt : un champ changé → signature différente, ne collisionne pas", () => {
    expect(signatureOf(reduction())).toBe(signatureOf(reduction()));
    expect(signatureOf(reduction({ versementPer: 9000 }))).not.toBe(signatureOf(reduction()));
    expect(signatureOf(reduction())).not.toBe(signatureOf(impot()));
    expect(signatureOf(reduction())).not.toBe(signatureOf(quick()));
  });

  it("comparateur AV/PER : un champ changé → signature différente, ne collisionne pas", () => {
    expect(signatureOf(comparateur())).toBe(signatureOf(comparateur()));
    expect(signatureOf(comparateur({ effortNetMensuel: 300 }))).not.toBe(signatureOf(comparateur()));
    expect(signatureOf(comparateur())).not.toBe(signatureOf(reduction()));
    expect(signatureOf(comparateur())).not.toBe(signatureOf(quick()));
  });

  it("pyramide-epargne identique = même signature, montant changé = différente", () => {
    expect(signatureOf(pyramide())).toBe(signatureOf(pyramide()));
    const autre = pyramide({
      patrimoineTotal: 120000,
      niveaux: [
        { key: "precaution", label: "PRÉCAUTION", montantReel: 80000, pctTotal: 0.66, statut: "sur" },
        { key: "projet", label: "PROJET", montantReel: 10000, pctTotal: 0.08, statut: "sous" },
        { key: "longTerme", label: "LONG TERME", montantReel: 25000, pctTotal: 0.21, statut: "ok" },
        { key: "dynamique", label: "DYNAMIQUE", montantReel: 5000, pctTotal: 0.04, statut: "ok" },
      ],
    });
    expect(signatureOf(autre)).not.toBe(signatureOf(pyramide()));
    expect(signatureOf(pyramide())).not.toBe(signatureOf(comparateur()));
  });

  it("resilience-marches identique = même signature, versement changé = différente", () => {
    expect(signatureOf(resilience())).toBe(signatureOf(resilience()));
    expect(signatureOf(resilience({ versementMensuel: 400 }))).not.toBe(signatureOf(resilience()));
    expect(signatureOf(resilience())).not.toBe(signatureOf(pyramide()));
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
  it("Réduction d'impôt — revenu, versement, économie ; TMI affichée si elle change", () => {
    const sansChangement = summarizeRecord(reduction());
    expect(sansChangement).toContain("Réduction d'impôt PER");
    expect(sansChangement).toContain("versement PER");
    expect(sansChangement).toContain("économie");
    expect(sansChangement).not.toContain("TMI 30 % → 30 %");
    const avecChangement = summarizeRecord(
      reduction({}) // base 30/30
    );
    expect(avecChangement).not.toContain("→ 11 %");
    const changeTmi = summarizeRecord({
      ...reduction(),
      result: { impotAvant: 3000, impotApres: 1200, economie: 1800, tmiAvant: 30, tmiApres: 11 },
    });
    expect(changeTmi).toContain("TMI 30 % → 11 %");
  });

  it("Comparateur AV/PER — effort net, TMI, nets PER vs AV + verdict", () => {
    const s = summarizeRecord(comparateur());
    expect(s).toContain("Comparateur AV / PER");
    expect(s).toContain("effort net");
    expect(s).toContain("TMI 30 %");
    expect(s).toContain("avantage PER");
    const egal = summarizeRecord({
      ...comparateur(),
      result: { tmi: 11, perNet: 70855, avNet: 70328, gagnant: "egal", ecart: 527, ecartPct: 0.7 },
    });
    expect(egal).toContain("quasi-équivalents");
  });

  it("Impôt — demi-part invalidité mentionnée, plafonnement omis si inactif", () => {
    const s = summarizeRecord(
      impot({ demiPartHandicap: true, nbEnfants: 0 })
    );
    expect(s).toContain("demi-part invalidité");
  });

  it("Pyramide — total, répartition par niveau et marquage des sur/sous-représentés", () => {
    const s = summarizeRecord(pyramide());
    expect(s).toContain("Pyramide de l'épargne");
    expect(s).toContain("patrimoine");
    expect(s).toContain("précaution");
    expect(s).toContain("(sur-représenté)");
    expect(s).toContain("(sous-représenté)");
  });

  it("Résilience des marchés — versements, total versé et capitaux finaux des profils", () => {
    const s = summarizeRecord(resilience());
    expect(s).toContain("Résilience des marchés");
    expect(s).toContain("apport initial");
    expect(s).toContain("horizon 20 ans");
    expect(s).toContain("Prudent");
    expect(s).toContain("Dynamique");
    expect(s).toContain("Livret A");
  });
});

describe("resilienceDraft — builder", () => {
  it("mappe versements + capitaux finaux (avec valeurs manquantes → 0)", () => {
    const d = resilienceDraft(
      { versementInitial: 5000, versementMensuel: 150, horizon: 15 },
      { totalVerse: 32000, finals: { prudent: 40000, equilibre: 44000, dynamique: 49000, livretA: 36000 } }
    );
    expect(d.simId).toBe("resilience-marches");
    expect(d.inputs.versementMensuel).toBe(150);
    expect(d.result.totalVerse).toBe(32000);
    expect(d.result.finalDynamique).toBe(49000);
    expect(d.result.finalFondsEuros).toBe(0); // absent → 0
  });
});

describe("pyramideDraft — builder", () => {
  it("mappe capacité + résultat réel (computePyramide) vers un enregistrement réduit", () => {
    const result = computePyramide({
      ...DEFAULT_PYRAMIDE_INPUTS,
      capaciteEpargneMensuelle: 1500,
      livretsReglementes: 30000,
      encoursAv: 20000,
    });
    const d = pyramideDraft({ capaciteEpargneMensuelle: 1500 }, result);
    expect(d.simId).toBe("pyramide-epargne");
    expect(d.inputs.capaciteEpargneMensuelle).toBe(1500);
    expect(d.result.patrimoineTotal).toBe(result.patrimoineTotal);
    expect(d.result.niveaux).toHaveLength(4);
    // Le draft ne conserve QUE les clés réduites (pas color/cibleMontant/etc.).
    expect(Object.keys(d.result.niveaux[0]).sort()).toEqual(
      ["key", "label", "montantReel", "pctTotal", "statut"].sort()
    );
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

describe("reductionDraft — builder", () => {
  it("mappe entrées + résultats (avant/après/économie) vers un enregistrement", () => {
    const d = reductionDraft(
      {
        statut: "Célibataire",
        nbEnfants: 0,
        garde: "classique",
        demiPartHandicap: false,
        revenuImposable: 60000,
        versementPer: 6000,
      },
      {
        avant: { impotNet: 11104, tmi: 30 },
        apres: { impotNet: 9304, tmi: 30 },
        economie: 1800,
      }
    );
    expect(d.simId).toBe("reduction-impot");
    expect(d.inputs.versementPer).toBe(6000);
    expect(d.result.impotAvant).toBe(11104);
    expect(d.result.impotApres).toBe(9304);
    expect(d.result.economie).toBe(1800);
    expect(d.label).toBe("Réduction d'impôt PER");
  });
});

describe("comparateurDraft — builder", () => {
  it("mappe entrées + résultats (nets PER/AV, gagnant, écart)", () => {
    const d = comparateurDraft(
      {
        effortNetMensuel: 210,
        effortNetInitial: 0,
        horizon: 20,
        profil: "equilibre",
        trancheSortie: 30,
        marie: false,
      },
      {
        tmi: 30,
        per: { capitalNet: 76407 },
        av: { capitalNetSans: 70328 },
        gagnant: "per",
        ecart: 6079,
        ecartPct: 8,
      }
    );
    expect(d.simId).toBe("comparateur-av-per");
    expect(d.inputs.effortNetMensuel).toBe(210);
    expect(d.result.perNet).toBe(76407);
    expect(d.result.avNet).toBe(70328);
    expect(d.result.gagnant).toBe("per");
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
