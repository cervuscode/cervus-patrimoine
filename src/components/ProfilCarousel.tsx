"use client";

import { useEffect, useRef, useState } from "react";

interface Profil {
  nom: string;
  horizon: string;
  risque: number; // 1 à 7 (échelle indicative type SRRI)
  rendement: number; // hypothèse de rendement annuel (%)
  projection: string;
  description: string;
}

const PROFILS: Profil[] = [
  {
    nom: "Prudent",
    horizon: "2 à 4 ans",
    risque: 2,
    rendement: 3,
    projection: "≈ 10 600 €",
    description:
      "Une allocation défensive, majoritairement en fonds euros, pour préserver le capital avec une volatilité réduite.",
  },
  {
    nom: "Équilibré",
    horizon: "5 à 8 ans",
    risque: 4,
    rendement: 4,
    projection: "≈ 12 200 €",
    description:
      "Un équilibre entre sécurité et performance, mêlant fonds euros et unités de compte diversifiées.",
  },
  {
    nom: "Dynamique",
    horizon: "8 ans et +",
    risque: 6,
    rendement: 5,
    projection: "≈ 14 800 €",
    description:
      "Une exposition forte aux marchés actions pour viser une performance supérieure sur le long terme.",
  },
  {
    nom: "Responsable",
    horizon: "5 à 8 ans",
    risque: 4,
    rendement: 4,
    projection: "≈ 12 000 €",
    description:
      "Une allocation orientée vers des supports ISR et durables, sans renoncer à la diversification.",
  },
];

const RISK_SCALE = [1, 2, 3, 4, 5, 6, 7];
const COUNT = PROFILS.length;

// Boucle infinie : clone du dernier au début + clone du premier à la fin.
// Index de piste : 0 = clone(dernier), 1..COUNT = profils réels, COUNT+1 = clone(premier).
const SLIDES: Profil[] = [PROFILS[COUNT - 1], ...PROFILS, PROFILS[0]];

function ProfilCard({ p, active, displayNum }: { p: Profil; active: boolean; displayNum: number }) {
  return (
    <div className="w-full shrink-0 px-1">
      <div
        className={`flex flex-col gap-6 p-8 rounded-[20px] border transition-colors duration-300 ${
          active ? "border-[#795D48]" : "border-[#D4C9BE]"
        }`}
        style={{ backgroundColor: "#F2EDE8" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-cormorant text-3xl font-semibold text-[#0f0f0f]">{p.nom}</h3>
          <span className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.14em] border border-[#795D48]/30 rounded-[50px] px-3 py-1">
            Profil {displayNum}/{COUNT}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[14px] p-4" style={{ backgroundColor: "#EDE5DC" }}>
            <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.1em] mb-1">
              Horizon conseillé
            </p>
            <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{p.horizon}</p>
          </div>
          <div className="rounded-[14px] p-4" style={{ backgroundColor: "#EDE5DC" }}>
            <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.1em] mb-1">
              Projection illustrative
            </p>
            <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{p.projection}</p>
            <p className="font-inter text-[9px] text-[#3a3a3a]/55 mt-1">
              pour 10 000 € · non contractuel
            </p>
          </div>
        </div>

        {/* Hypothèse de rendement annuel */}
        <div
          className="flex items-center gap-2 rounded-[12px] px-4 py-3 border border-[#795D48]/20"
          style={{ backgroundColor: "#EDE5DC" }}
        >
          <span className="font-inter text-[11px] text-[#795D48] uppercase tracking-[0.1em]">
            Hypothèse
          </span>
          <span className="font-cormorant text-2xl font-semibold text-[#0f0f0f] leading-none">
            {p.rendement}&nbsp;%/an
          </span>
          <span className="font-inter text-[10px] text-[#3a3a3a]/55">
            rendement annuel hypothétique
          </span>
        </div>

        {/* Échelle de risque indicative 1-7 */}
        <div>
          <div className="flex items-end gap-1.5 mb-2">
            {RISK_SCALE.map((lvl) => (
              <div
                key={lvl}
                className="flex-1 rounded-[3px]"
                style={{
                  height: 8 + lvl * 3,
                  backgroundColor: lvl === p.risque ? "#795D48" : "#D4C9BE",
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-inter text-[10px] text-[#3a3a3a]/55">Risque plus faible</span>
            <span className="font-inter text-[10px] text-[#3a3a3a]/55">Risque plus élevé</span>
          </div>
          <p className="font-inter text-xs text-[#3a3a3a] mt-1">
            Niveau de risque indicatif&nbsp;: {p.risque}/7
          </p>
        </div>

        <p className="font-inter text-sm text-[#3a3a3a]/80 leading-relaxed">{p.description}</p>
      </div>
    </div>
  );
}

export default function ProfilCarousel() {
  const [pos, setPos] = useState(1); // position dans SLIDES (1 = premier profil réel)
  const [anim, setAnim] = useState(true); // transition slide active
  const [reduced, setReduced] = useState(false);
  const [hovering, setHovering] = useState(false);
  // L'utilisateur a pris la main (flèche / dot / swipe) → l'auto-play ne reprend plus.
  const [userTook, setUserTook] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // current = profil réel affiché (0..COUNT-1), pour les dots et le highlight.
  const current = ((pos - 1) % COUNT + COUNT) % COUNT;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Avance d'un cran (sens unique pour l'auto-play → boucle continue via les clones).
  const step = (dir: 1 | -1) => {
    if (reduced) {
      // Pas de transition : on reste dans la plage réelle [1..COUNT] avec wrap instantané.
      setAnim(false);
      setPos((p) => {
        const n = p + dir;
        if (n > COUNT) return 1;
        if (n < 1) return COUNT;
        return n;
      });
      return;
    }
    setAnim(true);
    setPos((p) => p + dir);
  };

  // Auto-play 3,5 s. Désactivé si reduced-motion, survol, ou prise de contrôle.
  useEffect(() => {
    if (reduced || userTook || hovering) return;
    const id = setInterval(() => step(1), 3500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, userTook, hovering]);

  // Fin de slide : si on est sur un clone, on saute sans transition vers le réel équivalent.
  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform") return;
    if (pos === COUNT + 1) {
      setAnim(false);
      setPos(1);
    } else if (pos === 0) {
      setAnim(false);
      setPos(COUNT);
    }
  };

  const userStep = (dir: 1 | -1) => {
    setUserTook(true);
    step(dir);
  };
  const goToReal = (i: number) => {
    setUserTook(true);
    setAnim(!reduced);
    setPos(i + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setUserTook(true); // toucher = prise de contrôle
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) step(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full max-w-full min-w-0"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Piste du carrousel */}
      <div className="relative min-w-0">
        <div
          className="overflow-hidden rounded-[20px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(-${pos * 100}%)`,
              transition: anim && !reduced ? "transform 400ms cubic-bezier(0.34, 1.2, 0.5, 1)" : "none",
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {SLIDES.map((p, i) => (
              <ProfilCard
                key={i}
                p={p}
                active={i === pos}
                displayNum={(((i - 1) % COUNT) + COUNT) % COUNT + 1}
              />
            ))}
          </div>
        </div>

        {/* Flèches (desktop) */}
        <button
          type="button"
          onClick={() => userStep(-1)}
          aria-label="Profil précédent"
          className="hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-[#795D48]/30 bg-[#F2EDE8] text-[#795D48] hover:bg-[#795D48] hover:text-white transition-colors duration-200 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => userStep(1)}
          aria-label="Profil suivant"
          className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-[#795D48]/30 bg-[#F2EDE8] text-[#795D48] hover:bg-[#795D48] hover:text-white transition-colors duration-200 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Indicateurs de position (dots) */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {PROFILS.map((p, i) => (
          <button
            key={p.nom}
            type="button"
            onClick={() => goToReal(i)}
            aria-label={`Aller au profil ${p.nom}`}
            aria-current={i === current}
            className="h-2 rounded-full transition-all duration-200"
            style={{
              width: i === current ? 24 : 8,
              backgroundColor: i === current ? "#795D48" : "#D4C9BE",
            }}
          />
        ))}
      </div>

      {/* Mention réglementaire obligatoire */}
      <p className="font-inter text-xs text-[#3a3a3a]/60 leading-relaxed mt-6 text-center md:text-left">
        Simulation indicative — non contractuelle. Les performances passées ne préjugent
        pas des performances futures.
      </p>
    </div>
  );
}
