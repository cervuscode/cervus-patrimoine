import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("0")) {
    return "+33" + cleaned.slice(1);
  }
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  return "+33" + cleaned;
}

const BREVO_API = "https://api.brevo.com/v3";

type Produit = "PER" | "AV";

// Migration de listes à la validation OTP, paramétrée PAR PRODUIT :
// le contact passe de la liste « sans OTP » à la liste « avec OTP » du produit.
// PER = #6 → #5 (inchangé). AV = listes AV (placeholders à renseigner).
const LIST_MIGRATION: Record<Produit, { from: number; to: number }> = {
  PER: { from: 6, to: 5 },
  // TODO (étape 3, manuel) : renseigner les IDs réels des listes Brevo AV.
  // Tant que from/to valent 0, la migration de listes AV est ignorée (seuls les
  // attributs sont mis à jour) — voir garde dans markOtpVerifiedInBrevo.
  AV: { from: 0 /* TODO ID liste AV sans OTP */, to: 0 /* TODO ID liste AV avec OTP */ },
};

function normaliseProduit(value: unknown): Produit {
  return value === "AV" ? "AV" : "PER"; // défaut PER
}

// Numéros whitelistés : tout code à 6 chiffres est accepté, Twilio non appelé
const PHONE_WHITELIST = new Set(["0781196794", "+33781196794", "0658558903", "+33658558903"]);

async function markOtpVerifiedInBrevo(email: string, telephone: string, produit: Produit) {
  if (!email) return;
  const cleaned = telephone.replace(/\s/g, "");
  const formatted = cleaned.startsWith("0")
    ? "+33" + cleaned.slice(1)
    : cleaned.startsWith("+")
    ? cleaned
    : "+33" + cleaned;

  const headers = {
    "api-key": process.env.BREVO_API_KEY!,
    "Content-Type": "application/json",
  };

  const { from, to } = LIST_MIGRATION[produit];
  const migrationActive = from > 0 && to > 0;

  try {
    const calls: Promise<Response>[] = [
      // Mise à jour des attributs (OTP_VERIFIE + numéro de téléphone)
      fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          attributes: { OTP_VERIFIE: true, TELEPHONE: formatted, SIMULATION_EN_ATTENTE: false },
        }),
      }),
    ];

    if (migrationActive) {
      calls.push(
        // Retrait de la liste « sans OTP » du produit
        fetch(`${BREVO_API}/contacts/lists/${from}/contacts/remove`, {
          method: "POST",
          headers,
          body: JSON.stringify({ emails: [email] }),
        }),
        // Ajout à la liste « avec OTP » du produit
        fetch(`${BREVO_API}/contacts/lists/${to}/contacts/add`, {
          method: "POST",
          headers,
          body: JSON.stringify({ emails: [email] }),
        })
      );
    } else {
      console.warn(`[verify-otp] Migration de listes ignorée pour produit ${produit} (IDs non configurés)`);
    }

    const [resPut, resRemove, resAdd] = await Promise.all(calls);
    if (!resPut.ok) console.error(`[verify-otp] Brevo PUT contact: ${resPut.status}`);
    if (migrationActive) {
      if (resRemove && !resRemove.ok) console.error(`[verify-otp] Brevo remove list #${from}: ${resRemove.status}`);
      if (resAdd && !resAdd.ok) console.error(`[verify-otp] Brevo add list #${to}: ${resAdd.status}`);
    }
  } catch (err) {
    console.error("[verify-otp] Brevo update failed:", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telephone, code, email, produit } = await req.json();
    if (!telephone || !code) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    const produitNorm = normaliseProduit(produit); // défaut PER

    // Validation du format du code avant tout appel Twilio
    if (!/^\d{6}$/.test(String(code))) {
      return NextResponse.json({ valid: false, error: "Code incorrect ou expiré" }, { status: 400 });
    }

    // Whitelist — accepter tout code valide (6 chiffres) sans appeler Twilio
    if (PHONE_WHITELIST.has(telephone.replace(/\s/g, ""))) {
      if (/^\d{6}$/.test(code)) {
        void markOtpVerifiedInBrevo(email ?? "", telephone, produitNorm);
        return NextResponse.json({ valid: true });
      }
      return NextResponse.json({ valid: false, error: "Code incorrect ou expiré" }, { status: 400 });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verificationChecks.create({ to: formatPhone(telephone), code });

    if (check.status === "approved") {
      void markOtpVerifiedInBrevo(email ?? "", telephone, produitNorm);
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false, error: "Code incorrect ou expiré" }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("[verify-otp]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}
