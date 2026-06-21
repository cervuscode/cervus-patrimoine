"use client";

import { formatEuro } from "@/lib/per-quick";
import { TRANCHES_AFFICHAGE, type ReductionResult } from "@/lib/reduction-impot";

/**
 * Visuel avant/après de l'illustration réduction d'impôt (Lot 6). Deux colonnes
 * empilées (blocs CSS), côte à côte MÊME sur mobile (la comparaison des hauteurs
 * est tout l'intérêt pédagogique). La portion de revenu retirée des tranches
 * hautes est matérialisée par un bloc « fantôme » en pointillés sur la colonne
 * « avec versement ».
 *
 * Rendu PUR à partir de `computeReduction` (chiffres déjà issus du vrai moteur).
 * Source UNIQUE du rendu, partagée par le simulateur ET la vue présentation.
 */
const HAUTEUR_PX = 300;

export default function ReductionStacks({ result }: { result: ReductionResult }) {
  const ref = Math.max(result.revenuAvant, 1);
  const scale = HAUTEUR_PX / ref;
  const ghostPx = result.montantEfface * scale;

  // Libellé du bloc fantôme : nomme la tranche si une seule est concernée.
  const eff = result.tranchesEffacees;
  const ghostLabel =
    eff.length === 1
      ? `−${formatEuro(result.montantEfface)} sortis de la tranche ${eff[0].label}`
      : `−${formatEuro(result.montantEfface)} sortis des tranches hautes`;

  return (
    <div className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-4 sm:p-6">
      <div className="flex items-end justify-center gap-4 sm:gap-10">
        <Colonne
          titre="Sans versement"
          slices={result.slicesAvant}
          scale={scale}
          impot={result.avant.impotNet}
        />
        <Colonne
          titre="Avec versement"
          slices={result.slicesApres}
          scale={scale}
          impot={result.apres.impotNet}
          ghostPx={ghostPx > 1 ? ghostPx : 0}
          ghostLabel={ghostLabel}
        />
      </div>

      {/* Légende des tranches (couleur = taux) */}
      <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-cervus-bronze/60">
        {TRANCHES_AFFICHAGE.map((t) => (
          <span key={t.taux} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-[3px] border border-cervus-gold/20"
              style={{ background: t.color }}
            />
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Colonne({
  titre,
  slices,
  scale,
  impot,
  ghostPx = 0,
  ghostLabel,
}: {
  titre: string;
  slices: { taux: number; label: string; color: string; montant: number }[];
  scale: number;
  impot: number;
  ghostPx?: number;
  ghostLabel?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2" style={{ maxWidth: 150 }}>
      <div
        className="flex w-full flex-col-reverse"
        style={{ height: HAUTEUR_PX }}
      >
        {/* Blocs par tranche (du bas vers le haut) */}
        {slices.map((s) => {
          const h = s.montant * scale;
          // Texte lisible : sombre sur tranches claires, crème sur tranches foncées.
          const dark = s.taux <= 0.11;
          return (
            <div
              key={s.taux}
              className="flex items-center justify-center overflow-hidden text-[10px] leading-tight"
              style={{ height: h, background: s.color, color: dark ? "#5D4738" : "#F2EDE8" }}
            >
              {h >= 22 && (
                <span className="px-1 text-center">
                  {s.label} · {formatEuro(s.montant)}
                </span>
              )}
            </div>
          );
        })}

        {/* Bloc fantôme : portion sortie des tranches hautes (en pointillés). */}
        {ghostPx > 0 && (
          <div
            className="mb-1 flex items-center justify-center rounded-[6px] border border-dashed border-cervus-gold/60 px-1 text-center text-[9px] leading-tight text-cervus-bronze/50"
            style={{ height: Math.max(ghostPx, 18) }}
          >
            {ghostLabel}
          </div>
        )}
      </div>

      <span className="text-xs text-cervus-bronze/60">{titre}</span>
      <span className="font-cormorant text-lg text-cervus-bronze">{formatEuro(impot)}</span>
    </div>
  );
}
