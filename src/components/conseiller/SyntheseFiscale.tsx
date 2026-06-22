"use client";

import Link from "next/link";
import { useRdvClient } from "./RdvClientProvider";
import { impotReel } from "@/lib/fiscal-engine";
import { partsPourDecomposition } from "@/lib/fiscal-state";
import { decoupeParTranche } from "@/lib/reduction-impot";

/**
 * Encadré fiscal de synthèse de la fiche client (refonte — remplace la ligne
 * fiscale + le bloc CEHR/CDHR de l'ancien panneau persistant).
 *
 * Affiché UNIQUEMENT si un client est chargé et que le revenu net imposable > 0.
 * Consomme l'état déjà calculé dans le contexte (`fiscalState`, `contributionsHR`),
 * réutilise `impotReel` (fiscal-engine, lecture seule) et `decoupeParTranche` /
 * couleurs charte de `reduction-impot`. AUCUN nouveau calcul, AUCUNE écriture.
 */
function euro(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}

/** Couleur de texte lisible selon le fond de la chip (charte : clair → texte sombre). */
function chipText(color: string): string {
  // Tranches claires (crème / bronze clair) → texte sombre ; foncées → texte crème.
  return color === "#F2EDE8" || color === "#a07d62" ? "#3a2c22" : "#F2EDE8";
}

export default function SyntheseFiscale() {
  const { client, fiscalState, contributionsHR } = useRdvClient();
  if (!client || fiscalState.revenuNetImposable <= 0) return null;

  const { revenuNetImposable, partsBase, partsTotal, tmi } = fiscalState;
  const impotNet = Math.round(impotReel(revenuNetImposable, partsBase, partsTotal));
  const tauxMoyen = revenuNetImposable > 0 ? (impotNet / revenuNetImposable) * 100 : 0;
  // Décomposition par tranche sur la base de parts cohérente avec la TMI : quand le
  // plafonnement du quotient familial mord, on décompose sur partsBase (sinon les
  // seuils ×partsTotal masquent la tranche marginale réelle, ex. 45 %).
  const slices = decoupeParTranche(revenuNetImposable, partsPourDecomposition(fiscalState));

  // CEHR/CDHR — repris à l'identique de l'ancien ContributionsHautsRevenusPanel.
  const concerne = contributionsHR.concerne;
  const { rfr, rfrEstime, cehr, cdhr } = contributionsHR;
  const irHR = Math.max(0, cdhr.impositionReconstituee - cehr.contribution - cdhr.majorationFoyer);
  const totalHR = irHR + cehr.contribution + cdhr.contribution;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-cervus-gold/25 bg-cervus-gold/5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
          Synthèse fiscale
        </h3>
        <Link
          href="/reference-fiscale"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cervus-gold-light hover:text-cervus-bronze"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
          Référence 2026
        </Link>
      </div>

      {/* 3 chiffres clés */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <KeyFigure label="Impôt net" value={euro(impotNet)} />
        <KeyFigure label="TMI effective" value={`${tmi} %`} />
        <KeyFigure label="Taux moyen" value={`${tauxMoyen.toFixed(1).replace(".", ",")} %`} />
      </div>

      {/* Répartition du revenu par tranche (chips colorées, couleurs charte) */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-cervus-bronze/50">
          Répartition du revenu par tranche
        </p>
        <div className="flex flex-wrap gap-2">
          {slices.map((s) => (
            <div
              key={s.taux}
              className="flex min-w-[64px] flex-col items-center rounded-lg px-2.5 py-1.5"
              style={{ backgroundColor: s.color, color: chipText(s.color) }}
            >
              <span className="text-[11px] font-semibold leading-tight">{s.label}</span>
              <span className="text-xs leading-tight">{euro(s.montant)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contributions hauts revenus — affichées seulement si le foyer est concerné */}
      {concerne && (
        <div className="flex flex-col gap-1 border-t border-cervus-gold/20 pt-3 text-xs">
          <p className="mb-1 font-medium uppercase tracking-wide text-cervus-gold-light">
            Contributions hauts revenus
          </p>
          <HRRow
            label="RFR retenu"
            value={euro(rfr)}
            note={rfrEstime ? "estimé" : "réel (avis d'imposition)"}
          />
          <HRRow label="CEHR" value={euro(cehr.contribution)} />
          <HRRow
            label="CDHR"
            value={euro(cdhr.contribution)}
            note="estimation — RFR retraité approximé"
          />
          <div className="mt-1 border-t border-cervus-gold/20 pt-1.5">
            <HRRow label="Total IR + CEHR + CDHR" value={euro(totalHR)} strong />
          </div>
          {cdhr.majorationFoyer > 0 && (
            <p className="mt-1 text-[10px] leading-snug text-cervus-bronze/45">
              Majoration CDHR estimée sur le nombre d&apos;enfants.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function KeyFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-cervus-dark/40 px-2 py-2.5 text-center sm:px-3">
      <span className="text-[10px] uppercase tracking-wide text-cervus-bronze/50 sm:text-[11px]">
        {label}
      </span>
      <span className="font-cormorant text-xl text-cervus-bronze sm:text-2xl">{value}</span>
    </div>
  );
}

function HRRow({
  label,
  value,
  note,
  strong,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-cervus-bronze/60">
        {label}
        {note && <span className="ml-1 text-[10px] text-cervus-bronze/40">({note})</span>}
      </span>
      <span className={strong ? "font-semibold text-cervus-bronze" : "text-cervus-bronze/90"}>
        {value}
      </span>
    </div>
  );
}
