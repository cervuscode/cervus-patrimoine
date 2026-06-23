import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import ResilienceMarchesSim from "@/components/conseiller/ResilienceMarchesSim";
import type { ResilienceInputs } from "@/lib/resilience-marches";

export const metadata: Metadata = {
  title: "Résilience des marchés — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

// Lit Pipedrive à chaque ouverture (snapshot frais pour le pré-remplissage).
export const dynamic = "force-dynamic";

type FieldVal = { sim: string | number | null; dec: string | number | null };

/** Priorité Découverte RDV > Simulation (règle Lot 1). */
function pick(v?: FieldVal): string | number | null {
  if (!v) return null;
  if (v.dec != null && String(v.dec) !== "") return v.dec;
  if (v.sim != null && String(v.sim) !== "") return v.sim;
  return null;
}
function pickNum(v?: FieldVal): number {
  const raw = pick(v);
  if (raw == null) return 0;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/**
 * MODE CONNECTÉ (Lot 10) : ouvert depuis une fiche client. Graphique 3 pré-rempli
 * depuis les versements de la fiche (priorité Découverte > Simulation) + horizon
 * dérivé (âge retraite − âge courant), défaut 20. Graphes 1/2 historiques figés.
 * N'écrit JAMAIS dans Pipedrive.
 */
export default async function ResilienceMarchesConnectePage({
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

  let prefill: Partial<ResilienceInputs> = {};
  let code: string | null = null;
  try {
    const client = await getClientView(personId);
    const deal = client.deals[0]; // add_time DESC → le plus récent
    code = client.deals.find((d) => d.code)?.code ?? null;

    const anneeNaissance = pickNum(client.personFields.anneeNaissance);
    const ageRetraite = pickNum(client.personFields.ageRetraite);
    const ageCourant = anneeNaissance > 0 ? new Date().getFullYear() - anneeNaissance : 0;
    const horizon = ageRetraite > 0 && ageCourant > 0 ? ageRetraite - ageCourant : 0;

    prefill = {
      versementInitial: deal ? pickNum(deal.fields.versementInitial) : 0,
      versementMensuel: deal ? pickNum(deal.fields.versementMensuel) || 200 : 200,
      horizon: horizon > 0 ? horizon : 20,
    };
  } catch {
    return (
      <Shell personId={params.personId} message="Impossible de charger la fiche depuis Pipedrive." />
    );
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-cervus-gold/15 px-4 py-3 sm:px-6">
        <Link href={`/client/${personId}`} className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
          ← Fiche client
        </Link>
      </div>
      <ResilienceMarchesSim prefill={prefill} client={{ personId, code }} />
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
