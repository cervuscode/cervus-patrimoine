"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "Analyse de votre situation fiscale...",
  "Calcul de votre économie d'impôt...",
  "Projection de votre capital retraite...",
];

const DURATION_MS = 3000;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  onNext: () => void;
}

export default function QLoading({ onNext }: Props) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const onNextRef = useRef(onNext);

  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION_MS) * 100, 100);
      setProgress(pct);
      setMsgIndex(Math.min(
        Math.floor((elapsed / DURATION_MS) * MESSAGES.length),
        MESSAGES.length - 1
      ));
      if (elapsed >= DURATION_MS) {
        clearInterval(interval);
        onNextRef.current();
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center justify-center gap-10 pt-16 pb-8">
      {/* Progress circle */}
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#e8e0d8" strokeWidth="5" />
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="#795D48"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-inter text-sm font-semibold text-[#795D48]">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Message */}
      <p className="font-inter text-sm text-[#555555] text-center min-h-[1.5rem]">
        {MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
