"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CopyButton from "./CopyButton";

/**
 * Volet B — pour un deal créé à la main dans Pipedrive (sans code).
 * 1. « Générer un code » → calcule le prochain code (scan+1), AFFICHE sans écrire.
 * 2. Copie en un clic. Auguste colle le code dans le champ Code client du deal côté Pipedrive.
 * 3. « Lier la fiche » → vérifie que le deal contient bien ce code. Si OK → recharge.
 */
export default function GenerateCodeBox({ dealId }: { dealId: number }) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function generate() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/rdv/next-code");
      const json = await res.json();
      if (res.ok && json.code) setCode(json.code);
      else setMsg({ kind: "err", text: "Génération impossible." });
    } finally {
      setBusy(false);
    }
  }

  async function link() {
    if (!code) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/rdv/link-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, expectedCode: code }),
      });
      const json = await res.json();
      if (res.ok && json.match) {
        setMsg({ kind: "ok", text: "Fiche liée. Rechargement…" });
        router.refresh();
      } else {
        setMsg({
          kind: "err",
          text: `Le champ Code client du deal ne contient pas « ${code} »${
            json.current ? ` (actuel : ${json.current})` : ""
          }. Collez le code dans Pipedrive puis réessayez.`,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-cervus-gold/30 bg-cervus-dark/40 p-4">
      <p className="mb-3 text-sm text-cervus-bronze/80">
        Ce dossier n&apos;a pas encore de code client.
      </p>

      {!code ? (
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="rounded-[50px] bg-cervus-gold px-5 py-2 text-sm font-medium text-cervus-bronze hover:bg-cervus-gold-dark disabled:opacity-50"
        >
          {busy ? "…" : "Générer un code"}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="font-cormorant text-3xl font-semibold text-cervus-bronze">{code}</span>
            <CopyButton value={code} />
          </div>
          <ol className="list-decimal pl-5 text-xs text-cervus-bronze/60">
            <li>Copiez le code ci-dessus.</li>
            <li>Collez-le dans le champ « Code client » du deal, côté Pipedrive.</li>
            <li>Cliquez « Lier la fiche » pour vérifier.</li>
          </ol>
          <button
            type="button"
            onClick={link}
            disabled={busy}
            className="self-start rounded-[50px] border border-cervus-gold px-5 py-2 text-sm font-medium text-cervus-bronze hover:bg-cervus-gold/20 disabled:opacity-50"
          >
            {busy ? "Vérification…" : "Lier la fiche"}
          </button>
        </div>
      )}

      {msg && (
        <p className={`mt-3 text-xs ${msg.kind === "ok" ? "text-emerald-400" : "text-amber-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
