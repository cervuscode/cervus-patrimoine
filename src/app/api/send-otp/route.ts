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

function isValidFrenchMobile(phone: string): boolean {
  const digits = phone.replace(/\s/g, "");
  return /^0[67]\d{8}$/.test(digits);
}

// Numéros whitelistés : bypass rate limiting + Twilio (pas de coût)
const PHONE_WHITELIST = new Set(["0781196794", "+33781196794"]);

// Rate limiting en mémoire : max 3 tentatives par IP sur 10 minutes
const rateLimitMap = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAt: now });
    return false;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { telephone } = await req.json();
    if (!telephone) {
      return NextResponse.json({ error: "Numéro de téléphone manquant" }, { status: 400 });
    }

    // 1. Validation format avant tout appel Twilio
    if (!isValidFrenchMobile(telephone)) {
      return NextResponse.json(
        { error: "Numéro invalide — utilisez un numéro mobile français (06 ou 07)" },
        { status: 400 }
      );
    }

    // 2. Whitelist — bypass rate limiting et appel Twilio
    if (PHONE_WHITELIST.has(telephone.replace(/\s/g, ""))) {
      return NextResponse.json({ sent: true });
    }

    // 3. Rate limiting par IP avant tout appel Twilio
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de tentatives, réessayez dans quelques minutes" },
        { status: 429 }
      );
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
