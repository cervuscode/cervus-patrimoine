import { NextResponse } from "next/server";
import { requireConseiller } from "../_guard";
import { computeNextClientCode } from "@/lib/pipedrive";

// Volet B : propose le prochain code disponible (scan + 1). N'écrit RIEN dans
// Pipedrive — Auguste copie-colle le code manuellement, puis « Lier la fiche ».
export async function GET() {
  if (!(await requireConseiller())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const code = await computeNextClientCode();
    return NextResponse.json({ code });
  } catch (err) {
    console.error("[/api/rdv/next-code]", err);
    return NextResponse.json({ error: "Génération impossible" }, { status: 500 });
  }
}
