"use client";

import { computePlafondPER } from "@/lib/per-quick";
import { formatEuro } from "@/lib/per-quick";

/**
 * Plafond de déductibilité PER — affichage informatif + alerte NON BLOQUANTE.
 * OUTIL CONSEILLER UNIQUEMENT (jamais le site public). Le conseiller peut continuer à
 * saisir n'importe quel versement : l'alerte informe, elle ne bloque pas et ne plafonne
 * rien. Reliquats des 3 années précédentes : mentionnés, jamais calculés (non dispo).
 *
 * `revenuImposable` − `foncier` = assiette professionnelle (conforme DGFiP).
 * `versementAnnuel` = versement mensuel × 12 + apport initial.
 */
export default function PlafondPerAlert({
  revenuImposable,
  foncier = 0,
  versementAnnuel,
}: {
  revenuImposable: number;
  foncier?: number;
  versementAnnuel: number;
}) {
  const proNet = Math.max(0, (revenuImposable || 0) - (foncier || 0));
  const r = computePlafondPER(proNet, versementAnnuel);

  return (
    <section
      className={`rounded-2xl border p-4 text-sm ${
        r.depassement
          ? "border-amber-500/50 bg-amber-500/10"
          : "border-cervus-gold/20 bg-cervus-dark/40"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-cervus-bronze/70">Plafond de déduction PER (estimation)</span>
        <span className="font-cormorant text-xl font-semibold text-cervus-bronze">
          {formatEuro(r.plafond)}
        </span>
      </div>
      {r.depassement ? (
        <p className="mt-2 text-amber-300/90">
          ⚠️ Le versement annuel de <b>{formatEuro(r.versementAnnuel)}</b> dépasse le plafond
          de <b>{formatEuro(r.depassementMontant)}</b>. La fraction excédentaire n&apos;est pas
          déductible cette année (sauf reliquats disponibles).
        </p>
      ) : (
        <p className="mt-2 text-cervus-bronze/55">
          Versement annuel estimé {formatEuro(r.versementAnnuel)} — dans la limite déductible.
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-cervus-bronze/40">
        Plafond = max(10 % des revenus pro nets ; 10 % du PASS), dans la limite de 10 % de
        8 PASS (PASS 2025). Assiette hors revenus fonciers. Ce plafond peut être augmenté des
        <b> reliquats non utilisés des 3 années précédentes</b> (figurant sur l&apos;avis
        d&apos;imposition) — non pris en compte ici.
      </p>
    </section>
  );
}
