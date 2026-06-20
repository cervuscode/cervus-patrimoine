"use client";

import { useState } from "react";

export default function CopyButton({
  value,
  label = "Copier",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponible (contexte non sécurisé) → on ignore silencieusement
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copier ${value}`}
      className={`inline-flex items-center gap-1.5 rounded-[50px] border border-cervus-gold/50 px-3 py-1 text-xs font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold/20 ${className}`}
    >
      {copied ? "Copié !" : label}
    </button>
  );
}
