import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { decodePresentationParams } from "@/lib/presentation-bridge";
import PresentationSpace from "@/components/conseiller/PresentationSpace";

// Espace présentation unifié (Lot F), ouvert en _blank depuis la fiche. HORS du
// groupe (conseiller) → pas de panneau persistant, pas de session shell.
// noindex : metadata dédiée + header X-Robots-Tag du middleware + root layout.
export const metadata: Metadata = {
  title: "Présentation — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

/**
 * Charge l'identité + les hypothèses par défaut depuis les query params (encodés par
 * la fiche). Aucun accès Pipedrive : le client ne voit jamais de « dossier ».
 */
export default async function PresentationPage({
  searchParams,
}: {
  params: { personId: string };
  searchParams: Record<string, string | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const decoded = decodePresentationParams(searchParams);

  return (
    <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
      <PresentationSpace initial={decoded} />
    </div>
  );
}
