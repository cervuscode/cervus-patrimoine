import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { resolveClientContext, pickNum, pickStr } from "@/lib/compte-rendu-context";
import { computeAvailability } from "@/lib/compte-rendu";
import { normalizeStatutLabel } from "@/lib/impot-sim";
import { normalizeAvProfil } from "@/lib/av-sim";
import CompteRenduComposer, {
  type ComposerDefaults,
} from "@/components/conseiller/CompteRenduComposer";
import type { PerProfil } from "@/lib/per-quick";

export const metadata: Metadata = {
  title: "Compte-rendu de RDV — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

/** Normalise un libellé profil libre vers les 3 profils PER (défaut équilibré). */
function normalizePerProfil(raw?: string): PerProfil {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("prudent")) return "prudent";
  if (s.includes("dynam")) return "dynamique";
  return "equilibre";
}

export default async function CompteRenduPage({ params }: { params: { personId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personId = Number(params.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    return <Shell personId={params.personId} message="Identifiant client invalide." />;
  }

  let composerProps: {
    code: string | null;
    available: ReturnType<typeof computeAvailability>;
    defaults: ComposerDefaults;
  };
  try {
    const { ctx, client } = await resolveClientContext(personId);
    const deal = client.deals[0];

    const fs = ctx.fiscalState;
    const dealVersementMensuel = deal ? pickNum(deal.fields.versementMensuel) ?? 0 : 0;
    const dealVersementInitial = deal ? pickNum(deal.fields.versementInitial) ?? 0 : 0;
    const dealProfil = deal ? pickStr(deal.fields.profil) : undefined;

    // Horizon = âge retraite − âge courant (défaut 20 ans si indisponible).
    const ageRetraite = pickNum(client.personFields.ageRetraite);
    const ageCourant = 2026 - ctx.anneeNaissance;
    const horizon =
      ageRetraite && ageRetraite > ageCourant ? ageRetraite - ageCourant : 20;

    const defaults: ComposerDefaults = {
      perVersementMensuel: dealVersementMensuel,
      perVersementInitial: dealVersementInitial,
      horizon,
      profil: normalizePerProfil(dealProfil),
      trancheSortie: fs.tmi,
      avVersementMensuel: dealVersementMensuel,
      avVersementInitial: dealVersementInitial,
      avDuree: 15,
      avProfil: normalizeAvProfil(dealProfil),
      marie: fs.partsBase === 2,
      effortNetMensuel: dealVersementMensuel,
      reductionRevenu: fs.revenuNetImposable,
      reductionStatut: normalizeStatutLabel(pickStr(client.personFields.statutMarital)) ||
        "Célibataire",
      reductionNbEnfants: ctx.nbEnfants,
      reductionVersement: dealVersementInitial,
    };

    composerProps = { code: ctx.code, available: computeAvailability(ctx), defaults };
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
      <CompteRenduComposer
        personId={personId}
        code={composerProps.code}
        available={composerProps.available}
        defaults={composerProps.defaults}
      />
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
