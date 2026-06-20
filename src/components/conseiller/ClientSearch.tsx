"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Hit {
  id: number;
  name: string;
  email: string | null;
}

/**
 * Recherche par CHAMP LIBRE (jamais de dropdown de clients — invariant #5).
 * Résultats en liste textuelle sous le champ, clic pour ouvrir la fiche.
 */
export default function ClientSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/rdv/search?q=${encodeURIComponent(q.trim())}`);
        const json = await res.json();
        setHits(res.ok ? json.results ?? [] : []);
        setTouched(true);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="w-full">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un client (nom, e-mail ou code)…"
        className="w-full rounded-[50px] border border-cervus-gold/40 bg-cervus-dark/60 px-5 py-3 text-base text-cervus-bronze placeholder-cervus-bronze/40 focus:border-cervus-gold focus:outline-none"
        autoComplete="off"
      />

      <div className="mt-3 flex flex-col divide-y divide-cervus-gold/10">
        {loading && <p className="px-1 py-2 text-sm text-cervus-bronze/50">Recherche…</p>}
        {!loading && touched && hits.length === 0 && q.trim().length >= 2 && (
          <p className="px-1 py-2 text-sm text-cervus-bronze/50">Aucun résultat.</p>
        )}
        {hits.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => router.push(`/client/${h.id}`)}
            className="flex flex-col items-start px-1 py-3 text-left hover:bg-cervus-gold/10"
          >
            <span className="text-sm font-medium text-cervus-bronze">{h.name}</span>
            {h.email && <span className="text-xs text-cervus-bronze/50">{h.email}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
