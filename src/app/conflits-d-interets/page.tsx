import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conflits d'intérêts — Cervus Patrimoine",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-cervus-cream pt-8 mt-8 first:border-t-0 first:pt-0 first:mt-0">
      <h2 className="font-cormorant text-2xl font-semibold text-cervus-dark mb-4">{title}</h2>
      <div className="font-inter text-sm text-cervus-dark/70 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function ConflitsInteretsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
          Transparence
        </p>
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-12">
          Gestion des conflits d&apos;intérêts
        </h1>

        <Section title="Nature des rémunérations">
          <p>
            Dans le cadre de son activité de mandataire d&apos;intermédiaire
            d&apos;assurance, Auguste Dechery — Cervus Patrimoine perçoit des
            rémunérations sous forme de{" "}
            <strong className="font-medium text-cervus-dark/80">
              commissions versées par les assureurs et producteurs de produits financiers
            </strong>{" "}
            avec lesquels il travaille.
          </p>
          <p>
            Ces commissions sont versées lors de la souscription ou du versement sur
            les produits distribués (contrats d&apos;assurance-vie, PER, etc.) et
            peuvent également prendre la forme de commissions récurrentes sur
            l&apos;encours géré.
          </p>
        </Section>

        <Section title="Indépendance du conseil">
          <p>
            Cervus Patrimoine s&apos;engage à ce que cette rémunération
            n&apos;affecte pas la qualité et l&apos;objectivité du conseil prodigué.
            Le choix des solutions préconisées repose exclusivement sur l&apos;analyse
            de la situation patrimoniale du client, de ses objectifs et de son profil
            de risque.
          </p>
          <p>
            Lorsqu&apos;un conflit d&apos;intérêts potentiel est identifié, il est
            systématiquement porté à la connaissance du client avant toute
            recommandation.
          </p>
        </Section>

        <Section title="Liste des mandants">
          <p>
            La liste des compagnies d&apos;assurance et producteurs de produits
            financiers avec lesquels Cervus Patrimoine a conclu un mandat est
            disponible sur simple demande.
          </p>
          <p className="mt-3">
            Pour en faire la demande :{" "}
            <strong className="font-medium text-cervus-dark/80">
              auguste@cervuspatrimoine.fr
            </strong>
          </p>
        </Section>

        <Section title="Cadre réglementaire">
          <p>
            Cette politique de gestion des conflits d&apos;intérêts s&apos;inscrit
            dans le respect des obligations issues de la directive sur la distribution
            d&apos;assurances (DDA), transposée en droit français, et des règles
            édictées par l&apos;Autorité de Contrôle Prudentiel et de Résolution
            (ACPR).
          </p>
        </Section>
      </div>
    </div>
  );
}
