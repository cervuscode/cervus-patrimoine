import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qui sommes-nous — Cervus Patrimoine",
  description: "Découvrez l'équipe Cervus Patrimoine et notre approche indépendante du conseil patrimonial.",
};

export default function QuiSommesNousPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Qui sommes-nous
        </h1>
        <p className="font-inter text-cervus-dark/60 text-lg">
          {/* PLACEHOLDER — Présentation équipe et cabinet à venir */}
          Cette page présentera le cabinet et son fondateur Auguste Dechery.
        </p>
      </div>
    </div>
  );
}
