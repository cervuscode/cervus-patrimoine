import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Cervus Patrimoine",
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

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24">
        <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
          RGPD
        </p>
        <h1 className="font-cormorant text-5xl font-light text-cervus-dark mb-2">
          Politique de confidentialité
        </h1>
        <p className="font-inter text-sm text-cervus-dark/40 mb-12">
          Dernière mise à jour : mai 2026
        </p>

        <Section title="Responsable du traitement">
          <Row label="Nom" value="Auguste Dechery" />
          <Row label="Adresse" value="16 Passage de la Main d'Or, 75011 Paris" />
          <Row label="Email" value="demandeRGPD@cervuspatrimoine.fr" />
        </Section>

        <Section title="Données collectées">
          <p>
            Dans le cadre de l&apos;utilisation du site et de nos outils, nous sommes
            amenés à collecter les données personnelles suivantes :
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-cervus-dark/70">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Revenus annuels imposables</li>
            <li>Tranche marginale d&apos;imposition (TMI)</li>
            <li>Versement PER envisagé</li>
          </ul>
        </Section>

        <Section title="Finalités du traitement">
          <ul className="list-disc list-inside space-y-1 text-cervus-dark/70">
            <li>Réalisation de simulations PER</li>
            <li>Prise de contact et suivi de votre demande</li>
            <li>Envoi de documentation patrimoniale</li>
          </ul>
        </Section>

        <Section title="Base légale">
          <p>
            Le traitement de vos données repose sur votre{" "}
            <strong className="font-medium text-cervus-dark/80">consentement explicite</strong>,
            recueilli au moment de la saisie du formulaire ou du simulateur.
          </p>
        </Section>

        <Section title="Durée de conservation">
          <p>
            Vos données sont conservées pendant une durée de{" "}
            <strong className="font-medium text-cervus-dark/80">2 ans</strong> à compter
            de votre dernier contact avec Cervus Patrimoine, puis supprimées ou archivées
            conformément aux obligations légales.
          </p>
        </Section>

        <Section title="Destinataires et transferts hors UE">
          <p className="mb-3">
            Vos données peuvent être transmises aux sous-traitants suivants, dans le
            cadre strict des finalités décrites ci-dessus :
          </p>
          <Row label="Brevo" value="Envoi d'emails — serveurs UE" />
          <Row label="Twilio" value="Communication — serveurs USA" />
          <Row label="Vercel Inc." value="Hébergement — serveurs USA" />
          <p className="mt-3 text-cervus-dark/50 text-xs">
            Des transferts hors Union Européenne peuvent avoir lieu vers des pays
            ne disposant pas d&apos;un niveau de protection adéquat reconnu par la
            Commission européenne. Ces transferts sont encadrés par des clauses
            contractuelles types approuvées par la Commission européenne.
          </p>
        </Section>

        <Section title="Vos droits">
          <p className="mb-3">
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="list-disc list-inside space-y-1 text-cervus-dark/70">
            <li>Droit d&apos;accès</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement</li>
            <li>Droit d&apos;opposition</li>
          </ul>
          <p className="mt-4">
            Pour exercer vos droits, adressez votre demande à :{" "}
            <strong className="font-medium text-cervus-dark/80">
              demandeRGPD@cervuspatrimoine.fr
            </strong>
          </p>
        </Section>

        <Section title="Réclamation auprès de la CNIL">
          <p>
            Si vous estimez que le traitement de vos données personnelles n&apos;est
            pas conforme à la réglementation, vous avez le droit d&apos;introduire une
            réclamation auprès de la Commission Nationale de l&apos;Informatique et
            des Libertés (CNIL) sur{" "}
            <span className="underline underline-offset-2">www.cnil.fr</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}
