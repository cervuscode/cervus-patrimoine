import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { SimulateurData, ComputedResults } from "@/app/simulateur-per/types";

const gold = "#795D48";
const dark = "#0f0f0f";
const cream = "#f8f5f1";
const grey = "#888";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: dark, backgroundColor: "#fff" },
  header: { marginBottom: 28 },
  title: { fontSize: 22, color: gold, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: grey },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 9, color: gold, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, borderBottom: `0.5px solid ${cream}`, paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 200, color: grey },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  bigNumber: { fontSize: 28, fontFamily: "Helvetica-Bold", color: gold, marginBottom: 2 },
  bigLabel: { fontSize: 9, color: grey, textTransform: "uppercase", letterSpacing: 1 },
  bigBlock: { backgroundColor: cream, padding: 16, marginBottom: 8, borderRadius: 3 },
  disclaimer: { fontSize: 8, color: grey, fontStyle: "italic", marginTop: 28, lineHeight: 1.6, borderTop: `0.5px solid ${cream}`, paddingTop: 12 },
  footer: { fontSize: 8, color: grey, position: "absolute", bottom: 32, left: 48, right: 48, textAlign: "center" },
  twoCol: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
});

const STATUT_LABELS: Record<string, string> = {
  celibataire: "Célibataire",
  divorce: "Divorcé(e)",
  marie: "Marié(e)",
  pacse: "Pacsé(e)",
  parent_isole: "Parent isolé",
};

const PROFIL_LABELS: Record<string, string> = {
  prudent: "Prudent (3 %/an)",
  equilibre: "Équilibré (4 %/an)",
  dynamique: "Dynamique (5 %/an)",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
}

export default function PdfDocument({ data, computed }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Cervus Patrimoine</Text>
          <Text style={s.subtitle}>Votre simulation PER personnalisée — {data.prenom}</Text>
        </View>

        {/* Situation */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Situation familiale</Text>
          <View style={s.row}><Text style={s.label}>Statut</Text><Text style={s.value}>{STATUT_LABELS[data.statut] ?? data.statut}</Text></View>
          <View style={s.row}><Text style={s.label}>Enfants à charge</Text><Text style={s.value}>{data.nbEnfants === 6 ? "6 ou plus" : data.nbEnfants}</Text></View>
          <View style={s.row}><Text style={s.label}>Parts fiscales</Text><Text style={s.value}>{computed.partsTotal.toLocaleString("fr-FR")} parts</Text></View>
          <View style={s.row}><Text style={s.label}>TMI calculée</Text><Text style={s.value}>{computed.tmi} %</Text></View>
        </View>

        {/* Revenus */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Revenus</Text>
          <View style={s.row}><Text style={s.label}>Revenu global imposable</Text><Text style={s.value}>{fmt(computed.revenuImposable)}</Text></View>
          {parseFloat(data.salaires) > 0 && <View style={s.row}><Text style={s.label}>Salaires (net avant impôt)</Text><Text style={s.value}>{fmt(parseFloat(data.salaires))}</Text></View>}
          {parseFloat(data.bnc) > 0 && <View style={s.row}><Text style={s.label}>BNC (net)</Text><Text style={s.value}>{fmt(parseFloat(data.bnc))}</Text></View>}
          {parseFloat(data.bic) > 0 && <View style={s.row}><Text style={s.label}>BIC (net)</Text><Text style={s.value}>{fmt(parseFloat(data.bic))}</Text></View>}
          {parseFloat(data.foncier) > 0 && <View style={s.row}><Text style={s.label}>Revenus fonciers (net)</Text><Text style={s.value}>{fmt(parseFloat(data.foncier))}</Text></View>}
        </View>

        {/* Résultats fiscaux */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Résultat fiscal</Text>
          <View style={s.twoCol}>
            <View style={[s.bigBlock, s.col]}>
              <Text style={s.bigLabel}>Économie fiscale / an</Text>
              <Text style={s.bigNumber}>{fmt(computed.economieFiscale)}</Text>
              <Text style={{ fontSize: 8, color: grey }}>Versement {fmt(computed.versementAnnuel)}/an · TMI {computed.tmi}%</Text>
            </View>
            <View style={[s.bigBlock, s.col]}>
              <Text style={s.bigLabel}>Capital estimé à 64 ans</Text>
              <Text style={s.bigNumber}>{fmt(computed.capitalFinal)}</Text>
              <Text style={{ fontSize: 8, color: grey }}>{computed.nAnnees} ans · {PROFIL_LABELS[data.profil]}</Text>
            </View>
          </View>
        </View>

        {/* Projection */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Projection PER</Text>
          <View style={s.row}><Text style={s.label}>Versement mensuel</Text><Text style={s.value}>{fmt(parseFloat(data.versementMensuel) || 0)}</Text></View>
          <View style={s.row}><Text style={s.label}>Profil investisseur</Text><Text style={s.value}>{PROFIL_LABELS[data.profil]}</Text></View>
          <View style={s.row}><Text style={s.label}>Durée</Text><Text style={s.value}>{computed.nAnnees} an{computed.nAnnees > 1 ? "s" : ""}</Text></View>
          <View style={s.row}><Text style={s.label}>Capital final estimé</Text><Text style={s.value}>{fmt(computed.capitalFinal)}</Text></View>
        </View>

        {/* CTA */}
        <View style={{ marginTop: 8, marginBottom: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: gold }}>
            Prendre RDV pour approfondir votre simulation
          </Text>
          <Text style={{ fontSize: 9, color: grey, marginTop: 2 }}>cervuspatrimoine.fr/simulateur-per</Text>
        </View>

        {/* Disclaimer */}
        <Text style={s.disclaimer}>
          Ces projections sont fournies à titre indicatif sur la base des données renseignées.
          Un Plan d&apos;Épargne Retraite présente des contreparties importantes — notamment le
          blocage des fonds jusqu&apos;à la retraite et une fiscalité spécifique à la sortie —
          qu&apos;il est essentiel d&apos;évaluer avec un conseiller avant toute souscription.
          Les résultats de cette simulation ne constituent pas un conseil en investissement.
        </Text>

        {/* Footer */}
        <Text style={s.footer}>
          Cervus Patrimoine · Auguste Dechery · ORIAS n° 25006770 · Mandataire d&apos;Intermédiaire d&apos;Assurance
        </Text>
      </Page>
    </Document>
  );
}
