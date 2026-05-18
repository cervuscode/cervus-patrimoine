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

async function sendEmail(data: SimulateurData, computed: ComputedResults, pdfBase64: string) {
  const body = {
    sender: { name: "Cervus Patrimoine", email: "simulation@cervuspatrimoine.fr" },
    to: [{ email: data.email, name: data.prenom }],
    subject: `Votre simulation PER — Cervus Patrimoine, ${data.prenom}`,
    htmlContent: `
      <p>Bonjour ${data.prenom},</p>
      <p>Merci d'avoir utilisé le simulateur PER Cervus Patrimoine.</p>
      <p>
        <strong>Économie fiscale estimée :</strong> ${computed.economieFiscale.toLocaleString("fr-FR")} €/an<br/>
        <strong>Capital estimé à 64 ans :</strong> ${computed.capitalFinal.toLocaleString("fr-FR")} €<br/>
        <strong>TMI :</strong> ${computed.tmi} %
      </p>
      <p>Votre rapport complet est joint à cet email.</p>
      <p>
        Pour approfondir votre situation patrimoniale, prenez rendez-vous avec Auguste Dechery :<br/>
        <a href="${process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://cervuspatrimoine.fr/simulateur-per"}">
          Prendre rendez-vous
        </a>
      </p>
      <p style="font-size:11px;color:#999;font-style:italic;margin-top:24px;">
        Ces projections sont fournies à titre indicatif et ne constituent pas un conseil en investissement.
        Cervus Patrimoine · ORIAS n° 25006770
      </p>
    `,
    attachment: [
      {
        name: `Simulation_PER_Cervus_${data.prenom}_${data.nom}.pdf`,
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

  const body = {
    email: data.email,
    updateEnabled: true,
    attributes: {
      FIRSTNAME: data.prenom,
      LASTNAME: data.nom,
      ...(data.telephone ? { SMS: formatPhoneForBrevo(data.telephone) } : {}),
      SOURCE: "Simu-PER",
      STATUT_FISCAL: statut,
      TMI: computed.tmi,
      REVENUS_ANNUELS: computed.revenuImposable,
      AGE_RETRAITE: computed.ageRetraiteNum,
      VERSEMENT_PER: computed.versementAnnuel,
      ECONOMIE_IMPOT: computed.economieFiscale,
      CAPITAL_PROJETE: computed.capitalFinal,
      PROFIL_RISQUE: profil,
      CONSENTEMENT_RDV: data.consentementRdv,
      OTP_VERIFIE: true,
      SIMULATION_EN_ATTENTE: false,
    },
    listIds: [4], // ID liste "Leads Simu-PER" — à ajuster selon votre compte Brevo
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
    console.error(`[submit] Brevo contact error: ${res.status}`);
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

    // Run email + CRM in parallel — non-blocking on partial failure
    await Promise.allSettled([
      sendEmail(data, computed, pdfBase64),
      createBrevoContact(data, computed),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[submit]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ error: "Erreur lors du traitement" }, { status: 500 });
  }
}
