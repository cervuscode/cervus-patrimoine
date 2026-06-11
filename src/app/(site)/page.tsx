import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import AnimatedSection from "@/components/AnimatedSection";
import ProfilCarousel from "@/components/ProfilCarousel";

export const metadata: Metadata = {
  title: "Cervus Patrimoine — Cabinet de gestion de patrimoine indépendant",
  description:
    "Cervus Patrimoine, cabinet indépendant de conseil en gestion de patrimoine. Stratégies personnalisées : PER, assurance-vie, succession. Prenez rendez-vous.",
};

// ─── BANDEAU IMAGE DE TITRE DE SECTION ─────────────────────────────────────────
// Image plein-largeur + overlay sombre pour la lisibilité + titre clair par-dessus.
// Coupe nette avec le contenu crème qui suit (le dégradé reste dans le bandeau).
function SectionBanner({
  src,
  alt,
  eyebrow,
  title,
  subtitle,
}: {
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative h-[220px] sm:h-[300px] lg:h-[340px] overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        quality={85}
        className="object-cover"
        style={{ objectPosition: "center" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(15,15,15,0.55), rgba(15,15,15,0.25))" }}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-10">
        {eyebrow && (
          <p className="font-inter text-[0.7rem] text-[#F2EDE8]/85 uppercase tracking-[0.14em] mb-3">
            {eyebrow}
          </p>
        )}
        <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light text-[#F2EDE8] leading-tight max-w-3xl"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="font-inter text-base text-[#F2EDE8]/85 mt-3 max-w-xl">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── SECTION 1 — HERO ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center" }}
        src="/videos/hero-15s.mp4"
        poster="/images/hero-poster.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
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
              href="/reserver"
              className="inline-flex items-center justify-center px-[28px] py-[12px] bg-[#795D48] text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
            >
              Prendre rendez-vous
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-[28px] py-[12px] border-[1.5px] border-white/40 text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:border-white hover:bg-white/10 transition-colors duration-200"
            >
              Découvrir nos services
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
    </section>
  );
}

// ─── SECTION 3 — SERVICES ──────────────────────────────────────────────────────
const services = [
  {
    title: "Conseil patrimonial global",
    description:
      "Pour les salariés, dirigeants, indépendants et professions libérales : optimisation fiscale, stratégie d'investissement, transmission — une vision d'ensemble de votre situation.",
    cta: "En savoir plus",
    href: "/services",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" stroke="#795D48" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="6" stroke="#795D48" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="1.5" fill="#795D48" />
      </svg>
    ),
  },
  {
    title: "PER & Retraite",
    description: "Optimisez votre fiscalité aujourd'hui tout en préparant votre retraite de demain.",
    cta: "En savoir plus",
    href: "/services",
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
];

function ServicesSection() {
  return (
    <section className="py-28" id="services" style={{ backgroundColor: "#EDE8E3" }}>
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
                className="group flex flex-col gap-6 p-8 rounded-[20px] border border-[#D4C9BE] hover:border-[#795D48] hover:scale-[1.02] transition-all duration-300 h-full"
                style={{ backgroundColor: "#F2EDE8" }}
              >
                <div className="w-12 h-12 flex items-center justify-center border border-[#795D48]/20 rounded-xl">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-cormorant text-2xl font-semibold text-[#0f0f0f] mb-3">{service.title}</h3>
                  <p className="font-inter text-sm text-[#3a3a3a]/75 leading-relaxed">{service.description}</p>
                </div>
                <div className="font-inter text-sm text-[#795D48] font-medium">
                  {service.cta} →
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 4 — AERIAL IMAGE ──────────────────────────────────────────────────
function AerialSection() {
  return (
    <section className="relative h-[70vh] overflow-hidden">
      <Image
        src="/images/section-vision-echiquier.png"
        alt=""
        fill
        sizes="100vw"
        quality={85}
        className="object-cover"
        style={{ objectPosition: "center" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

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

// ─── SECTION — CHAPEAU CONSEIL EN GESTION DE PATRIMOINE ────────────────────────
const expertises = [
  {
    label: "Comprendre vos enjeux",
    detail:
      "Votre statut, votre rémunération, vos objectifs : tout commence par une vraie phase de découverte de votre situation.",
  },
  {
    label: "Identifier la bonne enveloppe",
    detail:
      "Nous vous présentons clairement chaque solution et mettons en place celle qui correspond réellement à votre profil.",
  },
  {
    label: "Vous suivre dans le temps",
    detail:
      "Votre interlocuteur reste le même : nous ajustons votre stratégie à chaque étape de votre vie.",
  },
];

function ConseilSection() {
  return (
    <section className="py-28" id="conseil" style={{ backgroundColor: "#EDE8E3" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="max-w-3xl mb-14">
          <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.14em] mb-6">
            Conseil en gestion de patrimoine
          </p>
          <h2 className="font-cormorant text-5xl lg:text-6xl font-light text-[#0f0f0f] leading-[1.1] mb-5">
            Un accompagnement, pas un produit
          </h2>
          <p className="font-inter text-xl text-[#795D48] leading-snug mb-8">
            Majorité des enfants, études, achat de la résidence, transmission, baisse de
            revenus à la retraite… autant d&apos;échéances qui se préparent bien avant qu&apos;elles
            n&apos;arrivent.
          </p>
          <p className="font-inter text-lg text-[#3a3a3a]/80 leading-relaxed">
            Notre rôle n&apos;est pas de vous vendre un placement, mais de regarder votre vie
            quelques années plus loin que le quotidien&nbsp;: identifier ensemble les besoins
            financiers à venir, puis y répondre par une stratégie cohérente, indépendante et
            transparente. Les expertises ci-dessous sont les déclinaisons d&apos;un seul et même
            accompagnement.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {expertises.map((e, i) => (
            <AnimatedSection key={e.label} delay={i * 0.12}>
              <div
                className="h-full rounded-[20px] border border-[#D4C9BE] p-7"
                style={{ backgroundColor: "#F2EDE8" }}
              >
                <span className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.12em]">
                  0{i + 1}
                </span>
                <h3 className="font-cormorant text-2xl font-semibold text-[#0f0f0f] mt-2 mb-2">
                  {e.label}
                </h3>
                <p className="font-inter text-sm text-[#3a3a3a]/75 leading-relaxed">{e.detail}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5 — SIMULATEUR PREVIEW (unique rappel discret du simulateur) ───────
function SimulateurPreviewSection() {
  return (
    <section id="simulateur" style={{ backgroundColor: "#F2EDE8" }}>
      <SectionBanner
        src="/images/section-per-sablier.png"
        alt="PER et préparation de la retraite"
        eyebrow="PER & Retraite"
        title="Combien pouvez-vous économiser avec un PER ?"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.12em] mb-6">
              Outil interactif
            </p>
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

// ─── SECTION — ASSURANCE-VIE + CARROUSEL DE PROFILS ────────────────────────────
function AssuranceVieSection() {
  return (
    <section className="overflow-x-hidden" id="assurance-vie" style={{ backgroundColor: "#EDE8E3" }}>
      <SectionBanner
        src="/images/section-av-piece.png"
        alt="Assurance-vie et valorisation du capital"
        eyebrow="Assurance-vie"
        title="Faites fructifier votre capital, à votre rythme"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection>
            <p className="font-inter text-base text-[#3a3a3a]/75 leading-relaxed mb-6">
              Nous comparons les contrats du marché sans être liés à un assureur&nbsp;:
              aucun produit maison, aucune rétrocommission cachée. Seulement l&apos;allocation
              la plus adaptée à votre profil et à vos objectifs.
            </p>
            <p className="font-inter text-base text-[#3a3a3a]/75 leading-relaxed mb-10">
              Du profil prudent au profil dynamique, votre stratégie reste transparente
              et ajustable dans le temps.
            </p>
            <Link
              href="/simulateur-assurance-vie"
              className="inline-flex items-center justify-center gap-2 px-[28px] py-[12px] bg-[#795D48] text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
            >
              Simuler mon assurance-vie →
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="min-w-0">
            <ProfilCarousel />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION — ACCOMPAGNEMENT DIRIGEANTS ───────────────────────────────────────
const dirigeantServices = [
  {
    title: "Comprendre vos enjeux",
    description:
      "Votre statut, votre rémunération et vos arbitrages personnels analysés ensemble, en toute indépendance.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="12" cy="12" r="7" stroke="#795D48" strokeWidth="1.5" />
        <path d="M17 17l5 5" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Gérer l'excédent de trésorerie",
    description:
      "Contrat de capitalisation et solutions adaptées pour faire travailler la trésorerie de votre entreprise.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="14" rx="2" stroke="#795D48" strokeWidth="1.5" />
        <path d="M4 12h20M9 17h3" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Assurer vos revenus",
    description:
      "Prévoyance du dirigeant : protéger votre revenu et vos proches face aux aléas.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l9 4v6c0 5.5-3.8 9.3-9 10.5C8.8 23.3 5 19.5 5 14V8l9-4Z" stroke="#795D48" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10.5 14l2.5 2.5 4.5-5" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function DirigeantsSection() {
  return (
    <section id="dirigeants" style={{ backgroundColor: "#F2EDE8" }}>
      <SectionBanner
        src="/images/section-dirigeants-abstrait.png"
        alt="Accompagnement des dirigeants"
        eyebrow="Dirigeants & professions libérales"
        title="Un accompagnement dédié aux dirigeants"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {dirigeantServices.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.12}>
              <div
                className="flex flex-col gap-6 p-8 rounded-[20px] border border-[#D4C9BE] h-full"
                style={{ backgroundColor: "#F2EDE8" }}
              >
                <div className="w-12 h-12 flex items-center justify-center border border-[#795D48]/20 rounded-xl">
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-cormorant text-2xl font-semibold text-[#0f0f0f] mb-3">{s.title}</h3>
                  <p className="font-inter text-sm text-[#3a3a3a]/75 leading-relaxed">{s.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <Link
            href="/reserver"
            className="inline-flex items-center justify-center gap-2 px-[28px] py-[12px] bg-[#795D48] text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
          >
            Prendre rendez-vous →
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── SECTION — NOTRE APPROCHE ──────────────────────────────────────────────────
function ApprocheSection() {
  return (
    <section className="py-28" id="approche" style={{ backgroundColor: "#EDE8E3" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <AnimatedSection>
            <p className="font-inter text-[0.7rem] text-[#795D48] uppercase tracking-[0.14em] mb-6">
              Notre approche
            </p>
            <h2 className="font-cormorant text-5xl lg:text-[3.2rem] font-light text-[#0f0f0f] leading-tight mb-8">
              Faire les choses autrement
            </h2>
            <p className="font-inter text-base text-[#3a3a3a]/80 leading-relaxed mb-6">
              Trop souvent, les clients souscrivent des produits choisis dans l&apos;intérêt du
              conseiller, pas dans le leur&nbsp;: un gestionnaire imposé par l&apos;assureur partenaire,
              des produits structurés vendus sur un nom, des frais sur versement excessifs. Nous avons
              fondé Cervus Patrimoine pour rompre avec ces pratiques.
            </p>
            <p className="font-inter text-base text-[#3a3a3a]/80 leading-relaxed mb-10">
              Pas de produit maison. Pas de rétrocommission cachée. Pas de solution imposée par un
              partenaire. Nous comparons le marché en toute indépendance et ne retenons qu&apos;une
              chose&nbsp;: la solution la plus adaptée à votre situation.
            </p>
            <Link
              href="/qui-sommes-nous"
              className="inline-flex items-center gap-2 font-inter text-sm text-[#795D48] hover:text-[#6a5040] font-medium transition-colors"
              aria-label="En savoir plus sur Cervus Patrimoine"
            >
              En savoir plus →
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="rounded-[20px] border border-[#D4C9BE] p-8" style={{ backgroundColor: "#F2EDE8" }}>
              <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.14em] mb-6">
                Nos engagements
              </p>
              <ul className="flex flex-col gap-4 mb-8">
                {[
                  "Indépendance totale, aucun produit maison",
                  "Aucune rétrocommission cachée",
                  "Comparaison du marché, solution sur mesure",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" stroke="#795D48" strokeWidth="1.3" />
                      <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-inter text-sm text-[#3a3a3a]/85 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-6 border-t border-[#D4C9BE]/70">
                <div className="rounded-[14px] px-4 py-2 border border-[#D4C9BE]" style={{ backgroundColor: "#EDE5DC" }}>
                  <p className="font-inter text-[9px] text-[#795D48] uppercase tracking-wider">ORIAS</p>
                  <p className="font-inter text-xs font-semibold text-[#0f0f0f]">n° 25006770</p>
                </div>
                <div className="rounded-[14px] px-4 py-2 border border-[#D4C9BE]" style={{ backgroundColor: "#EDE5DC" }}>
                  <p className="font-inter text-[9px] text-[#795D48] uppercase tracking-wider">CNCEF</p>
                  <p className="font-inter text-xs font-semibold text-[#0f0f0f]">Assurance</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION FINALE — CTA PRISE DE RENDEZ-VOUS ─────────────────────────────────
function FinalCtaSection() {
  return (
    <section className="py-28 px-6" id="contact" style={{ backgroundColor: "#5D4738" }}>
      <div className="max-w-3xl mx-auto text-center">
        <AnimatedSection>
          <p className="font-inter text-[0.7rem] text-[#EAD9C7] uppercase tracking-[0.18em] mb-6">
            Entretien gratuit
          </p>
          <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-[3.5rem] font-light text-[#F2EDE8] leading-tight mb-6">
            Parlons de votre projet patrimonial
          </h2>
          <p className="font-inter text-base text-[#F2EDE8]/70 leading-relaxed mb-10 max-w-xl mx-auto">
            Chaque situation est unique. Réservez un entretien confidentiel
            et sans engagement avec un conseiller indépendant.
          </p>
          <Link
            href="/reserver"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#F2EDE8] text-[#5D4738] font-inter text-base font-medium tracking-[0.02em] rounded-[50px] hover:bg-white transition-colors duration-200 shadow-lg shadow-black/20"
          >
            Prendre rendez-vous
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="font-inter text-xs text-[#F2EDE8]/45 mt-6">
            30 minutes · gratuit · sans engagement
          </p>
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
      <ServicesSection />
      <AerialSection />
      <ConseilSection />
      <SimulateurPreviewSection />
      <AssuranceVieSection />
      <DirigeantsSection />
      <ApprocheSection />
      <FinalCtaSection />
    </>
  );
}
