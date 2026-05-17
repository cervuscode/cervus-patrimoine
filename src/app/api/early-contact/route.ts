import { NextRequest, NextResponse } from "next/server";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

const BREVO_API = "https://api.brevo.com/v3";

export async function POST(req: NextRequest) {
  try {
    const { data, computed } = (await req.json()) as {
      data: SimulateurData;
      computed: ComputedResults;
    };

    if (!data.email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }

    const statut =
      data.statut === "marie" || data.statut === "pacse"
        ? "Couple"
        : data.statut === "parent_isole"
        ? "Parent isolé"
        : "Célibataire";

    const profil = { prudent: "Prudent", equilibre: "Équilibré", dynamique: "Dynamique" }[data.profil] ?? "";

    const body = {
      email: data.email,
      updateEnabled: true,
      attributes: {
        FIRSTNAME: data.prenom,
        LASTNAME: data.nom,
        SOURCE: "Simu-PER",
        STATUT_FISCAL: statut,
        TMI: computed.tmi,
        REVENUS_ANNUELS: computed.revenuImposable,
        AGE_RETRAITE: computed.ageRetraiteNum,
        VERSEMENT_PER: computed.versementAnnuel,
        ECONOMIE_IMPOT: computed.economieFiscale,
        CAPITAL_PROJETE: computed.capitalFinal,
        PROFIL_RISQUE: profil,
        OTP_VERIFIE: false,
        SIMULATION_EN_ATTENTE: false,
      },
      listIds: [4],
    };

    const res = await fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[early-contact] Brevo error:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[early-contact]", err);
    return NextResponse.json({ ok: false });
  }
}
