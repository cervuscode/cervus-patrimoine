import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getClientView } from "@/lib/pipedrive";
import NotesEditor from "@/components/conseiller/NotesEditor";

// Onglet dédié aux notes (ouvert en _blank depuis le panneau persistant).
// Hors du groupe (conseiller) → pas de panneau persistant ici (onglet focalisé).
// noindex : metadata dédiée + header X-Robots-Tag du middleware sur l'hôte app.
export const metadata: Metadata = {
  title: "Notes — Cervus Patrimoine",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

export default async function NotesPage({
  params,
}: {
  params: { personId: string };
}) {
  // Même barrière d'auth que tout /app/(conseiller)/* (session NextAuth requise).
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const personId = Number(params.personId);
  if (!Number.isInteger(personId) || personId <= 0) {
    return <Shell message="Identifiant client invalide." />;
  }

  try {
    const client = await getClientView(personId);
    // Code du deal le plus récent (repère discret, jamais le nom en partage d'écran).
    const code = client.deals.find((d) => d.code)?.code ?? null;
    return (
      <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
        <NotesEditor personId={personId} initialNotes={client.notes ?? ""} clientCode={code} />
      </div>
    );
  } catch {
    return <Shell message="Impossible de charger les notes depuis Pipedrive." />;
  }
}

function Shell({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-cervus-dark text-cervus-bronze font-inter">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-cervus-bronze/80">{message}</p>
      </main>
    </div>
  );
}
