"use client";

import { formatEuro } from "@/lib/per-quick";
import {
  STATUT_COLORS,
  STATUT_LABELS,
  type NiveauResult,
  type PyramideResult,
} from "@/lib/pyramide-epargne";

/**
 * Visuel de la « Pyramide de l'épargne » (Lot 9). Deux pyramides : à GAUCHE la
 * répartition CIBLE théorique (% / « 6 mois »), à DROITE la répartition RÉELLE du
 * client (montants €, % du total, écart coloré). Côte à côte sur desktop, empilées
 * sur mobile (mobile-first).
 *
 * Technique : 4 couches en TRAPÈZE (clip-path) formant un triangle — sommet =
 * DYNAMIQUE en haut, base = PRÉCAUTION en bas (sens classique : base sécurisée
 * large). Le texte est en surimpression (non rogné par le clip-path) → toujours
 * lisible. Blocs CSS purs (cohérent ReductionStacks / ComparateurStacks).
 *
 * Source UNIQUE du rendu, partagée par le simulateur, la vue présentation et le
 * bloc fiche client.
 */

const HAUTEUR_COUCHE = 74; // px par couche

// Largeurs (%) du trapèze aux 5 lignes horizontales, du sommet (44 %) à la base
// (100 %). Le sommet ne descend pas à 0 % pour garder les couches hautes lisibles.
const W_SOMMET = 44;
const W_BASE = 100;
const W_STEP = (W_BASE - W_SOMMET) / 4;

/** clip-path d'un trapèze centré (largeurs haut/bas en %). */
function trapeze(topW: number, botW: number): string {
  const tl = 50 - topW / 2;
  const tr = 50 + topW / 2;
  const bl = 50 - botW / 2;
  const br = 50 + botW / 2;
  return `polygon(${tl}% 0, ${tr}% 0, ${br}% 100%, ${bl}% 100%)`;
}

function pctTxt(p: number): string {
  return `${(p * 100).toFixed(p * 100 >= 10 || p === 0 ? 0 : 1).replace(".", ",")} %`;
}

export default function PyramidsView({ result }: { result: PyramideResult }) {
  if (result.patrimoineTotal <= 0) {
    return (
      <div className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-6 text-center text-sm text-cervus-bronze/60">
        Renseignez les encours du patrimoine financier pour afficher la pyramide.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Pyramide titre="Répartition cible" mode="theorique" result={result} />
        <Pyramide titre="Votre répartition" mode="reel" result={result} />
      </div>

      <p className="text-center font-cormorant text-lg text-cervus-bronze">
        Patrimoine financier total : {formatEuro(result.patrimoineTotal)}
      </p>

      {/* Légende des écarts (mode réel). */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-cervus-bronze/60">
        {(["ok", "sur", "sous"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: STATUT_COLORS[s] }}
            />
            {STATUT_LABELS[s]}
          </span>
        ))}
      </div>

      {result.ciblePrecaution === null && (
        <p className="text-center text-[11px] text-cervus-bronze/45">
          Renseignez la capacité d&apos;épargne mensuelle pour comparer à la cible
          théorique.
        </p>
      )}
    </div>
  );
}

function Pyramide({
  titre,
  mode,
  result,
}: {
  titre: string;
  mode: "theorique" | "reel";
  result: PyramideResult;
}) {
  // Du SOMMET (dynamique) vers la BASE (précaution) pour l'affichage.
  const fromTop = [...result.niveaux].reverse();

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-cervus-gold-light">
        {titre}
      </span>
      <div className="w-full max-w-[320px]">
        {fromTop.map((n, j) => {
          const topW = W_SOMMET + j * W_STEP;
          const botW = W_SOMMET + (j + 1) * W_STEP;
          return (
            <Couche
              key={n.key}
              niveau={n}
              mode={mode}
              clip={trapeze(topW, botW)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Couche({
  niveau,
  mode,
  clip,
}: {
  niveau: NiveauResult;
  mode: "theorique" | "reel";
  clip: string;
}) {
  const txt = niveau.texteSombre ? "#5D4738" : "#F2EDE8";
  return (
    <div className="relative" style={{ height: HAUTEUR_COUCHE }}>
      {/* Trapèze coloré (rogné). */}
      <div className="absolute inset-0" style={{ background: niveau.color, clipPath: clip }} />
      {/* Contenu en surimpression (non rogné → toujours lisible). */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-2 text-center leading-tight"
        style={{ color: txt }}
      >
        <span className="text-[11px] font-semibold tracking-wide">{niveau.label}</span>
        {mode === "theorique" ? (
          <span className="text-[10px] opacity-80">{niveau.cibleLabel}</span>
        ) : (
          <>
            <span className="text-xs font-medium">{formatEuro(niveau.montantReel)}</span>
            <span className="text-[10px] opacity-80">{pctTxt(niveau.pctTotal)}</span>
            {niveau.statut !== "neutre" && (
              <span
                className="mt-0.5 inline-flex items-center rounded-full px-2 py-px text-[9px] font-semibold text-white"
                style={{ background: STATUT_COLORS[niveau.statut] }}
              >
                {STATUT_LABELS[niveau.statut]}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
