import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocument from "./PdfDocument";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";
import { syncToPipedrive } from "@/lib/pipedrive";

const BREVO_API = "https://api.brevo.com/v3";

// Pipedrive — appel non bloquant : si la config est absente ou si l'appel échoue,
// la génération du PDF et l'envoi Brevo se font quand même.
async function syncPipedriveSafe(data: SimulateurData, computed: ComputedResults, otpVerifie: boolean) {
  if (!process.env.PIPEDRIVE_API_TOKEN || !process.env.PIPEDRIVE_DOMAIN) {
    console.warn("[submit] Pipedrive non configuré (PIPEDRIVE_API_TOKEN/PIPEDRIVE_DOMAIN absents), sync ignorée");
    return;
  }
  try {
    await syncToPipedrive(data, computed, otpVerifie);
  } catch (err: unknown) {
    console.error("[submit] Pipedrive sync échouée:", err instanceof Error ? err.message : err);
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function formatPhoneForBrevo(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+33" + cleaned;
}

// Emails whitelistés : bypass rate limiting sur /api/submit
const EMAIL_WHITELIST = new Set(["gusrr31@gmail.com"]);

// Rate limiting en mémoire : max 5 soumissions par IP par heure
const submitRateMap = new Map<string, { count: number; firstAt: number }>();
const SUBMIT_WINDOW_MS = 60 * 60 * 1000; // 1 heure
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

async function sendMakeWebhook(data: SimulateurData, computed: ComputedResults, pdfBase64: string) {
  console.log("[Make] Début sendMakeWebhook, type: otp_valide");
  console.log("[Make] URL présente:", !!process.env.MAKE_WEBHOOK_URL);

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("[Make] Webhook non envoyé : MAKE_WEBHOOK_URL absent des variables d'env (type: otp_valide)");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const profilLabels: Record<string, string> = {
    prudent: "Prudent", equilibre: "Équilibré", dynamique: "Dynamique",
  };
  const objectifLabels: Record<string, string> = {
    reduire_impots: "Réduire mes impôts",
    preparer_retraite: "Préparer ma retraite",
    dynamiser_epargne: "Dynamiser mon épargne",
  };
  const statutProLabels: Record<string, string> = {
    salarie: "Salarié", fonctionnaire: "Fonctionnaire",
    independant: "Indépendant", liberal: "Profession libérale",
  };

  try {
    console.log(`[Make] Envoi fetch vers Make (otp_valide) — PDF inclus: ${pdfBase64.length > 0}, taille base64: ${pdfBase64.length} chars`);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:                "otp_valide",
        email:               data.email,
        prenom:              data.prenom,
        pdf:                 pdfBase64,
        nom_fichier:         `simulation-per-${data.prenom.toLowerCase()}-${date}.pdf`,
        capital_projete:     computed.capitalFinal,
        economie_fiscale:    computed.economieFiscale,
        tmi:                 computed.tmi,
        versement_mensuel:   Math.round(computed.versementAnnuel / 12),
        profil_investisseur: profilLabels[data.profil] ?? data.profil,
        objectif:            data.objectif ? (objectifLabels[data.objectif] ?? data.objectif) : "",
        statut_pro:          data.statutPro ? (statutProLabels[data.statutPro] ?? data.statutPro) : "",
        impot_avant_per:     computed.impotAvant,
        impot_apres_per:     computed.impotApres,
        pas_avant_per:       computed.pasMensAvant,
        pas_apres_per:       computed.pasMensApres,
        economie_mensuelle:  computed.economieMensuelle,
        revenu_conjoint:     data.revenusConjoint ? (parseFloat(data.revenusConjoint) || 0) * 12 : 0,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[Make] Webhook otp_valide HTTP error: ${res.status} — ${body}`);
    } else {
      console.log("[Make] Webhook otp_valide envoyé avec succès, status:", res.status);
    }
  } catch (err: unknown) {
    console.error("[Make] Webhook otp_valide exception réseau:", err instanceof Error ? err.message : err);
  }
}

async function createBrevoContact(data: SimulateurData, computed: ComputedResults) {
  const statut =
    data.statut === "marie" || data.statut === "pacse"
      ? "Couple"
      : data.statut === "parent_isole"
      ? "Parent isolé"
      : "Célibataire";

  const profil = { prudent: "Prudent", equilibre: "Équilibré", dynamique: "Dynamique" }[data.profil];

  const objectifLabels: Record<string, string> = {
    reduire_impots:    "Réduire mes impôts",
    preparer_retraite: "Préparer ma retraite",
    dynamiser_epargne: "Dynamiser mon épargne",
  };
  const statutProLabels: Record<string, string> = {
    salarie:       "Salarié",
    fonctionnaire: "Fonctionnaire",
    independant:   "Indépendant",
    liberal:       "Profession libérale",
  };

  const today = new Date();
  const dateSimulation = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  const body = {
    email: data.email,
    updateEnabled: true,
    attributes: {
      PRENOM:              data.prenom,
      NOM:                 data.nom,
      ...(data.telephone ? { TELEPHONE: formatPhoneForBrevo(data.telephone) } : {}),
      SOURCE:              "Simu-PER",
      STATUT_MARITAL:      statut,
      TMI:                 computed.tmi,
      REVENU_IMPOSABLE:    computed.revenuImposable,
      ANNEE_NAISSANCE:     parseInt(data.anneeNaissance) || 0,
      NB_ENFANT:           data.nbEnfants,
      AUTRE_REVENU:        data.autresRevenus ?? false,
      VERSEMENT_INITIAL:   parseFloat(data.versementInitial) || 0,
      VERSEMENT_MENSUEL:   parseFloat(data.versementMensuel) || 0,
      VERSEMENT_PER:       computed.versementAnnuel,
      PROFIL_INVESTISSEUR: profil,
      CAPITAL_PROJETE:     computed.capitalFinal,
      ECONOMIE_FISCALE:    computed.economieFiscale,
      AGE_RETRAITE:        computed.ageRetraiteNum,
      DATE_SIMULATION:     dateSimulation,
      IMPOT_AVANT_PER:     computed.impotAvant,
      IMPOT_APRES_PER:     computed.impotApres,
      PAS_AVANT_PER:       computed.pasMensAvant,
      PAS_APRES_PER:       computed.pasMensApres,
      ECONOMIE_MENSUELLE:  computed.economieMensuelle,
      ...(data.objectif  ? { OBJECTIF:   objectifLabels[data.objectif]    ?? data.objectif  } : {}),
      ...(data.statutPro ? { STATUT_PRO: statutProLabels[data.statutPro]  ?? data.statutPro } : {}),
      ...(data.revenusConjoint ? { REVENU_CONJOINT: (parseFloat(data.revenusConjoint) || 0) * 12 } : {}),
      CONSENTEMENT_RDV:    data.consentementRdv,
      OTP_VERIFIE:         true,
      SIMULATION_EN_ATTENTE: false,
    },
    listIds: [5], // Liste "Leads Simu-PER"
  };

  const res = await fetch(`${BREVO_API}/contacts`, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "(unreadable)");
    // errBody = message d'erreur Brevo uniquement, pas de données utilisateur
    console.error(`[submit] Brevo contact error: ${res.status} — ${errBody}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data, computed } = (await req.json()) as {
      data: SimulateurData;
      computed: ComputedResults;
    };

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
        return NextResponse.json(
          { error: "Trop de soumissions, réessayez dans une heure" },
          { status: 429 }
        );
      }
    }

    // Generate PDF — explicit try/catch to surface render errors
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(
        // @ts-expect-error — react-pdf types differ from React's generic ReactElement
        React.createElement(PdfDocument, { data, computed })
      ) as Buffer;
    } catch (renderErr: unknown) {
      console.error("[submit] renderToBuffer ERREUR:", renderErr instanceof Error ? renderErr.message : renderErr);
      throw renderErr;
    }

    const byteSize = pdfBuffer.byteLength ?? (pdfBuffer as Buffer).length;
    // Magic bytes check: valid PDF starts with %PDF (hex 25 50 44 46)
    const magicOk = pdfBuffer[0] === 0x25 && pdfBuffer[1] === 0x50 && pdfBuffer[2] === 0x44 && pdfBuffer[3] === 0x46;
    if (byteSize < 5000) {
      console.error(`[submit] PDF SUSPECT — taille ${byteSize} octets (< 5000), PDF probablement vide ou tronqué`);
    }
    if (!magicOk) {
      console.error(`[submit] PDF SUSPECT — magic bytes invalides, premiers bytes: ${Array.from(pdfBuffer.slice(0, 4)).map(b => b.toString(16).padStart(2, "0")).join(" ")}`);
    }

    // Buffer.toString("base64") produces pure base64 — strip prefix defensively just in case
    const rawBase64 = pdfBuffer.toString("base64");
    const pdfBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "");
    console.log(`[submit] PDF généré — ${byteSize} octets, magic %PDF: ${magicOk ? "OK" : "INVALIDE"}, base64 ${pdfBase64.length} chars, début: ${pdfBase64.slice(0, 20)}`);


    // Run CRM + Make webhook in parallel — non-blocking on partial failure
    const results = await Promise.allSettled([
      createBrevoContact(data, computed),
      sendMakeWebhook(data, computed, pdfBase64),
      syncPipedriveSafe(data, computed, true), // OTP validé → pipeline "Leads" / étape "Tel Validé"
    ]);
    results.forEach((r, i) => {
      const label = ["createBrevoContact", "sendMakeWebhook", "syncPipedriveSafe"][i];
      if (r.status === "rejected") {
        console.error(`[submit] ${label} rejeté:`, r.reason instanceof Error ? r.reason.message : r.reason);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[submit]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ error: "Erreur lors du traitement" }, { status: 500 });
  }
}
