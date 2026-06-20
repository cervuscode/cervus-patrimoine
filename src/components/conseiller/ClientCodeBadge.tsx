"use client";

import CopyButton from "./CopyButton";

/** Code client en évidence (jamais le nom sur les vues partageables, MD §4.2). */
export default function ClientCodeBadge({ code }: { code: string | null }) {
  if (!code) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-xl bg-cervus-gold/20 px-4 py-1.5 font-cormorant text-3xl font-semibold tracking-wide text-cervus-bronze">
        {code}
      </span>
      <CopyButton value={code} />
    </div>
  );
}
