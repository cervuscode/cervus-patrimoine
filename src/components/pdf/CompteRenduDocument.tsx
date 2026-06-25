import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { RenderModel } from "@/lib/compte-rendu";
import { s, GOLD, GOLD_LIGHT, BROWN, DARK, GREY, CREAM, FooterReglementaire } from "./pdf-theme";
import SyntheseFiscaleBlock from "./blocks/SyntheseFiscaleBlock";
import PlafondsPerBlock from "./blocks/PlafondsPerBlock";
import ContributionsHRBlock from "./blocks/ContributionsHRBlock";
import PyramideBlock from "./blocks/PyramideBlock";
import PerQuickBlock from "./blocks/PerQuickBlock";
import PerFullBlock from "./blocks/PerFullBlock";
import AvBlock from "./blocks/AvBlock";
import ComparateurBlock from "./blocks/ComparateurBlock";
import ReductionBlock from "./blocks/ReductionBlock";

/**
 * Document racine du « Compte-rendu de RDV » (Lot 11).
 * Page de garde + corps (blocs sélectionnés dans l'ordre). Pied de page réglementaire
 * répété sur chaque page (`fixed`). Calqué sur les PDF de production du repo.
 *
 * Émis par le cabinet Cervus Patrimoine — aucun nom de conseiller (plusieurs
 * conseillers à terme). Code client `C-XXXX`, jamais le nom.
 */
export default function CompteRenduDocument({ model }: { model: RenderModel }) {
  const codeLabel = model.code ?? "—";

  return (
    <Document>
      {/* ── PAGE DE GARDE ──────────────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* Logo texte stylisé (pas d'image — émetteur cabinet) */}
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, color: GOLD, letterSpacing: 3, marginBottom: 4 }}>
            CERVUS PATRIMOINE
          </Text>
          <Text style={{ fontFamily: "Helvetica", fontSize: 8, color: GREY, letterSpacing: 1, marginBottom: 40 }}>
            Conseil en gestion de patrimoine indépendant
          </Text>

          <View style={{ height: 0.8, backgroundColor: GOLD, marginBottom: 22 }} />

          <Text style={{ fontFamily: "Times-Roman", fontSize: 30, color: DARK, letterSpacing: 0.5 }}>
            Compte-rendu de
          </Text>
          <Text style={{ fontFamily: "Times-Bold", fontSize: 30, color: DARK, letterSpacing: 0.5, marginBottom: 26 }}>
            rendez-vous
          </Text>

          {/* Code client en évidence — jamais le nom */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Text style={{ fontSize: 8, color: GREY, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Client
            </Text>
            <View style={{ backgroundColor: BROWN, borderRadius: 5, paddingVertical: 4, paddingHorizontal: 12 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14, color: CREAM, letterSpacing: 1 }}>
                {codeLabel}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 9, color: GREY, marginBottom: 40 }}>
            Établi le {model.dateStr}
          </Text>
        </View>

        {/* Bandeau identité cabinet en bas de la page de garde */}
        <View style={{ borderTopWidth: 0.6, borderTopColor: GOLD_LIGHT, paddingTop: 10 }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: GOLD, letterSpacing: 1 }}>
            Cervus Patrimoine
          </Text>
          <Text style={{ fontSize: 7.5, color: GREY, marginTop: 2 }}>
            ORIAS 25006770 — SIREN 944 972 553
          </Text>
        </View>

        <FooterReglementaire />
      </Page>

      {/* ── CORPS ──────────────────────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        {model.blocks.length === 0 ? (
          <Text style={{ fontSize: 9, color: GREY }}>
            Aucun bloc sélectionné.
          </Text>
        ) : (
          model.blocks.map((block, i) => {
            switch (block.kind) {
              case "synthese-fiscale":
                return <SyntheseFiscaleBlock key={i} model={block} />;
              case "plafonds-per":
                return <PlafondsPerBlock key={i} model={block} />;
              case "contributions-hr":
                return <ContributionsHRBlock key={i} model={block} />;
              case "pyramide":
                return <PyramideBlock key={i} model={block} />;
              case "per-quick":
                return <PerQuickBlock key={i} model={block} />;
              case "per-full":
                return <PerFullBlock key={i} model={block} />;
              case "av":
                return <AvBlock key={i} model={block} />;
              case "comparateur":
                return <ComparateurBlock key={i} model={block} />;
              case "reduction":
                return <ReductionBlock key={i} model={block} />;
              default:
                return null;
            }
          })
        )}
        <FooterReglementaire />
      </Page>
    </Document>
  );
}
