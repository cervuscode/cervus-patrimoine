import { NextResponse } from "next/server";
import { requireConseiller } from "../_guard";
import { saveDecouverteRDV } from "@/lib/pipedrive";

// Écrit UNIQUEMENT les champs Découverte RDV modifiés (jamais Simulation).
// Le client n'envoie que les champs réellement édités (dirty) — voir RdvClientProvider.
export async function POST(req: Request) {
  if (!(await requireConseiller())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  let body: {
    personId?: unknown;
    dealId?: unknown;
    personValues?: Record<string, string | number | null>;
    dealValues?: Record<string, string | number | null>;
    notes?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  const personId = Number(body.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    return NextResponse.json({ error: "personId invalide" }, { status: 400 });
  }
  const dealId = body.dealId != null ? Number(body.dealId) : null;
  try {
    await saveDecouverteRDV({
      personId,
      dealId: dealId && Number.isInteger(dealId) ? dealId : null,
      personValues: body.personValues,
      dealValues: body.dealValues,
      notes: body.notes,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/rdv/save]", err);
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }
}
