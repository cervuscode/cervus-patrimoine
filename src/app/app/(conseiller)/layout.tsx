import type { Metadata } from "next";

// noindex en défense en profondeur (le root layout l'impose déjà globalement,
// + header X-Robots-Tag posé par le middleware sur l'hôte app).
export const metadata: Metadata = {
  title: "Espace Conseiller — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export default function ConseillerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
      {children}
    </div>
  );
}
