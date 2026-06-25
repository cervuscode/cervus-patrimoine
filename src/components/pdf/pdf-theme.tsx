import { Text, View, StyleSheet } from "@react-pdf/renderer";

/**
 * Thème PDF partagé du « Compte-rendu de RDV » (Lot 11).
 *
 * Calqué EXACTEMENT sur les deux PDF de production du repo
 * (`api/submit/PdfDocument.tsx` PER + `api/submit-av/PdfDocumentAV.tsx` AV) :
 * mêmes tokens charte, mêmes polices Helvetica/Times, même formatage manuel des
 * nombres (toLocaleString("fr-FR") insère un   qui rend « / » dans les
 * polices PDF → on reconstruit l'espace fine à la main).
 *
 * Module de COMPOSANTS @react-pdf/renderer uniquement — jamais monté dans le DOM.
 */

// ── Design tokens (charte Cervus) ───────────────────────────────────────────────
export const CREAM = "#F2EDE8";
export const WHITE = "#ffffff";
export const GOLD = "#795D48";
export const GOLD_LIGHT = "#a07d62";
export const BROWN = "#5D4738";
export const BROWN_DEEP = "#3a2c22";
export const DARK = "#1C1C1C";
export const GREY = "#888888";
export const SOFT = "#D4C9BE";

// ── Number formatting (identique aux PDF existants) ─────────────────────────────
export function fmtNum(n: number): string {
  const a = Math.round(Math.abs(n));
  const s = a.toString();
  let r = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) r += " ";
    r += s[i];
  }
  return (n < 0 ? "-" : "") + r;
}
export function fmt(n: number): string {
  return fmtNum(n) + " €";
}
export function fmtK(n: number): string {
  if (Math.abs(n) >= 10000) return Math.round(n / 1000) + " k€";
  return fmtNum(n) + " €";
}
/** Pourcentage avec virgule décimale française (ex. « 7,7 % »). */
export function fmtPct(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",") + " %";
}

/** Date du jour formatée FR (sans heure — pas de séparateur problématique). */
export function todayStr(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Texte réglementaire imposé (Lot 11) — affiché en pied de CHAQUE page.
 * Aucun nom de conseiller : le document est émis par le cabinet Cervus Patrimoine.
 */
export const FOOTER_TEXT =
  "Document à caractère informatif et pédagogique, non contractuel. " +
  "Les simulations présentées sont des estimations indicatives basées sur des hypothèses de rendement non garanties. " +
  "Les performances passées ne préjugent pas des performances futures. " +
  "Cervus Patrimoine — ORIAS 25006770 — SIREN 944 972 553.";

// ── StyleSheet partagé (calqué sur les PDF existants) ───────────────────────────
export const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    backgroundColor: CREAM,
  },
  secTitle: {
    fontFamily: "Times-Roman",
    fontSize: 13,
    color: DARK,
    letterSpacing: 0.4,
  },
  secLine: {
    height: 0.6,
    backgroundColor: GOLD,
    marginTop: 3,
    marginBottom: 8,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 8,
  },
  cardLbl: {
    fontSize: 6,
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  cardVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK },
  cardAcc: { fontSize: 10, fontFamily: "Helvetica-Bold", color: GOLD },
  cardSub: { fontSize: 6.5, color: GREY, marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    fontSize: 6,
    color: GREY,
    textAlign: "center",
    borderTopWidth: 0.4,
    borderTopColor: SOFT,
    paddingTop: 5,
    lineHeight: 1.4,
  },
});

/** Pied de page réglementaire, répété sur chaque page via `fixed`. */
export function FooterReglementaire() {
  return <Text style={s.footer} fixed>{FOOTER_TEXT}</Text>;
}

/** Titre de section avec filet doré (réutilisable par tous les blocs). */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View>
      <Text style={s.secTitle}>{children}</Text>
      <View style={s.secLine} />
    </View>
  );
}

/** Couleur de texte lisible selon le fond de chip (charte : clair → texte sombre). */
export function chipText(color: string): string {
  return color === CREAM || color === GOLD_LIGHT ? BROWN_DEEP : CREAM;
}
