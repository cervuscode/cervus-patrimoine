import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RdvClientProvider } from "@/components/conseiller/RdvClientProvider";
import PersistentPanel from "@/components/conseiller/PersistentPanel";

// noindex en défense en profondeur (le root layout l'impose déjà globalement,
// + header X-Robots-Tag posé par le middleware sur l'hôte app).
export const metadata: Metadata = {
  title: "Espace Conseiller — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export default async function ConseillerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Contexte + panneau persistant montés UNIQUEMENT pour une session valide :
  // la page /login (non authentifiée) ne doit jamais afficher le panneau.
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
      {session ? (
        <RdvClientProvider>
          {children}
          <PersistentPanel />
        </RdvClientProvider>
      ) : (
        children
      )}
    </div>
  );
}
