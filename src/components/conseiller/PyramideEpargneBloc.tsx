"use client";

import { useMemo } from "react";
import { computePyramide } from "@/lib/pyramide-epargne";
import { formatEuro } from "@/lib/per-quick";
import { useRdvClient } from "./RdvClientProvider";
import PyramidsView from "./PyramidsView";

/**
 * Bloc « Pyramide de l'épargne » inline sur la fiche client (Lot 9). Comme
 * SyntheseFiscale / PlafondVersementPER : lit le contexte (patrimoine financier
 * déjà mémoïsé) et affiche les deux pyramides en lecture directe. Affiché seulement
 * si un client est chargé ET qu'il existe un patrimoine financier renseigné.
 *
 * Le scénario éditable « et si… » reste accessible via le simulateur connecté
 * (bouton « Pyramide de l'épargne » de la fiche).
 */
export default function PyramideEpargneBloc() {
  const { client, patrimoineFinancier } = useRdvClient();
  const result = useMemo(
    () => computePyramide(patrimoineFinancier),
    [patrimoineFinancier]
  );

  if (!client || result.patrimoineTotal <= 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-cervus-gold/30 bg-cervus-dark/40 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-cormorant text-xl font-semibold text-cervus-bronze">
          Pyramide de l&apos;épargne
        </h3>
        <p className="text-xs text-cervus-bronze/55">
          Répartition réelle du patrimoine financier face à une cible de bon sens.
        </p>
      </div>

      <PyramidsView result={result} />

      {result.ciblePrecaution !== null && (
        <p className="text-center text-xs text-cervus-bronze/55">
          Cible de précaution : {formatEuro(result.ciblePrecaution)}
          {result.surplus > 0 && <> · surplus à investir {formatEuro(result.surplus)}</>}.
        </p>
      )}
    </section>
  );
}
