"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { CONSEILLER_SIMS } from "@/lib/conseiller-sims";
import {
  PRESENT_MSG_IDENTITY,
  PRESENT_MSG_RECORD,
  PRESENT_MSG_REQUEST,
  type ClientIdentity,
  type DecodedPresentation,
  type HypoValues,
} from "@/lib/presentation-bridge";
import type { SimRecordDraft } from "@/lib/sim-history";
import PerQuickPresentation from "./presentation/PerQuickPresentation";
import PerFullPresentation from "./presentation/PerFullPresentation";

// Map id de simulateur → vue de présentation. Ajouter un simulateur présentable =
// ajouter une entrée ici (+ son entrée dans le registre conseiller-sims.ts).
type PresentationView = ComponentType<{
  identity: ClientIdentity;
  hypo: HypoValues;
  onHypo: <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => void;
  /** Lot 3 : remonte la variante courante vers l'opener au clic (renvoie false si fiche fermée). */
  onRecord: (draft: SimRecordDraft) => boolean;
}>;

const VIEWS: Record<string, PresentationView> = {
  per: PerQuickPresentation,
  "per-complet": PerFullPresentation,
};

// Simulateurs réellement présentables (disponibles + ayant une vue).
const PRESENTABLE = CONSEILLER_SIMS.filter((s) => s.available && VIEWS[s.id]);

/**
 * Espace « Présentations clients » (Lot F) — LA seule surface partagée en visio.
 * Menu de navigation entre simulateurs DANS le même onglet. Identité partagée
 * (lecture seule, rapatriable via Actualiser) ; hypothèses propres à chaque
 * simulateur (éditables, jamais écrasées par Actualiser).
 */
export default function PresentationSpace({ initial }: { initial: DecodedPresentation }) {
  const [identity, setIdentity] = useState<ClientIdentity>(initial.identity);
  // Chaque simulateur démarre avec le même seed d'hypothèses (issu de la fiche),
  // puis diverge selon les éditions locales.
  const [hypoBySim, setHypoBySim] = useState<Record<string, HypoValues>>(() =>
    Object.fromEntries(PRESENTABLE.map((s) => [s.id, { ...initial.hypo }]))
  );
  const [activeSim, setActiveSim] = useState<string>(
    VIEWS[initial.activeSim] ? initial.activeSim : PRESENTABLE[0]?.id ?? "per"
  );
  const [status, setStatus] = useState<"idle" | "refreshing">("idle");
  const [notice, setNotice] = useState<string | null>(null);

  const onHypo = useCallback(
    <K extends keyof HypoValues>(key: K, value: HypoValues[K]) => {
      setHypoBySim((prev) => ({ ...prev, [activeSim]: { ...prev[activeSim], [key]: value } }));
    },
    [activeSim]
  );

  // Lot 3 : transmission MANUELLE de la variante courante vers l'opener (la fiche),
  // déclenchée par le clic « Garder ce résultat » de la vue. Plus de debounce :
  // post immédiat. Renvoie false si la fiche (opener) est fermée → la vue affiche
  // « Fiche fermée » (cohérent avec « Actualiser »). Dédup consécutive côté opener.
  const onRecord = useCallback((draft: SimRecordDraft): boolean => {
    if (!window.opener || window.opener.closed) return false;
    window.opener.postMessage({ type: PRESENT_MSG_RECORD, draft }, window.location.origin);
    return true;
  }, []);

  // Réception de l'identité fraîche depuis la fiche (opener). N'écrase QUE l'identité.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PRESENT_MSG_IDENTITY) return;
      setIdentity(event.data.identity as ClientIdentity);
      setStatus("idle");
      setNotice("Identité actualisée");
      setTimeout(() => setNotice(null), 2000);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const actualiser = useCallback(() => {
    if (!window.opener || window.opener.closed) {
      setNotice("Fenêtre source fermée, impossible d'actualiser.");
      setTimeout(() => setNotice(null), 3500);
      return;
    }
    setStatus("refreshing");
    window.opener.postMessage(
      { type: PRESENT_MSG_REQUEST, simId: activeSim },
      window.location.origin
    );
    setTimeout(() => {
      setStatus((s) => {
        if (s === "refreshing") {
          setNotice("Aucune réponse de la fenêtre source.");
          setTimeout(() => setNotice(null), 3500);
          return "idle";
        }
        return s;
      });
    }, 2500);
  }, [activeSim]);

  const ActiveView = VIEWS[activeSim] ?? PerQuickPresentation;
  const activeHypo = hypoBySim[activeSim] ?? initial.hypo;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-5 py-8 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cervus-gold-light">Cervus Patrimoine</p>
          <h1 className="font-cormorant text-3xl font-semibold text-cervus-bronze sm:text-4xl">
            Votre projet retraite
          </h1>
          {initial.code && (
            <p className="mt-1 font-mono text-sm tracking-wider text-cervus-bronze/50">{initial.code}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={actualiser}
            disabled={status === "refreshing"}
            className="inline-flex items-center gap-2 rounded-[50px] border border-cervus-gold/50 px-5 py-2.5 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold/15 disabled:opacity-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            {status === "refreshing" ? "Actualisation…" : "Actualiser"}
          </button>
          {notice && <span className="text-[11px] text-cervus-gold-light">{notice}</span>}
        </div>
      </header>

      {/* Menu des simulateurs — navigation in-tab */}
      <nav className="flex flex-wrap gap-2">
        {PRESENTABLE.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSim(s.id)}
            className={`rounded-[50px] border px-4 py-2 text-sm font-medium transition-colors ${
              activeSim === s.id
                ? "border-cervus-gold bg-cervus-gold text-cervus-bronze"
                : "border-cervus-gold/40 text-cervus-bronze/80 hover:bg-cervus-gold/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <ActiveView identity={identity} hypo={activeHypo} onHypo={onHypo} onRecord={onRecord} />

      <p className="text-xs leading-relaxed text-cervus-bronze/40">
        Estimation pédagogique indicative, non contractuelle. Les performances futures ne sont pas
        garanties.
      </p>
    </main>
  );
}
