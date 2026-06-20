"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import SessionActivityGuard from "./SessionActivityGuard";

/**
 * Frontière client du layout conseiller : monte le <SessionProvider> (nécessaire à
 * useSession/getSession côté client) et la garde d'inactivité (Lot 2, point A).
 *
 * refetchInterval volontairement non défini (= 0, pas de polling) : avec
 * updateAge:0, tout appel à /api/auth/session re-signe le JWT — un polling
 * prolongerait la session sans activité réelle. La prolongation est pilotée
 * uniquement par l'activité utilisateur (SessionActivityGuard).
 */
export default function ConseillerSessionShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus>
      <SessionActivityGuard />
      {children}
    </SessionProvider>
  );
}
