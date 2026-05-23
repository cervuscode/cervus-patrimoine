import { NextRequest, NextResponse } from "next/server";

const BREVO_API = "https://api.brevo.com/v3";

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+33" + cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const { email, telephone } = await req.json();
    const headers = { "api-key": process.env.BREVO_API_KEY! };

    if (email) {
      const res = await fetch(
        `${BREVO_API}/contacts/${encodeURIComponent(email)}`,
        { headers }
      );
      return NextResponse.json({ exists: res.ok });
    }

    if (telephone) {
      const formatted = formatPhone(telephone);
      const filter = encodeURIComponent(JSON.stringify({ "attributes.TELEPHONE": formatted }));
      const res = await fetch(`${BREVO_API}/contacts?filter=${filter}&limit=1`, { headers });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({ exists: (json.contacts?.length ?? 0) > 0 });
      }
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: false });
  } catch {
    // Non-blocking — on erreur, on laisse passer
    return NextResponse.json({ exists: false });
  }
}
