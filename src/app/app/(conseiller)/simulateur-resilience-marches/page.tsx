import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import ResilienceMarchesSim from "@/components/conseiller/ResilienceMarchesSim";

// noindex : metadata dédiée + header X-Robots-Tag du middleware + root layout.
export const metadata: Metadata = {
  title: "Résilience des marchés — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

/**
 * MODE AUTONOME (Lot 10) : ouvert depuis l'accueil, sans client. Aucun accès
 * Pipedrive, aucune écriture. Statique.
 */
export default async function ResilienceMarchesAutonomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen">
      <div className="border-b border-cervus-gold/15 px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
          ← Accueil
        </Link>
      </div>
      <ResilienceMarchesSim />
    </main>
  );
}
