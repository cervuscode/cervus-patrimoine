import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

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

// ─────────────────────────────────────────────────────────────────────────────
// Sync principal
// ─────────────────────────────────────────────────────────────────────────────
export interface PipedriveSyncResult {
  personId: number;
  dealId: number;
}

export async function syncToPipedrive(
  data: SimulateurData,
  computed: ComputedResults,
  otpVerifie: boolean
): Promise<PipedriveSyncResult> {
  const meta = await getMeta();
  const { pipelineId, stageId } = resolveRouting(meta, otpVerifie);

  const fullName = `${data.prenom ?? ""} ${data.nom ?? ""}`.trim();
  const phone = formatPhone(data.telephone);

  // ── Person ───────────────────────────────────────────────────────────────
  const personCustom = buildCustomFields(
    meta.personFields,
    {
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
    "Person"
  );

  const personPayload: Record<string, unknown> = {
    name: fullName || data.email,
    email: [{ value: data.email, primary: true, label: "work" }],
    ...(phone ? { phone: [{ value: phone, primary: true, label: "mobile" }] } : {}),
    ...personCustom,
  };

  const existingId = await findPersonByEmail(data.email);
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
  const dealCustom = buildCustomFields(
    meta.dealFields,
    {
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
    "Deal"
  );

  const dealPayload: Record<string, unknown> = {
    title: `PER - ${fullName || data.email}`,
    person_id: personId,
    pipeline_id: pipelineId,
    stage_id: stageId,
    ...dealCustom,
  };

  const deal = await pdPost<{ data: { id: number } }>("/deals", dealPayload);
  const dealId = deal.data.id;
  console.log(`[Pipedrive] Deal créé: ${dealId} (pipeline ${pipelineId}, stage ${stageId})`);

  return { personId, dealId };
}
