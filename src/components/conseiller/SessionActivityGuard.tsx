"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSession, signOut, useSession } from "next-auth/react";

// On ne « touche » la session au plus qu'une fois toutes les 5 min sur activité :
// inutile de pinger à chaque clic, la fenêtre glissante fait 1h.
const ACTIVITY_THROTTLE_MS = 5 * 60 * 1000;

/**
 * Garde d'inactivité (Lot 2, point A). Doit être monté dans un <SessionProvider>.
 *
 * On NE fait PAS de polling périodique de la session : avec updateAge:0, chaque
 * appel à /api/auth/session re-signe le JWT (exp repoussé) — un polling
 * maintiendrait donc la session vivante SANS activité réelle, ce qui annulerait le
 * timeout. À la place :
 *
 *  1. Prolongation glissante sur activité réelle : à un clic/frappe/scroll/touch
 *     (throttlé ~5 min) → getSession() re-signe le JWT et renvoie un nouvel
 *     `expires` (~now + 1h). Les frappes/clics SANS navigation sont ainsi comptés.
 *  2. Déconnexion exacte à l'expiration : un timer est armé sur la date `expires`
 *     de la session. À chaque prolongation, il est ré-armé. À l'échéance (1h sans
 *     activité) → signOut vers /login?reason=timeout (message clair).
 */
export default function SessionActivityGuard() {
  const { data, status } = useSession();
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPing = useRef(0);

  const scheduleLogout = useCallback((expiresISO?: string | null) => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (!expiresISO) return;
    const ms = new Date(expiresISO).getTime() - Date.now();
    if (ms <= 0) {
      void signOut({ callbackUrl: "/login?reason=timeout" });
      return;
    }
    logoutTimer.current = setTimeout(() => {
      void signOut({ callbackUrl: "/login?reason=timeout" });
    }, ms);
  }, []);

  // Arme / ré-arme le timer dès qu'on connaît l'`expires` courant (montage + focus).
  useEffect(() => {
    if (status === "authenticated") scheduleLogout(data?.expires ?? null);
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [status, data?.expires, scheduleLogout]);

  // Prolongation glissante sur activité (throttlée).
  useEffect(() => {
    if (status !== "authenticated") return;

    async function onActivity() {
      const now = Date.now();
      if (now - lastPing.current < ACTIVITY_THROTTLE_MS) return;
      lastPing.current = now;
      // getSession() touche /api/auth/session → re-signe le JWT (updateAge:0) et
      // renvoie un `expires` repoussé d'1h → on ré-arme le timer dessus.
      const fresh = await getSession();
      scheduleLogout(fresh?.expires ?? null);
    }

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    for (const ev of events) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
    return () => {
      for (const ev of events) window.removeEventListener(ev, onActivity);
    };
  }, [status, scheduleLogout]);

  return null;
}
