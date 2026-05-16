"use client";

import { ComputedResults, SimulateurData, Profil } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
  onSendEmail: () => void;
  emailSent: boolean;
  emailLoading: boolean;
}

const PROFIL_LABELS: Record<Profil, string> = {
  prudent: "Profil Prudent — 3 %/an",
  equilibre: "Profil Équilibré — 4 %/an",
  dynamique: "Profil Dynamique — 5 %/an",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

export default function ResultPage({ data, computed, onSendEmail, emailSent, emailLoading }: Props) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#";

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-cervus-gold/10 border border-cervus-gold/20 rounded-full px-4 py-1.5 mb-6">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#795D48" strokeWidth="1.2" />
            <path d="M4.5 7l2 2 3-3" stroke="#795D48" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-inter text-xs text-cervus-gold uppercase tracking-widest">
            Simulation complétée
          </span>
        </div>
        <h2 className="font-cormorant text-4xl lg:text-5xl font-light text-cervus-dark mb-2">
          Votre simulation, {data.prenom}
        </h2>
        <span className="inline-block font-inter text-xs text-cervus-gold bg-cervus-gold/10 px-3 py-1 rounded-full">
          {PROFIL_LABELS[data.profil]}
        </span>
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-cervus-dark rounded-sm flex flex-col gap-2">
          <span className="font-inter text-xs text-white/40 uppercase tracking-widest">
            Économie fiscale annuelle
          </span>
          <span className="font-cormorant text-5xl font-light text-cervus-gold-light">
            {fmt(computed.economieFiscale)} €
          </span>
          <span className="font-inter text-xs text-white/30">
            Versement {fmt(computed.versementAnnuel)} €/an · TMI {computed.tmi} %
          </span>
        </div>
        <div className="p-6 bg-cervus-dark rounded-sm flex flex-col gap-2">
          <span className="font-inter text-xs text-white/40 uppercase tracking-widest">
            Capital estimé à 64 ans
          </span>
          <span className="font-cormorant text-5xl font-light text-cervus-gold-light">
            {fmt(computed.capitalFinal)} €
          </span>
          <span className="font-inter text-xs text-white/30">
            sur {computed.nAnnees} an{computed.nAnnees > 1 ? "s" : ""} · hypothèse {(computed.tauxAnnuel * 100).toFixed(0)} %/an
          </span>
        </div>
      </div>

      {/* Recharts — courbe progression */}
      <div className="flex flex-col gap-4">
        <p className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest">
          Progression du capital
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={computed.courbe} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis
                dataKey="annee"
                tick={{ fontSize: 10, fontFamily: "var(--font-inter)", fill: "#b0a090" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                tick={{ fontSize: 10, fontFamily: "var(--font-inter)", fill: "#b0a090" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [`${fmt(Number(value))} €`, "Capital"]}
                labelFormatter={(label) => `Année ${label}`}
                contentStyle={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  border: "1px solid #e8e2da",
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              />
              <Line
                type="monotone"
                dataKey="capital"
                stroke="#795D48"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#795D48" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mise en garde réglementaire */}
      <div className="p-5 bg-cervus-cream/60 border border-cervus-cream rounded-sm">
        <p className="font-inter text-xs text-cervus-dark/50 leading-relaxed italic">
          Ces projections sont fournies à titre indicatif sur la base des données que vous avez
          renseignées. Un Plan d&apos;Épargne Retraite présente des contreparties importantes —
          notamment le blocage des fonds jusqu&apos;à la retraite et une fiscalité spécifique à
          la sortie — qu&apos;il est essentiel d&apos;évaluer avec un conseiller avant toute
          souscription.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors text-center"
        >
          Prendre RDV pour approfondir ma simulation
        </a>
        <button
          onClick={onSendEmail}
          disabled={emailSent || emailLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border border-cervus-gold text-cervus-gold font-inter text-sm font-medium rounded hover:bg-cervus-gold/5 transition-colors disabled:opacity-50"
        >
          {emailLoading ? "Envoi…" : emailSent ? "✓ Rapport envoyé" : "Recevoir mon rapport par email"}
        </button>
      </div>

      {/* Footer réglementaire */}
      <div className="border-t border-cervus-cream pt-6 text-center">
        <p className="font-inter text-[10px] text-cervus-dark/30">
          Cervus Patrimoine · Auguste Dechery · ORIAS n° 25006770 · Mandataire d&apos;Intermédiaire d&apos;Assurance
        </p>
      </div>
    </div>
  );
}
