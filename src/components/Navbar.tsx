"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Simulateur PER", href: "/simulateur-per" },
  { label: "Qui sommes-nous", href: "/qui-sommes-nous" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cervus-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:scale-105"
            >
              {/* Cerf SVG simple */}
              {/* Corps */}
              <ellipse cx="18" cy="24" rx="7" ry="8" fill="#795D48" />
              {/* Tête */}
              <ellipse cx="18" cy="13" rx="4" ry="4.5" fill="#795D48" />
              {/* Cou */}
              <rect x="15.5" y="16" width="5" height="5" rx="1" fill="#795D48" />
              {/* Bois gauche */}
              <line x1="14" y1="10" x2="10" y2="4" stroke="#795D48" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="4" x2="8" y2="6" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="4" x2="12" y2="6" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
              {/* Bois droit */}
              <line x1="22" y1="10" x2="26" y2="4" stroke="#795D48" strokeWidth="2" strokeLinecap="round" />
              <line x1="26" y1="4" x2="28" y2="6" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="26" y1="4" x2="24" y2="6" stroke="#795D48" strokeWidth="1.5" strokeLinecap="round" />
              {/* Pattes */}
              <line x1="14" y1="30" x2="13" y2="35" stroke="#795D48" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="30" x2="23" y2="35" stroke="#795D48" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-cormorant text-xl font-semibold tracking-wide text-cervus-dark">
              Cervus Patrimoine
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-inter text-sm text-cervus-dark/70 hover:text-cervus-gold transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="ml-4 px-5 py-2.5 bg-cervus-gold text-white font-inter text-sm font-medium tracking-wide rounded hover:bg-cervus-gold-light transition-colors duration-200"
            >
              Prendre RDV
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 bg-cervus-dark transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-cervus-dark transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-cervus-dark transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-cervus-cream px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-inter text-sm text-cervus-dark/70 hover:text-cervus-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-5 py-2.5 bg-cervus-gold text-white font-inter text-sm font-medium text-center rounded hover:bg-cervus-gold-light transition-colors"
          >
            Prendre RDV
          </Link>
        </div>
      )}
    </header>
  );
}
