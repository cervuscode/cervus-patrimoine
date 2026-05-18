import type { Metadata } from "next";
import Link from "next/link";
import SimulateurForm from "./components/SimulateurForm";

export const metadata: Metadata = {
  title: "Simulateur PER — Cervus Patrimoine",
  description:
    "Calculez votre économie d'impôt PER et projetez votre capital retraite. Simulation gratuite et personnalisée — Cervus Patrimoine.",
};

export default function SimulateurPERPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F2EDE8" }}>
      {/* Minimal header */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-[#D4C9BE]/60" style={{ backgroundColor: "#F2EDE8" }}>
        <Link href="/" className="font-cormorant text-xl font-semibold text-cervus-dark tracking-wide">
          Cervus Patrimoine
        </Link>
        <span className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest hidden sm:block">
          Simulateur PER
        </span>
      </header>

      {/* Form wrapper */}
      <main className="flex-1 flex items-start justify-center py-10 px-6">
        <div className="w-full max-w-xl">
          <SimulateurForm />
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="w-full px-6 py-4 border-t border-[#D4C9BE]/60 text-center" style={{ backgroundColor: "#F2EDE8" }}>
        <p className="font-inter text-[10px] text-cervus-dark/30">
          © 2026 Cervus Patrimoine · ORIAS n° 25006770 ·{" "}
          <Link href="/mentions-legales" className="underline hover:text-cervus-gold transition-colors">
            Mentions légales
          </Link>
          {" · "}
          <Link href="/politique-de-confidentialite" className="underline hover:text-cervus-gold transition-colors">
            Confidentialité
          </Link>
        </p>
      </footer>
    </div>
  );
}
