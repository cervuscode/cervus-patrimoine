/**
 * Création IDEMPOTENTE des champs « Découverte RDV » dans Pipedrive.
 *
 * Source de vérité = le registre `src/lib/rdv-fields.ts`. Le script liste les champs
 * existants (/personFields, /dealFields), et crée par POST UNIQUEMENT ceux dont le
 * `decName` est absent (jamais de doublon). Re-jouable sans risque.
 *
 * Couvre les ajouts des Chantiers C (RFR réel) et D (6 enveloppes patrimoine). Les
 * champs déjà présents (Lot 1) sont simplement ignorés.
 *
 * Exécution :  npx --yes tsx scripts/create-rdv-fields.ts
 * Pré-requis : PIPEDRIVE_API_TOKEN (+ PIPEDRIVE_DOMAIN, défaut "cervus") dans .env.local.
 * ⚠️ Le token n'est lu que depuis l'environnement / .env.local — jamais en dur ici.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { RDV_FIELDS, type RdvFieldDef } from "../src/lib/rdv-fields";

// Charge .env.local (sans dépendance dotenv).
function loadEnvLocal(): void {
  try {
    const txt = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* pas de .env.local — on s'appuie sur l'environnement courant */
  }
}
loadEnvLocal();

const TOKEN = process.env.PIPEDRIVE_API_TOKEN;
const DOMAIN = process.env.PIPEDRIVE_DOMAIN || "cervus";
if (!TOKEN) {
  console.error("✖ PIPEDRIVE_API_TOKEN manquant (définir dans .env.local).");
  process.exit(1);
}
const BASE = `https://${DOMAIN}.pipedrive.com/api/v1`;

const KIND_TO_TYPE: Record<RdvFieldDef["kind"], string> = {
  money: "monetary",
  number: "double",
  text: "varchar",
};

async function existingNames(entity: RdvFieldDef["entity"]): Promise<Set<string>> {
  const path = entity === "deal" ? "dealFields" : "personFields";
  const res = await fetch(`${BASE}/${path}?api_token=${TOKEN}&limit=500`);
  if (!res.ok) throw new Error(`GET /${path} → HTTP ${res.status}`);
  const json = (await res.json()) as { data?: Array<{ name?: string }> };
  return new Set((json.data ?? []).map((f) => f.name ?? ""));
}

async function createField(entity: RdvFieldDef["entity"], name: string, type: string): Promise<void> {
  const path = entity === "deal" ? "dealFields" : "personFields";
  const res = await fetch(`${BASE}/${path}?api_token=${TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, field_type: type }),
  });
  const json = (await res.json()) as { success?: boolean };
  if (!res.ok || !json.success) {
    throw new Error(`POST /${path} "${name}" → HTTP ${res.status} ${JSON.stringify(json)}`);
  }
}

async function main(): Promise<void> {
  const existing: Record<RdvFieldDef["entity"], Set<string>> = {
    person: await existingNames("person"),
    deal: await existingNames("deal"),
  };

  let created = 0;
  let skipped = 0;
  for (const f of RDV_FIELDS) {
    if (existing[f.entity].has(f.decName)) {
      skipped++;
      continue;
    }
    const type = KIND_TO_TYPE[f.kind];
    process.stdout.write(`+ création (${f.entity}/${type}) : ${f.decName}\n`);
    await createField(f.entity, f.decName, type);
    created++;
  }

  console.log(`\nTerminé : ${created} champ(s) créé(s), ${skipped} déjà présent(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
