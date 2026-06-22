"use client";

/**
 * Toggle « Personne seule / Couple » du MODE AUTONOME des simulateurs conseiller
 * (PER rapide, PER complet, comparateur AV/PER).
 *
 * Raison d'être : en autonome on ne dispose que d'un scalaire `parts`, insuffisant
 * pour distinguer un couple (base 2, jamais de plafonnement QF) d'une personne seule
 * avec enfants (base 1, plafonnement possible). Ce toggle fournit partsBase au
 * moteur → TMI effective correcte. En mode connecté, l'info vient de la fiche.
 */
export default function CoupleToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (couple: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      {[
        { label: "Personne seule", couple: false },
        { label: "Couple", couple: true },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.couple)}
          className={`flex-1 rounded-[50px] border px-3 py-2 text-xs font-medium transition-colors ${
            value === o.couple
              ? "border-cervus-gold bg-cervus-gold text-cervus-bronze"
              : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
