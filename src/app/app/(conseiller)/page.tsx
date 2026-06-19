import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/conseiller/SignOutButton";

export default async function ConseillerHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const identite = session.user?.name ?? session.user?.email ?? "Conseiller";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-cervus-gold-light">
          Cervus Patrimoine
        </p>
        <h1 className="font-cormorant text-5xl font-semibold text-cervus-bronze">
          Espace Conseiller
        </h1>
      </header>

      <p className="text-base text-cervus-bronze/80">
        Connecté en tant que{" "}
        <span className="font-medium text-cervus-bronze">{identite}</span>.
      </p>

      <SignOutButton />
    </main>
  );
}
