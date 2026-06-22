"use client";

import { formatEuro } from "@/lib/per-quick";
import type { ComparateurResult } from "@/lib/comparateur-av-per";

/**
 * Visuel du comparateur AV / PER (Lot 7) : deux barres côte à côte (PER net vs AV
 * net), même échelle → la plus haute gagne visuellement. Le produit gagnant est
 * surligné (ou les deux en « équivalent » si quasi-parité). Blocs CSS, mobile-first
 * (côte à côte même sur petit écran : la comparaison des hauteurs est l'intérêt).
 *
 * Rendu PUR à partir de `computeComparateur`. Source unique partagée par le
 * simulateur ET la vue présentation.
 */
const HAUTEUR_PX = 240;

export default function ComparateurStacks({ result }: { result: ComparateurResult }) {
  const ref = Math.max(result.per.capitalNet, result.av.capitalNetSans, 1);
  const scale = HAUTEUR_PX / ref;
  const egal = result.gagnant === "egal";

  return (
    <div className="rounded-2xl border border-cervus-gold/20 bg-cervus-dark/40 p-4 sm:p-6">
      <div className="flex items-end justify-center gap-6 sm:gap-12">
        <Barre
          titre="PER"
          montant={result.per.capitalNet}
          hauteur={result.per.capitalNet * scale}
          gagnant={result.gagnant === "per" || egal}
          sous="capital net en sortie"
        />
        <Barre
          titre="Assurance-vie"
          montant={result.av.capitalNetSans}
          hauteur={result.av.capitalNetSans * scale}
          gagnant={result.gagnant === "av" || egal}
          sous="capital net au terme"
        />
      </div>
      <p className="mt-4 text-center text-[11px] text-cervus-bronze/45">
        À effort net identique · profil {profilLabel(result)} · horizon égal · capital net après
        fiscalité de sortie.
      </p>
    </div>
  );
}

function profilLabel(r: ComparateurResult): string {
  return `${Math.round(r.taux * 100)} %/an`;
}

function Barre({
  titre,
  montant,
  hauteur,
  gagnant,
  sous,
}: {
  titre: string;
  montant: number;
  hauteur: number;
  gagnant: boolean;
  sous: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2" style={{ maxWidth: 150 }}>
      <span className="font-cormorant text-lg font-semibold text-cervus-bronze">
        {formatEuro(montant)}
      </span>
      <div className="flex w-full items-end justify-center" style={{ height: HAUTEUR_PX }}>
        <div
          className={`w-full rounded-t-lg transition-all ${
            gagnant ? "bg-cervus-gold" : "bg-cervus-gold/30"
          }`}
          style={{ height: Math.max(hauteur, 4) }}
        />
      </div>
      <span className="text-sm font-medium text-cervus-bronze">{titre}</span>
      <span className="text-[11px] text-cervus-bronze/50">{sous}</span>
    </div>
  );
}
