import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Services — Cervus Patrimoine",
  description: "PER, assurance-vie, PEA, stratégie patrimoniale. Découvrez l'ensemble des services Cervus Patrimoine.",
};

export default function ServicesPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Nos Services
        </h1>
        <p className="font-inter text-cervus-dark/60 text-lg">
          {/* PLACEHOLDER — Contenu services à venir */}
          Cette page présentera en détail l&apos;ensemble de nos services patrimoniaux.
        </p>
      </div>
    </div>
  );
}
