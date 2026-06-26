/**
 * Compte-rendu de RDV (Lot 11) — types de composition + construction du modèle de rendu.
 *
 * Module PUR isomorphe (aucun secret). Sépare clairement :
 *  - la COMPOSITION : ce que le conseiller a coché/paramétré côté UI (envoyé au serveur).
 *  - le CONTEXTE CLIENT : les données fiscales déjà calculées server-side depuis Pipedrive.
 *  - le MODÈLE DE RENDU : tout recalculé ici via les fonctions pures existantes, prêt à
 *    être consommé par les composants @react-pdf/renderer (qui ne font AUCUN calcul).
 *
 * Le serveur ne fait JAMAIS confiance à des résultats venus du body : il ne reçoit que
 * des paramètres et recalcule tout (cohérent avec l'invariant sécurité Lot 2+).
 *
 * Consomme `fiscal-engine.ts` en LECTURE SEULE (via fiscal-state + reduction-impot).
 *
 * ⚠️ Livrable 2 : seuls la page de garde et le bloc Synthèse fiscale sont câblés.
 * Les autres blocs (plafonds, CEHR/CDHR, pyramide, simulateurs) seront ajoutés ensuite.
 */

import { impotReel } from "./fiscal-engine";
import {
  partsPourDecomposition,
  plafonnementQuotientActif,
  type FiscalState,
} from "./fiscal-state";
import { decoupeParTranche } from "./reduction-impot";
import { computePlafondTotal } from "./plafond-per";
import {
  approximerRFR,
  computeContributionsHautsRevenus,
} from "./contributions-hauts-revenus";
import {
  computePyramide,
  type PyramideInputs,
  type EcartStatut,
  type NiveauKey,
} from "./pyramide-epargne";
import {
  computePerQuick,
  PROFIL_LABELS,
  type PerProfil,
} from "./per-quick";
import { computePerSortie, type AgeConversion } from "./per-sortie";
import {
  computeAvSim,
  AV_PROFIL_LABELS,
} from "./av-sim";
import type { AVProfil } from "./av-engine";
import {
  computeComparateur,
  verdictComparateur,
  type Gagnant,
} from "./comparateur-av-per";
import { computeReduction } from "./reduction-impot";
import type { GardeRegime } from "./impot-sim";

// ─────────────────────────────────────────────────────────────────────────────
// Composition (envoyée par l'UI)
// ─────────────────────────────────────────────────────────────────────────────

/** Blocs fixes cochables. */
export interface CompositionBlocs {
  syntheseFiscale?: boolean;
  plafondsPer?: boolean;
  contributionsHR?: boolean;
  pyramide?: boolean;
}

/** Paramètres d'une instance de simulateur (HYPOTHÈSES seulement — l'identité vient de la fiche). */
export interface PerQuickParams {
  versementMensuel: number;
  versementInitial: number;
  horizon: number;
  profil: PerProfil;
  /** Taux de rendement annuel en % (ex. 4). Absent → défaut du profil. */
  taux?: number;
}
export interface PerFullParams extends PerQuickParams {
  /** Tranche de sortie (0|11|30|41|45). Absent → TMI courante de la fiche. */
  trancheSortie?: number;
  ageConversion?: AgeConversion;
}

export interface AvParams {
  versementInitial: number;
  versementMensuel: number;
  dureeAnnees: number;
  profil: AVProfil;
  marie: boolean;
}
export interface ComparateurParams {
  effortNetMensuel: number;
  effortNetInitial: number;
  horizon: number;
  profil: PerProfil;
  /** Tranche de sortie PER. Absent → TMI courante de la fiche. */
  trancheSortie?: number;
}
/** Réduction d'impôt — « tout est hypothèse » (revenu + situation éditables). */
export interface ReductionParams {
  revenuImposable: number;
  statut: string;
  nbEnfants: number;
  garde: GardeRegime;
  demiPartHandicap: boolean;
  versementPer: number;
}

/** Instance de simulateur à inclure (multi-instances possibles du même type). */
export type SimInstance =
  | { type: "per-quick"; params: PerQuickParams }
  | { type: "per-full"; params: PerFullParams }
  | { type: "av"; params: AvParams }
  | { type: "comparateur"; params: ComparateurParams }
  | { type: "reduction"; params: ReductionParams };

export interface CompositionPayload {
  blocs: CompositionBlocs;
  simulations?: SimInstance[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Contexte client (résolu server-side depuis Pipedrive)
// ─────────────────────────────────────────────────────────────────────────────

export interface ClientContext {
  /** Code client `C-XXXX` affiché en page de garde (identifiant principal). */
  code: string | null;
  /** Nom complet du client (mention secondaire en page de garde). */
  clientName: string | null;
  fiscalState: FiscalState;
  /** Revenu foncier (€/an) — exclu de l'assiette plafond salarié. */
  foncier: number;
  /** Bénéfice BNC (€/an) — assiette TNS. */
  bnc: number;
  /** Bénéfice BIC (€/an) — assiette TNS. */
  bic: number;
  /** Le client est-il TNS (switch fiche « Est TNS ») ? Déclenche le plafond Madelin. */
  estTNS: boolean;
  /** Nombre d'enfants (PAC) — majoration CDHR. */
  nbEnfants: number;
  /** RFR réel saisi (avis d'imposition) ; `null` → RFR approximé pour CEHR/CDHR. */
  rfrReel: number | null;
  /** Année de naissance — sortie en rente du PER complet. */
  anneeNaissance: number;
  /** Encours financiers par enveloppe — pyramide de l'épargne. */
  patrimoine: PyramideInputs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modèle de rendu (consommé par les composants PDF)
// ─────────────────────────────────────────────────────────────────────────────

export interface TrancheSlice {
  taux: number; // 0, 0.11, 0.30, 0.41, 0.45
  label: string; // « 30 % »
  color: string; // couleur charte du bloc
  montant: number; // montant de revenu du foyer dans cette tranche
  impot: number; // impôt généré par cette tranche (montant × taux)
}

export interface SyntheseFiscaleModel {
  kind: "synthese-fiscale";
  revenuNet: number;
  partsTotal: number;
  impotNet: number;
  tmi: number;
  tauxMoyen: number; // %
  slices: TrancheSlice[];
  /** Somme des « impôt généré » par tranche (= impôt au barème sur la base affichée). */
  totalBareme: number;
  /**
   * Écart barème → net (> 0 si la somme des tranches dépasse l'impôt net).
   * Provient de l'avantage de quotient familial plafonné ou de la décote.
   * 0 (ou bruit d'arrondi) → pas de ligne de réconciliation.
   */
  ecart: number;
  /** Libellé de l'écart (`null` si pas d'écart) pour la ligne de réconciliation. */
  ecartLabel: string | null;
}

export interface PlafondsPerModel {
  kind: "plafonds-per";
  estTNS: boolean;
  /** Assiette du plafond salarié = revenu net imposable − foncier. */
  baseSalarie: number;
  plafondSalarie: number;
  /** Bénéfice TNS retenu = BNC + BIC (≥ 0). */
  beneficeTNS: number;
  plafondTNS: number;
  plafondTotal: number;
}

export interface ContributionsHRModel {
  kind: "contributions-hr";
  rfr: number;
  rfrEstime: boolean;
  cehr: number;
  cdhr: number;
  /** IR reconstitué isolé (impositionReconstituee − CEHR − majoration foyer). */
  irHR: number;
  /** Total IR + CEHR + CDHR. */
  totalHR: number;
  majorationFoyer: number;
}

export interface PyramideNiveauModel {
  key: NiveauKey;
  label: string;
  sousTitre: string;
  color: string;
  texteSombre: boolean;
  montantReel: number;
  pctTotal: number; // 0..1
  statut: EcartStatut;
}
export interface PyramideModel {
  kind: "pyramide";
  patrimoineTotal: number;
  niveaux: PyramideNiveauModel[]; // base → sommet
}

export interface CourbePoint {
  annee: number;
  capital: number;
}

export interface PerQuickModel {
  kind: "per-quick";
  versementMensuel: number;
  versementInitial: number;
  horizon: number;
  profilLabel: string;
  tauxPct: number; // %
  tmi: number;
  economieFiscale: number;
  totalVerse: number;
  capitalFinal: number;
  courbe: CourbePoint[];
}

export interface PerFullModel {
  kind: "per-full";
  versementMensuel: number;
  versementInitial: number;
  horizon: number;
  profilLabel: string;
  tauxPct: number;
  trancheSortie: number;
  ageConversion: AgeConversion;
  capitalFinal: number;
  versementsCumules: number;
  plusValue: number;
  courbe: CourbePoint[];
  // 3 sorties
  sortie1Net: number;
  sortie2EquivMensuel: number;
  sortie2Net: number;
  sortie3Disponible: boolean;
  sortie3RenteMensuelle: number;
  sortie3RenteNetteAnnuelle: number;
}

export interface AvModel {
  kind: "av";
  versementInitial: number;
  versementMensuel: number;
  dureeAnnees: number;
  profilLabel: string;
  marie: boolean;
  capitalFinalBrut: number;
  capitalNet: number;
  capitalNetOptimise: number;
  gainOptimisation: number;
  optimisationUtile: boolean;
  totalVerse: number;
  courbe: CourbePoint[];
}

export interface ComparateurModel {
  kind: "comparateur";
  effortNetMensuel: number;
  effortNetInitial: number;
  horizon: number;
  profilLabel: string;
  trancheSortie: number;
  tmi: number;
  perMensuel: number;
  economieMensuelle: number;
  perCapitalNet: number;
  avCapitalNet: number;
  ecart: number;
  gagnant: Gagnant;
  verdictTitre: string;
  verdictMessage: string;
}

/** Segment de revenu dans une tranche (rendu visuel du bloc réduction). */
export interface ReductionSlice {
  taux: number; // 0, 0.11, 0.30, 0.41, 0.45
  label: string; // « 30 % »
  color: string; // couleur charte
  montant: number; // montant de revenu du foyer dans cette tranche
}

export interface ReductionModel {
  kind: "reduction";
  revenuAvant: number;
  revenuApres: number;
  versementPer: number;
  montantEfface: number;
  situation: string;
  impotAvant: number;
  impotApres: number;
  economie: number;
  tmiAvant: number;
  tmiApres: number;
  tmiChange: boolean;
  /** Découpe par tranche du revenu AVANT versement (rendu des barres). */
  slicesAvant: ReductionSlice[];
  /** Découpe par tranche du revenu APRÈS versement. */
  slicesApres: ReductionSlice[];
  /** Portions retirées des tranches hautes (bloc fantôme), tranches hautes d'abord. */
  tranchesEffacees: Array<{ taux: number; label: string; montant: number }>;
}

export type RenderBlock =
  | SyntheseFiscaleModel
  | PlafondsPerModel
  | ContributionsHRModel
  | PyramideModel
  | PerQuickModel
  | PerFullModel
  | AvModel
  | ComparateurModel
  | ReductionModel;

export interface RenderModel {
  code: string | null;
  clientName: string | null;
  dateStr: string;
  blocks: RenderBlock[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Construction
// ─────────────────────────────────────────────────────────────────────────────

function buildSyntheseFiscale(fs: FiscalState): SyntheseFiscaleModel | null {
  if (fs.revenuNetImposable <= 0) return null;
  const { revenuNetImposable, partsBase, partsTotal } = fs;
  const impotNet = Math.round(impotReel(revenuNetImposable, partsBase, partsTotal));
  const tauxMoyen = revenuNetImposable > 0 ? (impotNet / revenuNetImposable) * 100 : 0;
  // Décomposition par tranche sur la base de parts cohérente avec la TMI affichée
  // (même règle que SyntheseFiscale.tsx : partsBase si le plafonnement QF mord).
  const slices: TrancheSlice[] = decoupeParTranche(
    revenuNetImposable,
    partsPourDecomposition(fs)
  ).map((sl) => ({
    taux: sl.taux,
    label: sl.label,
    color: sl.color,
    montant: sl.montant,
    impot: Math.round(sl.montant * sl.taux),
  }));

  // Réconciliation honnête : la somme des « impôt généré » = impôt AU BARÈME sur la
  // base de décomposition. L'impôt NET en diffère par l'avantage de quotient familial
  // plafonné (base = partsBase) ou par la décote (bas revenus). On affiche une ligne
  // d'écart seulement si elle est significative (au-delà du bruit d'arrondi).
  const totalBareme = slices.reduce((acc, sl) => acc + sl.impot, 0);
  const ecartBrut = totalBareme - impotNet;
  const hasEcart = ecartBrut > 2;
  const ecartLabel = hasEcart
    ? plafonnementQuotientActif(fs)
      ? "Avantage quotient familial (plafonné)"
      : "Décote"
    : null;

  return {
    kind: "synthese-fiscale",
    revenuNet: revenuNetImposable,
    partsTotal,
    impotNet,
    tmi: fs.tmi,
    tauxMoyen,
    slices,
    totalBareme,
    ecart: hasEcart ? ecartBrut : 0,
    ecartLabel,
  };
}

function buildPlafondsPer(ctx: ClientContext): PlafondsPerModel | null {
  const revenuNet = ctx.fiscalState.revenuNetImposable;
  if (revenuNet <= 0) return null;
  const res = computePlafondTotal({
    revenuImposable: revenuNet,
    foncier: ctx.foncier,
    bnc: ctx.bnc,
    bic: ctx.bic,
    estTNS: ctx.estTNS,
  });
  return {
    kind: "plafonds-per",
    estTNS: res.estTNS,
    baseSalarie: Math.max(0, revenuNet - ctx.foncier),
    plafondSalarie: res.plafondSalarie,
    beneficeTNS: Math.max(0, ctx.bnc + ctx.bic),
    plafondTNS: res.plafondTNS,
    plafondTotal: res.plafondTotal,
  };
}

/**
 * Contributions hauts revenus (CEHR/CDHR). Réplique EXACTEMENT la logique du contexte
 * `RdvClientProvider` (RFR réel saisi sinon approximé ; IR = impotReel ; couple =
 * partsBase 2 ; PAC = nbEnfants). Retourne `null` si le foyer n'est pas concerné.
 */
function buildContributionsHR(ctx: ClientContext): ContributionsHRModel | null {
  const fs = ctx.fiscalState;
  if (fs.revenuNetImposable <= 0) return null;
  const rfrReelValide = ctx.rfrReel != null && ctx.rfrReel > 0;
  const rfr = rfrReelValide
    ? (ctx.rfrReel as number)
    : approximerRFR({ revenuNetImposable: fs.revenuNetImposable });
  const ir = Math.round(impotReel(fs.revenuNetImposable, fs.partsBase, fs.partsTotal));
  const res = computeContributionsHautsRevenus({
    rfr,
    rfrEstime: !rfrReelValide,
    ir,
    couple: fs.partsBase === 2,
    personnesCharge: ctx.nbEnfants,
  });
  if (!res.concerne) return null;

  const irHR = Math.max(
    0,
    res.cdhr.impositionReconstituee - res.cehr.contribution - res.cdhr.majorationFoyer
  );
  const totalHR = irHR + res.cehr.contribution + res.cdhr.contribution;
  return {
    kind: "contributions-hr",
    rfr: res.rfr,
    rfrEstime: res.rfrEstime,
    cehr: res.cehr.contribution,
    cdhr: res.cdhr.contribution,
    irHR,
    totalHR,
    majorationFoyer: res.cdhr.majorationFoyer,
  };
}

function buildPyramide(ctx: ClientContext): PyramideModel | null {
  const res = computePyramide(ctx.patrimoine);
  if (res.patrimoineTotal <= 0) return null;
  return {
    kind: "pyramide",
    patrimoineTotal: res.patrimoineTotal,
    niveaux: res.niveaux.map((n) => ({
      key: n.key,
      label: n.label,
      sousTitre: n.sousTitre,
      color: n.color,
      texteSombre: n.texteSombre,
      montantReel: n.montantReel,
      pctTotal: n.pctTotal,
      statut: n.statut,
    })),
  };
}

function buildPerQuick(ctx: ClientContext, p: PerQuickParams): PerQuickModel {
  const fs = ctx.fiscalState;
  const res = computePerQuick(
    {
      revenuImposable: fs.revenuNetImposable,
      parts: fs.partsTotal,
      versementMensuel: p.versementMensuel,
      versementInitial: p.versementInitial,
      horizon: p.horizon,
      profil: p.profil,
      taux: p.taux != null ? p.taux / 100 : undefined,
    },
    { tmi: fs.tmi }
  );
  return {
    kind: "per-quick",
    versementMensuel: p.versementMensuel,
    versementInitial: p.versementInitial,
    horizon: p.horizon,
    profilLabel: PROFIL_LABELS[p.profil] ?? p.profil,
    tauxPct: res.taux * 100,
    tmi: res.tmi,
    economieFiscale: res.economieFiscale,
    totalVerse: res.totalVerse,
    capitalFinal: Math.round(res.capitalFinal),
    courbe: res.courbe.map((c) => ({ annee: c.annee, capital: Math.round(c.capital) })),
  };
}

function buildPerFull(ctx: ClientContext, p: PerFullParams): PerFullModel {
  const fs = ctx.fiscalState;
  const trancheSortie = p.trancheSortie != null ? p.trancheSortie : fs.tmi;
  const ageConversion: AgeConversion = p.ageConversion === 64 ? 64 : 67;
  const res = computePerSortie({
    revenuImposable: fs.revenuNetImposable,
    parts: fs.partsTotal,
    anneeNaissance: ctx.anneeNaissance,
    versementMensuel: p.versementMensuel,
    versementInitial: p.versementInitial,
    horizon: p.horizon,
    profil: p.profil,
    taux: p.taux != null ? p.taux / 100 : undefined,
    trancheSortie,
    ageConversion,
  });
  return {
    kind: "per-full",
    versementMensuel: p.versementMensuel,
    versementInitial: p.versementInitial,
    horizon: p.horizon,
    profilLabel: PROFIL_LABELS[p.profil] ?? p.profil,
    tauxPct: res.taux * 100,
    trancheSortie,
    ageConversion,
    capitalFinal: Math.round(res.capitalFinal),
    versementsCumules: Math.round(res.versementsCumules),
    plusValue: Math.round(res.plusValue),
    courbe: res.courbe.map((c) => ({ annee: c.annee, capital: Math.round(c.capital) })),
    sortie1Net: res.sortie1.capitalNet,
    sortie2EquivMensuel: res.sortie2.equivalentMensuel,
    sortie2Net: res.sortie2.capitalNet,
    sortie3Disponible: res.sortie3.disponible,
    sortie3RenteMensuelle: res.sortie3.renteMensuelle,
    sortie3RenteNetteAnnuelle: res.sortie3.renteNetteAnnuelle,
  };
}

function buildAv(p: AvParams): AvModel {
  const res = computeAvSim({
    versementInitial: p.versementInitial,
    versementMensuel: p.versementMensuel,
    dureeAnnees: p.dureeAnnees,
    profil: p.profil,
    marie: p.marie,
  });
  return {
    kind: "av",
    versementInitial: p.versementInitial,
    versementMensuel: p.versementMensuel,
    dureeAnnees: p.dureeAnnees,
    profilLabel: AV_PROFIL_LABELS[p.profil] ?? p.profil,
    marie: p.marie,
    capitalFinalBrut: Math.round(res.capitalFinalBrut),
    capitalNet: Math.round(res.capitalNet),
    capitalNetOptimise: Math.round(res.capitalNetOptimise),
    gainOptimisation: Math.round(res.gainOptimisation),
    optimisationUtile: res.optimisationUtile,
    totalVerse: res.totalVerse,
    courbe: res.courbe.map((c) => ({ annee: c.annee, capital: Math.round(c.valeur) })),
  };
}

function buildComparateur(ctx: ClientContext, p: ComparateurParams): ComparateurModel {
  const fs = ctx.fiscalState;
  const res = computeComparateur(
    {
      revenuImposable: fs.revenuNetImposable,
      parts: fs.partsTotal,
      marie: fs.partsBase === 2,
      effortNetMensuel: p.effortNetMensuel,
      effortNetInitial: p.effortNetInitial,
      horizon: p.horizon,
      profil: p.profil,
      trancheSortie: p.trancheSortie != null ? p.trancheSortie : fs.tmi,
    },
    { tmi: fs.tmi }
  );
  const verdict = verdictComparateur(res);
  // ⚠️ `verdictComparateur` formate ses nombres via toLocaleString("fr-FR") → espace
  // insécable ( / ) qui rend « / » dans les polices PDF. On la normalise en
  // espace simple (même contrainte que fmtNum, cf. PDF existants).
  const pdfText = (str: string) => str.replace(/[\u00a0\u202f]/g, " ");
  return {
    kind: "comparateur",
    effortNetMensuel: p.effortNetMensuel,
    effortNetInitial: p.effortNetInitial,
    horizon: p.horizon,
    profilLabel: PROFIL_LABELS[p.profil] ?? p.profil,
    trancheSortie: p.trancheSortie != null ? p.trancheSortie : fs.tmi,
    tmi: res.tmi,
    perMensuel: Math.round(res.perMensuel),
    economieMensuelle: Math.round(res.economieMensuelle),
    perCapitalNet: Math.round(res.per.capitalNet),
    avCapitalNet: Math.round(res.av.capitalNetSans),
    ecart: Math.round(res.ecart),
    gagnant: res.gagnant,
    verdictTitre: pdfText(verdict.titre),
    verdictMessage: pdfText(verdict.message),
  };
}

function buildReduction(p: ReductionParams): ReductionModel {
  const res = computeReduction({
    revenuImposable: p.revenuImposable,
    statut: p.statut,
    nbEnfants: p.nbEnfants,
    garde: p.garde,
    demiPartHandicap: p.demiPartHandicap,
    versementPer: p.versementPer,
  });
  return {
    kind: "reduction",
    revenuAvant: Math.round(res.revenuAvant),
    revenuApres: Math.round(res.revenuApres),
    versementPer: Math.round(p.versementPer),
    montantEfface: Math.round(res.montantEfface),
    situation: p.statut + (p.nbEnfants > 0 ? ` · ${p.nbEnfants} enfant${p.nbEnfants > 1 ? "s" : ""}` : ""),
    impotAvant: res.avant.impotNet,
    impotApres: res.apres.impotNet,
    economie: Math.round(res.economie),
    tmiAvant: res.avant.tmi,
    tmiApres: res.apres.tmi,
    tmiChange: res.tmiChange,
    slicesAvant: res.slicesAvant.map((sl) => ({ taux: sl.taux, label: sl.label, color: sl.color, montant: sl.montant })),
    slicesApres: res.slicesApres.map((sl) => ({ taux: sl.taux, label: sl.label, color: sl.color, montant: sl.montant })),
    tranchesEffacees: res.tranchesEffacees,
  };
}

function buildSimulation(ctx: ClientContext, sim: SimInstance): RenderBlock | null {
  const hasRevenu = ctx.fiscalState.revenuNetImposable > 0;
  switch (sim.type) {
    case "per-quick":
      return hasRevenu ? buildPerQuick(ctx, sim.params) : null;
    case "per-full":
      return hasRevenu ? buildPerFull(ctx, sim.params) : null;
    case "av":
      // AV = « tout est hypothèse » : indépendant du revenu de la fiche.
      return buildAv(sim.params);
    case "comparateur":
      return hasRevenu ? buildComparateur(ctx, sim.params) : null;
    case "reduction":
      // Réduction = « tout est hypothèse » : revenu porté par les params.
      return sim.params.revenuImposable > 0 ? buildReduction(sim.params) : null;
    default:
      return null;
  }
}

/** Disponibilité des blocs fixes (données présentes) — pilote l'UI de composition. */
export interface BlocAvailability {
  syntheseFiscale: boolean;
  plafondsPer: boolean;
  contributionsHR: boolean;
  pyramide: boolean;
}
export function computeAvailability(ctx: ClientContext): BlocAvailability {
  return {
    syntheseFiscale: buildSyntheseFiscale(ctx.fiscalState) != null,
    plafondsPer: buildPlafondsPer(ctx) != null,
    contributionsHR: buildContributionsHR(ctx) != null,
    pyramide: buildPyramide(ctx) != null,
  };
}

/** Recalcule tout le contenu du PDF depuis la composition + le contexte client. */
export function buildRenderModel(
  composition: CompositionPayload,
  ctx: ClientContext,
  dateStr: string
): RenderModel {
  const blocks: RenderBlock[] = [];

  if (composition.blocs.syntheseFiscale) {
    const synthese = buildSyntheseFiscale(ctx.fiscalState);
    if (synthese) blocks.push(synthese);
  }
  if (composition.blocs.plafondsPer) {
    const plafonds = buildPlafondsPer(ctx);
    if (plafonds) blocks.push(plafonds);
  }
  if (composition.blocs.contributionsHR) {
    const hr = buildContributionsHR(ctx);
    if (hr) blocks.push(hr);
  }
  if (composition.blocs.pyramide) {
    const pyramide = buildPyramide(ctx);
    if (pyramide) blocks.push(pyramide);
  }

  // Simulations (multi-instances, dans l'ordre fourni) après les blocs fixes.
  for (const sim of composition.simulations ?? []) {
    const block = buildSimulation(ctx, sim);
    if (block) blocks.push(block);
  }

  return { code: ctx.code, clientName: ctx.clientName, dateStr, blocks };
}
