import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import ClientView from "@/components/conseiller/ClientView";

// Toujours dynamique : on lit Pipedrive à chaque ouverture (snapshot frais).
export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
}: {
  params: { personId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personId = Number(params.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    return <ErrorShell message="Identifiant client invalide." />;
  }

  try {
    const client = await getClientView(personId);
    return (
      <main className="min-h-screen">
        <TopBar />
        <ClientView initial={client} />
      </main>
    );
  } catch {
    return <ErrorShell message="Impossible de charger cette fiche depuis Pipedrive." />;
  }
}

function TopBar() {
  return (
    <div className="border-b border-cervus-gold/15 px-4 py-3 sm:px-6">
      <Link href="/" className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
        ← Recherche
      </Link>
    </div>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start gap-4 px-6 py-16">
      <Link href="/" className="text-sm text-cervus-bronze/70 hover:text-cervus-bronze">
        ← Recherche
      </Link>
      <p className="text-cervus-bronze/80">{message}</p>
    </main>
  );
}
