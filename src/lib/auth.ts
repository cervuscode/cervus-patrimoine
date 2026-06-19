import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Domaine Workspace autorisé (jamais codé en dur dans la logique : variable d'env).
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN ?? "cervuspatrimoine.fr";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          // Indice de domaine côté Google (UX : pré-filtre le sélecteur de compte).
          // NE FAIT PAS office de sécurité : `hd` est falsifiable côté client,
          // la vraie barrière est la vérification server-side dans le callback signIn.
          hd: ALLOWED_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    // URLs PUBLIQUES (sans préfixe /app) : le middleware réécrit le host
    // app.cervuspatrimoine.fr/login -> /app/login en interne.
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      // Défense en profondeur : ne JAMAIS se fier au seul paramètre `hd`.
      // On revérifie server-side le domaine de l'email retourné par Google.
      const p = profile as { email?: string; email_verified?: boolean } | undefined;
      const email = p?.email?.toLowerCase();
      if (!email) return false;
      // Google doit avoir vérifié l'email (compte Workspace = toujours vérifié).
      if (p?.email_verified === false) return false;
      const domain = email.split("@")[1];
      if (domain !== ALLOWED_DOMAIN) return false; // -> ?error=AccessDenied
      return true;
    },
  },
};
