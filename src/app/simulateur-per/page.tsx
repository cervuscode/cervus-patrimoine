import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Simulation PER — Calculez votre économie d'impôt | Cervus Patrimoine",
  description:
    "Simulateur PER gratuit : découvrez en 2 minutes votre économie d'impôt, votre impôt avant/après PER et votre capital retraite projeté. Sans engagement.",
  alternates: { canonical: "/simulateur-per" },
  openGraph: {
    title: "Simulation PER — Calculez votre économie d'impôt",
    description:
      "Découvrez en 2 minutes combien le PER peut réduire vos impôts et le capital que vous pouvez constituer pour votre retraite.",
    type: "website",
  },
};

const SIMULATION_HREF = "/simulateur-per/simulation";

// ─── Réassurance (gratuit · 2 min · sans engagement) ─────────────────────────
const reassurances = [
  {
    label: "100 % gratuit",
    desc: "Aucun frais, aucune carte bancaire demandée.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#795D48" strokeWidth="1.6" />
        <path d="M12 7v10M9.5 9.2c0-1.1 1.1-1.7 2.5-1.7s2.5.6 2.5 1.7-1.1 1.6-2.5 1.6-2.5.6-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.6 2.5-1.7" stroke="#795D48" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "2 minutes",
    desc: "Un parcours simple, sans paperasse.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#795D48" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2.2" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Sans engagement",
    desc: "Vos résultats, libre à vous d'aller plus loin.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6l7-3z" stroke="#795D48" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8.8 12l2.2 2.2 4-4.4" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ─── Ce que vous allez obtenir (4 résultats) ─────────────────────────────────
const resultats = [
  {
    title: "Votre gain fiscal",
    desc: "Le montant exact que vous pouvez déduire de vos impôts dès cette année grâce à vos versements PER.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="#795D48" strokeWidth="1.6" />
        <path d="M11 21L21 11" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12.5" cy="12.5" r="1.8" stroke="#795D48" strokeWidth="1.4" />
        <circle cx="19.5" cy="19.5" r="1.8" stroke="#795D48" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    title: "Votre impôt avant / après PER",
    desc: "La comparaison claire de votre imposition, pour visualiser l'effet réel du PER sur votre feuille d'impôt.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <path d="M5 16h7M20 16h7" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.5 12.5L6 16l3.5 3.5" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.5 12.5L26 16l-3.5 3.5" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="9" width="6" height="14" rx="1.5" stroke="#795D48" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "Votre économie mensuelle",
    desc: "Le coût réel de votre effort d'épargne chaque mois, une fois l'avantage fiscal pris en compte.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <rect x="5" y="7" width="22" height="18" rx="2.5" stroke="#795D48" strokeWidth="1.6" />
        <path d="M5 12h22" stroke="#795D48" strokeWidth="1.6" />
        <path d="M10 4.5v4M22 4.5v4" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 18.5h5" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Votre capital à la retraite",
    desc: "La projection de l'épargne que vous aurez constituée le jour de votre départ en retraite.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <path d="M5 24h22" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 21l6-6 4 3 8-9" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 9h-4M24 9v4" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function SimulateurPERLandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F2EDE8" }}>
      {/* ─── HERO (sombre) ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f0f0f]">
        {/* halo doré discret */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(121,93,72,0.28), transparent 70%)",
          }}
        />

        {/* header minimal */}
        <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/cervus_logo.svg" alt="Cervus Patrimoine" width={32} height={32} className="h-8 w-auto" priority />
            <span className="font-cormorant text-xl font-semibold text-white tracking-wide">
              Cervus Patrimoine
            </span>
          </Link>
          <span className="font-inter text-[0.65rem] text-white/40 uppercase tracking-[0.2em] hidden sm:block">
            Simulateur PER
          </span>
        </header>

        {/* contenu hero */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-20 sm:pt-16 sm:pb-28 text-center">
          <p className="font-inter text-[0.7rem] text-cervus-gold-light uppercase tracking-[0.18em] mb-6">
            Simulation gratuite · Résultat immédiat
          </p>
          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-[3.75rem] font-light text-white leading-[1.08] mb-6">
            Combien le PER peut-il réduire&nbsp;vos&nbsp;impôts&nbsp;?
          </h1>
          <p className="font-inter text-[1.05rem] text-white/75 leading-relaxed max-w-xl mx-auto mb-10">
            Découvrez en 2 minutes votre économie d&apos;impôt, votre capital retraite
            projeté et le coût réel de votre épargne — chiffré sur votre situation.
          </p>

          <Link
            href={SIMULATION_HREF}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-cervus-gold text-white font-inter text-base font-medium tracking-[0.02em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200 shadow-lg shadow-black/30"
          >
            Démarrer ma simulation
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* réassurance inline */}
          <p className="font-inter text-xs text-white/45 mt-5 tracking-wide">
            Gratuit · 2 minutes · Sans engagement
          </p>
        </div>

        {/* fondu vers la section crème */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 100, background: "linear-gradient(to bottom, transparent, #F2EDE8)" }}
          aria-hidden="true"
        />
      </section>

      {/* ─── CE QUE VOUS ALLEZ OBTENIR ─────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-inter text-[0.7rem] text-cervus-gold uppercase tracking-[0.18em] mb-4">
              Votre rapport personnalisé
            </p>
            <h2 className="font-cormorant text-3xl sm:text-4xl font-light text-cervus-dark leading-tight">
              Ce que vous allez obtenir
            </h2>
            <p className="font-inter text-sm sm:text-base text-cervus-dark/55 leading-relaxed max-w-xl mx-auto mt-4">
              Quatre résultats clairs pour décider en toute connaissance de cause.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {resultats.map((r, i) => (
              <div
                key={r.title}
                className="group bg-white border border-[#E4DACE] rounded-sm p-7 sm:p-8 flex items-start gap-5 hover:border-cervus-gold/50 transition-colors duration-200"
              >
                <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-sm bg-cervus-cream border border-[#E4DACE]">
                  {r.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-cormorant text-lg font-semibold text-cervus-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-cormorant text-xl font-semibold text-cervus-dark leading-snug">
                      {r.title}
                    </h3>
                  </div>
                  <p className="font-inter text-sm text-cervus-dark/60 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA intermédiaire */}
          <div className="text-center mt-14">
            <Link
              href={SIMULATION_HREF}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-cervus-gold text-white font-inter text-base font-medium tracking-[0.02em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
            >
              Démarrer ma simulation
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── RÉASSURANCE ───────────────────────────────────────────────── */}
      <section className="pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:divide-x divide-[#D4C9BE]/60 border-t border-b border-[#D4C9BE]/60 divide-y sm:divide-y-0">
            {reassurances.map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-4 sm:px-8 py-7">
                <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-sm bg-white border border-[#E4DACE]">
                  {item.icon}
                </div>
                <div>
                  <p className="font-cormorant text-lg font-semibold text-cervus-dark">{item.label}</p>
                  <p className="font-inter text-[0.8rem] text-cervus-dark/55 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER MINIMAL ────────────────────────────────────────────── */}
      <footer className="mt-auto w-full px-6 py-4 border-t border-[#D4C9BE]/60 text-center">
        <p className="font-inter text-[10px] text-cervus-dark/30">
          © 2026 Cervus Patrimoine · ORIAS n° 25006770 ·{" "}
          <Link href="/mentions-legales" className="underline hover:text-cervus-gold transition-colors">
            Mentions légales
          </Link>
          {" · "}
          <Link href="/politique-de-confidentialite" className="underline hover:text-cervus-gold transition-colors">
            Confidentialité
          </Link>
        </p>
      </footer>
    </div>
  );
}
