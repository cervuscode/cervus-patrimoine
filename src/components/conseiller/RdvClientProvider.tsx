"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { RDV_FIELDS, SECTION_LABELS, SECTION_ORDER } from "@/lib/rdv-fields";
import { computeFiscalState, type FiscalState } from "@/lib/fiscal-state";
import {
  formatSyntheseNote,
  signatureOf,
  type DecouverteLine,
  type SimRecord,
  type SimRecordDraft,
} from "@/lib/sim-history";

// Types alignés sur le retour serveur de getClientView (dupliqués côté client pour
// éviter d'importer pipedrive.ts — server-only — dans un composant client).
export interface ClientFieldValue {
  id: string;
  sim: string | number | null;
  dec: string | number | null;
}
export interface ClientDeal {
  id: number;
  title: string;
  produit: string | null;
  status: string | null;
  code: string | null;
  fields: Record<string, ClientFieldValue>;
}
export interface ClientView {
  personId: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  personFields: Record<string, ClientFieldValue>;
  notes: string | null;
  deals: ClientDeal[];
}

function entityOf(fieldId: string): "person" | "deal" | null {
  return RDV_FIELDS.find((f) => f.id === fieldId)?.entity ?? null;
}
function kindOf(fieldId: string) {
  return RDV_FIELDS.find((f) => f.id === fieldId)?.kind ?? "text";
}

/** Valeur affichée par défaut : Découverte si renseignée, sinon Simulation (visuel). */
function initialDisplay(v: ClientFieldValue | undefined): string {
  if (!v) return "";
  if (v.dec != null && String(v.dec) !== "") return String(v.dec);
  if (v.sim != null && String(v.sim) !== "") return String(v.sim);
  return "";
}

interface RdvClientContextValue {
  client: ClientView | null;
  activeDealId: number | null;
  activeDeal: ClientDeal | null;
  saving: boolean;
  hasUnsavedChanges: boolean;
  setClient: (view: ClientView | null) => void;
  selectDeal: (dealId: number) => void;
  getValue: (fieldId: string) => string;
  /** État du champ : "vide" | "prefill" (montré depuis Simulation) | "saved" (Découverte en base) | "edited" (modifié non enregistré). */
  fieldState: (fieldId: string) => "vide" | "prefill" | "saved" | "edited";
  getSim: (fieldId: string) => string | number | null;
  setValue: (fieldId: string, value: string) => void;
  notes: string;
  notesDirty: boolean;
  setNotes: (value: string) => void;
  save: () => Promise<boolean>;
  /** État fiscal partagé (Lot 2) : revenu net, parts, TMI calculés UNE FOIS. */
  fiscalState: FiscalState;
  /** Historique de session des simulations consultées (Lot 3) — en mémoire seul. */
  simHistory: SimRecord[];
  /** Capture auto d'une variante (dédup consécutif) ; appelé par les simulateurs connectés. */
  recordSim: (draft: SimRecordDraft) => void;
  /** Compile Découverte + historique → note HTML, écrit sur le deal actif. */
  generateSyntheseNote: () => Promise<boolean>;
  generatingNote: boolean;
}

const Ctx = createContext<RdvClientContextValue | null>(null);

export function useRdvClient(): RdvClientContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRdvClient doit être utilisé dans <RdvClientProvider>");
  return ctx;
}

export function RdvClientProvider({ children }: { children: ReactNode }) {
  const [client, setClientState] = useState<ClientView | null>(null);
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [personDraft, setPersonDraft] = useState<Record<string, string>>({});
  const [personDirty, setPersonDirty] = useState<Set<string>>(new Set());
  const [dealDraft, setDealDraft] = useState<Record<string, string>>({});
  const [dealDirty, setDealDirty] = useState<Set<string>>(new Set());
  const [notes, setNotesState] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [simHistory, setSimHistory] = useState<SimRecord[]>([]);
  const [generatingNote, setGeneratingNote] = useState(false);

  const activeDeal = useMemo(
    () => client?.deals.find((d) => d.id === activeDealId) ?? null,
    [client, activeDealId]
  );

  const hydrateDealDraft = useCallback((deal: ClientDeal | null) => {
    const draft: Record<string, string> = {};
    if (deal) {
      for (const f of RDV_FIELDS) {
        if (f.entity !== "deal") continue;
        draft[f.id] = initialDisplay(deal.fields[f.id]);
      }
    }
    setDealDraft(draft);
    setDealDirty(new Set());
  }, []);

  const setClient = useCallback(
    (view: ClientView | null) => {
      setClientState(view);
      setPersonDirty(new Set());
      setDealDirty(new Set());
      setNotesDirty(false);
      // Lot 3 : l'historique de simulations est lié à la fiche ouverte → reset à
      // chaque (ré)chargement d'un client (changement de client ou réouverture).
      setSimHistory([]);
      if (!view) {
        setActiveDealId(null);
        setPersonDraft({});
        setDealDraft({});
        setNotesState("");
        return;
      }
      const pd: Record<string, string> = {};
      for (const f of RDV_FIELDS) {
        if (f.entity !== "person") continue;
        pd[f.id] = initialDisplay(view.personFields[f.id]);
      }
      setPersonDraft(pd);
      setNotesState(view.notes ?? "");
      // Décision 2 : sélection explicite si plusieurs deals ; auto si un seul.
      const onlyDeal = view.deals.length === 1 ? view.deals[0] : null;
      setActiveDealId(onlyDeal ? onlyDeal.id : null);
      hydrateDealDraft(onlyDeal);
    },
    [hydrateDealDraft]
  );

  const selectDeal = useCallback(
    (dealId: number) => {
      setActiveDealId(dealId);
      const deal = client?.deals.find((d) => d.id === dealId) ?? null;
      hydrateDealDraft(deal);
    },
    [client, hydrateDealDraft]
  );

  const getValue = useCallback(
    (fieldId: string): string => {
      const entity = entityOf(fieldId);
      if (entity === "deal") return dealDraft[fieldId] ?? "";
      return personDraft[fieldId] ?? "";
    },
    [personDraft, dealDraft]
  );

  const getSim = useCallback(
    (fieldId: string): string | number | null => {
      const entity = entityOf(fieldId);
      const src = entity === "deal" ? activeDeal?.fields[fieldId] : client?.personFields[fieldId];
      return src?.sim ?? null;
    },
    [client, activeDeal]
  );

  const fieldState = useCallback(
    (fieldId: string): "vide" | "prefill" | "saved" | "edited" => {
      const entity = entityOf(fieldId);
      const dirty = entity === "deal" ? dealDirty.has(fieldId) : personDirty.has(fieldId);
      if (dirty) return "edited";
      const src = entity === "deal" ? activeDeal?.fields[fieldId] : client?.personFields[fieldId];
      if (src?.dec != null && String(src.dec) !== "") return "saved";
      if (src?.sim != null && String(src.sim) !== "") return "prefill";
      return "vide";
    },
    [client, activeDeal, personDirty, dealDirty]
  );

  const setValue = useCallback((fieldId: string, value: string) => {
    const entity = entityOf(fieldId);
    if (entity === "deal") {
      setDealDraft((d) => ({ ...d, [fieldId]: value }));
      setDealDirty((s) => new Set(s).add(fieldId));
    } else {
      setPersonDraft((d) => ({ ...d, [fieldId]: value }));
      setPersonDirty((s) => new Set(s).add(fieldId));
    }
  }, []);

  const setNotes = useCallback((value: string) => {
    setNotesState(value);
    setNotesDirty(true);
  }, []);

  const hasUnsavedChanges = personDirty.size > 0 || dealDirty.size > 0 || notesDirty;

  // État fiscal partagé (Lot 2) : calculé UNE FOIS via fiscal-engine (lecture seule),
  // recalculé automatiquement à chaque changement des champs sources (draft = valeur
  // courante, déjà résolue Découverte RDV > Simulation à l'hydratation).
  const fiscalState = useMemo<FiscalState>(() => {
    const np = (id: string): number | undefined => {
      const v = parseFloat(String(personDraft[id] ?? "").replace(",", "."));
      return Number.isFinite(v) ? v : undefined;
    };
    const nd = (id: string): number | undefined => {
      const v = parseFloat(String(dealDraft[id] ?? "").replace(",", "."));
      return Number.isFinite(v) ? v : undefined;
    };
    return computeFiscalState({
      revenuImposable: np("revenuImposable"),
      partsFiscales: np("partsFiscales"),
      salaireMensuel: np("salaireMensuel"),
      revenuConjoint: np("revenuConjoint"),
      statutMarital: personDraft["statutMarital"] || undefined,
      nbEnfants: np("nbEnfants"),
      foncier: nd("foncier"),
      bnc: nd("bnc"),
      bic: nd("bic"),
    });
  }, [personDraft, dealDraft]);

  const save = useCallback(async (): Promise<boolean> => {
    if (!client) return false;
    if (!hasUnsavedChanges) return true;
    setSaving(true);
    try {
      const toValue = (fieldId: string, raw: string): string | number | null => {
        const trimmed = raw.trim();
        if (trimmed === "") return null;
        if (kindOf(fieldId) === "text") return trimmed;
        const n = parseFloat(trimmed.replace(",", "."));
        return Number.isFinite(n) ? n : null;
      };
      const personValues: Record<string, string | number | null> = {};
      for (const id of Array.from(personDirty)) personValues[id] = toValue(id, personDraft[id] ?? "");
      const dealValues: Record<string, string | number | null> = {};
      for (const id of Array.from(dealDirty)) dealValues[id] = toValue(id, dealDraft[id] ?? "");

      const res = await fetch("/api/rdv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: client.personId,
          dealId: activeDealId,
          personValues,
          dealValues,
          notes: notesDirty ? notes : undefined,
        }),
      });
      if (!res.ok) return false;

      // Met à jour la baseline locale : les valeurs enregistrées deviennent les
      // valeurs Découverte en base → prochaines ouvertures = priorité Découverte.
      setClientState((prev) => {
        if (!prev) return prev;
        const next: ClientView = { ...prev };
        next.personFields = { ...prev.personFields };
        for (const id of Array.from(personDirty)) {
          next.personFields[id] = { ...next.personFields[id], id, dec: personValues[id] };
        }
        if (notesDirty) next.notes = notes;
        if (activeDealId != null) {
          next.deals = prev.deals.map((d) => {
            if (d.id !== activeDealId) return d;
            const f = { ...d.fields };
            for (const id of Array.from(dealDirty)) f[id] = { ...f[id], id, dec: dealValues[id] };
            return { ...d, fields: f };
          });
        }
        return next;
      });
      setPersonDirty(new Set());
      setDealDirty(new Set());
      setNotesDirty(false);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, [client, hasUnsavedChanges, personDirty, dealDirty, personDraft, dealDraft, notes, notesDirty, activeDealId]);

  // ── Lot 3 : capture des simulations consultées ────────────────────────────────
  // Dédup CONSÉCUTIF : on n'ajoute que si la variante diffère du dernier
  // enregistrement (tue les re-renders identiques, conserve A→B→A = 3 entrées).
  const recordSim = useCallback((draft: SimRecordDraft) => {
    setSimHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && signatureOf(last) === signatureOf(draft)) return prev;
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return [...prev, { ...draft, id, ts: Date.now() } as SimRecord];
    });
  }, []);

  // Compose les lignes Découverte (par section, valeurs courantes Découverte>Sim).
  const buildDecouverteLines = useCallback((): DecouverteLine[] => {
    const fmtField = (id: string, raw: string): string => {
      const def = RDV_FIELDS.find((f) => f.id === id);
      const trimmed = raw.trim();
      if (trimmed === "") return "";
      if (def && (def.kind === "money" || def.kind === "number")) {
        const n = parseFloat(trimmed.replace(",", "."));
        if (!Number.isFinite(n)) return trimmed;
        return def.kind === "money"
          ? `${n.toLocaleString("fr-FR")} €`
          : n.toLocaleString("fr-FR");
      }
      return trimmed;
    };
    const lines: DecouverteLine[] = [];
    // Ligne fiscale calculée en tête (vérité partagée Lot 2).
    if (fiscalState.revenuNetImposable > 0) {
      lines.push({
        label: "Fiscalité (calculée)",
        value:
          `TMI ${fiscalState.tmi} % · ${fiscalState.partsTotal} part` +
          `${fiscalState.partsTotal > 1 ? "s" : ""} · revenu net ` +
          `${Math.round(fiscalState.revenuNetImposable).toLocaleString("fr-FR")} €`,
      });
    }
    for (const section of SECTION_ORDER) {
      const parts: string[] = [];
      for (const f of RDV_FIELDS) {
        if (f.section !== section) continue;
        const v = fmtField(f.id, getValue(f.id));
        if (v !== "") parts.push(`${f.label} ${v}`);
      }
      if (parts.length > 0) {
        lines.push({ label: SECTION_LABELS[section], value: parts.join(" · ") });
      }
    }
    return lines;
  }, [fiscalState, getValue]);

  const generateSyntheseNote = useCallback(async (): Promise<boolean> => {
    if (!client || activeDealId == null) return false;
    setGeneratingNote(true);
    try {
      const content = formatSyntheseNote({
        code: activeDeal?.code ?? null,
        generatedAt: new Date(),
        decouverte: buildDecouverteLines(),
        history: simHistory,
      });
      const res = await fetch("/api/rdv/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: activeDealId, content }),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setGeneratingNote(false);
    }
  }, [client, activeDealId, activeDeal, simHistory, buildDecouverteLines]);

  const value: RdvClientContextValue = {
    client,
    activeDealId,
    activeDeal,
    saving,
    hasUnsavedChanges,
    setClient,
    selectDeal,
    getValue,
    fieldState,
    getSim,
    setValue,
    notes,
    notesDirty,
    setNotes,
    save,
    fiscalState,
    simHistory,
    recordSim,
    generateSyntheseNote,
    generatingNote,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
