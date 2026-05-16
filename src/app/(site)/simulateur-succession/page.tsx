import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur Succession — Cervus Patrimoine",
  description: "Anticipez la transmission de votre patrimoine avec le simulateur succession de Cervus Patrimoine.",
};

export default function SimulateurSuccessionPage() {
  return (
    <div className="pt-20 min-h-screen bg-cervus-cream">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
          Outil interactif
        </p>
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-4">
          Simulateur Succession
        </h1>
        <p className="font-inter text-cervus-dark/60 text-base leading-relaxed mb-10">
          Anticipez la transmission de votre patrimoine et estimez les droits de
          succession selon votre situation familiale et patrimoniale.
        </p>

        {/* PLACEHOLDER — Simulateur succession à développer */}
        <div className="bg-white border border-cervus-cream rounded-sm p-10">
          <p className="font-inter text-sm text-cervus-dark/40 text-center py-8">
            Le simulateur succession sera disponible prochainement.
          </p>
        </div>

        <p className="font-inter text-xs text-cervus-dark/40 leading-relaxed mt-6">
          Les résultats de cette simulation sont fournis à titre indicatif et ne
          constituent pas un conseil en investissement. Pour une analyse personnalisée
          de votre situation, contactez un conseiller agréé.
        </p>
      </div>
    </div>
  );
}
