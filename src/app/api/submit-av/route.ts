import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocumentAV from "./PdfDocumentAV";
import { syncAVToPipedrive } from "@/lib/pipedrive";
import type { AVComputed } from "@/lib/av-engine";

const BREVO_API = "https://api.brevo.com/v3";

// Liste Brevo "AV avec OTP" (#12).
const AV_LIST_AVEC_OTP = 12;

interface AVData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  versementInitial: string;
  versementMensuel: string;
  dureeAnnees: number;
  profil: string;
  marie: boolean | null;
}

const avProfilLabels: Record<string, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  responsable: "Responsable",
  dynamique: "Dynamique",
};

function situationLabel(marie: boolean | null): string {
  return marie ? "Marié(e) / pacsé(e)" : "Seul(e)";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function formatPhoneForBrevo(phone: string): string {
  const cleaned = (phone ?? "").replace(/\s/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+33" + cleaned;
}

// Emails whitelistés : bypass rate limiting
const EMAIL_WHITELIST = new Set(["gusrr31@gmail.com"]);

// Rate limiting en mémoire : max 5 soumissions par IP par heure
const submitRateMap = new Map<string, { count: number; firstAt: number }>();
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
const SUBMIT_MAX = 5;

function isSubmitRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = submitRateMap.get(ip);
  if (!entry || now - entry.firstAt > SUBMIT_WINDOW_MS) {
    submitRateMap.set(ip, { count: 1, firstAt: now });
    return false;
  }
  if (entry.count >= SUBMIT_MAX) return true;
  entry.count += 1;
  return false;
}

// Pipedrive — appel non bloquant.
async function syncPipedriveSafe(data: AVData, computed: AVComputed, otpVerifie: boolean) {
  if (!process.env.PIPEDRIVE_API_TOKEN || !process.env.PIPEDRIVE_DOMAIN) {
    console.warn("[submit-av] Pipedrive non configuré, sync ignorée");
    return;
  }
  try {
    await syncAVToPipedrive(data, computed, otpVerifie);
  } catch (err: unknown) {
    console.error("[submit-av] Pipedrive sync échouée:", err instanceof Error ? err.message : err);
  }
}

// Génère le PDF AV et le renvoie en base64 pur. Calqué sur le PER (submit/route.ts) :
// renderToBuffer → toString("base64") → strip défensif du préfixe data:. En cas
// d'erreur de rendu, on renvoie "" pour ne pas bloquer l'envoi Make / CRM.
async function renderAVPdfBase64(data: AVData, computed: AVComputed): Promise<string> {
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      // @ts-expect-error — react-pdf types differ from React's generic ReactElement
      React.createElement(PdfDocumentAV, { data, computed })
    ) as Buffer;
  } catch (renderErr: unknown) {
    console.error("[submit-av] renderToBuffer ERREUR:", renderErr instanceof Error ? renderErr.message : renderErr);
    return "";
  }
  const byteSize = pdfBuffer.byteLength ?? (pdfBuffer as Buffer).length;
  const magicOk = pdfBuffer[0] === 0x25 && pdfBuffer[1] === 0x50 && pdfBuffer[2] === 0x44 && pdfBuffer[3] === 0x46;
  if (byteSize < 5000) {
    console.error(`[submit-av] PDF SUSPECT — taille ${byteSize} octets (< 5000), PDF probablement vide ou tronqué`);
  }
  if (!magicOk) {
    console.error(`[submit-av] PDF SUSPECT — magic bytes invalides, premiers bytes: ${Array.from(pdfBuffer.slice(0, 4)).map(b => b.toString(16).padStart(2, "0")).join(" ")}`);
  }
  const pdfBase64 = pdfBuffer.toString("base64").replace(/^data:[^;]+;base64,/, "");
  console.log(`[submit-av] PDF généré — ${byteSize} octets, magic %PDF: ${magicOk ? "OK" : "INVALIDE"}, base64 ${pdfBase64.length} chars`);
  return pdfBase64;
}

async function sendMakeWebhook(data: AVData, computed: AVComputed) {
  // Scénario Make DÉDIÉ AV (isolé du PER) → MAKE_WEBHOOK_URL_AV
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_AV;
  if (!webhookUrl) {
    console.error("[Make] Webhook AV non envoyé : MAKE_WEBHOOK_URL_AV absent (type: otp_valide)");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  // PDF AV inline base64 (comme le PER), joint au payload Make.
  const pdfBase64 = await renderAVPdfBase64(data, computed);
  try {
    const payload = {
      produit: "AV",
      type: "otp_valide",
      email: data.email.trim().toLowerCase(),
      prenom: data.prenom,
      nom: data.nom,
      telephone: data.telephone ? formatPhoneForBrevo(data.telephone) : "",
      pdf: pdfBase64,
      nom_fichier: `simulation-assurance-vie-${(data.prenom || "client").toLowerCase()}-${date}.pdf`,
      capital_brut: computed.capitalFinalBrut,
      capital_net_sans: computed.capitalNetSansCervus,
      capital_net_avec: computed.capitalNetAvecCervus,
      gain_net: computed.gainNetCervus,
      horizon: data.dureeAnnees,
      versement_initial: parseFloat(data.versementInitial) || 0,
      versement_mensuel: parseFloat(data.versementMensuel) || 0,
      profil_investisseur: avProfilLabels[data.profil] ?? data.profil,
      situation: situationLabel(data.marie),
    };
    const { pdf: _pdf, ...payloadSansPdf } = payload;
    void _pdf;
    console.log("[Make] Payload AV otp_valide (hors PDF):", JSON.stringify(payloadSansPdf));
    console.log(`[Make] Envoi AV otp_valide — PDF inclus: ${pdfBase64.length > 0}, taille base64: ${pdfBase64.length} chars`);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[Make] Webhook AV otp_valide HTTP error: ${res.status} — ${body}`);
    } else {
      console.log("[Make] Webhook AV otp_valide envoyé, status:", res.status);
    }
  } catch (err: unknown) {
    console.error("[Make] Webhook AV otp_valide exception:", err instanceof Error ? err.message : err);
  }
}

async function createBrevoContact(data: AVData, computed: AVComputed) {
  const body = {
    email: data.email,
    updateEnabled: true,
    attributes: {
      PRENOM: data.prenom,
      NOM: data.nom,
      ...(data.telephone ? { TELEPHONE: formatPhoneForBrevo(data.telephone) } : {}),
      SOURCE: "Simu-AV",
      AV_CAPITAL_BRUT: computed.capitalFinalBrut,
      AV_CAPITAL_NET_SANS: computed.capitalNetSansCervus,
      AV_CAPITAL_NET_AVEC: computed.capitalNetAvecCervus,
      AV_GAIN_NET: computed.gainNetCervus,
      AV_HORIZON: data.dureeAnnees,
      AV_VERSEMENT_INITIAL: parseFloat(data.versementInitial) || 0,
      AV_VERSEMENT_MENSUEL: parseFloat(data.versementMensuel) || 0,
      AV_PROFIL: avProfilLabels[data.profil] ?? data.profil,
      AV_SITUATION: situationLabel(data.marie),
      OTP_VERIFIE: true,
      SIMULATION_EN_ATTENTE: false,
    },
    listIds: [AV_LIST_AVEC_OTP], // #12 — Leads Simu-AV
  };

  const res = await fetch(`${BREVO_API}/contacts`, {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "(unreadable)");
    console.error(`[submit-av] Brevo contact error: ${res.status} — ${errBody}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data, computed } = (await req.json()) as { data: AVData; computed: AVComputed };

    if (!data?.email || !data.prenom || !computed) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }
    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Rate limiting par IP (bypass pour emails whitelistés)
    if (!EMAIL_WHITELIST.has(data.email.toLowerCase())) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
      if (isSubmitRateLimited(ip)) {
        return NextResponse.json({ error: "Trop de soumissions, réessayez dans une heure" }, { status: 429 });
      }
    }

    const results = await Promise.allSettled([
      createBrevoContact(data, computed),
      sendMakeWebhook(data, computed),
      syncPipedriveSafe(data, computed, true),
    ]);
    results.forEach((r, i) => {
      const label = ["createBrevoContact", "sendMakeWebhook", "syncPipedriveSafe"][i];
      if (r.status === "rejected") {
        console.error(`[submit-av] ${label} rejeté:`, r.reason instanceof Error ? r.reason.message : r.reason);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[submit-av]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ error: "Erreur lors du traitement" }, { status: 500 });
  }
}
