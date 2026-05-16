import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur PER — Cervus Patrimoine",
  description: "Simulez votre Plan d'Épargne Retraite et estimez votre économie d'impôt avec Cervus Patrimoine.",
};

export default function SimulateurPERPage() {
  return (
    <div className="pt-20 min-h-screen bg-cervus-cream">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Simulateur PER
        </h1>
        <p className="font-inter text-cervus-dark/60 text-lg">
          {/* PLACEHOLDER — Contenu simulateur à venir */}
          Cette page accueillera le simulateur interactif Plan d&apos;Épargne Retraite.
        </p>
      </div>
    </div>
  );
}
