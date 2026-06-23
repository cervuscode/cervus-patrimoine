import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import PyramideEpargneSim from "@/components/conseiller/PyramideEpargneSim";
import type { PyramideInputs } from "@/lib/pyramide-epargne";

export const metadata: Metadata = {
  title: "Pyramide de l'épargne — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

// Lit Pipedrive à chaque ouverture (snapshot frais pour le pré-remplissage).
export const dynamic = "force-dynamic";

type FieldVal = { sim: string | number | null; dec: string | number | null };

/** Priorité Découverte RDV > Simulation (règle Lot 1). Patrimoine = Découverte-only. */
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
 * MODE CONNECTÉ (Lot 9) : ouvert depuis une fiche client. Encours PRÉ-REMPLIS depuis
 * le patrimoine financier de la fiche (champs Découverte). Tout reste éditable
 * (scénarios « et si… »). N'écrit JAMAIS dans Pipedrive.
 */
export default async function PyramideEpargneConnectePage({
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

  let prefill: Partial<PyramideInputs> = {};
  let code: string | null = null;
  try {
    const client = await getClientView(personId);
    code = client.deals.find((d) => d.code)?.code ?? null;
    const pf = client.personFields;
    prefill = {
      livretsReglementes: pickNum(pf.livretsReglementes),
      livretsBoostes: pickNum(pf.livretsBoostes),
      autreEpargne: pickNum(pf.autreEpargne),
      encoursFondsEuros: pickNum(pf.encoursFondsEuros),
      encoursAv: pickNum(pf.encoursAv),
      encoursPea: pickNum(pf.encoursPea),
      encoursPer: pickNum(pf.encoursPer),
      cto: pickNum(pf.cto),
      crypto: pickNum(pf.crypto),
      capaciteEpargneMensuelle: pickNum(pf.capaciteEpargneMensuelle),
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
      <PyramideEpargneSim prefill={prefill} client={{ personId, code }} />
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
