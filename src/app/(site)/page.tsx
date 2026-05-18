import Link from "next/link";
import type { Metadata } from "next";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata: Metadata = {
  title: "Cervus Patrimoine — Cabinet de gestion de patrimoine haut de gamme",
  description:
    "Cervus Patrimoine, cabinet indépendant de conseil en gestion de patrimoine. Stratégies personnalisées : PER, assurance-vie, succession. Prenez rendez-vous.",
};

// ─── SECTION 1 — HERO ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#0f0f0f]" style={{ zIndex: -1 }} aria-hidden="true" />
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="max-w-3xl">
          <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.15em] mb-8">
            Cabinet de Gestion de Patrimoine Indépendant
          </p>
          <h1 className="font-cormorant text-5xl sm:text-6xl lg:text-[5rem] font-light text-white leading-[1.05] mb-8">
            Une gestion transparente de votre patrimoine
          </h1>
          <p className="font-inter text-[1.1rem] text-white/80 leading-relaxed max-w-xl mb-12">
            Cervus Patrimoine vous accompagne avec une approche indépendante et
            personnalisée pour construire, protéger et transmettre votre capital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/simulateur-per"
              className="inline-flex items-center justify-center px-[28px] py-[12px] bg-[#795D48] text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
            >
              Simuler mon PER
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-[28px] py-[12px] border-[1.5px] border-white/40 text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:border-white hover:bg-white/10 transition-colors duration-200"
            >
              Prendre RDV
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50" style={{ zIndex: 20 }}>
        <span className="font-inter text-[9px] text-white tracking-[0.25em] uppercase">Scroll</span>
        <svg width="14" height="24" viewBox="0 0 14 24" fill="none" className="animate-bounce">
          <rect x="1" y="1" width="12" height="22" rx="6" stroke="white" strokeWidth="1.5" />
          <rect x="5.5" y="5" width="3" height="5" rx="1.5" fill="white" />
        </svg>
      </div>
      {/* Fondu bas → section stats */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 140, background: "linear-gradient(to bottom, transparent, #F2EDE8)", zIndex: 15 }}
        aria-hidden="true"
      />
    </section>
  );
}

// ─── SECTION 2 — STATS ─────────────────────────────────────────────────────────
const stats = [
  { headline: "Indépendant", sub: "Aucun conflit d'intérêts, aucun produit maison" },
  { headline: "ORIAS 25006770", sub: "Mandataire d'intermédiaire en assurance certifié" },
  { headline: "RCP assurée", sub: "Responsabilité civile professionnelle Markel / Assurup" },
];

function StatsSection() {
  return (
    <section className="py-20" style={{ backgroundColor: "#F2EDE8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#D4C9BE]/60">
          {stats.map((s, i) => (
            <AnimatedSection
              key={s.headline}
              delay={i * 0.1}
              className="px-8 py-8 md:py-4 first:pl-0 last:pr-0 text-center md:text-left"
            >
              <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f] mb-2">{s.headline}</p>
              <p className="font-inter text-sm text-[#0f0f0f]/55 leading-relaxed">{s.sub}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 3 — SERVICES ──────────────────────────────────────────────────────
const services = [
  {
    title: "PER & Retraite",
    description: "Optimisez votre fiscalité aujourd'hui tout en préparant votre retraite de demain.",
    cta: "Simuler",
    href: "/simulateur-per",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="#795D48" strokeWidth="1.5" />
        <path d="M14 7v7l4 3" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Assurance-vie",
    description: "Faites fructifier votre capital dans une enveloppe souple et fiscalement avantageuse.",
    cta: "En savoir plus",
    href: "/services",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 5C14 5 5 9.5 5 17a9 9 0 0 0 18 0C23 9.5 14 5 14 5Z" stroke="#795D48" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 12v5M11.5 14.5h5" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Transmission & Succession",
    description: "Anticipez la transmission de votre patrimoine pour protéger vos proches.",
    cta: "Simuler",
    href: "/simulateur-succession",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="10" cy="10" r="4.5" stroke="#795D48" strokeWidth="1.5" />
        <circle cx="20" cy="19" r="4.5" stroke="#795D48" strokeWidth="1.5" />
        <path d="M14 10h3a3 3 0 0 1 3 3v2" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function ServicesSection() {
  return (
    <section className="relative py-28" id="services" style={{ backgroundColor: "#EDE8E3" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="mb-16">
          <h2 className="font-cormorant text-5xl lg:text-6xl font-light text-[#0f0f0f]">
            Des solutions patrimoniales sur mesure
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 0.12}>
              <Link
                href={service.href}
                className="group flex flex-col gap-6 p-8 bg-[#0f0f0f] rounded-[20px] border border-transparent hover:border-[#795D48] hover:scale-[1.02] transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-xl">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-cormorant text-2xl font-semibold text-white mb-3">{service.title}</h3>
                  <p className="font-inter text-sm text-white/55 leading-relaxed">{service.description}</p>
                </div>
                <div className="font-inter text-sm text-[#795D48] font-medium">
                  {service.cta} →
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
      {/* Fondu bas → section aérienne sombre */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 100, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.35))" }}
        aria-hidden="true"
      />
    </section>
  );
}

// ─── SECTION 4 — AERIAL IMAGE ──────────────────────────────────────────────────
function AerialSection() {
  return (
    <section className="relative h-[70vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/images/aerial-view.png')", backgroundAttachment: "fixed" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      {/* Fondu haut — depuis section services */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{ height: 100, background: "linear-gradient(to bottom, #EDE8E3, transparent)" }}
        aria-hidden="true"
      />
      {/* Fondu bas — vers section simulateur */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{ height: 140, background: "linear-gradient(to bottom, transparent, #F2EDE8)" }}
        aria-hidden="true"
      />

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center">
        <AnimatedSection>
          <h2 className="font-cormorant text-4xl sm:text-[3.5rem] font-light text-white mb-8 leading-tight">
            Votre patrimoine mérite une vision d&apos;ensemble
          </h2>
          <Link
            href="/qui-sommes-nous"
            className="inline-flex items-center gap-2 px-[28px] py-[12px] border-[1.5px] border-white/50 text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:border-white hover:bg-white/10 transition-colors duration-200"
            aria-label="Découvrir notre approche"
          >
            Découvrir notre approche →
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── SECTION 5 — SIMULATEUR PREVIEW ────────────────────────────────────────────
function SimulateurPreviewSection() {
  return (
    <section className="py-28" id="simulateur" style={{ backgroundColor: "#F2EDE8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.12em] mb-6">
              Outil interactif
            </p>
            <h2 className="font-cormorant text-5xl lg:text-[3.2rem] font-light text-[#0f0f0f] leading-tight mb-8">
              Combien pouvez-vous économiser avec un PER ?
            </h2>
            <p className="font-inter text-base text-[#0f0f0f]/55 leading-relaxed mb-10">
              Notre simulateur calcule en temps réel votre économie d&apos;impôt
              selon votre situation personnelle et votre tranche marginale d&apos;imposition.
            </p>
            <Link
              href="/simulateur-per"
              className="inline-flex items-center gap-3 px-[28px] py-[12px] bg-[#795D48] text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
            >
              Lancer la simulation →
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="relative">
              <div
                className="rounded-[20px] border border-[#D4C9BE] p-8"
                style={{ backgroundColor: "#EDE8E3" }}
              >
                <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.15em] mb-6">
                  Aperçu — résultat simulateur
                </p>
                <div className="flex flex-col gap-4 mb-6">
                  {[
                    { label: "Revenu annuel imposable", val: "80 000 €" },
                    { label: "Versement PER", val: "10 000 €" },
                    { label: "Tranche marginale", val: "30 %" },
                  ].map((f) => (
                    <div key={f.label} className="flex justify-between items-center py-3 border-b border-[#D4C9BE]/60 last:border-0">
                      <span className="font-inter text-xs text-[#0f0f0f]/50">{f.label}</span>
                      <span className="font-inter text-sm font-medium text-[#0f0f0f]">{f.val}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[16px] p-6" style={{ backgroundColor: "#F2EDE8" }}>
                  <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.12em] mb-1">
                    Économie d&apos;impôt estimée
                  </p>
                  <p className="font-cormorant text-5xl text-[#795D48] font-semibold">3 000 €</p>
                  <p className="font-inter text-xs text-[#0f0f0f]/40 mt-2">Dès la première année</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border border-[#795D48]/20 rounded-[20px] -z-10" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6 — QUI SOMMES-NOUS ───────────────────────────────────────────────
function AboutSection() {
  return (
    <section className="py-28" id="equipe" style={{ backgroundColor: "#EDE8E3" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <div className="relative">
              <div
                className="aspect-[4/5] rounded-[20px] flex items-center justify-center border border-[#D4C9BE] overflow-hidden"
                style={{ backgroundColor: "#F2EDE8" }}
              >
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-label="Photo Auguste Dechery à venir">
                  <circle cx="32" cy="24" r="14" stroke="#795D48" strokeWidth="1.5" />
                  <path d="M8 56c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute -bottom-4 -right-4 flex flex-col gap-2">
                <div className="rounded-[16px] px-4 py-2 border border-[#D4C9BE]" style={{ backgroundColor: "#F2EDE8" }}>
                  <p className="font-inter text-[9px] text-[#795D48] uppercase tracking-wider">ORIAS</p>
                  <p className="font-inter text-xs font-semibold text-[#0f0f0f]">n° 25006770</p>
                </div>
                <div className="rounded-[16px] px-4 py-2 border border-[#D4C9BE]" style={{ backgroundColor: "#F2EDE8" }}>
                  <p className="font-inter text-[9px] text-[#795D48] uppercase tracking-wider">CNCEF</p>
                  <p className="font-inter text-xs font-semibold text-[#0f0f0f]">Assurance</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.12em] mb-6">Notre équipe</p>
            <h2 className="font-cormorant text-5xl lg:text-[3.2rem] font-light text-[#0f0f0f] leading-tight mb-6">
              Une approche indépendante et rigoureuse
            </h2>
            <h3 className="font-cormorant text-xl font-semibold text-[#0f0f0f] mb-1">Auguste Dechery</h3>
            <p className="font-inter text-sm text-[#795D48] mb-5">
              Fondateur & Conseiller en Gestion de Patrimoine
            </p>
            <p className="font-inter text-sm text-[#0f0f0f]/60 leading-relaxed mb-8">
              Fort d&apos;une expérience acquise en banque privée et en cabinet de gestion de patrimoine
              indépendant, Auguste Dechery accompagne ses clients avec rigueur et transparence dans la
              construction et l&apos;optimisation de leur stratégie patrimoniale. Aucun produit maison,
              aucune rétrocommission cachée — seulement votre intérêt.
            </p>
            <Link
              href="/qui-sommes-nous"
              className="inline-flex items-center gap-2 font-inter text-sm text-[#795D48] hover:text-[#6a5040] font-medium transition-colors"
              aria-label="En savoir plus sur Cervus Patrimoine"
            >
              En savoir plus →
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION CONTACT ───────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section className="py-28" id="contact" style={{ backgroundColor: "#F2EDE8" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl">
          <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.12em] mb-4">Contact</p>
          <h2 className="font-cormorant text-5xl font-light text-[#0f0f0f] mb-8">
            Parlons de votre projet
          </h2>
          <p className="font-inter text-base text-[#0f0f0f]/55 leading-relaxed mb-10">
            Chaque situation patrimoniale est unique. Prenez rendez-vous pour un
            premier entretien confidentiel et sans engagement.
          </p>
          <div
            className="rounded-[20px] p-10 border border-dashed border-[#795D48]/30 text-center"
            style={{ backgroundColor: "#EDE8E3" }}
          >
            <p className="font-inter text-sm text-[#0f0f0f]/40">
              Formulaire de prise de rendez-vous (Calendly)
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <AerialSection />
      <SimulateurPreviewSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
