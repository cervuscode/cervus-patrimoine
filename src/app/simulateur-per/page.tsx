import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur PER — Cervus Patrimoine",
  description: "Simulez votre Plan d'Épargne Retraite et estimez votre économie d'impôt avec Cervus Patrimoine.",
};

const disclaimer =
  "Les résultats de cette simulation sont fournis à titre indicatif et ne constituent pas un conseil en investissement. Pour une analyse personnalisée de votre situation, contactez un conseiller agréé.";

export default function SimulateurPERPage() {
  return (
    <div className="pt-20 min-h-screen bg-cervus-cream">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
          Outil interactif
        </p>
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-4">
          Simulateur PER
        </h1>
        <p className="font-inter text-cervus-dark/60 text-base leading-relaxed mb-10">
          Estimez l&apos;économie d&apos;impôt générée par un versement sur votre
          Plan d&apos;Épargne Retraite selon votre tranche marginale d&apos;imposition.
        </p>

        {/* PLACEHOLDER — Formulaire simulateur à développer */}
        <div className="bg-white border border-cervus-cream rounded-sm p-10 flex flex-col gap-6">
          <p className="font-inter text-sm text-cervus-dark/40 text-center py-8">
            Le simulateur interactif sera intégré ici.
          </p>

          {/* Disclaimer — affiché à chaque étape du formulaire */}
          <div className="border-t border-cervus-cream pt-6">
            <p className="font-inter text-xs text-cervus-dark/40 leading-relaxed">
              {disclaimer}
            </p>
          </div>
        </div>

        {/* Disclaimer répété sous le formulaire */}
        <p className="font-inter text-xs text-cervus-dark/40 leading-relaxed mt-6">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
