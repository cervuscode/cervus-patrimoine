import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Cervus Patrimoine",
};

export default function MentionsLegalesPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-6">
          Mentions légales
        </h1>
        <p className="font-inter text-cervus-dark/60 text-base">
          {/* PLACEHOLDER — Mentions légales à compléter */}
          Les mentions légales de Cervus Patrimoine seront publiées ici.
        </p>
      </div>
    </div>
  );
}
