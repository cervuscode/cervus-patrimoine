import { NextRequest, NextResponse } from "next/server";

const BREVO_API = "https://api.brevo.com/v3";

export type Produit = "PER" | "AV";

// Listes Brevo par produit. La détection de doublon est désormais « par produit » :
// un contact n'est considéré comme déjà présent QUE s'il appartient à au moins une
// liste du produit concerné (un lead PER peut donc faire une simu AV, et inversement).
const PER_LIST_IDS = [5, 6]; // #5 Leads Simu-PER (OTP) + #6 Leads sans OTP — inchangé
// TODO (étape 3, manuel) : renseigner les IDs réels des listes Brevo AV
// (équivalents « sans OTP » et « avec OTP »). Tant que la liste est vide, aucune
// simu AV n'est bloquée pour doublon (exists = false).
const AV_LIST_IDS: number[] = [/* TODO IDs Brevo AV : [sansOtp, avecOtp] */];

function listsForProduit(produit: Produit): number[] {
  return produit === "AV" ? AV_LIST_IDS : PER_LIST_IDS;
}

function normaliseProduit(value: unknown): Produit {
  return value === "AV" ? "AV" : "PER"; // défaut PER
}

function belongsToProduit(contactListIds: unknown, produitLists: number[]): boolean {
  if (!Array.isArray(contactListIds) || produitLists.length === 0) return false;
  return produitLists.some((id) => contactListIds.includes(id));
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+33" + cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const { email, telephone, produit } = await req.json();
    const headers = { "api-key": process.env.BREVO_API_KEY! };
    const produitLists = listsForProduit(normaliseProduit(produit));

    if (email) {
      const res = await fetch(
        `${BREVO_API}/contacts/${encodeURIComponent(email)}`,
        { headers }
      );
      if (!res.ok) return NextResponse.json({ exists: false });
      const contact = await res.json().catch(() => null);
      return NextResponse.json({ exists: belongsToProduit(contact?.listIds, produitLists) });
    }

    if (telephone) {
      const formatted = formatPhone(telephone);
      const filter = encodeURIComponent(JSON.stringify({ "attributes.TELEPHONE": formatted }));
      const res = await fetch(`${BREVO_API}/contacts?filter=${filter}&limit=1`, { headers });
      if (res.ok) {
        const json = await res.json();
        const contact = json.contacts?.[0];
        return NextResponse.json({ exists: belongsToProduit(contact?.listIds, produitLists) });
      }
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: false });
  } catch {
    // Non-blocking — on erreur, on laisse passer
    return NextResponse.json({ exists: false });
  }
}
