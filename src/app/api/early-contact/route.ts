import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocument from "@/app/api/submit/PdfDocument";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";
import { syncToPipedrive } from "@/lib/pipedrive";

const BREVO_API = "https://api.brevo.com/v3";

// Pipedrive — appel non bloquant : si la config est absente ou si l'appel échoue,
// l'envoi Brevo et le webhook Make se font quand même.
async function syncPipedriveSafe(data: SimulateurData, computed: ComputedResults, otpVerifie: boolean) {
  if (!process.env.PIPEDRIVE_API_TOKEN || !process.env.PIPEDRIVE_DOMAIN) {
    console.warn("[early-contact] Pipedrive non configuré (PIPEDRIVE_API_TOKEN/PIPEDRIVE_DOMAIN absents), sync ignorée");
    return;
  }
  try {
    await syncToPipedrive(data, computed, otpVerifie);
  } catch (err: unknown) {
    console.error("[early-contact] Pipedrive sync échouée:", err instanceof Error ? err.message : err);
  }
}

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

const profilLabels: Record<string, string> = {
  prudent: "Prudent", equilibre: "Équilibré", dynamique: "Dynamique",
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

async function sendMakeWebhookSansOtp(data: SimulateurData, computed: ComputedResults) {
  console.log("[Make] Début sendMakeWebhookSansOtp, type: sans_otp");
  console.log("[Make] URL présente:", !!process.env.MAKE_WEBHOOK_URL);

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("[Make] Webhook non envoyé : MAKE_WEBHOOK_URL absent des variables d'env (type: sans_otp)");
    return;
  }

  const date = new Date().toISOString().slice(0, 10);

  // Génère le PDF pour la pièce jointe dans le scénario Make sans OTP — explicit try/catch
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(
      // @ts-expect-error — react-pdf types differ from React's generic ReactElement
      React.createElement(PdfDocument, { data, computed })
    ) as Buffer;
  } catch (renderErr: unknown) {
    console.error("[early-contact] renderToBuffer ERREUR:", renderErr instanceof Error ? renderErr.message : renderErr);
    return;
  }

  const byteSize = pdfBuffer.byteLength ?? (pdfBuffer as Buffer).length;
  const magicOk = pdfBuffer[0] === 0x25 && pdfBuffer[1] === 0x50 && pdfBuffer[2] === 0x44 && pdfBuffer[3] === 0x46;
  if (byteSize < 5000) {
    console.error(`[early-contact] PDF SUSPECT — taille ${byteSize} octets (< 5000), PDF probablement vide ou tronqué`);
  }
  if (!magicOk) {
    console.error(`[early-contact] PDF SUSPECT — magic bytes invalides, premiers bytes: ${Array.from(pdfBuffer.slice(0, 4)).map(b => b.toString(16).padStart(2, "0")).join(" ")}`);
  }

  // Buffer.toString("base64") produces pure base64 — strip prefix defensively just in case
  const rawBase64 = pdfBuffer.toString("base64");
  const pdfBase64 = rawBase64.replace(/^data:[^;]+;base64,/, "");
  console.log(`[early-contact] PDF généré — ${byteSize} octets, magic %PDF: ${magicOk ? "OK" : "INVALIDE"}, base64 ${pdfBase64.length} chars, début: ${pdfBase64.slice(0, 20)}`);

  try {
    const payload = {
      type:                "sans_otp",
      email:               data.email.trim().toLowerCase(),
      prenom:              data.prenom,
      nom:                 data.nom,
      pdf:                 pdfBase64,
      nom_fichier:         `simulation-per-${data.prenom.toLowerCase()}-${date}.pdf`,
      capital_projete:     computed.capitalFinal,
      economie_fiscale:    computed.economieFiscale,
      tmi:                 computed.tmi,
      versement_mensuel:   Math.round(computed.versementAnnuel / 12),
      salaire_mensuel:     parseFloat(data.salaireMensuel) || 0,
      profil_investisseur: profilLabels[data.profil] ?? data.profil,
      objectif:            data.objectif ? (objectifLabels[data.objectif] ?? data.objectif) : "",
      statut_pro:          data.statutPro ? (statutProLabels[data.statutPro] ?? data.statutPro) : "",
      impot_avant_per:     computed.impotAvant,
      impot_apres_per:     computed.impotApres,
      pas_avant_per:       computed.pasMensAvant,
      pas_apres_per:       computed.pasMensApres,
      economie_mensuelle:  computed.economieMensuelle,
      revenu_conjoint:     data.revenusConjoint ? (parseFloat(data.revenusConjoint) || 0) * 12 : 0,
    };
    // Log payload sans le PDF (trop volumineux)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pdf: _pdf, ...payloadSansPdf } = payload;
    console.log("[Make] Payload sans_otp (hors PDF):", JSON.stringify(payloadSansPdf));
    console.log(`[Make] Envoi fetch vers Make (sans_otp) — PDF inclus: ${pdfBase64.length > 0}, taille base64: ${pdfBase64.length} chars`);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[Make] Webhook sans_otp HTTP error: ${res.status} — ${body}`);
    } else {
      console.log("[Make] Webhook sans_otp envoyé avec succès, status:", res.status);
    }
  } catch (err: unknown) {
    console.error("[Make] Webhook sans_otp exception réseau:", err instanceof Error ? err.message : err);
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

    const profil = profilLabels[data.profil] ?? "";

    const today = new Date();
    const dateSimulation = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    const brevoAttributes = {
      PRENOM:              data.prenom,
      NOM:                 data.nom,
      SOURCE:              "Simu-PER",
      STATUT_MARITAL:      statut,
      TMI:                 computed.tmi,
      REVENU_IMPOSABLE:    computed.revenuImposable,
      SALAIRE_MENSUEL:     parseFloat(data.salaireMensuel) || 0,
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
      ...(data.objectif  ? { OBJECTIF:   objectifLabels[data.objectif]   ?? data.objectif  } : {}),
      ...(data.statutPro ? { STATUT_PRO: statutProLabels[data.statutPro] ?? data.statutPro } : {}),
      ...(data.revenusConjoint ? { REVENU_CONJOINT: (parseFloat(data.revenusConjoint) || 0) * 12 } : {}),
      OTP_VERIFIE:           false,
      SIMULATION_EN_ATTENTE: false,
    };
    console.log("[Brevo early-contact] Attributs clés — SALAIRE_MENSUEL:", brevoAttributes.SALAIRE_MENSUEL, "STATUT_PRO:", brevoAttributes.STATUT_PRO, "OBJECTIF:", brevoAttributes.OBJECTIF);
    const brevoBody = {
      email:         data.email,
      updateEnabled: true,
      attributes:    brevoAttributes,
      listIds:       [6], // Liste "Leads sans OTP" — migré vers #5 à la validation OTP
    };

    const results = await Promise.allSettled([
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
      syncPipedriveSafe(data, computed, false), // pas d'OTP → pipeline "Leads sans OTP" / étape "Simulation effectuée"
    ]);
    results.forEach((r, i) => {
      const label = ["brevoContact", "sendMakeWebhookSansOtp", "syncPipedriveSafe"][i];
      if (r.status === "rejected") {
        console.error(`[early-contact] ${label} rejeté:`, r.reason instanceof Error ? r.reason.message : r.reason);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[early-contact]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ ok: false });
  }
}
