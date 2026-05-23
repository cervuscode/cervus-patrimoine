import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocument from "./PdfDocument";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

const BREVO_API = "https://api.brevo.com/v3";

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
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  console.log("[Make] URL:", webhookUrl ?? "undefined — MAKE_WEBHOOK_URL non défini dans les variables d'env");
  if (!webhookUrl) {
    console.error("[Make] Webhook non envoyé : MAKE_WEBHOOK_URL manquant (type: otp_valide)");
    return;
  }
  console.log("[Make] Envoi webhook: otp_valide");

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
    }),
  });

  if (!res.ok) {
    console.error(`[Make] Webhook otp_valide error: ${res.status}`);
  } else {
    console.log("[Make] Webhook otp_valide envoyé avec succès");
  }
}

async function sendEmail(data: SimulateurData, computed: ComputedResults, pdfBase64: string) {
  const profilLabels: Record<string, string> = {
    prudent:   "Prudent",
    equilibre: "Équilibré",
    dynamique: "Dynamique",
  };
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

  const body = {
    sender: { name: "Auguste — Cervus Patrimoine", email: "auguste@cervuspatrimoine.fr" },
    to: [{ email: data.email, name: data.prenom }],
    templateId: 1,
    params: {
      PRENOM:              data.prenom,
      CAPITAL_PROJETE:     computed.capitalFinal,
      ECONOMIE_FISCALE:    computed.economieFiscale,
      TMI:                 computed.tmi,
      VERSEMENT_MENSUEL:   Math.round(computed.versementAnnuel / 12),
      PROFIL_INVESTISSEUR: profilLabels[data.profil] ?? data.profil,
      OBJECTIF:            data.objectif ? (objectifLabels[data.objectif] ?? data.objectif) : "",
      STATUT_PRO:          data.statutPro ? (statutProLabels[data.statutPro] ?? data.statutPro) : "",
    },
    attachment: [
      {
        name:    "simulation-per-cervus.pdf",
        content: pdfBase64,
      },
    ],
  };

  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`[submit] Brevo email error: ${res.status}`);
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
      ...(data.objectif  ? { OBJECTIF:   objectifLabels[data.objectif]    ?? data.objectif  } : {}),
      ...(data.statutPro ? { STATUT_PRO: statutProLabels[data.statutPro]  ?? data.statutPro } : {}),
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

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      // @ts-expect-error — react-pdf types differ from React's generic ReactElement
      React.createElement(PdfDocument, { data, computed })
    );
    const pdfBase64 = pdfBuffer.toString("base64");

    // Run email + CRM + Make webhook in parallel — non-blocking on partial failure
    await Promise.allSettled([
      sendEmail(data, computed, pdfBase64),
      createBrevoContact(data, computed),
      sendMakeWebhook(data, computed, pdfBase64),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[submit]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ error: "Erreur lors du traitement" }, { status: 500 });
  }
}
