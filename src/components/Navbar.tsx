"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Qui sommes-nous", href: "/qui-sommes-nous" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

const simulatorOptions = [
  { label: "Simulateur PER", href: "/simulateur-per" },
  { label: "Simulateur Assurance-vie", href: "/simulateur-assurance-vie" },
  { label: "Calcul intérêts composés", href: "/simulateur-interets-composes" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  // Seule la page d'accueil a un hero sombre : la navbar transparente (texte/logo
  // blancs) n'est lisible qu'au-dessus de ce fond. Partout ailleurs (fonds blancs),
  // on garde la navbar en mode plein (fond crème, texte foncé) dès le haut de page.
  const hasDarkHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openSim = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSimOpen(true);
  };

  const closeSim = () => {
    closeTimer.current = setTimeout(() => setSimOpen(false), 150);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const transparent = hasDarkHero && !scrolled && !menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        !transparent ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
      }`}
      style={{ backgroundColor: transparent ? "transparent" : "#F2EDE8" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src="/cervus_logo.png"
              alt="Cervus Patrimoine"
              width={500}
              height={500}
              className={`h-14 w-auto transition-[transform,filter] duration-300 group-hover:scale-105 ${
                transparent ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-inter text-sm tracking-wide transition-colors duration-200 ${
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#0f0f0f]/65 hover:text-[#795D48]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/reserver"
              className={`px-[28px] py-[12px] font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] border-[1.5px] transition-colors duration-200 ${
                transparent
                  ? "border-white/40 text-white hover:bg-white/10"
                  : "border-[#795D48] text-[#795D48] hover:bg-[#795D48] hover:text-white"
              }`}
            >
              Prendre rendez-vous
            </Link>

            {/* Simulation — hover dropdown */}
            <div
              className="relative"
              onMouseEnter={openSim}
              onMouseLeave={closeSim}
            >
              <button
                className="flex items-center gap-2 px-[28px] py-[12px] bg-[#795D48] text-white font-inter text-sm font-medium tracking-[0.03em] rounded-[50px] hover:bg-[#6a5040] transition-colors duration-200"
                aria-expanded={simOpen}
              >
                Faire une simulation
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-200 ${simOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {simOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onMouseEnter={openSim}
                    onMouseLeave={closeSim}
                    className="absolute right-0 top-full mt-2 w-64 p-2 rounded-[16px] border border-[#D4C9BE]/60"
                    style={{
                      backgroundColor: "#F2EDE8",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    }}
                  >
                    {simulatorOptions.map((opt) => (
                      <Link
                        key={opt.href}
                        href={opt.href}
                        onClick={() => setSimOpen(false)}
                        className="block px-4 py-3 rounded-[10px] font-inter text-sm text-[#0f0f0f] hover:bg-[#795D48] hover:text-white transition-colors duration-150"
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {[
              menuOpen ? "rotate-45 translate-y-2" : "",
              menuOpen ? "opacity-0" : "",
              menuOpen ? "-rotate-45 -translate-y-2" : "",
            ].map((cls, i) => (
              <span
                key={i}
                className={`block w-6 h-0.5 transition-all duration-200 ${
                  transparent ? "bg-white" : "bg-[#0f0f0f]"
                } ${cls}`}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden border-t border-[#D4C9BE]/60 overflow-hidden"
            style={{ backgroundColor: "#F2EDE8" }}
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-inter text-sm text-[#0f0f0f]/70 hover:text-[#795D48] transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-[#D4C9BE]/60 pt-4 flex flex-col gap-3">
                <Link
                  href="/reserver"
                  onClick={() => setMenuOpen(false)}
                  className="px-[28px] py-[12px] border-[1.5px] border-[#795D48] text-[#795D48] font-inter text-sm font-medium text-center rounded-[50px] hover:bg-[#795D48] hover:text-white transition-colors duration-200"
                >
                  Prendre rendez-vous
                </Link>

                <div className="flex flex-col gap-1">
                  <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.12em] mb-1">
                    Simulateurs
                  </p>
                  {simulatorOptions.map((opt) => (
                    <Link
                      key={opt.href}
                      href={opt.href}
                      onClick={() => setMenuOpen(false)}
                      className="py-2.5 px-3 rounded-[10px] font-inter text-sm text-[#0f0f0f]/70 hover:bg-[#795D48] hover:text-white transition-colors duration-150"
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
