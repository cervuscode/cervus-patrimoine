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

// Numéros whitelistés : tout code à 6 chiffres est accepté, Twilio non appelé
const PHONE_WHITELIST = new Set(["0781196794", "+33781196794", "0658558903", "+33658558903"]);

async function markOtpVerifiedInBrevo(email: string, telephone: string) {
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

  try {
    const [resPut, resRemove, resAdd] = await Promise.all([
      // Mise à jour des attributs (OTP_VERIFIE + numéro de téléphone)
      fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          attributes: { OTP_VERIFIE: true, TELEPHONE: formatted, SIMULATION_EN_ATTENTE: false },
        }),
      }),
      // Retrait de la liste #6 (Leads sans OTP)
      fetch(`${BREVO_API}/contacts/lists/6/contacts/remove`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emails: [email] }),
      }),
      // Ajout à la liste #5 (Leads Simu-PER)
      fetch(`${BREVO_API}/contacts/lists/5/contacts/add`, {
        method: "POST",
        headers,
        body: JSON.stringify({ emails: [email] }),
      }),
    ]);
    if (!resPut.ok)    console.error(`[verify-otp] Brevo PUT contact: ${resPut.status}`);
    if (!resRemove.ok) console.error(`[verify-otp] Brevo remove list #6: ${resRemove.status}`);
    if (!resAdd.ok)    console.error(`[verify-otp] Brevo add list #5: ${resAdd.status}`);
  } catch (err) {
    console.error("[verify-otp] Brevo update failed:", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { telephone, code, email } = await req.json();
    if (!telephone || !code) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Validation du format du code avant tout appel Twilio
    if (!/^\d{6}$/.test(String(code))) {
      return NextResponse.json({ valid: false, error: "Code incorrect ou expiré" }, { status: 400 });
    }

    // Whitelist — accepter tout code valide (6 chiffres) sans appeler Twilio
    if (PHONE_WHITELIST.has(telephone.replace(/\s/g, ""))) {
      if (/^\d{6}$/.test(code)) {
        void markOtpVerifiedInBrevo(email ?? "", telephone);
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
      void markOtpVerifiedInBrevo(email ?? "", telephone);
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false, error: "Code incorrect ou expiré" }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("[verify-otp]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}
