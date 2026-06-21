import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";
import type { AVComputed } from "@/lib/av-engine";
import {
  RDV_FIELDS,
  NOTES_FIELD,
  CODE_CLIENT_FIELD_NAME,
  type RdvFieldDef,
} from "@/lib/rdv-fields";

/**
 * Pipedrive sync — server-side only.
 *
 * Le token (PIPEDRIVE_API_TOKEN) ne doit JAMAIS être exposé au client : ce module
 * n'est importé que depuis des routes API (runtime serveur).
 *
 * Principe :
 *  - Les clés techniques (hash) des champs personnalisés ne sont PAS hardcodées.
 *    Elles sont résolues dynamiquement via /personFields et /dealFields, mappées par
 *    leur nom lisible, et mises en cache (TTL) pour éviter un appel à chaque requête.
 *  - Idem pour les IDs de pipelines/étapes (résolus via /pipelines et /stages).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Libellés (alignés avec Brevo)
// ─────────────────────────────────────────────────────────────────────────────
const profilLabels: Record<string, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  dynamique: "Dynamique",
};
// Profils Assurance-vie (inclut "responsable", absent du PER)
const avProfilLabels: Record<string, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  responsable: "Responsable",
  dynamique: "Dynamique",
};
const objectifLabels: Record<string, string> = {
  reduire_impots: "Réduire mes impôts",
  preparer_retraite: "Préparer ma retraite",
  dynamiser_epargne: "Dynamiser mon épargne",
};
const statutProLabels: Record<string, string> = {
  salarie: "Salarié",
  fonctionnaire: "Fonctionnaire",
  independant: "Indépendant",
  liberal: "Profession libérale",
};

function statutMaritalLabel(statut: SimulateurData["statut"]): string {
  if (statut === "marie" || statut === "pacse") return "Couple";
  if (statut === "parent_isole") return "Parent isolé";
  return "Célibataire";
}

function formatPhone(phone: string): string {
  const cleaned = (phone ?? "").replace(/\s/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+33" + cleaned;
}

// Date du jour au format "YYYY-MM-DD" (date locale Europe/Paris, sans heure).
// Sert d'ancre au champ deal "Date simulation" pour les relances J+1/J+7/J+21.
// `en-CA` produit nativement le format ISO court AAAA-MM-JJ.
function todaySimulationDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Ajoute `days` jours calendaires à une date "YYYY-MM-DD" et renvoie "YYYY-MM-DD".
// Calcul robuste via Date.UTC (midi UTC pour éviter tout effet de bord) : gère
// nativement les passages de mois et d'année (28/02 → 01/03, 25/12 → 05/01, etc.).
// Aucune composante horaire / fuseau dans le résultat : date calendaire pure.
function addDaysToISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Champs deal "revenus annexes" de la personne (foncier / BNC / BIC).
// Communs PER & AV (ce sont des revenus du contact, pas du produit). Résolus par
// NOM LISIBLE comme tous les autres champs custom (aucun hash en dur, cf. en-tête).
// Type Pipedrive : monétaire → on écrit une valeur numérique SIMPLE, exactement
// comme "Capital projeté" / "Versement mensuel" (pas d'objet {value, currency}).
// ─────────────────────────────────────────────────────────────────────────────
const DEAL_FIELD_FONCIER = "Foncier";
const DEAL_FIELD_BNC = "BNC";
const DEAL_FIELD_BIC = "BIC";

// Montant monétaire optionnel : renvoie un nombre strictement positif, sinon
// `undefined` → la clé sera OMISE par buildCustomFields. Pour ces revenus annexes
// on ne veut jamais écrire 0 par défaut (≠ des champs versements qui forcent `|| 0`).
function optionalAmount(raw: string | number | null | undefined): number | undefined {
  const n = typeof raw === "number" ? raw : parseFloat((raw ?? "").toString());
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Routage pipeline / étape selon le statut OTP
// ─────────────────────────────────────────────────────────────────────────────
const ROUTING = {
  withOtp: { pipeline: "Leads", stage: "Tel Validé" },
  withoutOtp: { pipeline: "Leads sans OTP", stage: "Simulation effectuée" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Base URL + fetch helper
// ─────────────────────────────────────────────────────────────────────────────
function pipedriveHost(): string {
  const d = (process.env.PIPEDRIVE_DOMAIN ?? "").trim().replace(/\/+$/, "");
  if (!d) throw new Error("PIPEDRIVE_DOMAIN manquant");
  if (d.startsWith("http://") || d.startsWith("https://")) return d;
  if (d.includes(".")) return `https://${d}`;
  return `https://${d}.pipedrive.com`;
}

function apiBase(): string {
  return `${pipedriveHost()}/api/v1`;
}

function withToken(path: string): string {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) throw new Error("PIPEDRIVE_API_TOKEN manquant");
  const sep = path.includes("?") ? "&" : "?";
  return `${apiBase()}${path}${sep}api_token=${encodeURIComponent(token)}`;
}

async function pdGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(withToken(path), { method: "GET" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json && json.success === false)) {
    throw new Error(`Pipedrive GET ${path} → ${res.status} ${JSON.stringify(json?.error ?? json)}`);
  }
  return json as T;
}

async function pdPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(withToken(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json && json.success === false)) {
    throw new Error(`Pipedrive POST ${path} → ${res.status} ${JSON.stringify(json?.error ?? json)}`);
  }
  return json as T;
}

async function pdPut<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(withToken(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json && json.success === false)) {
    throw new Error(`Pipedrive PUT ${path} → ${res.status} ${JSON.stringify(json?.error ?? json)}`);
  }
  return json as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Résolution + cache des métadonnées (champs, pipelines, étapes)
// ─────────────────────────────────────────────────────────────────────────────
interface PdField {
  key: string;
  name: string;
}
interface PdPipeline {
  id: number;
  name: string;
}
interface PdStage {
  id: number;
  name: string;
  pipeline_id: number;
}

interface PipedriveMeta {
  personFields: Record<string, string>; // nom -> key
  dealFields: Record<string, string>; // nom -> key
  pipelines: PdPipeline[];
  stages: PdStage[];
  fetchedAt: number;
}

const META_TTL_MS = 10 * 60 * 1000; // 10 min
let metaCache: PipedriveMeta | null = null;

function mapByName(fields: PdField[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of fields ?? []) {
    if (f?.name && f?.key) map[f.name.trim()] = f.key;
  }
  return map;
}

async function getMeta(): Promise<PipedriveMeta> {
  if (metaCache && Date.now() - metaCache.fetchedAt < META_TTL_MS) {
    return metaCache;
  }
  const [pf, df, pl, st] = await Promise.all([
    pdGet<{ data: PdField[] }>("/personFields"),
    pdGet<{ data: PdField[] }>("/dealFields"),
    pdGet<{ data: PdPipeline[] }>("/pipelines"),
    pdGet<{ data: PdStage[] }>("/stages"),
  ]);
  metaCache = {
    personFields: mapByName(pf.data ?? []),
    dealFields: mapByName(df.data ?? []),
    pipelines: pl.data ?? [],
    stages: st.data ?? [],
    fetchedAt: Date.now(),
  };
  return metaCache;
}

function resolveRouting(meta: PipedriveMeta, otpVerifie: boolean): { pipelineId: number; stageId: number } {
  const target = otpVerifie ? ROUTING.withOtp : ROUTING.withoutOtp;
  const pipeline = meta.pipelines.find((p) => p.name.trim().toLowerCase() === target.pipeline.toLowerCase());
  if (!pipeline) throw new Error(`Pipeline introuvable: "${target.pipeline}"`);
  const stage = meta.stages.find(
    (s) => s.pipeline_id === pipeline.id && s.name.trim().toLowerCase() === target.stage.toLowerCase()
  );
  if (!stage) throw new Error(`Étape introuvable: "${target.stage}" dans pipeline "${target.pipeline}"`);
  return { pipelineId: pipeline.id, stageId: stage.id };
}

/**
 * Construit le set de champs personnalisés {hashKey: value} à partir d'un mapping
 * {nomLisible: value}. Les champs inconnus (non présents dans Pipedrive) ou à valeur
 * vide/undefined sont ignorés, avec un avertissement loggé pour les champs manquants.
 */
function buildCustomFields(
  nameToKey: Record<string, string>,
  values: Record<string, string | number | null | undefined>,
  context: string
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === "") continue;
    const key = nameToKey[name];
    if (!key) {
      console.warn(`[Pipedrive] Champ ${context} introuvable, ignoré: "${name}"`);
      continue;
    }
    out[key] = value;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Person : recherche par email → update / create
// ─────────────────────────────────────────────────────────────────────────────
async function findPersonByEmail(email: string): Promise<number | null> {
  const res = await pdGet<{ data?: { items?: Array<{ item?: { id?: number } }> } }>(
    `/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`
  );
  const id = res.data?.items?.[0]?.item?.id;
  return typeof id === "number" ? id : null;
}

// Cherche le deal OUVERT le plus récent rattaché à la Person ET portant le même
// `Produit` (champ custom). Sert à réutiliser le deal créé par early-contact lors de
// la validation OTP, sans créer de doublon.
//
// INVARIANT « par produit » : le matching se fait TOUJOURS par personne + produit,
// jamais par personne seule. Une personne peut avoir simultanément un deal PER ouvert
// ET un deal AV ouvert ; on ne réutilise/déplace JAMAIS le deal d'un autre produit
// (sinon on écraserait ses données). Comparaison insensible à la casse / aux espaces.
//
// Renvoie null (→ un nouveau deal sera créé) si aucun deal ouvert du produit n'existe,
// ou si le champ `Produit` est introuvable côté Pipedrive : on préfère créer un deal
// plutôt que risquer d'écraser celui d'un autre produit.
export async function findOpenDealForPersonAndProduct(
  personId: number,
  produitValue: string
): Promise<number | null> {
  const meta = await getMeta();
  const produitKey = meta.dealFields["Produit"];
  if (!produitKey) {
    console.warn('[Pipedrive] Champ Deal "Produit" introuvable — findOpenDealForPersonAndProduct ne peut pas filtrer par produit');
    return null;
  }

  const res = await pdGet<{ data?: Array<Record<string, unknown>> | null }>(
    `/persons/${personId}/deals?status=open&limit=50&sort=add_time DESC`
  );
  const target = produitValue.trim().toLowerCase();
  for (const deal of res.data ?? []) {
    const raw = deal[produitKey];
    if (raw != null && String(raw).trim().toLowerCase() === target) {
      const id = deal.id;
      return typeof id === "number" ? id : null;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync principal
// ─────────────────────────────────────────────────────────────────────────────
export interface PipedriveSyncResult {
  personId: number;
  dealId: number;
}

/**
 * Cœur générique « par produit ».
 *
 * Reçoit des mappings {nomLisible: valeur} déjà spécifiques au produit (construits
 * par les adaptateurs PER/AV), et orchestre : upsert Person par email, puis logique
 * Deal (réutilisation/déplacement vs création) selon le statut OTP.
 *
 * - `personValues` / `dealValues` : champs personnalisés par nom lisible (mappés en
 *   clés hash via la meta). `dealValues` inclut Produit/Source.
 * - `produit` : OBLIGATOIRE. La réutilisation de deal est TOUJOURS filtrée par ce
 *   produit (`findOpenDealForPersonAndProduct`) : on n'écrase/déplace jamais le deal
 *   d'un autre produit. Doit correspondre à la valeur `Produit` mise dans `dealValues`.
 */
export interface ProductSyncParams {
  email: string;
  fullName: string;
  phone?: string;
  personValues: Record<string, string | number | null | undefined>;
  dealValues: Record<string, string | number | null | undefined>;
  title: string;
  otpVerifie: boolean;
  produit: string;
}

export async function syncProductToPipedrive(params: ProductSyncParams): Promise<PipedriveSyncResult> {
  const { email, fullName, phone, personValues, dealValues, title, otpVerifie, produit } = params;

  const meta = await getMeta();
  const { pipelineId, stageId } = resolveRouting(meta, otpVerifie);

  // ── Person ───────────────────────────────────────────────────────────────
  const personCustom = buildCustomFields(meta.personFields, personValues, "Person");

  const personPayload: Record<string, unknown> = {
    name: fullName || email,
    email: [{ value: email, primary: true, label: "work" }],
    ...(phone ? { phone: [{ value: phone, primary: true, label: "mobile" }] } : {}),
    ...personCustom,
  };

  const existingId = await findPersonByEmail(email);
  let personId: number;
  if (existingId) {
    const updated = await pdPut<{ data: { id: number } }>(`/persons/${existingId}`, personPayload);
    personId = updated.data?.id ?? existingId;
    console.log(`[Pipedrive] Person mise à jour: ${personId}`);
  } else {
    const created = await pdPost<{ data: { id: number } }>("/persons", personPayload);
    personId = created.data.id;
    console.log(`[Pipedrive] Person créée: ${personId}`);
  }

  // ── Deal ─────────────────────────────────────────────────────────────────
  const dealCustom = buildCustomFields(meta.dealFields, dealValues, "Deal");

  // "Date simulation" + échéancier de relances figé (Relance J1/J7/J21 le) : ces 4
  // dates sont l'ancre des relances. On ne les écrit QU'À LA CRÉATION (ou si le deal
  // existant n'a pas encore de Date simulation). Sur un deal déjà daté, on retire ces
  // clés du payload de mise à jour pour ne JAMAIS réinitialiser l'échéancier lors d'une
  // 2e visite (ex. early-contact → submit, ou simu rejouée un autre jour).
  // Le champ "Dernière relance envoyée" n'est jamais touché ici (géré par Make).
  const dateSimKey = meta.dealFields["Date simulation"];
  const relanceKeys = ["Relance J1 le", "Relance J7 le", "Relance J21 le"]
    .map((name) => meta.dealFields[name])
    .filter((k): k is string => Boolean(k));
  async function stripDateSimIfAlreadySet(existingDealId: number): Promise<void> {
    if (!dateSimKey || dealCustom[dateSimKey] === undefined) return;
    const res = await pdGet<{ data?: Record<string, unknown> }>(`/deals/${existingDealId}`);
    const existing = res.data?.[dateSimKey];
    // Si la Date simulation est déjà posée → on ne réécrit ni elle ni les 3 relances.
    if (existing != null && String(existing).trim() !== "") {
      delete dealCustom[dateSimKey];
      for (const k of relanceKeys) delete dealCustom[k];
    }
  }

  let dealId: number;
  // Volet A (Lot 1) : on ne génère le code client QUE pour un deal nouvellement créé.
  let dealCreated = false;

  // OTP validé : réutiliser le deal créé par early-contact plutôt que d'en créer un 2e.
  // On le met à jour et on le déplace vers "Leads" / "Tel Validé". Si aucun deal ouvert
  // n'existe (OTP validé avant qu'early-contact ait tourné), on en crée un directement.
  if (otpVerifie) {
    const existingDealId = await findOpenDealForPersonAndProduct(personId, produit);
    if (existingDealId) {
      await stripDateSimIfAlreadySet(existingDealId);
      await pdPut(`/deals/${existingDealId}`, {
        title,
        pipeline_id: pipelineId,
        stage_id: stageId,
        ...dealCustom,
      });
      dealId = existingDealId;
      console.log(`[Pipedrive] Deal existant mis à jour et déplacé: ${dealId} (pipeline ${pipelineId}, stage ${stageId})`);
    } else {
      const deal = await pdPost<{ data: { id: number } }>("/deals", {
        title,
        person_id: personId,
        pipeline_id: pipelineId,
        stage_id: stageId,
        ...dealCustom,
      });
      dealId = deal.data.id;
      dealCreated = true;
      console.log(`[Pipedrive] Aucun deal ouvert trouvé, deal créé: ${dealId} (pipeline ${pipelineId}, stage ${stageId})`);
    }
  } else {
    // early-contact (sans OTP) : si un deal ouvert existe déjà (ex. un submit OTP a tourné
    // avant), on NE crée rien et on NE rétrograde pas — un OTP validé ne doit jamais
    // redescendre vers "Leads sans OTP". Sinon, création en "Leads sans OTP" / "Simulation effectuée".
    const existingDealId = await findOpenDealForPersonAndProduct(personId, produit);
    if (existingDealId) {
      dealId = existingDealId;
      console.log(`[Pipedrive] Deal ouvert déjà présent (${dealId}), early-contact ne crée rien et ne rétrograde pas`);
    } else {
      const deal = await pdPost<{ data: { id: number } }>("/deals", {
        title,
        person_id: personId,
        pipeline_id: pipelineId,
        stage_id: stageId,
        ...dealCustom,
      });
      dealId = deal.data.id;
      dealCreated = true;
      console.log(`[Pipedrive] Deal créé: ${dealId} (pipeline ${pipelineId}, stage ${stageId})`);
    }
  }

  // Volet A : attribution du code client à la source, UNIQUEMENT à la création d'un
  // nouveau deal. Strictement non-bloquant : un échec ne doit jamais faire échouer la
  // création du deal ni le parcours du site public (cf. assignClientCodeOnCreate).
  if (dealCreated) {
    await assignClientCodeOnCreate(dealId);
  }

  return { personId, dealId };
}

/**
 * Adaptateur PER :
 *   Produit "PER", Source "Simu-PER", titre "PER - …", matching de deal FILTRÉ par
 *   Produit="PER" (n'écrase jamais un deal AV ouvert du même contact).
 */
export async function syncToPipedrive(
  data: SimulateurData,
  computed: ComputedResults,
  otpVerifie: boolean
): Promise<PipedriveSyncResult> {
  const fullName = `${data.prenom ?? ""} ${data.nom ?? ""}`.trim();
  const phone = formatPhone(data.telephone);
  const dateSimulationPER = todaySimulationDate();

  return syncProductToPipedrive({
    email: data.email,
    fullName,
    phone: phone || undefined,
    personValues: {
      LinkedIn: (data as unknown as { linkedin?: string }).linkedin ?? "",
      "Statut professionnel": data.statutPro ? statutProLabels[data.statutPro] ?? data.statutPro : "",
      "Statut marital": statutMaritalLabel(data.statut),
      "Nombre d'enfants": data.nbEnfants,
      "Année de naissance": parseInt(data.anneeNaissance) || 0,
      "Salaire mensuel": parseFloat(data.salaireMensuel) || 0,
      "Revenu imposable": computed.revenuImposable,
      "Revenu conjoint": data.revenusConjoint ? (parseFloat(data.revenusConjoint) || 0) * 12 : 0,
      TMI: computed.tmi,
      "Âge retraite": computed.ageRetraiteNum,
    },
    dealValues: {
      "Versement initial": parseFloat(data.versementInitial) || 0,
      "Versement mensuel": parseFloat(data.versementMensuel) || 0,
      [DEAL_FIELD_FONCIER]: optionalAmount(data.foncier),
      [DEAL_FIELD_BNC]: optionalAmount(data.bnc),
      [DEAL_FIELD_BIC]: optionalAmount(data.bic),
      "Capital projeté": computed.capitalFinal,
      "Économie fiscale": computed.economieFiscale,
      "Économie mensuelle": computed.economieMensuelle,
      "Impôt avant PER": computed.impotAvant,
      "Impôt après PER": computed.impotApres,
      "PAS avant PER": computed.pasMensAvant,
      "PAS après PER": computed.pasMensApres,
      "Profil investisseur": profilLabels[data.profil] ?? data.profil,
      Produit: "PER",
      Objectif: data.objectif ? objectifLabels[data.objectif] ?? data.objectif : "",
      Source: "Simu-PER",
      "Date simulation": dateSimulationPER,
      "Relance J1 le": addDaysToISODate(dateSimulationPER, 1),
      "Relance J7 le": addDaysToISODate(dateSimulationPER, 7),
      "Relance J21 le": addDaysToISODate(dateSimulationPER, 21),
      "OTP vérifié": otpVerifie ? "Oui" : "Non",
    },
    title: `PER - ${fullName || data.email}`,
    otpVerifie,
    produit: "PER",
  });
}

/**
 * Adaptateur Assurance-vie.
 *   Produit "AV", Source "Simu-AV", titre "AV - …", matching de deal FILTRÉ par
 *   Produit="AV" (n'écrase jamais un deal PER ouvert).
 *   Person = champs communs uniquement (nom/email/téléphone). Champs deal PER-spécifiques
 *   laissés vides : on ne renseigne que les champs AV + ceux réutilisés.
 */
export interface AVSyncInput {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  versementInitial: string;
  versementMensuel: string;
  dureeAnnees: number;
  profil: string;
  marie: boolean | null;
  // Revenus annexes de la personne (communs PER/AV). Optionnels : le parcours AV
  // ne les collecte pas aujourd'hui → undefined → clés Pipedrive omises.
  foncier?: string;
  bnc?: string;
  bic?: string;
}

export async function syncAVToPipedrive(
  data: AVSyncInput,
  computed: AVComputed,
  otpVerifie: boolean
): Promise<PipedriveSyncResult> {
  const fullName = `${data.prenom ?? ""} ${data.nom ?? ""}`.trim();
  const phone = formatPhone(data.telephone);
  const dateSimulationAV = todaySimulationDate();

  return syncProductToPipedrive({
    email: data.email,
    fullName,
    phone: phone || undefined,
    // Person : champs communs uniquement. On laisse vide pour ne pas écraser des
    // données Person plus riches issues d'un éventuel parcours PER du même contact.
    personValues: {},
    dealValues: {
      "Versement initial": parseFloat(data.versementInitial) || 0,
      "Versement mensuel": parseFloat(data.versementMensuel) || 0,
      [DEAL_FIELD_FONCIER]: optionalAmount(data.foncier),
      [DEAL_FIELD_BNC]: optionalAmount(data.bnc),
      [DEAL_FIELD_BIC]: optionalAmount(data.bic),
      "Capital projeté": computed.capitalFinalBrut,
      Horizon: data.dureeAnnees,
      "Capital net avec": computed.capitalNetAvecCervus,
      "Capital net sans": computed.capitalNetSansCervus,
      "Gain net optimisé": computed.gainNetCervus,
      "Profil investisseur": avProfilLabels[data.profil] ?? data.profil,
      Produit: "AV",
      Source: "Simu-AV",
      "Date simulation": dateSimulationAV,
      "Relance J1 le": addDaysToISODate(dateSimulationAV, 1),
      "Relance J7 le": addDaysToISODate(dateSimulationAV, 7),
      "Relance J21 le": addDaysToISODate(dateSimulationAV, 21),
      "OTP vérifié": otpVerifie ? "Oui" : "Non",
    },
    title: `AV - ${fullName || data.email}`,
    otpVerifie,
    produit: "AV",
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// Outil RDV Conseiller — Lot 1
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Volet A — Code client généré à la source (format C-0042, scan + 1, jamais régénéré)
// ─────────────────────────────────────────────────────────────────────────────

const CODE_CLIENT_REGEX = /^C-(\d+)$/i;

function formatClientCode(n: number): string {
  return `C-${String(n).padStart(4, "0")}`;
}

/**
 * Scanne TOUS les deals (paginé) pour trouver le plus grand code `C-XXXX` attribué,
 * et renvoie le suivant (`C-0001` si aucun). Exporté : réutilisé par le Volet B
 * (bouton « Générer un code » de l'outil RDV) pour proposer le même prochain code.
 */
export async function computeNextClientCode(): Promise<string> {
  const meta = await getMeta();
  const codeKey = meta.dealFields[CODE_CLIENT_FIELD_NAME];
  if (!codeKey) {
    throw new Error(`Champ Deal "${CODE_CLIENT_FIELD_NAME}" introuvable côté Pipedrive`);
  }

  let max = 0;
  let start = 0;
  const limit = 500;
  // Pagination Pipedrive : on boucle tant que more_items_in_collection est vrai.
  for (let guard = 0; guard < 100; guard++) {
    const res = await pdGet<{
      data?: Array<Record<string, unknown>> | null;
      additional_data?: { pagination?: { more_items_in_collection?: boolean; next_start?: number } };
    }>(`/deals?status=all_not_deleted&limit=${limit}&start=${start}`);
    for (const deal of res.data ?? []) {
      const raw = deal[codeKey];
      if (raw == null) continue;
      const m = String(raw).trim().match(CODE_CLIENT_REGEX);
      if (m) {
        const n = parseInt(m[1], 10);
        if (Number.isFinite(n) && n > max) max = n;
      }
    }
    const pg = res.additional_data?.pagination;
    if (!pg?.more_items_in_collection) break;
    start = pg.next_start ?? start + limit;
  }
  return formatClientCode(max + 1);
}

/**
 * Attribue un code client à un deal NOUVELLEMENT créé, s'il n'en a pas déjà un.
 * STRICTEMENT NON-BLOQUANT : toute erreur (champ absent, réseau, quota) est avalée
 * et loggée — ne fait jamais échouer la création du deal ni le parcours public.
 * Ne régénère jamais un code déjà présent.
 */
export async function assignClientCodeOnCreate(dealId: number): Promise<void> {
  try {
    const meta = await getMeta();
    const codeKey = meta.dealFields[CODE_CLIENT_FIELD_NAME];
    if (!codeKey) {
      console.warn(`[Pipedrive] Champ "${CODE_CLIENT_FIELD_NAME}" absent → code client non généré (no-op)`);
      return;
    }
    // Ne jamais régénérer : si le deal a déjà un code, on s'arrête.
    const current = await pdGet<{ data?: Record<string, unknown> }>(`/deals/${dealId}`);
    const existing = current.data?.[codeKey];
    if (existing != null && String(existing).trim() !== "") {
      return;
    }
    const code = await computeNextClientCode();
    await pdPut(`/deals/${dealId}`, { [codeKey]: code });
    console.log(`[Pipedrive] Code client attribué au deal ${dealId}: ${code}`);
  } catch (err) {
    console.warn(`[Pipedrive] Échec attribution code client (non-bloquant) deal ${dealId}:`, err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Volet B — Lire le code client d'un deal (vérification « Lier la fiche »)
// ─────────────────────────────────────────────────────────────────────────────
export async function readDealCodeClient(dealId: number): Promise<string | null> {
  const meta = await getMeta();
  const codeKey = meta.dealFields[CODE_CLIENT_FIELD_NAME];
  if (!codeKey) return null;
  const res = await pdGet<{ data?: Record<string, unknown> }>(`/deals/${dealId}`);
  const raw = res.data?.[codeKey];
  return raw != null && String(raw).trim() !== "" ? String(raw).trim() : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recherche de personnes (champ libre nom/email — JAMAIS de dropdown côté UI)
// ─────────────────────────────────────────────────────────────────────────────
export interface PersonSearchHit {
  id: number;
  name: string;
  email: string | null;
}

export async function searchPersonsByTerm(term: string): Promise<PersonSearchHit[]> {
  const q = term.trim();
  if (q.length < 2) return [];
  const res = await pdGet<{
    data?: { items?: Array<{ item?: { id?: number; name?: string; primary_email?: string | null } }> };
  }>(`/persons/search?term=${encodeURIComponent(q)}&fields=name,email&limit=20`);
  const hits: PersonSearchHit[] = [];
  for (const it of res.data?.items ?? []) {
    const id = it.item?.id;
    if (typeof id !== "number") continue;
    hits.push({
      id,
      name: it.item?.name ?? "(sans nom)",
      email: it.item?.primary_email ?? null,
    });
  }
  return hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vue client : Person + tous ses deals, valeurs Simulation + Découverte RDV
// ─────────────────────────────────────────────────────────────────────────────
export interface ClientFieldValue {
  id: string; // RdvFieldDef.id
  sim: string | number | null; // valeur Simulation (lecture seule)
  dec: string | number | null; // valeur Découverte RDV (en base)
}

export interface ClientDeal {
  id: number;
  title: string;
  produit: string | null;
  status: string | null;
  code: string | null;
  // valeurs des champs Découverte RDV portés par le DEAL (id → {sim, dec})
  fields: Record<string, ClientFieldValue>;
}

export interface ClientView {
  personId: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  // valeurs des champs Découverte RDV portés par la PERSON (id → {sim, dec})
  personFields: Record<string, ClientFieldValue>;
  notes: string | null;
  deals: ClientDeal[];
}

function readVal(
  source: Record<string, unknown>,
  nameToKey: Record<string, string>,
  fieldName?: string
): string | number | null {
  if (!fieldName) return null;
  const key = nameToKey[fieldName];
  if (!key) return null;
  const raw = source[key];
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" || typeof raw === "string") return raw;
  // Champ monétaire renvoyé sous forme d'objet {value, currency} selon le contexte.
  if (typeof raw === "object" && "value" in (raw as Record<string, unknown>)) {
    const v = (raw as { value?: unknown }).value;
    return typeof v === "number" || typeof v === "string" ? v : null;
  }
  return null;
}

function collectFields(
  entity: RdvFieldDef["entity"],
  source: Record<string, unknown>,
  nameToKey: Record<string, string>
): Record<string, ClientFieldValue> {
  const out: Record<string, ClientFieldValue> = {};
  for (const f of RDV_FIELDS) {
    if (f.entity !== entity) continue;
    out[f.id] = {
      id: f.id,
      sim: readVal(source, nameToKey, f.simName),
      dec: readVal(source, nameToKey, f.decName),
    };
  }
  return out;
}

export async function getClientView(personId: number): Promise<ClientView> {
  const meta = await getMeta();

  const personRes = await pdGet<{ data?: Record<string, unknown> }>(`/persons/${personId}`);
  const person = personRes.data ?? {};

  const notesKey = meta.personFields[NOTES_FIELD.decName];
  const notesRaw = notesKey ? person[notesKey] : null;
  const notes = notesRaw != null && String(notesRaw).trim() !== "" ? String(notesRaw) : null;

  const dealsRes = await pdGet<{ data?: Array<Record<string, unknown>> | null }>(
    `/persons/${personId}/deals?status=all_not_deleted&limit=50&sort=add_time DESC`
  );
  const produitKey = meta.dealFields["Produit"];
  const codeKey = meta.dealFields[CODE_CLIENT_FIELD_NAME];

  const deals: ClientDeal[] = (dealsRes.data ?? []).map((d) => {
    const idRaw = d.id;
    const code = codeKey ? d[codeKey] : null;
    const produit = produitKey ? d[produitKey] : null;
    return {
      id: typeof idRaw === "number" ? idRaw : Number(idRaw),
      title: typeof d.title === "string" ? d.title : "",
      produit: produit != null && String(produit).trim() !== "" ? String(produit) : null,
      status: typeof d.status === "string" ? d.status : null,
      code: code != null && String(code).trim() !== "" ? String(code).trim() : null,
      fields: collectFields("deal", d, meta.dealFields),
    };
  });

  return {
    personId,
    name: typeof person.name === "string" ? person.name : "",
    firstName: typeof person.first_name === "string" ? person.first_name : null,
    lastName: typeof person.last_name === "string" ? person.last_name : null,
    email:
      typeof person.primary_email === "string"
        ? person.primary_email
        : null,
    personFields: collectFields("person", person, meta.personFields),
    notes,
    deals,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Écriture Découverte RDV (jamais les champs Simulation)
// `personValues` / `dealValues` : { fieldId → valeur }. `notes` à part (Person).
// ─────────────────────────────────────────────────────────────────────────────
export interface SaveDecouverteInput {
  personId: number;
  dealId?: number | null;
  personValues?: Record<string, string | number | null>;
  dealValues?: Record<string, string | number | null>;
  notes?: string | null;
}

function buildDecouvertePayload(
  entity: RdvFieldDef["entity"],
  values: Record<string, string | number | null> | undefined,
  nameToKey: Record<string, string>
): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  if (!values) return out;
  for (const [fieldId, value] of Object.entries(values)) {
    const def = RDV_FIELDS.find((f) => f.id === fieldId && f.entity === entity);
    if (!def) continue; // jamais un champ inconnu
    const key = nameToKey[def.decName]; // TOUJOURS la clé Découverte RDV, jamais Simulation
    if (!key) {
      console.warn(`[Pipedrive] Champ Découverte introuvable, ignoré: "${def.decName}"`);
      continue;
    }
    out[key] = value;
  }
  return out;
}

export async function saveDecouverteRDV(input: SaveDecouverteInput): Promise<void> {
  const meta = await getMeta();

  // ── Person ──
  const personPayload = buildDecouvertePayload("person", input.personValues, meta.personFields);
  if (input.notes !== undefined) {
    const notesKey = meta.personFields[NOTES_FIELD.decName];
    if (notesKey) personPayload[notesKey] = input.notes;
    else console.warn(`[Pipedrive] Champ "${NOTES_FIELD.decName}" introuvable, notes ignorées`);
  }
  if (Object.keys(personPayload).length > 0) {
    await pdPut(`/persons/${input.personId}`, personPayload);
  }

  // ── Deal ──
  if (input.dealId) {
    const dealPayload = buildDecouvertePayload("deal", input.dealValues, meta.dealFields);
    if (Object.keys(dealPayload).length > 0) {
      await pdPut(`/deals/${input.dealId}`, dealPayload);
    }
  }
}

/**
 * Ajoute une NOTE (API Notes Pipedrive) attachée à un Deal (Lot 3 — note de
 * synthèse de RDV). `content` est du HTML léger (Pipedrive rend du HTML).
 * Ne touche AUCUN champ Découverte — uniquement la création de note.
 */
export async function addDealNote(dealId: number, content: string): Promise<void> {
  await pdPost("/notes", { content, deal_id: dealId });
}
