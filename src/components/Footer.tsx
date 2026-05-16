import Link from "next/link";

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "Réclamations", href: "/reclamations" },
  { label: "Conflits d'intérêts", href: "/conflits-d-interets" },
];

export default function Footer() {
  return (
    <footer className="bg-cervus-dark text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <span className="font-cormorant text-2xl font-semibold tracking-wide text-white">
              Cervus Patrimoine
            </span>
            <p className="font-inter text-sm text-white/50 max-w-xs leading-relaxed">
              Cabinet indépendant de conseil en gestion de patrimoine.
              <br />
              Conseil personnalisé, stratégies sur mesure.
            </p>
          </div>

          {/* Legal links */}
          <nav className="flex flex-col gap-3">
            <span className="font-inter text-xs text-white/30 uppercase tracking-widest mb-1">
              Informations légales
            </span>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter text-sm text-white/50 hover:text-cervus-gold-light transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-white/30">
            © 2026 Cervus Patrimoine. Tous droits réservés.
          </p>
          <p className="font-inter text-xs text-white/20">
            ORIAS n° 25006770 — Mandataire d&apos;Intermédiaire d&apos;Assurance
          </p>
        </div>
      </div>
    </footer>
  );
}
