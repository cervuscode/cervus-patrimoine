import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import ReferenceFiscale from "@/components/conseiller/ReferenceFiscale";

export const metadata: Metadata = {
  title: "Référence fiscale 2026 — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

/**
 * Tableau de référence fiscal (Lot G). Accessible SANS client ouvert. Aucun accès
 * Pipedrive, aucune écriture, consultation pure de données de contrôle interne.
 */
export default async function ReferenceFiscalePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen">
      <div className="border-b border-cervus-gold/15 px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
          ← Accueil
        </Link>
      </div>
      <ReferenceFiscale />
    </main>
  );
}
