import { NextRequest, NextResponse } from "next/server";
import { syncToPipedrive } from "@/lib/pipedrive";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * /api/pipedrive-sync — server-side uniquement.
 * Pousse la simulation PER dans Pipedrive (Person + Deal) via appel API direct.
 * Le token reste côté serveur (variable d'env PIPEDRIVE_API_TOKEN).
 *
 * Body attendu : { data: SimulateurData, computed: ComputedResults, otpVerifie?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const { data, computed, otpVerifie } = (await req.json()) as {
      data: SimulateurData;
      computed: ComputedResults;
      otpVerifie?: boolean;
    };

    if (!data?.email || !isValidEmail(data.email) || !computed) {
      return NextResponse.json({ error: "Données manquantes ou email invalide" }, { status: 400 });
    }

    if (!process.env.PIPEDRIVE_API_TOKEN || !process.env.PIPEDRIVE_DOMAIN) {
      console.error("[pipedrive-sync] Variables d'env PIPEDRIVE_API_TOKEN / PIPEDRIVE_DOMAIN absentes");
      return NextResponse.json({ error: "Configuration Pipedrive manquante" }, { status: 500 });
    }

    const result = await syncToPipedrive(data, computed, otpVerifie === true);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    console.error("[pipedrive-sync]", err instanceof Error ? err.message : "Erreur inconnue");
    return NextResponse.json({ ok: false, error: "Erreur lors de la synchronisation Pipedrive" }, { status: 500 });
  }
}
