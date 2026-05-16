import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Cervus Patrimoine",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Politique de confidentialité
        </h1>
        <p className="font-inter text-cervus-dark/60 text-base">
          {/* PLACEHOLDER — Politique de confidentialité à compléter (RGPD) */}
          La politique de confidentialité de Cervus Patrimoine sera publiée ici, conformément au RGPD.
        </p>
      </div>
    </div>
  );
}
