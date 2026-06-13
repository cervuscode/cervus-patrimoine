import type { Metadata } from "next";
import Link from "next/link";
import SimulateurInteretsComposes from "./SimulateurInteretsComposes";

// NB : la page hérite du `noindex` global défini dans src/app/layout.tsx
// (site en pré-lancement). Aucune exception d'indexation ici — la structure SEO
// est prête pour la levée globale du noindex au lancement post-COA.
export const metadata: Metadata = {
  title: "Calcul intérêts composés — Simulateur gratuit | Cervus Patrimoine",
  description:
    "Simulateur de calcul des intérêts composés gratuit et instantané : capital initial, versements, taux, durée, inflation et fiscalité. Visualisez la croissance de votre épargne année après année.",
  alternates: { canonical: "/simulateur-interets-composes" },
};

// JSON-LD — WebApplication (l'outil) + FAQPage (questions pédagogiques).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Simulateur d'intérêts composés",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://cervuspatrimoine.fr/simulateur-interets-composes",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      provider: {
        "@type": "Organization",
        name: "Cervus Patrimoine",
        url: "https://cervuspatrimoine.fr",
      },
      description:
        "Calcul instantané des intérêts composés : capital, versements, taux, durée, inflation et fiscalité des gains.",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Qu'est-ce que les intérêts composés ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Les intérêts composés sont les intérêts calculés non seulement sur le capital de départ, mais aussi sur les intérêts déjà accumulés. Chaque période, les gains s'ajoutent au capital et produisent à leur tour des intérêts : l'épargne croît de façon exponentielle dans le temps.",
          },
        },
        {
          "@type": "Question",
          name: "Comment calculer les intérêts composés ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "La formule de base est Cn = C0 × (1 + t)^n, où C0 est le capital initial, t le taux par période et n le nombre de périodes. Avec des versements réguliers, on ajoute la valeur acquise d'une suite de versements capitalisés. Le simulateur effectue ce calcul automatiquement.",
          },
        },
        {
          "@type": "Question",
          name: "Pourquoi commencer à épargner tôt ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Plus l'horizon est long, plus l'effet boule de neige des intérêts composés est puissant : les intérêts produisent des intérêts. Quelques années d'avance peuvent représenter une différence majeure sur le capital final, même avec des montants modestes.",
          },
        },
      ],
    },
  ],
};

export default function SimulateurInteretsComposesPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 sm:py-20">
        {/* ── EN-TÊTE ───────────────────────────────────────────────────── */}
        <header className="max-w-3xl mb-10 sm:mb-12">
          <p className="font-inter text-xs uppercase tracking-[0.2em] text-[#795D48] mb-4">
            Simulateur gratuit
          </p>
          <h1 className="font-cormorant text-4xl sm:text-5xl font-light text-cervus-dark leading-tight">
            Calcul des intérêts composés
          </h1>
          <p className="font-inter text-cervus-dark/60 text-lg mt-5 leading-relaxed">
            Estimez en temps réel la croissance de votre épargne. Ajustez le
            capital, les versements, le taux et la durée : le résultat se met à
            jour instantanément. Aucune inscription, aucun e-mail demandé.
          </p>
        </header>

        {/* ── SIMULATEUR (interactif, client) ──────────────────────────── */}
        <SimulateurInteretsComposes />

        {/* ── CTA DE CONVERSION (juste sous le simulateur) ─────────────── */}
        <section className="mt-12 sm:mt-16">
          <div className="rounded-3xl bg-[#5D4738] text-white p-8 sm:p-10 flex flex-col items-start gap-5">
            <div>
              <h2 className="font-cormorant text-2xl sm:text-3xl font-light leading-snug">
                Et si vous optimisiez aussi votre fiscalité ?
              </h2>
              <p className="font-inter text-white/70 text-base mt-3 max-w-2xl leading-relaxed">
                Les intérêts composés font croître votre épargne — la fiscalité
                décide de ce qu&apos;il vous en reste. Découvrez combien un plan
                d&apos;épargne retraite pourrait réduire votre impôt, chiffres à
                l&apos;appui.
              </p>
            </div>
            <Link
              href="/simulateur-per"
              className="px-7 py-3.5 bg-cervus-bronze hover:bg-white text-[#5D4738] font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] transition-colors"
            >
              Simuler mon PER
            </Link>
            <Link
              href="/reserver"
              className="font-inter text-sm text-white/60 hover:text-white underline underline-offset-4 transition-colors"
            >
              ou prendre rendez-vous avec un conseiller
            </Link>
          </div>
        </section>

        {/* ── CONTENU ÉDITORIAL SEO ────────────────────────────────────── */}
        <article className="mt-16 sm:mt-20 max-w-3xl">
          <section className="mb-10">
            <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-4">
              Qu&apos;est-ce que les intérêts composés ?
            </h2>
            <p className="font-inter text-cervus-dark/70 leading-relaxed mb-4">
              Les intérêts composés désignent le mécanisme par lequel les
              intérêts générés par un placement sont réintégrés au capital, puis
              produisent à leur tour des intérêts. Contrairement aux intérêts
              simples — calculés uniquement sur la somme de départ — les intérêts
              composés s&apos;appliquent à un capital qui grossit à chaque
              période. Albert Einstein aurait qualifié ce phénomène de
              «&nbsp;huitième merveille du monde&nbsp;» : la formule est célèbre,
              mais l&apos;idée qu&apos;elle illustre est bien réelle. Le temps
              devient votre principal allié.
            </p>
            <p className="font-inter text-cervus-dark/70 leading-relaxed">
              Concrètement, un capital de 10&nbsp;000&nbsp;€ placé à 5&nbsp;%
              ne rapporte pas 500&nbsp;€ chaque année de façon linéaire&nbsp;:
              la deuxième année, les intérêts se calculent sur 10&nbsp;500&nbsp;€,
              la troisième sur 11&nbsp;025&nbsp;€, et ainsi de suite. La
              progression, d&apos;abord discrète, devient spectaculaire sur le
              long terme.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-4">
              Comment calculer les intérêts composés ?
            </h2>
            <p className="font-inter text-cervus-dark/70 leading-relaxed mb-4">
              La formule fondamentale est&nbsp;:
            </p>
            <p className="font-inter text-cervus-dark bg-cervus-bronze border border-[#E4DACE] rounded-2xl px-5 py-4 mb-4 text-center">
              C<sub>n</sub> = C<sub>0</sub> × (1 + t)<sup>n</sup>
            </p>
            <h3 className="font-cormorant text-xl text-cervus-dark mb-2">
              Les variables
            </h3>
            <ul className="font-inter text-cervus-dark/70 leading-relaxed mb-4 list-disc pl-5 space-y-1">
              <li>
                <strong>C<sub>0</sub></strong> : le capital initial investi.
              </li>
              <li>
                <strong>t</strong> : le taux de rendement par période (par an,
                par exemple).
              </li>
              <li>
                <strong>n</strong> : le nombre de périodes de capitalisation.
              </li>
            </ul>
            <p className="font-inter text-cervus-dark/70 leading-relaxed">
              Exemple&nbsp;: 10&nbsp;000&nbsp;€ à 5&nbsp;% pendant 10&nbsp;ans
              donnent 10&nbsp;000&nbsp;× (1,05)<sup>10</sup> ≈
              16&nbsp;289&nbsp;€, soit 6&nbsp;289&nbsp;€ d&apos;intérêts. Lorsque
              vous ajoutez des versements réguliers, le calcul intègre en plus la
              valeur acquise de chaque versement capitalisé jusqu&apos;au terme —
              c&apos;est précisément ce que fait le simulateur ci-dessus, mois
              par mois ou année par année.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-4">
              Pourquoi commencer tôt&nbsp;? L&apos;effet boule de neige
            </h2>
            <p className="font-inter text-cervus-dark/70 leading-relaxed mb-4">
              Le facteur le plus déterminant des intérêts composés n&apos;est ni
              le montant, ni le taux&nbsp;: c&apos;est la durée. Parce que la
              croissance est exponentielle, les dernières années pèsent bien plus
              lourd que les premières. Épargner 200&nbsp;€ par mois dès 25&nbsp;ans
              plutôt qu&apos;à 35&nbsp;ans peut, à rendement égal, aboutir à un
              capital sensiblement supérieur à l&apos;arrivée — la décennie
              d&apos;avance travaille pour vous sans effort supplémentaire.
            </p>
            <p className="font-inter text-cervus-dark/70 leading-relaxed">
              C&apos;est la raison pour laquelle la régularité prime souvent sur
              l&apos;ampleur des versements&nbsp;: un effort modeste mais constant,
              étalé sur une longue période, exploite pleinement l&apos;effet boule
              de neige. Le simulateur permet de visualiser cette dynamique en
              comparant la part des versements et celle des intérêts au fil du
              temps.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-4">
              Intérêts simples vs intérêts composés
            </h2>
            <p className="font-inter text-cervus-dark/70 leading-relaxed mb-4">
              Avec des <strong>intérêts simples</strong>, le rendement se calcule
              toujours sur le capital de départ&nbsp;: 10&nbsp;000&nbsp;€ à
              5&nbsp;% rapportent 500&nbsp;€ chaque année, soit 5&nbsp;000&nbsp;€
              sur 10&nbsp;ans (capital final&nbsp;: 15&nbsp;000&nbsp;€). Avec des{" "}
              <strong>intérêts composés</strong>, les gains se réinvestissent et
              produisent eux-mêmes des intérêts&nbsp;: le même placement atteint
              environ 16&nbsp;289&nbsp;€, soit 1&nbsp;289&nbsp;€ de plus, sans
              aucun versement additionnel.
            </p>
            <p className="font-inter text-cervus-dark/70 leading-relaxed">
              Cet écart se creuse avec le temps et le niveau de taux. Comprendre
              cette différence est essentiel pour arbitrer entre supports
              d&apos;épargne et pour mesurer l&apos;impact réel de la durée
              d&apos;un placement. Chez Cervus Patrimoine, conseil en gestion de
              patrimoine indépendant, nous privilégions une approche transparente
              et pédagogique&nbsp;: comprendre les mécanismes avant de décider.
            </p>
          </section>

          {/* Rappel mention */}
          <p className="font-inter text-[11px] leading-relaxed text-cervus-dark/45 border-t border-[#E4DACE] pt-6">
            Simulation pédagogique indicative — ne constitue pas un conseil en
            investissement. Les rendements sont hypothétiques et ne préjugent pas
            des performances futures.
          </p>
        </article>
      </div>
    </div>
  );
}
