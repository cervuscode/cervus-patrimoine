import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { decodePerInputs } from "@/lib/per-quick";
import PerPresentation from "@/components/conseiller/PerPresentation";

// Onglet de présentation (ouvert en _blank depuis le mode connecté). HORS du groupe
// (conseiller) → pas de panneau persistant, pas de session shell : surface épurée.
// noindex : metadata dédiée + header X-Robots-Tag du middleware + root layout.
export const metadata: Metadata = {
  title: "Présentation — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

/**
 * MODE PRÉSENTATION (Lot 2, point D). Entrées passées en query params (encodées par
 * `encodePerInputs`), recalcul via le MÊME helper pur `computePerQuick`. Aucun accès
 * Pipedrive : on ne charge pas la fiche, le client ne voit jamais de « dossier ».
 */
export default async function PresentationPerPage({
  searchParams,
}: {
  params: { personId: string };
  searchParams: Record<string, string | undefined>;
}) {
  // Même barrière d'auth que tout l'espace conseiller.
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const inputs = decodePerInputs(searchParams);
  const clientCode = searchParams.cc ?? null;

  return (
    <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
      <PerPresentation initialInputs={inputs} clientCode={clientCode} />
    </div>
  );
}
