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

export default function ProfilCarousel() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const count = PROFILS.length;
  const goTo = (i: number) => setIndex(((i % count) + count) % count);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="w-full max-w-full min-w-0">
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
              transform: `translateX(-${index * 100}%)`,
              transition: reduced ? "none" : "transform 380ms ease-out",
            }}
          >
            {PROFILS.map((p, i) => {
              const active = i === index;
              return (
                <div key={p.nom} className="w-full shrink-0 px-1">
                  <div
                    className={`flex flex-col gap-6 p-8 rounded-[20px] border transition-colors duration-300 ${
                      active ? "border-[#795D48]" : "border-[#D4C9BE]"
                    }`}
                    style={{ backgroundColor: "#F2EDE8" }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-cormorant text-3xl font-semibold text-[#0f0f0f]">
                        {p.nom}
                      </h3>
                      <span className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.14em] border border-[#795D48]/30 rounded-[50px] px-3 py-1">
                        Profil {i + 1}/{count}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-[14px] p-4" style={{ backgroundColor: "#EDE5DC" }}>
                        <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.1em] mb-1">
                          Horizon conseillé
                        </p>
                        <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">
                          {p.horizon}
                        </p>
                      </div>
                      <div className="rounded-[14px] p-4" style={{ backgroundColor: "#EDE5DC" }}>
                        <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.1em] mb-1">
                          Projection illustrative
                        </p>
                        <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">
                          {p.projection}
                        </p>
                        <p className="font-inter text-[9px] text-[#3a3a3a]/55 mt-1">
                          pour 10 000 € · non contractuel
                        </p>
                      </div>
                    </div>

                    {/* Hypothèse de rendement annuel */}
                    <div className="flex items-center gap-2 rounded-[12px] px-4 py-3 border border-[#795D48]/20" style={{ backgroundColor: "#EDE5DC" }}>
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
                        <span className="font-inter text-[10px] text-[#3a3a3a]/55">
                          Risque plus faible
                        </span>
                        <span className="font-inter text-[10px] text-[#3a3a3a]/55">
                          Risque plus élevé
                        </span>
                      </div>
                      <p className="font-inter text-xs text-[#3a3a3a] mt-1">
                        Niveau de risque indicatif&nbsp;: {p.risque}/7
                      </p>
                    </div>

                    <p className="font-inter text-sm text-[#3a3a3a]/80 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flèches (desktop) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Profil précédent"
          className="hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full border border-[#795D48]/30 bg-[#F2EDE8] text-[#795D48] hover:bg-[#795D48] hover:text-white transition-colors duration-200 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
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
            onClick={() => goTo(i)}
            aria-label={`Aller au profil ${p.nom}`}
            aria-current={i === index}
            className="h-2 rounded-full transition-all duration-200"
            style={{
              width: i === index ? 24 : 8,
              backgroundColor: i === index ? "#795D48" : "#D4C9BE",
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
