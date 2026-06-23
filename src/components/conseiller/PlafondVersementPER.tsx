"use client";

import { useRdvClient } from "./RdvClientProvider";
import PlafondPerAlert from "./PlafondPerAlert";
import { formatEuro } from "@/lib/per-quick";

/**
 * Bloc « Plafond de versement PER » de la fiche client (Lot 8) — section Épargne,
 * juste après les champs versement PER, avant Patrimoine financier.
 *
 * Switch TNS (iOS, Tailwind pur, charte Cervus) = UNIQUE déclencheur du calcul Madelin
 * (indépendant du champ texte « Statut professionnel »). Persisté via le champ Découverte
 * `estTNS` ("Oui"/vide). Affichage conditionnel salarié seul / salarié + Madelin + cumul.
 * Alerte non bloquante de dépassement (réutilise PlafondPerAlert avec le plafond total).
 *
 * OUTIL CONSEILLER UNIQUEMENT. Consomme `plafondPER` déjà calculé dans le contexte ;
 * AUCUN nouveau calcul, AUCUNE écriture (hors switch sauvegardé via la SaveBar).
 */
export default function PlafondVersementPER() {
  const { client, fiscalState, plafondPER, estTNS, setEstTNS, getValue } = useRdvClient();

  // Affiché seulement si un client est chargé (revenu peut être 0 pour un TNS pur).
  if (!client) return null;

  const num = (id: string): number => {
    const v = parseFloat(String(getValue(id) ?? "").replace(",", "."));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  const versementAnnuel = num("versementMensuel") * 12 + num("versementInitial");

  const { plafondSalarie, plafondTNS, plafondTotal } = plafondPER;
  const hasRevenu = fiscalState.revenuNetImposable > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
          Plafond de versement PER
        </h3>
        {/* Switch TNS iOS */}
        <button
          type="button"
          role="switch"
          aria-checked={estTNS}
          aria-label="Travailleur non salarié (TNS)"
          onClick={() => setEstTNS(!estTNS)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors ${
            estTNS
              ? "border-cervus-gold bg-cervus-gold"
              : "border-cervus-gold/30 bg-cervus-dark/60"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-cervus-cream shadow transition-transform ${
              estTNS ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <label
        className="-mt-2 flex cursor-pointer items-center justify-end gap-2 text-xs text-cervus-bronze/60"
        onClick={() => setEstTNS(!estTNS)}
      >
        TNS / Travailleur non salarié
      </label>

      <div className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-4 text-sm">
        {!estTNS ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-cervus-bronze/70">
              Plafond de déductibilité PER
              <span className="ml-1 text-[11px] text-cervus-bronze/40">
                (10 % du revenu net imposable)
              </span>
            </span>
            <span className="font-cormorant text-xl font-semibold text-cervus-bronze">
              {formatEuro(plafondTotal)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Row label="Plafond salarié" value={formatEuro(plafondSalarie)} />
            <Row label="Plafond Madelin (TNS)" value={formatEuro(plafondTNS)} />
            <div className="mt-1 border-t border-cervus-gold/20 pt-1.5">
              <Row label="Plafond total cumulé" value={formatEuro(plafondTotal)} strong />
            </div>
          </div>
        )}
        {!hasRevenu && (
          <p className="mt-2 text-[11px] text-cervus-bronze/40">
            Revenu non renseigné — le plafond salarié est ramené au plancher (10 % du PASS).
          </p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-cervus-bronze/40">
          {estTNS
            ? "Plafond Madelin = 10 % du bénéfice (BNC + BIC) + 15 % de la fraction entre 1 et 8 PASS, dans la limite de 8 PASS, plancher 10 % du PASS (PASS 2026)."
            : "Plafond = max(10 % des revenus pro nets ; 10 % du PASS), dans la limite de 10 % de 8 PASS (PASS 2026). Assiette hors revenus fonciers."}{" "}
          Ce plafond peut être augmenté des <b>reliquats non utilisés des 3 années précédentes</b>{" "}
          (figurant sur l&apos;avis d&apos;imposition) — non pris en compte ici.
        </p>
      </div>

      {/* Alerte de dépassement (non bloquante) comparée au plafond TOTAL cumulé. */}
      {versementAnnuel > 0 && (
        <PlafondPerAlert
          versementAnnuel={versementAnnuel}
          plafondOverride={plafondTotal}
          footnote={
            estTNS
              ? "Plafonds salarié et Madelin (TNS) cumulés. Reliquats des 3 années précédentes non pris en compte."
              : undefined
          }
        />
      )}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-cervus-bronze/60">{label}</span>
      <span
        className={
          strong
            ? "font-cormorant text-xl font-semibold text-cervus-bronze"
            : "text-cervus-bronze/90"
        }
      >
        {value}
      </span>
    </div>
  );
}
