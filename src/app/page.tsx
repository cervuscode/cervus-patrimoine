import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cervus Patrimoine — Cabinet de gestion de patrimoine haut de gamme",
  description:
    "Cervus Patrimoine, cabinet indépendant de conseil en gestion de patrimoine. Stratégies personnalisées : PER, assurance-vie, succession. Prenez rendez-vous.",
};

// ─── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen bg-cervus-dark flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#795D48_0%,_transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="max-w-3xl">
          <p className="font-inter text-xs text-cervus-gold-light uppercase tracking-[0.3em] mb-8">
            Cabinet de Gestion de Patrimoine
          </p>

          <h1 className="font-cormorant text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[1.05] mb-8">
            Une gestion transparente{" "}
            <span className="text-cervus-gold-light italic">de votre patrimoine</span>
          </h1>

          <p className="font-inter text-lg text-white/50 leading-relaxed max-w-xl mb-12">
            Cervus Patrimoine vous accompagne avec une approche indépendante et
            personnalisée pour construire, protéger et transmettre votre capital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/simulateur-per"
              className="inline-flex items-center justify-center px-8 py-4 bg-cervus-gold text-white font-inter text-sm font-medium tracking-wide rounded hover:bg-cervus-gold-light transition-colors duration-200"
            >
              Simuler mon PER
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white/80 font-inter text-sm font-medium tracking-wide rounded hover:border-cervus-gold-light hover:text-cervus-gold-light transition-colors duration-200"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>

        <div className="absolute bottom-16 right-8 lg:right-16 hidden lg:flex flex-col items-center gap-3 opacity-30">
          <div className="w-px h-16 bg-cervus-gold" />
          <span className="font-inter text-[10px] text-white tracking-[0.25em] rotate-90 origin-center translate-x-8">
            SCROLL
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Services Section ──────────────────────────────────────────────────────────
const services = [
  {
    title: "PER & Retraite",
    description:
      "Optimisez votre fiscalité aujourd'hui tout en préparant votre retraite de demain.",
    tag: "Défiscalisation",
    href: "/services#per",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="11" stroke="#795D48" strokeWidth="1.5" />
        <path d="M14 7v7l4 3" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Assurance-vie",
    description:
      "Faites fructifier votre capital dans une enveloppe souple, fiscalement avantageuse.",
    tag: "Capitalisation",
    href: "/services#assurance-vie",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 5C14 5 5 9.5 5 17a9 9 0 0 0 18 0C23 9.5 14 5 14 5Z"
          stroke="#795D48"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M14 12v5M11.5 14.5h5" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Succession",
    description:
      "Anticipez la transmission de votre patrimoine pour protéger vos proches.",
    tag: "Transmission",
    href: "/simulateur-succession",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="4.5" stroke="#795D48" strokeWidth="1.5" />
        <circle cx="20" cy="19" r="4.5" stroke="#795D48" strokeWidth="1.5" />
        <path d="M14 10h3a3 3 0 0 1 3 3v2" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function ServicesSection() {
  return (
    <section className="py-28 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
            Ce que nous faisons
          </p>
          <h2 className="font-cormorant text-5xl lg:text-6xl font-light text-cervus-dark">
            Des solutions patrimoniales{" "}
            <span className="italic text-cervus-gold">sur mesure</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group relative p-8 border border-cervus-cream rounded-sm hover:border-cervus-gold/40 transition-colors duration-300 flex flex-col gap-6 bg-white"
            >
              <span className="inline-block self-start font-inter text-[10px] text-cervus-gold uppercase tracking-[0.2em] bg-cervus-cream px-3 py-1 rounded-full">
                {service.tag}
              </span>

              <div className="w-12 h-12 flex items-center justify-center border border-cervus-cream rounded-sm group-hover:border-cervus-gold/40 transition-colors">
                {service.icon}
              </div>

              <div>
                <h3 className="font-cormorant text-2xl font-semibold text-cervus-dark mb-3">
                  {service.title}
                </h3>
                <p className="font-inter text-sm text-cervus-dark/60 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 font-inter text-xs text-cervus-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span>En savoir plus</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="#795D48"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-inter text-sm text-cervus-gold hover:text-cervus-gold-light transition-colors"
          >
            Voir tous nos services
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Simulateur Preview Section ────────────────────────────────────────────────
function SimulateurPreviewSection() {
  return (
    <section className="py-28 bg-cervus-dark" id="simulateur">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-inter text-xs text-cervus-gold-light uppercase tracking-[0.3em] mb-6">
              Outil interactif
            </p>
            <h2 className="font-cormorant text-5xl lg:text-6xl font-light text-white leading-tight mb-8">
              Combien pouvez-vous économiser{" "}
              <span className="italic text-cervus-gold-light">avec un PER ?</span>
            </h2>
            <p className="font-inter text-base text-white/50 leading-relaxed mb-10">
              Notre simulateur calcule en temps réel l&apos;économie d&apos;impôt
              générée par votre versement PER, selon votre tranche marginale
              d&apos;imposition.
            </p>
            <Link
              href="/simulateur-per"
              className="inline-flex items-center gap-3 px-8 py-4 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors duration-200"
            >
              Accéder au simulateur
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <div className="relative">
            <div className="border border-white/10 rounded-sm p-8 bg-white/5">
              <p className="font-inter text-xs text-white/30 uppercase tracking-widest mb-6">
                Aperçu simulateur
              </p>

              <div className="flex flex-col gap-4">
                {[
                  { label: "Revenu annuel imposable", placeholder: "Ex : 80 000 €" },
                  { label: "Versement PER envisagé", placeholder: "Ex : 10 000 €" },
                  { label: "Tranche marginale d'imposition", placeholder: "30 %" },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1.5">
                    <label className="font-inter text-xs text-white/40">{field.label}</label>
                    <div className="h-11 border border-white/10 rounded-sm bg-white/5 flex items-center px-4">
                      <span className="font-inter text-sm text-white/20">{field.placeholder}</span>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-6 bg-cervus-gold/10 border border-cervus-gold/20 rounded-sm">
                  <p className="font-inter text-xs text-cervus-gold-light uppercase tracking-widest mb-2">
                    Économie d&apos;impôt estimée
                  </p>
                  <p className="font-cormorant text-4xl text-white font-light">— — —</p>
                  <p className="font-inter text-xs text-white/30 mt-2">
                    Renseignez vos données pour obtenir votre estimation
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-cervus-gold/20 rounded-sm -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Team Section ──────────────────────────────────────────────────────────────
function TeamSection() {
  return (
    <section className="py-28 bg-cervus-cream" id="equipe">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
            Notre équipe
          </p>
          <h2 className="font-cormorant text-5xl lg:text-6xl font-light text-cervus-dark">
            Un accompagnement{" "}
            <span className="italic text-cervus-gold">humain et expert</span>
          </h2>
        </div>

        <div className="max-w-2xl">
          <div className="bg-white border border-cervus-cream rounded-sm p-10 flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo placeholder */}
            <div className="w-24 h-24 shrink-0 rounded-sm bg-cervus-cream border border-cervus-gold/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="12" r="6" stroke="#795D48" strokeWidth="1.5" />
                <path
                  d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12"
                  stroke="#795D48"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-cormorant text-2xl font-semibold text-cervus-dark">
                  Auguste Dechery
                </h3>
                <p className="font-inter text-sm text-cervus-gold mt-0.5">
                  Fondateur & Conseiller en Gestion de Patrimoine
                </p>
              </div>

              <p className="font-inter text-sm text-cervus-dark/60 leading-relaxed">
                Fort d&apos;une expérience acquise en banque privée et en cabinet de
                gestion de patrimoine indépendant, Auguste Dechery accompagne ses clients
                avec rigueur et transparence dans la construction et l&apos;optimisation
                de leur stratégie patrimoniale.
              </p>

              <Link
                href="/qui-sommes-nous"
                className="inline-flex items-center gap-2 font-inter text-xs text-cervus-gold hover:text-cervus-gold-light transition-colors mt-2"
              >
                En savoir plus
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ───────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section className="py-28 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-inter text-xs text-cervus-gold uppercase tracking-[0.3em] mb-4">
            Contact
          </p>
          <h2 className="font-cormorant text-5xl font-light text-cervus-dark mb-8">
            Parlons de{" "}
            <span className="italic text-cervus-gold">votre projet</span>
          </h2>
          <p className="font-inter text-base text-cervus-dark/60 leading-relaxed mb-10">
            Chaque situation patrimoniale est unique. Prenez rendez-vous pour un
            premier entretien confidentiel et sans engagement.
          </p>

          {/* PLACEHOLDER — Formulaire ou lien Calendly */}
          <div className="border border-dashed border-cervus-gold/30 rounded-sm p-8 bg-cervus-cream/50">
            <p className="font-inter text-sm text-cervus-dark/40 text-center">
              Formulaire de prise de rendez-vous à intégrer ici
              <br />
              <span className="text-xs">(Calendly, formulaire natif ou autre solution)</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <SimulateurPreviewSection />
      <TeamSection />
      <ContactSection />
    </>
  );
}
