import type { Metadata } from "next";
import SchedulerPipedrive from "@/components/SchedulerPipedrive";

export const metadata: Metadata = {
  title: "Réservez votre bilan patrimonial | Cervus Patrimoine",
  description:
    "Réservez en quelques clics votre bilan patrimonial avec un conseiller Cervus Patrimoine.",
};

export default function ReserverPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-cormorant text-4xl sm:text-5xl font-light text-[#0f0f0f] mb-10 leading-tight">
          Réservez votre bilan patrimonial
        </h1>
        <SchedulerPipedrive />
      </div>
    </main>
  );
}
