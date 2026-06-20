import { NextResponse } from "next/server";
import { requireConseiller } from "../_guard";
import { searchPersonsByTerm } from "@/lib/pipedrive";

export async function GET(req: Request) {
  if (!(await requireConseiller())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    const results = await searchPersonsByTerm(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[/api/rdv/search]", err);
    return NextResponse.json({ error: "Recherche impossible" }, { status: 500 });
  }
}
