import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import ComparateurAvPer from "@/components/conseiller/ComparateurAvPer";
import { computeFiscalState, mapStatutToParts } from "@/lib/fiscal-state";
import type { ComparateurInputs } from "@/lib/comparateur-av-per";

export const metadata: Metadata = {
  title: "Comparateur Assurance-vie / PER — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

// Lit Pipedrive à chaque ouverture (snapshot frais pour le pré-remplissage).
export const dynamic = "force-dynamic";

type FieldVal = { sim: string | number | null; dec: string | number | null };

/** Priorité Découverte RDV > Simulation (règle Lot 1, registre rdv-fields). */
function pick(v?: FieldVal): string | number | null {
  if (!v) return null;
  if (v.dec != null && String(v.dec) !== "") return v.dec;
  if (v.sim != null && String(v.sim) !== "") return v.sim;
  return null;
}
function pickNum(v?: FieldVal): number | undefined {
  const raw = pick(v);
  if (raw == null) return undefined;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

/** Versement « envisagé » PER prioritaire, repli sur le versement régulier (cf. simulateur-per). */
function pickEnvisage(envisage?: FieldVal, regulier?: FieldVal): number | undefined {
  if (envisage?.dec != null && String(envisage.dec) !== "") {
    const n = typeof envisage.dec === "number" ? envisage.dec : parseFloat(String(envisage.dec).replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return pickNum(regulier);
}

/**
 * MODE CONNECTÉ (Lot 7) : ouvert depuis une fiche client. Effort net / situation
 * PRÉ-REMPLIS priorité Découverte RDV > Simulation. Tout reste éditable. Tranche de
 * sortie par défaut = TMI courante (état fiscal partagé). N'écrit JAMAIS dans Pipedrive.
 */
export default async function ComparateurConnectePage({
  params,
}: {
  params: { personId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personId = Number(params.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    return <Shell personId={params.personId} message="Identifiant client invalide." />;
  }

  let prefill: Partial<ComparateurInputs> = {};
  let code: string | null = null;
  try {
    const client = await getClientView(personId);
    const deal = client.deals[0]; // add_time DESC → le plus récent
    code = client.deals.find((d) => d.code)?.code ?? null;

    const statut = pick(client.personFields.statutMarital)?.toString();
    const fiscal = computeFiscalState({
      revenuImposable: pickNum(client.personFields.revenuImposable),
      partsFiscales: pickNum(client.personFields.partsFiscales),
      salaireMensuel: pickNum(client.personFields.salaireMensuel),
      revenuConjoint: pickNum(client.personFields.revenuConjoint),
      statutMarital: statut,
      nbEnfants: pickNum(client.personFields.nbEnfants),
      foncier: deal ? pickNum(deal.fields.foncier) : undefined,
      bnc: deal ? pickNum(deal.fields.bnc) : undefined,
      bic: deal ? pickNum(deal.fields.bic) : undefined,
    });
    const marieParts = mapStatutToParts(statut);

    prefill = {
      revenuImposable: fiscal.revenuNetImposable > 0 ? fiscal.revenuNetImposable : 0,
      parts: fiscal.partsTotal,
      marie: marieParts === "marie" || marieParts === "pacse",
      effortNetMensuel: deal ? pickEnvisage(deal.fields.versementMensuelPerEnvisage, deal.fields.versementMensuel) ?? 0 : 0,
      effortNetInitial: deal ? pickEnvisage(deal.fields.versementInitialPerEnvisage, deal.fields.versementInitial) ?? 0 : 0,
      trancheSortie: fiscal.tmi,
    };
  } catch {
    return (
      <Shell personId={params.personId} message="Impossible de charger la fiche depuis Pipedrive." />
    );
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-cervus-gold/15 px-4 py-3 sm:px-6">
        <Link
          href={`/client/${personId}`}
          className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze"
        >
          ← Fiche client
        </Link>
      </div>
      <ComparateurAvPer prefill={prefill} client={{ personId, code }} />
    </main>
  );
}

function Shell({ personId, message }: { personId: string; message: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start gap-4 px-6 py-16">
      <Link href={`/client/${personId}`} className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
        ← Fiche client
      </Link>
      <p className="text-cervus-bronze/80">{message}</p>
    </main>
  );
}
