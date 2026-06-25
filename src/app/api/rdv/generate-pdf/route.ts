import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireConseiller } from "../_guard";
import { resolveClientContext } from "@/lib/compte-rendu-context";
import { buildRenderModel, type CompositionPayload } from "@/lib/compte-rendu";
import CompteRenduDocument from "@/components/pdf/CompteRenduDocument";

export const runtime = "nodejs";

/**
 * Génère le PDF « Compte-rendu de RDV » (Lot 11). Protégé conseiller.
 * Le body ne porte QUE des paramètres de composition — le serveur recalcule tout
 * depuis Pipedrive (invariant sécurité Lot 2+). Retourne le PDF en téléchargement.
 */
export async function POST(req: Request) {
  if (!(await requireConseiller())) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { personId?: unknown; composition?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const personId = Number(body.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    return new Response(JSON.stringify({ error: "personId invalide" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const composition = (body.composition ?? {}) as CompositionPayload;
  if (!composition.blocs || typeof composition.blocs !== "object") {
    return new Response(JSON.stringify({ error: "Composition invalide" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { ctx } = await resolveClientContext(personId);

    const dateStr = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const model = buildRenderModel(composition, ctx, dateStr);

    const pdfBuffer = (await renderToBuffer(
      // @ts-expect-error — react-pdf types differ from React's generic ReactElement
      React.createElement(CompteRenduDocument, { model })
    )) as Buffer;

    const filename = `compte-rendu-${(ctx.code ?? "client").replace(/[^A-Za-z0-9-]/g, "")}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/rdv/generate-pdf]", err);
    return new Response(JSON.stringify({ error: "Génération du PDF impossible" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
