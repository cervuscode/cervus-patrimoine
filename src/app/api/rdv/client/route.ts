import { NextResponse } from "next/server";
import { requireConseiller } from "../_guard";
import { getClientView } from "@/lib/pipedrive";

export async function GET(req: Request) {
  if (!(await requireConseiller())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const personId = Number(new URL(req.url).searchParams.get("personId"));
  if (!Number.isInteger(personId) || personId <= 0) {
    return NextResponse.json({ error: "personId invalide" }, { status: 400 });
  }
  try {
    const client = await getClientView(personId);
    return NextResponse.json({ client });
  } catch (err) {
    console.error("[/api/rdv/client]", err);
    return NextResponse.json({ error: "Chargement impossible" }, { status: 500 });
  }
}
