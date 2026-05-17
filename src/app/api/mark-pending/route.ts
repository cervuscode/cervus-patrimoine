import { NextRequest, NextResponse } from "next/server";

const BREVO_API = "https://api.brevo.com/v3";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };
    if (!email) return NextResponse.json({ ok: false });

    const body = {
      attributes: {
        SIMULATION_EN_ATTENTE: true,
      },
    };

    const res = await fetch(`${BREVO_API}/contacts/${encodeURIComponent(email)}`, {
      method: "PUT",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[mark-pending] Brevo error:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[mark-pending]", err);
    return NextResponse.json({ ok: false });
  }
}
