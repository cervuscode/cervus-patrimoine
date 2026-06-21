import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import PerFullSim from "@/components/conseiller/PerFullSim";
import type { PerSortieInputs } from "@/lib/per-sortie";
import type { PerProfil } from "@/lib/per-quick";
import { computeFiscalState } from "@/lib/fiscal-state";

export const metadata: Metadata = {
  title: "Simulateur PER complet — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

type FieldVal = { sim: string | number | null; dec: string | number | null };

/** Priorité Découverte RDV > Simulation (règle Lot 1). */
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
function pickProfil(v?: FieldVal): PerProfil | undefined {
  const raw = pick(v);
  if (raw == null) return undefined;
  const s = String(raw).toLowerCase();
  if (s.includes("prudent")) return "prudent";
  if (s.includes("dynam")) return "dynamique";
  if (s.includes("équil") || s.includes("equil")) return "equilibre";
  return undefined;
}

/**
 * MODE CONNECTÉ (Lot 5) : ouvert depuis une fiche client. Mêmes champs, pré-remplis
 * priorité Découverte RDV > Simulation. Code client en évidence. Le simulateur
 * calcule seulement — il n'écrit JAMAIS dans Pipedrive.
 */
export default async function SimulateurPerCompletConnectePage({
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

  let prefill: Partial<PerSortieInputs> = {};
  let code: string | null = null;
  try {
    const client = await getClientView(personId);
    const deal = client.deals[0];
    code = client.deals.find((d) => d.code)?.code ?? null;

    // État fiscal partagé (Lot 2) : calculé UNE FOIS via le même helper que le contexte.
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

    const anneeNaissance = pickNum(client.personFields.anneeNaissance);
    const ageRetraite = pickNum(client.personFields.ageRetraite);
    const horizon =
      anneeNaissance && ageRetraite
        ? ageRetraite - (new Date().getFullYear() - anneeNaissance)
        : undefined;

    const raw: Partial<PerSortieInputs> = {
      // Revenu/parts depuis l'état fiscal partagé (cohérence panneau/présentation).
      revenuImposable: fiscal.revenuNetImposable > 0 ? fiscal.revenuNetImposable : undefined,
      parts: fiscal.partsTotal,
      anneeNaissance,
      versementMensuel: deal ? pickNum(deal.fields.versementMensuel) : undefined,
      versementInitial: deal ? pickNum(deal.fields.versementInitial) : undefined,
      horizon: horizon && horizon > 0 ? horizon : undefined,
      profil: deal ? pickProfil(deal.fields.profil) : undefined,
      // Tranche de sortie par défaut = TMI partagée (Lot 2).
      trancheSortie: fiscal.revenuNetImposable > 0 ? fiscal.tmi : undefined,
    };
    prefill = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
    ) as Partial<PerSortieInputs>;
  } catch {
    return <Shell personId={params.personId} message="Impossible de charger la fiche depuis Pipedrive." />;
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-cervus-gold/15 px-4 py-3 sm:px-6">
        <Link href={`/client/${personId}`} className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
          ← Fiche client
        </Link>
      </div>
      <PerFullSim prefill={prefill} client={{ personId, code }} />
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
