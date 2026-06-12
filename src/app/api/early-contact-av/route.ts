import { NextRequest, NextResponse } from "next/server";
import { syncAVToPipedrive } from "@/lib/pipedrive";
import type { AVComputed } from "@/lib/av-engine";

const BREVO_API = "https://api.brevo.com/v3";

// Liste Brevo "AV sans OTP" (#11). Migrée vers #12 à la validation OTP (verify-otp).
const AV_LIST_SANS_OTP = 11;

// Données AV transmises par le front (sous-ensemble d'AVFormData côté serveur).
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

// Pipedrive — appel non bloquant.
async function syncPipedriveSafe(data: AVData, computed: AVComputed, otpVerifie: boolean) {
  if (!process.env.PIPEDRIVE_API_TOKEN || !process.env.PIPEDRIVE_DOMAIN) {
    console.warn("[early-contact-av] Pipedrive non configuré, sync ignorée");
    return;
  }
  try {
    await syncAVToPipedrive(data, computed, otpVerifie);
  } catch (err: unknown) {
    console.error("[early-contact-av] Pipedrive sync échouée:", err instanceof Error ? err.message : err);
  }
}

async function sendMakeWebhookSansOtp(data: AVData, computed: AVComputed) {
  // Scénario Make DÉDIÉ AV (isolé du PER) → MAKE_WEBHOOK_URL_AV
  const webhookUrl = process.env.MAKE_WEBHOOK_URL_AV;
  if (!webhookUrl) {
    console.error("[Make] Webhook AV non envoyé : MAKE_WEBHOOK_URL_AV absent (type: sans_otp)");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  try {
    // Lancement AV SANS pièce jointe PDF (pas de PDF généré).
    const payload = {
      produit: "AV",
      type: "sans_otp",
      email: data.email.trim().toLowerCase(),
      prenom: data.prenom,
      nom: data.nom,
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
    console.log("[Make] Payload AV sans_otp:", JSON.stringify(payload));
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[Make] Webhook AV sans_otp HTTP error: ${res.status} — ${body}`);
    } else {
      console.log("[Make] Webhook AV sans_otp envoyé, status:", res.status);
    }
  } catch (err: unknown) {
    console.error("[Make] Webhook AV sans_otp exception:", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data, computed } = (await req.json()) as { data: AVData; computed: AVComputed };

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

    const brevoAttributes = {
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
      OTP_VERIFIE: false,
      SIMULATION_EN_ATTENTE: false,
    };

    const brevoBody = {
      email: data.email,
      updateEnabled: true,
      attributes: brevoAttributes,
      listIds: [AV_LIST_SANS_OTP], // #11 — migré vers #12 à la validation OTP
    };

    const results = await Promise.allSettled([
      fetch(`${BREVO_API}/contacts`, {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify(brevoBody),
      }).then((res) => {
        if (!res.ok) console.error(`[early-contact-av] Brevo error: ${res.status}`);
      }),
      sendMakeWebhookSansOtp(data, computed),
      syncPipedriveSafe(data, computed, false),
    ]);
    results.forEach((r, i) => {
      const label = ["brevoContact", "sendMakeWebhookSansOtp", "syncPipedriveSafe"][i];
      if (r.status === "rejected") {
        console.error(`[early-contact-av] ${label} rejeté:`, r.reason instanceof Error ? r.reason.message : r.reason);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[early-contact-av]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ ok: false });
  }
}
