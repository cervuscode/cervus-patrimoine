"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Délai en secondes (stagger). Ex. index * 0.12 = 120 ms par élément. */
  delay?: number;
}

const EASE = "cubic-bezier(0.34, 1.2, 0.5, 1)";
const DURATION = "650ms";

const HIDDEN = "translateY(48px) scale(0.94)";
const SHOWN = "translateY(0px) scale(1)";

export default function AnimatedSection({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    let revealed = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      // rootMargin bas négatif : le reveal ne part que lorsque le bloc est franchement
      // entré (son haut a dépassé ~80% de la hauteur d'écran), pas dès qu'il pointe en bas.
      // L'observer est la SEULE source de déclenchement au scroll (pas de timeout global).
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);

    // Sécurité ciblée : ne révèle au mount QUE si l'élément est réellement dans le
    // viewport (au-dessus de la ligne de flottaison). Jamais un reveal inconditionnel.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) reveal();

    function reveal() {
      if (revealed) return;
      revealed = true;
      io.disconnect();
      // Double rAF : garantit que l'état caché (opacity 0 + translate + scale) est
      // peint sur une frame AVANT de passer à l'état visible, sinon la transition
      // — notamment sur transform — est sautée et l'élément apparaît d'un coup.
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }

    return () => {
      io.disconnect();
    };
  }, []);

  // reduced-motion : fade simple (opacity uniquement), sans translate/scale.
  const transition = reduced
    ? `opacity ${DURATION} ${EASE} ${delay}s`
    : `opacity ${DURATION} ${EASE} ${delay}s, transform ${DURATION} ${EASE} ${delay}s`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: reduced ? "none" : visible ? SHOWN : HIDDEN,
        transition,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
