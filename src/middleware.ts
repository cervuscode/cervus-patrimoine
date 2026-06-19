import { NextResponse, type NextRequest } from "next/server";

// Hôtes qui servent l'espace conseiller.
// - app.cervuspatrimoine.fr : production
// - app.localhost          : dev local (résolu vers 127.0.0.1 par les navigateurs
//                            modernes, sans modifier /etc/hosts)
// La logique de routing par hostname est STRICTEMENT IDENTIQUE en dev et en prod :
// aucune branche conditionnelle sur NODE_ENV.
const APP_HOSTS = new Set(["app.cervuspatrimoine.fr", "app.localhost"]);

function getHostname(req: NextRequest): string {
  const host = req.headers.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

function withNoindex(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export function middleware(req: NextRequest) {
  const isAppHost = APP_HOSTS.has(getHostname(req));
  const { pathname } = req.nextUrl;

  if (isAppHost) {
    // Routes techniques : ne JAMAIS réécrire.
    // - /api/auth/* : le callback OAuth doit rester à la racine
    //   (https://app.cervuspatrimoine.fr/api/auth/callback/google).
    // - /_next/*    : assets internes Next.
    // - /app/*      : déjà préfixé (évite le double préfixe).
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/app")
    ) {
      return withNoindex(NextResponse.next());
    }
    // Réécrit le chemin public (app.cervuspatrimoine.fr/...) vers le groupe
    // de routes interne /app/(conseiller)/...
    const url = req.nextUrl.clone();
    url.pathname = `/app${pathname}`;
    return withNoindex(NextResponse.rewrite(url));
  }

  // Hôte public (cervuspatrimoine.fr) : l'espace conseiller ne doit JAMAIS y être
  // servi, même en accès direct à /app/*. Renvoie un 404 propre.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  // Exécute le middleware sur tout sauf les assets statiques et le favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
