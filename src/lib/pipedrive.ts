import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";
import type { AVComputed } from "@/lib/av-engine";

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

  let dealId: number;

  // OTP validé : réutiliser le deal créé par early-contact plutôt que d'en créer un 2e.
  // On le met à jour et on le déplace vers "Leads" / "Tel Validé". Si aucun deal ouvert
  // n'existe (OTP validé avant qu'early-contact ait tourné), on en crée un directement.
  if (otpVerifie) {
    const existingDealId = await findOpenDealForPersonAndProduct(personId, produit);
    if (existingDealId) {
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
      console.log(`[Pipedrive] Deal créé: ${dealId} (pipeline ${pipelineId}, stage ${stageId})`);
    }
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
}

export async function syncAVToPipedrive(
  data: AVSyncInput,
  computed: AVComputed,
  otpVerifie: boolean
): Promise<PipedriveSyncResult> {
  const fullName = `${data.prenom ?? ""} ${data.nom ?? ""}`.trim();
  const phone = formatPhone(data.telephone);

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
      "Capital projeté": computed.capitalFinalBrut,
      Horizon: data.dureeAnnees,
      "Capital net avec": computed.capitalNetAvecCervus,
      "Capital net sans": computed.capitalNetSansCervus,
      "Gain net optimisé": computed.gainNetCervus,
      "Profil investisseur": avProfilLabels[data.profil] ?? data.profil,
      Produit: "AV",
      Source: "Simu-AV",
      "OTP vérifié": otpVerifie ? "Oui" : "Non",
    },
    title: `AV - ${fullName || data.email}`,
    otpVerifie,
    produit: "AV",
  });
}
