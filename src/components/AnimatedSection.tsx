"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Easing vivant type "ease-out" avec un très léger dépassement (back doux, sans rebond marqué).
const EASE = "cubic-bezier(0.33, 1.2, 0.5, 1)";

export default function AnimatedSection({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [offset, setOffset] = useState(36);

  useEffect(() => {
    // prefers-reduced-motion → affichage statique immédiat, aucune animation.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setReduced(true);
      setVisible(true);
      return;
    }

    // Amplitude un peu plus marquée sur mobile.
    setOffset(window.matchMedia("(max-width: 767px)").matches ? 40 : 36);

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    let revealed = false;
    const io = new IntersectionObserver(
      (entries) => {
        // threshold 0 → se déclenche dès le 1er pixel visible, y compris pour les
        // blocs déjà (partiellement) dans le viewport au chargement.
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    // rAF : garantit que l'état caché est peint avant l'observation (la transition joue).
    const raf = requestAnimationFrame(() => io.observe(el));
    // Sécurité : si l'observer ne se déclenche jamais, on révèle quand même.
    const fallback = setTimeout(() => reveal(), 1200);

    function reveal() {
      if (revealed) return;
      revealed = true;
      setVisible(true);
      io.disconnect();
      clearTimeout(fallback);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${offset}px)`,
        transition: reduced
          ? "none"
          : `opacity 0.6s ${EASE} ${delay}s, transform 0.6s ${EASE} ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
