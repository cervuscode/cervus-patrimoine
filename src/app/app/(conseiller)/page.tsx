import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import SignOutButton from "@/components/conseiller/SignOutButton";
import ClientSearch from "@/components/conseiller/ClientSearch";
import SimulateurGrid from "@/components/conseiller/SimulateurGrid";

export default async function ConseillerHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const identite = session.user?.name ?? session.user?.email ?? "Conseiller";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-12 pb-28 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-cervus-gold-light">
            Cervus Patrimoine
          </p>
          <h1 className="font-cormorant text-4xl font-semibold text-cervus-bronze sm:text-5xl">
            Espace Conseiller
          </h1>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-cervus-bronze/70">Rechercher un client</h2>
        <ClientSearch />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-cervus-bronze/70">Simulateurs</h2>
        <SimulateurGrid />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-cervus-bronze/70">Outils</h2>
        <Link
          href="/reference-fiscale"
          className="group rounded-2xl border border-cervus-gold/30 bg-cervus-dark/60 p-4 transition-colors hover:border-cervus-gold hover:bg-cervus-gold/10"
        >
          <div className="flex items-center justify-between">
            <p className="font-cormorant text-xl text-cervus-bronze">Référence fiscale 2026</p>
            <span className="text-cervus-gold-light transition-transform group-hover:translate-x-0.5">→</span>
          </div>
          <p className="mt-1 text-xs text-cervus-bronze/60">
            Impôt net, TMI et économie PER — vérification express, sans client ouvert.
          </p>
        </Link>
      </section>

      <p className="text-xs text-cervus-bronze/40">
        Connecté en tant que {identite}.
      </p>
    </main>
  );
}
