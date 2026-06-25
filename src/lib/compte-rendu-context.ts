/**
 * Résolution SERVEUR du contexte client pour le compte-rendu (Lot 11).
 *
 * Centralise la lecture Pipedrive + le calcul de l'état fiscal pour CONSTRUIRE le
 * `ClientContext` consommé par `buildRenderModel`. Utilisé par la route de génération
 * PDF ET par la page de composition (mêmes données, une seule implémentation).
 *
 * ⚠️ Serveur uniquement (importe `pipedrive` qui porte le token). Ne jamais importer
 * côté client. `compte-rendu.ts` reste isomorphe (aucun import Pipedrive).
 */

import { getClientView, type ClientView } from "./pipedrive";
import { computeFiscalState } from "./fiscal-state";
import type { ClientContext } from "./compte-rendu";

type FieldVal = { sim: string | number | null; dec: string | number | null };

/** Priorité Découverte RDV > Simulation (règle Lot 1, registre rdv-fields). */
export function pick(v?: FieldVal): string | number | null {
  if (!v) return null;
  if (v.dec != null && String(v.dec) !== "") return v.dec;
  if (v.sim != null && String(v.sim) !== "") return v.sim;
  return null;
}
export function pickNum(v?: FieldVal): number | undefined {
  const raw = pick(v);
  if (raw == null) return undefined;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}
export function pickStr(v?: FieldVal): string | undefined {
  const raw = pick(v);
  return raw == null ? undefined : String(raw);
}

export interface ResolvedClient {
  ctx: ClientContext;
  client: ClientView;
}

/** Lit Pipedrive et calcule le contexte client (état fiscal + patrimoine + flags). */
export async function resolveClientContext(personId: number): Promise<ResolvedClient> {
  const client = await getClientView(personId);
  const deal = client.deals[0]; // add_time DESC → le plus récent
  const code = client.deals.find((d) => d.code)?.code ?? null;

  const foncier = (deal ? pickNum(deal.fields.foncier) : undefined) ?? 0;
  const bnc = (deal ? pickNum(deal.fields.bnc) : undefined) ?? 0;
  const bic = (deal ? pickNum(deal.fields.bic) : undefined) ?? 0;
  const estTNS = pickStr(client.personFields.estTNS) === "Oui";
  const nbEnfants = pickNum(client.personFields.nbEnfants) ?? 0;
  const rfrReel = pickNum(client.personFields.rfrReel) ?? null;
  const anneeNaissance = pickNum(client.personFields.anneeNaissance) ?? 1980;

  const fiscalState = computeFiscalState({
    revenuImposable: pickNum(client.personFields.revenuImposable),
    partsFiscales: pickNum(client.personFields.partsFiscales),
    salaireMensuel: pickNum(client.personFields.salaireMensuel),
    revenuConjoint: pickNum(client.personFields.revenuConjoint),
    statutMarital: pickStr(client.personFields.statutMarital),
    nbEnfants,
    foncier,
    bnc,
    bic,
  });

  const pf = (id: keyof typeof client.personFields) => pickNum(client.personFields[id]) ?? 0;
  const patrimoine = {
    livretsReglementes: pf("livretsReglementes"),
    livretsBoostes: pf("livretsBoostes"),
    autreEpargne: pf("autreEpargne"),
    encoursFondsEuros: pf("encoursFondsEuros"),
    encoursAv: pf("encoursAv"),
    encoursPea: pf("encoursPea"),
    encoursPer: pf("encoursPer"),
    cto: pf("cto"),
    crypto: pf("crypto"),
    capaciteEpargneMensuelle: pf("capaciteEpargneMensuelle"),
  };

  const ctx: ClientContext = {
    code,
    fiscalState,
    foncier,
    bnc,
    bic,
    estTNS,
    nbEnfants,
    rfrReel,
    anneeNaissance,
    patrimoine,
  };
  return { ctx, client };
}
