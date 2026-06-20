import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Barrière d'auth pour TOUTES les routes /api/rdv/*.
 * Ces routes restent atteignables depuis l'hôte public (le middleware ne 404 que
 * /app/*, pas /api). La session NextAuth est posée sur app.cervuspatrimoine.fr →
 * une requête sans session valide est rejetée (401).
 *
 * Renvoie la session si OK, sinon `null` (l'appelant répond 401).
 */
export async function requireConseiller() {
  const session = await getServerSession(authOptions);
  return session ?? null;
}
