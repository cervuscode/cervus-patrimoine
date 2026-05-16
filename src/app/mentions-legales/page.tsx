import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Cervus Patrimoine",
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

export default function MentionsLegalesPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
          Informations légales
        </p>
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-12">
          Mentions légales
        </h1>

        <Section title="Éditeur du site">
          <Row label="Nom" value="Auguste Dechery" />
          <Row label="Forme juridique" value="Entrepreneur Individuel" />
          <Row label="SIREN" value="944 972 553" />
          <Row label="Adresse" value="16 Passage de la Main d'Or, 75011 Paris" />
          <Row label="Email" value="auguste@cervuspatrimoine.fr" />
          <Row label="Directeur de publication" value="Auguste Dechery" />
        </Section>

        <Section title="Statut réglementaire">
          <Row label="Numéro ORIAS" value="25006770" />
          <Row label="Qualité" value="Mandataire d'Intermédiaire d'Assurance (MIA)" />
          <Row label="Validité" value="jusqu'au 28/02/2027" />
          <p className="mt-3 text-cervus-dark/50 text-xs">
            Registre consultable sur{" "}
            <span className="underline underline-offset-2">www.orias.fr</span>
          </p>
        </Section>

        <Section title="Assurance responsabilité civile professionnelle">
          <Row label="Assureur" value="Markel Insurance SE via Assurup" />
          <Row label="Numéro de contrat" value="RCP251230201745" />
          <Row label="Validité" value="jusqu'au 31/12/2026" />
        </Section>

        <Section title="Association professionnelle">
          <Row label="Organisme" value="CNCEF Assurance" />
          <Row label="Adresse" value="103 Boulevard Haussmann, 75008 Paris" />
        </Section>

        <Section title="Hébergement">
          <Row label="Hébergeur" value="Vercel Inc." />
          <Row label="Adresse" value="440 N Barranca Ave #4133, Covina, CA 91723, USA" />
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            L&apos;ensemble du contenu de ce site (textes, visuels, structure) est la
            propriété exclusive d&apos;Auguste Dechery — Cervus Patrimoine. Toute
            reproduction, même partielle, est interdite sans autorisation préalable
            et écrite.
          </p>
        </Section>

        <Section title="Limitation de responsabilité">
          <p>
            Les informations présentées sur ce site ont un caractère général et
            informatif. Elles ne constituent en aucun cas un conseil en investissement
            personnalisé. Cervus Patrimoine décline toute responsabilité quant à
            l&apos;utilisation qui pourrait être faite de ces informations.
          </p>
        </Section>
      </div>
    </div>
  );
}
