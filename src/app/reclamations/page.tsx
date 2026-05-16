import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réclamations — Cervus Patrimoine",
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-cervus-dark/40 shrink-0 sm:w-56">{label}</span>
      <span className="text-cervus-dark/80">{value}</span>
    </div>
  );
}

export default function ReclamationsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
          Service client
        </p>
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-12">
          Réclamations
        </h1>

        <Section title="Comment formuler une réclamation">
          <p>
            Cervus Patrimoine s&apos;engage à traiter toute réclamation avec sérieux
            et diligence. Si vous souhaitez formuler une réclamation relative à nos
            services, vous pouvez nous contacter par email en décrivant précisément
            l&apos;objet de votre demande.
          </p>
          <Row label="Email dédié" value="reclamations@cervuspatrimoine.fr" />
        </Section>

        <Section title="Délais de traitement">
          <Row label="Accusé de réception" value="10 jours ouvrables maximum" />
          <Row label="Réponse définitive" value="2 mois maximum après réception" />
          <p className="mt-3 text-cervus-dark/50 text-xs">
            En cas de situation complexe nécessitant un délai supplémentaire,
            vous en serez informé par écrit dans ce même délai de 2 mois.
          </p>
        </Section>

        <Section title="Médiation">
          <p>
            Si la réponse apportée à votre réclamation ne vous satisfait pas, ou
            en l&apos;absence de réponse dans les délais indiqués, vous avez la
            possibilité de saisir un médiateur.
          </p>
          <p className="mt-3 bg-cervus-cream/60 border border-cervus-cream rounded-sm px-5 py-4 text-cervus-dark/60">
            <strong className="font-medium text-cervus-dark/70">
              Médiateur désigné :
            </strong>{" "}
            en cours de désignation. Cette information sera mise à jour dès que le
            médiateur compétent aura été formellement désigné.
          </p>
        </Section>

        <Section title="Autorité de contrôle">
          <p>
            Cervus Patrimoine est enregistré à l&apos;ORIAS sous le n° 25006770 en
            qualité de Mandataire d&apos;Intermédiaire d&apos;Assurance (MIA) et est
            membre de la CNCEF Assurance.
          </p>
          <p className="mt-2">
            Toute contestation relative à son activité réglementée peut être portée
            à la connaissance de l&apos;Autorité de Contrôle Prudentiel et de
            Résolution (ACPR).
          </p>
        </Section>
      </div>
    </div>
  );
}
