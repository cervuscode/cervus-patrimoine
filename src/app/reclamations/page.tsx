import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réclamations — Cervus Patrimoine",
};

export default function ReclamationsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Réclamations
        </h1>
        <p className="font-inter text-cervus-dark/60 text-base">
          {/* PLACEHOLDER — Procédure de réclamation à compléter */}
          La procédure de traitement des réclamations sera publiée ici, conformément aux exigences réglementaires.
        </p>
      </div>
    </div>
  );
}
