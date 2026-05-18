import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Simulateurs", href: "/simulateur-per" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "Réclamations", href: "/reclamations" },
  { label: "Conflits d'intérêts", href: "/conflits-d-interets" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 — Brand */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/cervus_logo.svg"
                alt="Cervus Patrimoine"
                width={36}
                height={36}
              />
              <span className="font-cormorant text-xl font-semibold tracking-wide text-white">
                Cervus Patrimoine
              </span>
            </Link>
            <p className="font-inter text-sm text-white/45 leading-relaxed max-w-[220px]">
              Cabinet de gestion de patrimoine indépendant
            </p>
          </div>

          {/* Col 2 — Navigation */}
          <div className="flex flex-col gap-3">
            <span className="font-inter text-[10px] text-white/30 uppercase tracking-[0.12em] mb-1">
              Navigation
            </span>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter text-sm text-white/50 hover:text-[#a07d62] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Col 3 — Légal */}
          <div className="flex flex-col gap-3">
            <span className="font-inter text-[10px] text-white/30 uppercase tracking-[0.12em] mb-1">
              Légal
            </span>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter text-sm text-white/50 hover:text-[#a07d62] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Col 4 — Contact */}
          <div className="flex flex-col gap-3">
            <span className="font-inter text-[10px] text-white/30 uppercase tracking-[0.12em] mb-1">
              Contact
            </span>
            <a
              href="mailto:contact@cervus-patrimoine.fr"
              className="font-inter text-sm text-white/50 hover:text-[#a07d62] transition-colors duration-200"
            >
              contact@cervus-patrimoine.fr
            </a>
            <p className="font-inter text-sm text-white/50">
              +33 (0)7 81 19 67 94
            </p>
            <a
              href={process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-inter text-sm text-[#795D48] hover:text-[#a07d62] transition-colors"
            >
              Prendre rendez-vous →
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-white/25">
            ORIAS n° 25006770 · MIA · © 2026 Cervus Patrimoine · Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
