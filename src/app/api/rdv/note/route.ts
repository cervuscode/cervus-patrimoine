import { NextResponse } from "next/server";
import { requireConseiller } from "../_guard";
import { addDealNote } from "@/lib/pipedrive";

// Ajoute une NOTE de synthèse sur le Deal actif (Lot 3). Protégé conseiller.
// Le contenu HTML est composé côté client (sim-history.formatSyntheseNote).
// N'écrit AUCUN champ Découverte — uniquement la création de note.
export async function POST(req: Request) {
  if (!(await requireConseiller())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  let body: { dealId?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  const dealId = Number(body.dealId);
  if (!Number.isInteger(dealId) || dealId <= 0) {
    return NextResponse.json({ error: "dealId invalide" }, { status: 400 });
  }
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content === "") {
    return NextResponse.json({ error: "Contenu vide" }, { status: 400 });
  }
  try {
    await addDealNote(dealId, content);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/rdv/note]", err);
    return NextResponse.json({ error: "Écriture de la note impossible" }, { status: 500 });
  }
}
