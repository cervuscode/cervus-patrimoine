import Link from "next/link";
import { CONSEILLER_SIMS } from "@/lib/conseiller-sims";

/**
 * Grille d'accès rapide aux simulateurs conseiller (accueil). Lit le registre
 * `conseiller-sims.ts` → ajouter un simulateur = ajouter une entrée, pas de refonte.
 *
 * `personId` optionnel : si fourni, les cartes pointent vers le mode CONNECTÉ
 * (depuis une fiche client) ; sinon vers le mode AUTONOME (depuis l'accueil).
 */
export default function SimulateurGrid({ personId }: { personId?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CONSEILLER_SIMS.map((sim) => {
        const href = personId != null ? sim.clientHref(personId) : sim.autonomousHref;
        if (!sim.available) {
          return (
            <div
              key={sim.id}
              className="cursor-not-allowed rounded-2xl border border-cervus-gold/15 bg-cervus-dark/40 p-4 opacity-50"
            >
              <p className="font-cormorant text-xl text-cervus-bronze">{sim.label}</p>
              <p className="mt-1 text-xs text-cervus-bronze/60">Bientôt disponible</p>
            </div>
          );
        }
        return (
          <Link
            key={sim.id}
            href={href}
            className="group rounded-2xl border border-cervus-gold/30 bg-cervus-dark/60 p-4 transition-colors hover:border-cervus-gold hover:bg-cervus-gold/10"
          >
            <div className="flex items-center justify-between">
              <p className="font-cormorant text-xl text-cervus-bronze">{sim.label}</p>
              <span className="text-cervus-gold-light transition-transform group-hover:translate-x-0.5">→</span>
            </div>
            <p className="mt-1 text-xs text-cervus-bronze/60">{sim.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
