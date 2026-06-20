"use client";

import { SECTION_ORDER, SECTION_LABELS, fieldsBySection } from "@/lib/rdv-fields";
import { useRdvClient } from "./RdvClientProvider";
import DiscoveryField from "./DiscoveryField";
import NotesField from "./NotesField";

/**
 * Toutes les sections de champs Découverte RDV (Simulation pré-remplit l'affichage).
 * Les champs portés par le Deal ne sont éditables que si un deal actif est sélectionné.
 * `compact` : 1 colonne (panneau) ; sinon grille responsive (page).
 */
export default function DiscoverySections({ compact = false }: { compact?: boolean }) {
  const { activeDealId } = useRdvClient();
  const grid = compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="flex flex-col gap-6">
      {SECTION_ORDER.map((section) => {
        const fields = fieldsBySection(section);
        const hasDealField = fields.some((f) => f.entity === "deal");
        return (
          <section key={section} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
              {SECTION_LABELS[section]}
            </h3>
            {hasDealField && activeDealId == null && (
              <p className="text-[11px] text-cervus-bronze/40">
                Sélectionnez un dossier pour éditer les champs liés au produit.
              </p>
            )}
            <div className={`grid gap-3 ${grid}`}>
              {fields.map((f) =>
                f.entity === "deal" && activeDealId == null ? null : (
                  <DiscoveryField key={f.id} fieldId={f.id} />
                )
              )}
            </div>
          </section>
        );
      })}

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
          Notes
        </h3>
        <NotesField />
      </section>
    </div>
  );
}
