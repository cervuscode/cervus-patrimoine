"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Qui sommes-nous", href: "/qui-sommes-nous" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

const simulatorOptions = [
  { emoji: "🧾", label: "Simulateur PER", href: "/simulateur-per" },
  { emoji: "🏠", label: "Simulateur Succession", href: "/simulateur-succession" },
  { emoji: "📈", label: "Simulateur Assurance-vie", href: "/simulateur-av" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSimOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const transparent = !scrolled && !menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-[0_1px_12px_rgba(0,0,0,0.08)]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Image
              src="/cervus_logo.svg"
              alt="Cervus Patrimoine"
              width={40}
              height={40}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span
              className={`font-cormorant text-xl font-semibold tracking-wide transition-colors duration-300 ${
                transparent ? "text-white" : "text-[#0f0f0f]"
              }`}
            >
              Cervus Patrimoine
            </span>
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
              href="/#contact"
              className={`px-5 py-2.5 font-inter text-sm font-medium tracking-wide rounded-sm border transition-colors duration-200 ${
                transparent
                  ? "border-white/40 text-white hover:bg-white/10"
                  : "border-[#795D48] text-[#795D48] hover:bg-[#795D48] hover:text-white"
              }`}
            >
              Prendre RDV
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setSimOpen((v) => !v)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#795D48] text-white font-inter text-sm font-medium tracking-wide rounded-sm hover:bg-[#6a5040] transition-colors duration-200"
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
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    {simulatorOptions.map((opt) => (
                      <Link
                        key={opt.href}
                        href={opt.href}
                        onClick={() => setSimOpen(false)}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-[#f8f5f1] transition-colors font-inter text-sm text-[#0f0f0f]"
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span>{opt.label}</span>
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
            className="lg:hidden bg-white border-t border-[#f0ece6] overflow-hidden"
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

              <div className="border-t border-[#f0ece6] pt-4 flex flex-col gap-3">
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3 border border-[#795D48] text-[#795D48] font-inter text-sm font-medium text-center rounded-sm hover:bg-[#795D48] hover:text-white transition-colors"
                >
                  Prendre RDV
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
                      className="flex items-center gap-3 py-2.5 font-inter text-sm text-[#0f0f0f]/70 hover:text-[#795D48] transition-colors"
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
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
