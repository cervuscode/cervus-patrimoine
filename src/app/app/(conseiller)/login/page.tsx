import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInButton from "@/components/conseiller/SignInButton";

function messageErreur(error?: string): string | null {
  if (!error) return null;
  switch (error) {
    case "AccessDenied":
      return "Accès refusé. Cet espace est réservé aux comptes @cervuspatrimoine.fr. Connectez-vous avec votre adresse professionnelle Cervus Patrimoine.";
    default:
      return "La connexion a échoué. Réessayez avec votre compte Google professionnel @cervuspatrimoine.fr.";
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  const erreur = messageErreur(searchParams?.error);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-cervus-gold-light">
          Cervus Patrimoine
        </p>
        <h1 className="font-cormorant text-4xl font-semibold text-cervus-bronze">
          Espace Conseiller
        </h1>
        <p className="text-sm text-cervus-bronze/70">
          Accès réservé à l&apos;équipe Cervus Patrimoine.
        </p>
      </header>

      {erreur && (
        <p
          role="alert"
          className="rounded-2xl border border-cervus-gold/40 bg-cervus-gold/10 px-5 py-4 text-sm text-cervus-bronze"
        >
          {erreur}
        </p>
      )}

      <SignInButton />
    </main>
  );
}
