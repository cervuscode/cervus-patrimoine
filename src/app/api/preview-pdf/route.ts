import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import PdfDocument from "@/app/api/submit/PdfDocument";
import { SimulateurData, ComputedResults, PROFIL_TAUX } from "@/app/simulateur-per/types";
import {
  calculerParts,
  calculerRevenuImposable,
  calculerTMI,
  projectionPER,
  economieFiscaleAnnuelle,
  impotReel,
} from "@/lib/fiscal-engine";

const MOCK: SimulateurData = {
  statut:             "celibataire",
  nbEnfants:          0,
  gardeParentale:     null,
  salaireMensuel:     "5500",
  abattementSalaires: "forfait10",
  fraisReels:         "",
  revenusConjoint:    "",
  autresRevenus:      false,
  bnc:                "",
  bic:                "",
  foncier:            "",
  anneeNaissance:     "1983",
  ageRetraite:        "64",
  versementInitial:   "5000",
  versementMensuel:   "300",
  profil:             "equilibre",
  objectif:           "reduire_impots",
  statutPro:          "salarie",
  prenom:             "Marie",
  nom:                "Dupont",
  email:              "marie.dupont@example.com",
  telephone:          "0612345678",
  otpCode:            "",
  otpSent:            false,
  otpVerified:        true,
  consentementRdv:    true,
  consentementRgpd:   true,
};

function buildComputed(): ComputedResults {
  const { partsBase, partsTotal } = calculerParts("celibataire", 0);
  const revenuImposable = calculerRevenuImposable({
    salaires:           5500 * 12,
    abattementSalaires: "forfait10",
  });
  const tmi             = calculerTMI(revenuImposable, partsBase, partsTotal);
  const currentYear     = new Date().getFullYear();
  const nAnnees         = Math.max(0, 64 - (currentYear - 1983));
  const tauxAnnuel      = PROFIL_TAUX["equilibre"];
  const versementMensuel = 300;
  const versementInitial = 5000;
  const { capitalFinal, courbe } = projectionPER(
    versementMensuel, tauxAnnuel, nAnnees, versementInitial
  );
  const economieFiscale   = economieFiscaleAnnuelle(versementMensuel, tmi);
  const versementAnnuel   = versementMensuel * 12;
  const impotAvant        = Math.round(impotReel(revenuImposable, partsBase, partsTotal));
  const revApres          = Math.max(0, revenuImposable - versementAnnuel);
  const impotApres        = Math.round(impotReel(revApres, partsBase, partsTotal));
  const economieAnn       = impotAvant - impotApres;
  const pasMensAvant      = Math.round(impotAvant / 12);
  const pasMensApres      = Math.round(impotApres / 12);
  const economieMensuelle = Math.max(0, Math.round(versementMensuel - economieAnn / 12));
  return {
    partsBase,
    partsTotal,
    revenuImposable,
    tmi,
    nAnnees,
    ageRetraiteNum:  64,
    tauxAnnuel,
    capitalFinal,
    courbe,
    economieFiscale,
    versementAnnuel,
    impotAvant,
    impotApres,
    pasMensAvant,
    pasMensApres,
    economieMensuelle,
  };
}

export async function GET() {
  const pdfBuffer = await renderToBuffer(
    // @ts-expect-error — react-pdf types differ from React's generic ReactElement
    React.createElement(PdfDocument, { data: MOCK, computed: buildComputed() })
  );
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": "inline; filename=\"preview-simulation.pdf\"",
    },
  });
}
