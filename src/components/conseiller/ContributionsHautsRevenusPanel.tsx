"use client";

import { useRdvClient } from "./RdvClientProvider";

/**
 * Bloc CEHR / CDHR du panneau persistant (Chantier C). Visible UNIQUEMENT si le foyer
 * est concerné (RFR > 250 000 € seul / 500 000 € couple) — sinon rien (pas de section
 * vide). Affiche RFR utilisé (estimé/réel), CEHR, CDHR (estimation) et le total
 * IR + CEHR + CDHR. Lecture seule : aucune écriture Pipedrive.
 */
function euro(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}

export default function ContributionsHautsRevenusPanel() {
  const { contributionsHR } = useRdvClient();
  if (!contributionsHR.concerne) return null;

  const { rfr, rfrEstime, cehr, cdhr } = contributionsHR;
  // impositionReconstituee = IR + CEHR + majoration foyer → on isole l'IR réel.
  const ir = Math.max(0, cdhr.impositionReconstituee - cehr.contribution - cdhr.majorationFoyer);
  const total = ir + cehr.contribution + cdhr.contribution;

  return (
    <section className="rounded-xl border border-cervus-gold/25 bg-cervus-gold/5 p-3 text-xs">
      <p className="mb-2 font-medium uppercase tracking-wide text-cervus-gold-light">
        Contributions hauts revenus
      </p>
      <Row
        label="RFR retenu"
        value={euro(rfr)}
        note={rfrEstime ? "estimé" : "réel (avis d'imposition)"}
      />
      <Row label="CEHR" value={euro(cehr.contribution)} />
      <Row label="CDHR" value={euro(cdhr.contribution)} note="estimation — RFR retraité approximé" />
      <div className="mt-2 border-t border-cervus-gold/20 pt-2">
        <Row label="Total IR + CEHR + CDHR" value={euro(total)} strong />
      </div>
      {cdhr.majorationFoyer > 0 && (
        <p className="mt-1.5 text-[10px] leading-snug text-cervus-bronze/45">
          Majoration CDHR estimée sur le nombre d&apos;enfants.
        </p>
      )}
    </section>
  );
}

function Row({
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
      <span className={strong ? "font-semibold text-cervus-bronze" : "text-cervus-bronze/90"}>{value}</span>
    </div>
  );
}
