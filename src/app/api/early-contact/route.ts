import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocument from "@/app/api/submit/PdfDocument";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

const BREVO_API = "https://api.brevo.com/v3";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Rate limiting : max 10 requêtes par IP par heure
const rateLimitMap = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAt: now });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count += 1;
  return false;
}

async function sendMakeWebhookSansOtp(data: SimulateurData, computed: ComputedResults) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) return;

  const date = new Date().toISOString().slice(0, 10);

  // Génère le PDF pour la pièce jointe dans le scénario Make sans OTP
  const pdfBuffer = await renderToBuffer(
    // @ts-expect-error — react-pdf types differ from React's generic ReactElement
    React.createElement(PdfDocument, { data, computed })
  );
  const pdfBase64 = pdfBuffer.toString("base64");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type:             "sans_otp_30min",
      email:            data.email,
      prenom:           data.prenom,
      pdf:              pdfBase64,
      nom_fichier:      `simulation-per-${data.prenom.toLowerCase()}-${date}.pdf`,
      capital_projete:  computed.capitalFinal,
      economie_fiscale: computed.economieFiscale,
      tmi:              computed.tmi,
    }),
  });

  if (!res.ok) {
    console.error(`[early-contact] Make webhook error: ${res.status}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, computed } = body as {
      data: SimulateurData;
      computed: ComputedResults;
    };

    if (!data?.email || !isValidEmail(data.email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (!computed) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const statut =
      data.statut === "marie" || data.statut === "pacse"
        ? "Couple"
        : data.statut === "parent_isole"
        ? "Parent isolé"
        : "Célibataire";

    const profil = { prudent: "Prudent", equilibre: "Équilibré", dynamique: "Dynamique" }[data.profil] ?? "";

    const brevoBody = {
      email: data.email,
      updateEnabled: true,
      attributes: {
        FIRSTNAME: data.prenom,
        LASTNAME: data.nom,
        SOURCE: "Simu-PER",
        STATUT_FISCAL: statut,
        TMI: computed.tmi,
        REVENUS_ANNUELS: computed.revenuImposable,
        AGE_RETRAITE: computed.ageRetraiteNum,
        VERSEMENT_PER: computed.versementAnnuel,
        ECONOMIE_IMPOT: computed.economieFiscale,
        CAPITAL_PROJETE: computed.capitalFinal,
        PROFIL_RISQUE: profil,
        OTP_VERIFIE: false,
        SIMULATION_EN_ATTENTE: false,
      },
      listIds: [6], // Liste "Leads sans OTP" — migré vers #5 à la validation OTP
    };

    await Promise.allSettled([
      fetch(`${BREVO_API}/contacts`, {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brevoBody),
      }).then((res) => {
        if (!res.ok) console.error(`[early-contact] Brevo error: ${res.status}`);
      }),
      sendMakeWebhookSansOtp(data, computed),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[early-contact]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ ok: false });
  }
}
