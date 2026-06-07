import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cervus Patrimoine — Cabinet de gestion de patrimoine indépendant",
  description:
    "Cervus Patrimoine, cabinet indépendant de gestion de patrimoine. PER, assurance-vie, succession, stratégie patrimoniale sur mesure.",
  keywords: ["gestion de patrimoine", "PER", "assurance-vie", "conseil financier", "Cervus Patrimoine"],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO (Axeptio): ajouter <Script id="axeptio" strategy="afterInteractive" src="https://static.axept.io/sdk.js" data-id="VOTRE_CLE_AXEPTIO" />
  // GA4 / GTM doivent être conditionnés au consentement Axeptio avant activation.
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
