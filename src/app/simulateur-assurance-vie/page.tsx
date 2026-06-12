import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Simulation Assurance-vie — Capital projeté & gestion optimisée | Cervus Patrimoine",
  description:
    "Simulateur assurance-vie gratuit : estimez votre capital projeté et comparez le rendement net avec et sans optimisation des plus-values. Indépendant et transparent.",
  alternates: { canonical: "/simulateur-assurance-vie" },
  openGraph: {
    title: "Simulation Assurance-vie — Capital projeté & gestion optimisée",
    description:
      "Estimez votre capital et l'intérêt d'une purge optimisée des plus-values, en toute transparence.",
    type: "website",
  },
};

const SIMULATION_HREF = "/simulateur-assurance-vie/simulation";

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

const resultats = [
  {
    title: "Votre capital projeté",
    desc: "L'estimation de la valeur de votre contrat au terme, selon votre profil et votre horizon.",
  },
  {
    title: "Net avec vs sans optimisation",
    desc: "La comparaison claire de votre capital après fiscalité, avec et sans purge optimisée des plus-values.",
  },
  {
    title: "Le gain réel de l'optimisation",
    desc: "L'impôt évité, le manque à gagner de capitalisation, et le gain net — affiché honnêtement, même s'il est faible.",
  },
  {
    title: "Les modes de gestion",
    desc: "Un éclairage pédagogique sur la gestion libre, pilotée ou sous mandat — le vrai levier de votre assurance-vie.",
  },
];

export default function SimulateurAVLandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#F2EDE8" }}>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0f0f0f]">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(121,93,72,0.28), transparent 70%)",
          }}
        />
        <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/cervus_logo.png" alt="Cervus Patrimoine" width={40} height={40} className="h-10 w-auto" priority />
            <span className="font-cormorant text-xl font-semibold text-white tracking-wide">Cervus Patrimoine</span>
          </Link>
          <span className="font-inter text-[0.65rem] text-white/40 uppercase tracking-[0.2em] hidden sm:block">
            Simulateur Assurance-vie
          </span>
        </header>

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-20 sm:pt-16 sm:pb-28 text-center">
          <p className="font-inter text-[0.7rem] text-cervus-gold-light uppercase tracking-[0.18em] mb-6">
            Simulation gratuite · Résultat immédiat
          </p>
          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-[3.75rem] font-light text-white leading-[1.08] mb-6">
            Quel capital pour votre assurance-vie&nbsp;?
          </h1>
          <p className="font-inter text-[1.05rem] text-white/75 leading-relaxed max-w-xl mx-auto mb-10">
            Estimez en 2 minutes votre capital projeté et l&apos;intérêt réel d&apos;une gestion
            optimisée des plus-values — comparé en toute indépendance, sans lien avec un assureur.
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
          <p className="font-inter text-xs text-white/45 mt-5 tracking-wide">
            Gratuit · 2 minutes · Sans engagement
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-y-5 sm:gap-y-0 max-w-lg mx-auto sm:divide-x divide-white/10">
            {[
              { stat: "Avec / sans", label: "comparaison nette" },
              { stat: "2 minutes", label: "pour votre résultat" },
              { stat: "Indépendant", label: "sans produit imposé" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center px-4">
                <span className="font-cormorant text-2xl font-semibold text-cervus-gold-light leading-tight">{m.stat}</span>
                <span className="font-inter text-[0.7rem] text-white/40 tracking-wide mt-0.5">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CE QUE VOUS ALLEZ OBTENIR */}
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
              Une comparaison claire et honnête pour décider en connaissance de cause.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {resultats.map((r, i) => (
              <div
                key={r.title}
                className="group bg-white border border-[#E4DACE] rounded-sm p-7 sm:p-8 flex items-start gap-5 hover:border-cervus-gold/50 transition-colors duration-200"
              >
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-sm bg-cervus-cream border border-[#E4DACE]">
                  <span className="font-cormorant text-lg font-semibold text-cervus-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="font-cormorant text-xl font-semibold text-cervus-dark leading-snug mb-2">
                    {r.title}
                  </h3>
                  <p className="font-inter text-sm text-cervus-dark/60 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

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

      {/* RÉASSURANCE */}
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
