import { NextResponse } from "next/server";
import { requireConseiller } from "../_guard";
import { readDealCodeClient } from "@/lib/pipedrive";

// Volet B : vérifie que le champ Code client du deal contient bien la valeur
// générée/copiée par Auguste. Ne modifie rien — simple vérification.
export async function POST(req: Request) {
  if (!(await requireConseiller())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  let body: { dealId?: unknown; expectedCode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }
  const dealId = Number(body.dealId);
  const expected = String(body.expectedCode ?? "").trim();
  if (!Number.isInteger(dealId) || dealId <= 0 || !expected) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }
  try {
    const current = await readDealCodeClient(dealId);
    const match = current != null && current.toLowerCase() === expected.toLowerCase();
    return NextResponse.json({ match, current });
  } catch (err) {
    console.error("[/api/rdv/link-code]", err);
    return NextResponse.json({ error: "Vérification impossible" }, { status: 500 });
  }
}
