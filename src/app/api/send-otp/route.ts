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

export async function POST(req: NextRequest) {
  try {
    const { telephone } = await req.json();
    if (!telephone) {
      return NextResponse.json({ error: "Numéro de téléphone manquant" }, { status: 400 });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verifications.create({ to: formatPhone(telephone), channel: "sms" });

    return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    console.error("[send-otp]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
