import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocument from "./PdfDocument";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

const BREVO_API = "https://api.brevo.com/v3";

async function sendEmail(data: SimulateurData, computed: ComputedResults, pdfBase64: string) {
  const body = {
    sender: { name: "Cervus Patrimoine", email: "simulation@cervuspatrimoine.fr" },
    to: [{ email: data.email, name: data.prenom }],
    subject: `Votre simulation PER — Cervus Patrimoine, ${data.prenom}`,
    htmlContent: `
      <p>Bonjour ${data.prenom},</p>
      <p>Merci d'avoir utilisé le simulateur PER Cervus Patrimoine.</p>
      <p>
        <strong>Économie fiscale estimée :</strong> ${computed.economieFiscale.toLocaleString("fr-FR")} €/an<br/>
        <strong>Capital estimé à 64 ans :</strong> ${computed.capitalFinal.toLocaleString("fr-FR")} €<br/>
        <strong>TMI :</strong> ${computed.tmi} %
      </p>
      <p>Votre rapport complet est joint à cet email.</p>
      <p>
        Pour approfondir votre situation patrimoniale, prenez rendez-vous avec Auguste Dechery :<br/>
        <a href="${process.env.NEXT_PUBLIC_CALENDLY_URL ?? "https://cervuspatrimoine.fr/simulateur-per"}">
          Prendre rendez-vous
        </a>
      </p>
      <p style="font-size:11px;color:#999;font-style:italic;margin-top:24px;">
        Ces projections sont fournies à titre indicatif et ne constituent pas un conseil en investissement.
        Cervus Patrimoine · ORIAS n° 25006770
      </p>
    `,
    attachment: [
      {
        name: `Simulation_PER_Cervus_${data.prenom}.pdf`,
        content: pdfBase64,
      },
    ],
  };

  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[submit] Brevo email error:", err);
  }
}

async function createBrevoContact(data: SimulateurData, computed: ComputedResults) {
  const statut =
    data.statut === "marie" || data.statut === "pacse"
      ? "Couple"
      : data.statut === "parent_isole"
      ? "Parent isolé"
      : "Célibataire";

  const profil = { prudent: "Prudent", equilibre: "Équilibré", dynamique: "Dynamique" }[data.profil];

  const body = {
    email: data.email,
    updateEnabled: true,
    attributes: {
      FIRSTNAME: data.prenom,
      SMS: data.telephone,
      SOURCE: "Simu-PER",
      STATUT_FISCAL: statut,
      TMI: computed.tmi,
      REVENUS_ANNUELS: computed.revenuImposable,
      VERSEMENT_PER: computed.versementAnnuel,
      ECONOMIE_IMPOT: computed.economieFiscale,
      CAPITAL_PROJETE: computed.capitalFinal,
      PROFIL_RISQUE: profil,
      CONSENTEMENT_RDV: data.consentementRdv,
    },
    listIds: [4], // ID liste "Leads Simu-PER" — à ajuster selon votre compte Brevo
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
    console.error("[submit] Brevo contact error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data, computed } = (await req.json()) as {
      data: SimulateurData;
      computed: ComputedResults;
    };

    if (!data.email || !data.prenom) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      // @ts-expect-error — react-pdf types differ from React's generic ReactElement
      React.createElement(PdfDocument, { data, computed })
    );
    const pdfBase64 = pdfBuffer.toString("base64");

    // Run email + CRM in parallel — non-blocking on partial failure
    await Promise.allSettled([
      sendEmail(data, computed, pdfBase64),
      createBrevoContact(data, computed),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[submit]", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
