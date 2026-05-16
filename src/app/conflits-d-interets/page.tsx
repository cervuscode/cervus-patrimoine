import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conflits d'intérêts — Cervus Patrimoine",
};

export default function ConflitsInteretsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Conflits d&apos;intérêts
        </h1>
        <p className="font-inter text-cervus-dark/60 text-base">
          {/* PLACEHOLDER — Politique de gestion des conflits d'intérêts à compléter */}
          La politique de gestion des conflits d&apos;intérêts de Cervus Patrimoine sera publiée ici.
        </p>
      </div>
    </div>
  );
}
