"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [offset, setOffset] = useState(20);

  useEffect(() => {
    // prefers-reduced-motion → affichage statique immédiat, aucune animation.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setReduced(true);
      setVisible(true);
      return;
    }

    // Amplitude un peu plus marquée sur mobile, sans devenir voyante.
    setOffset(window.matchMedia("(max-width: 767px)").matches ? 26 : 18);

    const el = ref.current;
    if (!el) return;

    // Fallback si IntersectionObserver indisponible : on affiche.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        // Se déclenche aussi pour les blocs déjà dans le viewport au chargement.
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
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
          : `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
