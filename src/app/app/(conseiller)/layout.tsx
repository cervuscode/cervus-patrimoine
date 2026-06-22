import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RdvClientProvider } from "@/components/conseiller/RdvClientProvider";
import ConseillerSessionShell from "@/components/conseiller/ConseillerSessionShell";

// noindex en défense en profondeur (le root layout l'impose déjà globalement,
// + header X-Robots-Tag posé par le middleware sur l'hôte app).
export const metadata: Metadata = {
  title: "Espace Conseiller — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export default async function ConseillerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Contexte monté UNIQUEMENT pour une session valide : la page /login
  // (non authentifiée) ne doit jamais hydrater le contexte client.
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
      {session ? (
        <ConseillerSessionShell>
          <RdvClientProvider>{children}</RdvClientProvider>
        </ConseillerSessionShell>
      ) : (
        children
      )}
    </div>
  );
}
