"use client";

import { SECTION_LABELS, fieldsBySection, type RdvFieldDef } from "@/lib/rdv-fields";
import { useRdvClient } from "./RdvClientProvider";
import DiscoveryField from "./DiscoveryField";
import NotesField from "./NotesField";

/**
 * Rendu d'UNE section de champs Découverte RDV (refonte fiche : composition pilotée
 * par `ClientView` pour intercaler Notes en tête et l'encadré fiscal au milieu).
 * Les champs portés par le Deal ne sont éditables que si un deal actif est sélectionné.
 */
export function DiscoverySection({ section }: { section: RdvFieldDef["section"] }) {
  const { activeDealId } = useRdvClient();
  const fields = fieldsBySection(section);
  const hasDealField = fields.some((f) => f.entity === "deal");

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
        {SECTION_LABELS[section]}
      </h3>
      {hasDealField && activeDealId == null && (
        <p className="text-[11px] text-cervus-bronze/40">
          Sélectionnez un dossier pour éditer les champs liés au produit.
        </p>
      )}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {fields.map((f) =>
          f.entity === "deal" && activeDealId == null ? null : (
            <DiscoveryField key={f.id} fieldId={f.id} />
          )
        )}
      </div>
    </section>
  );
}

/** Section Notes (mécanisme œil/flou/re-floutage inchangé), positionnée par ClientView. */
export function NotesSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-cervus-gold-light">
        Notes
      </h3>
      <NotesField />
    </section>
  );
}
