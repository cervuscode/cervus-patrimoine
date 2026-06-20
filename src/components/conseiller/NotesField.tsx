"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRdvClient } from "./RdvClientProvider";

// Délai de re-floutage automatique : 2 min d'inactivité de frappe (réarmé à chaque
// frappe — jamais un minuteur fixe depuis l'ouverture).
const REBLUR_INACTIVITY_MS = 2 * 60 * 1000;

/**
 * Notes libres — édition SUR PLACE dans le panneau persistant (Lot 2 : remplace
 * l'ancien onglet dédié /notes/[personId]).
 *
 * Règle de sécurité courante : la fenêtre principale de l'outil n'est JAMAIS
 * partagée à l'écran (seul l'onglet « Présentation client » l'est). Le floutage
 * n'est donc plus une barrière mais une protection anti-étourderie : éviter qu'un
 * texte sensible reste affiché en clair en permanence sans raison.
 *
 * - Par défaut : contenu réel rendu mais FLOUTÉ (illisible) + icône œil.
 * - Clic œil → révélation + textarea éditable inline (pas de modal, pas d'onglet).
 * - Re-floutage : (a) clic « Enregistrer » → save notes-only puis floute ;
 *   (b) 2 min d'inactivité de frappe → save si modifs en attente (jamais perdre
 *   une note tapée en RDV) puis floute.
 */
export default function NotesField() {
  const { client, notes, setNotes } = useRdvClient();
  const personId = client?.personId ?? null;

  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // notesDirty local au champ : le contexte global a son propre notesDirty, mais on
  // veut savoir si CE champ a été touché depuis le dernier enregistrement ici.
  const [dirty, setDirty] = useState(false);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const clearTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  // Sauvegarde notes-only (même endpoint que les autres champs Découverte).
  const persist = useCallback(async (): Promise<boolean> => {
    if (personId == null) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/rdv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, notes: notesRef.current }),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [personId]);

  const blur = useCallback(() => {
    clearTimer();
    setRevealed(false);
  }, [clearTimer]);

  // Re-floutage auto après inactivité : on sauve d'abord si modifs en attente.
  const scheduleReblur = useCallback(() => {
    clearTimer();
    inactivityTimer.current = setTimeout(async () => {
      if (dirty) {
        const ok = await persist();
        setDirty(false);
        setToast(ok ? "Enregistré" : "Échec de l'enregistrement");
        setTimeout(() => setToast(null), 2500);
      }
      setRevealed(false);
    }, REBLUR_INACTIVITY_MS);
  }, [clearTimer, dirty, persist]);

  // Nettoyage du timer au démontage.
  useEffect(() => clearTimer, [clearTimer]);

  function reveal() {
    if (personId == null) return;
    setRevealed(true);
    scheduleReblur();
  }

  function onChange(value: string) {
    setNotes(value);
    setDirty(true);
    scheduleReblur(); // chaque frappe repousse le re-floutage
  }

  async function saveAndBlur() {
    const ok = await persist();
    setDirty(false);
    setToast(ok ? "Enregistré" : "Échec de l'enregistrement");
    setTimeout(() => setToast(null), 2500);
    blur();
  }

  const hasContent = notes.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-cervus-bronze/70">Notes libres</span>
        <div className="flex items-center gap-2">
          {toast && (
            <span className={toast === "Enregistré" ? "text-[11px] text-emerald-400" : "text-[11px] text-amber-400"}>
              {toast}
            </span>
          )}
          {!revealed ? (
            <button
              type="button"
              onClick={reveal}
              disabled={personId == null}
              className="inline-flex items-center gap-1.5 rounded-[50px] border border-cervus-gold/50 px-3 py-1 text-xs font-medium text-cervus-bronze hover:bg-cervus-gold/20 disabled:opacity-40"
              aria-label="Afficher et éditer les notes"
            >
              {/* icône œil */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {hasContent ? "Afficher" : "Ajouter"}
            </button>
          ) : (
            <button
              type="button"
              onClick={saveAndBlur}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-[50px] bg-cervus-gold px-3 py-1 text-xs font-medium text-cervus-bronze hover:bg-cervus-gold-dark disabled:opacity-40"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          )}
        </div>
      </div>

      {revealed ? (
        <textarea
          autoFocus
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="resize-none rounded-lg border border-cervus-gold/30 bg-cervus-dark/60 px-3 py-2 text-sm leading-relaxed text-cervus-bronze focus:border-cervus-gold focus:outline-none"
          placeholder="Notes confidentielles sur le client…"
        />
      ) : hasContent ? (
        // Contenu réel rendu mais FLOUTÉ (illisible) — on voit qu'il y a du contenu.
        <div
          aria-hidden
          onClick={reveal}
          className="cursor-pointer select-none whitespace-pre-wrap rounded-lg border border-cervus-gold/20 bg-cervus-dark/60 px-3 py-2 text-sm leading-relaxed text-cervus-bronze/80 blur-[6px]"
        >
          {notes}
        </div>
      ) : (
        <div className="rounded-lg border border-cervus-gold/20 bg-cervus-dark/60 px-3 py-2 text-sm text-cervus-bronze/40 select-none">
          — aucune note —
        </div>
      )}
    </div>
  );
}
