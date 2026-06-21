import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import ReductionImpotSim from "@/components/conseiller/ReductionImpotSim";
import { computeFiscalState } from "@/lib/fiscal-state";
import { normalizeGarde, normalizeStatutLabel } from "@/lib/impot-sim";
import type { ReductionInputs } from "@/lib/reduction-impot";

export const metadata: Metadata = {
  title: "Illustration réduction d'impôt — Cervus Patrimoine",
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

/**
 * MODE CONNECTÉ (Lot 6) : ouvert depuis une fiche client. Mêmes champs, PRÉ-REMPLIS
 * priorité Découverte RDV > Simulation. Particularité : ICI tout reste éditable (y
 * compris revenu, situation familiale et versement) — le pré-remplissage n'est qu'un
 * point de départ. Le versement à illustrer est pré-rempli depuis le versement
 * initial de la fiche (0 si absent). N'écrit JAMAIS dans Pipedrive.
 */
export default async function ReductionImpotConnectePage({
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

  let prefill: Partial<ReductionInputs> = {};
  let code: string | null = null;
  try {
    const client = await getClientView(personId);
    const deal = client.deals[0]; // add_time DESC → le plus récent
    code = client.deals.find((d) => d.code)?.code ?? null;

    // État fiscal partagé (Lot 2) : revenu net imposable calculé une fois.
    const fiscal = computeFiscalState({
      revenuImposable: pickNum(client.personFields.revenuImposable),
      partsFiscales: pickNum(client.personFields.partsFiscales),
      salaireMensuel: pickNum(client.personFields.salaireMensuel),
      revenuConjoint: pickNum(client.personFields.revenuConjoint),
      statutMarital: pick(client.personFields.statutMarital)?.toString(),
      nbEnfants: pickNum(client.personFields.nbEnfants),
      foncier: deal ? pickNum(deal.fields.foncier) : undefined,
      bnc: deal ? pickNum(deal.fields.bnc) : undefined,
      bic: deal ? pickNum(deal.fields.bic) : undefined,
    });

    prefill = {
      statut: normalizeStatutLabel(pick(client.personFields.statutMarital)?.toString()),
      nbEnfants: pickNum(client.personFields.nbEnfants) ?? 0,
      garde: normalizeGarde(pick(client.personFields.garde)?.toString()),
      demiPartHandicap: false,
      revenuImposable: fiscal.revenuNetImposable > 0 ? fiscal.revenuNetImposable : 0,
      versementPer: deal ? pickNum(deal.fields.versementInitial) ?? 0 : 0,
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
      <ReductionImpotSim prefill={prefill} client={{ personId, code }} />
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
