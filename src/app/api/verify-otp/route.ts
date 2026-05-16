import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const { telephone, code } = await req.json();
    if (!telephone || !code) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verificationChecks.create({ to: telephone, code });

    if (check.status === "approved") {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false, error: "Code incorrect ou expiré" }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("[verify-otp]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
