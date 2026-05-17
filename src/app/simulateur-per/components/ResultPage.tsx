"use client";

import { useState } from "react";
import { ComputedResults, SimulateurData, Profil } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
  onSendEmail: (altEmail?: string) => void;
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

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return local.slice(0, 2) + "***@" + domain;
}

export default function ResultPage({ data, computed, onSendEmail, emailSent, emailLoading }: Props) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#";
  const [altEmail, setAltEmail] = useState("");
  const [showAltEmail, setShowAltEmail] = useState(false);
  const altEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(altEmail);

  // Courbe duale : capital + cumul économie fiscale
  const chartData = computed.courbe.map((point, i) => ({
    annee: point.annee,
    capital: point.capital,
    economieCumulee: Math.round(computed.versementAnnuel * (computed.tmi / 100) * (i + 1)),
  }));

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
        <div className="p-6 bg-cervus-dark rounded-xl flex flex-col gap-2">
          <span className="font-inter text-xs text-white/40 uppercase tracking-widest">
            Capital estimé à {computed.ageRetraiteNum} ans
          </span>
          <span className="font-cormorant text-5xl font-light" style={{ color: "#795D48" }}>
            {fmt(computed.capitalFinal)} €
          </span>
          <span className="font-inter text-xs text-white/30">
            sur {computed.nAnnees} an{computed.nAnnees > 1 ? "s" : ""} · hypothèse {(computed.tauxAnnuel * 100).toFixed(0)} %/an
          </span>
        </div>
        <div className="p-6 bg-cervus-dark rounded-xl flex flex-col gap-2">
          <span className="font-inter text-xs text-white/40 uppercase tracking-widest">
            Économie fiscale annuelle estimée
          </span>
          <span className="font-cormorant text-5xl font-light" style={{ color: "#795D48" }}>
            {fmt(computed.economieFiscale)} €
          </span>
          <span className="font-inter text-xs text-white/30">
            Versement {fmt(computed.versementAnnuel)} €/an · TMI {computed.tmi} %
          </span>
        </div>
      </div>

      {/* Dual chart */}
      {chartData.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest">
            Progression du capital & cumul d&apos;économie fiscale
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
                  formatter={(value, name) => [
                    `${fmt(Number(value))} €`,
                    name === "capital" ? "Capital" : "Économie fiscale cumulée",
                  ]}
                  labelFormatter={(label) => `Année ${label}`}
                  contentStyle={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 12,
                    border: "1px solid #e8e2da",
                    borderRadius: 8,
                    boxShadow: "none",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "var(--font-inter)", fontSize: 11 }}
                  formatter={(value) =>
                    value === "capital" ? "Capital" : "Économie fiscale cumulée"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="capital"
                  stroke="#795D48"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#795D48" }}
                />
                <Line
                  type="monotone"
                  dataKey="economieCumulee"
                  stroke="#795D48"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                  strokeOpacity={0.45}
                  activeDot={{ r: 3, fill: "#795D48" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="font-inter text-[10px] text-cervus-dark/30 text-right">
            — Capital &nbsp;&nbsp; - - Économie fiscale cumulée
          </p>
        </div>
      )}

      {/* Confirmation email */}
      <div className="p-5 bg-cervus-cream/60 border border-cervus-cream rounded-xl flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#795D48" strokeWidth="1.2" />
            <path d="M4.5 7l2 2 3-3" stroke="#795D48" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-inter text-sm text-cervus-dark/70">
            Votre simulation complète a été envoyée à{" "}
            <strong>{maskEmail(data.email)}</strong>. Pensez à vérifier vos spams.
          </p>
        </div>
        <p className="font-inter text-xs text-cervus-gold italic ml-5">
          La simulation envoyée par email est plus complète que l&apos;aperçu affiché ici.
        </p>
      </div>

      {/* Mise en garde réglementaire */}
      <div className="p-5 bg-cervus-cream/40 border border-cervus-cream rounded-xl">
        <p className="font-inter text-xs text-cervus-dark/50 leading-relaxed italic">
          Ces projections sont fournies à titre indicatif sur la base des données que vous avez
          renseignées. Un Plan d&apos;Épargne Retraite présente des contreparties importantes —
          notamment le blocage des fonds jusqu&apos;à la retraite et une fiscalité spécifique à
          la sortie — qu&apos;il est essentiel d&apos;évaluer avec un conseiller avant toute
          souscription.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-cervus-gold text-white font-inter text-sm font-medium rounded-xl hover:bg-cervus-gold-light transition-colors text-center"
        >
          Prendre RDV avec un conseiller
        </a>

        {/* Re-send email */}
        {!showAltEmail ? (
          <button
            onClick={() => setShowAltEmail(true)}
            className="font-inter text-sm text-cervus-dark/40 hover:text-cervus-dark/70 transition-colors text-center"
          >
            Vous n&apos;avez pas reçu le mail ?
          </button>
        ) : (
          <div className="flex flex-col gap-2 p-4 border border-cervus-cream rounded-xl">
            <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
              Autre adresse email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={altEmail}
                onChange={(e) => setAltEmail(e.target.value)}
                placeholder="autre@email.fr"
                className="flex-1 h-10 border border-cervus-cream rounded-xl bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
              />
              <button
                onClick={() => onSendEmail(altEmail)}
                disabled={!altEmailValid || emailLoading || emailSent}
                className="px-4 py-2 bg-cervus-gold text-white font-inter text-xs font-medium rounded-xl hover:bg-cervus-gold-light transition-colors disabled:opacity-30 whitespace-nowrap"
              >
                {emailLoading ? "Envoi…" : emailSent ? "✓ Envoyé" : "Renvoyer"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Consentement passif */}
      <p className="font-inter text-xs text-cervus-dark/30 text-center leading-relaxed">
        En cliquant sur Voir mes résultats, vous avez accepté d&apos;être recontacté par Cervus
        Patrimoine conformément à nos politiques de confidentialité.
      </p>

      {/* Footer réglementaire */}
      <div className="border-t border-cervus-cream pt-6 text-center">
        <p className="font-inter text-[10px] text-cervus-dark/30">
          Cervus Patrimoine · Auguste Dechery · ORIAS n° 25006770 · Mandataire d&apos;Intermédiaire d&apos;Assurance
        </p>
      </div>
    </div>
  );
}
