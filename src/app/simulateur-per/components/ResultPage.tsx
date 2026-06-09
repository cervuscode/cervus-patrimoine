"use client";

import { useState } from "react";
import { ComputedResults, SimulateurData, Profil } from "../types";
import {
  AreaChart,
  Area,
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
  // Bascule RDV : Calendly → page /reserver (Pipedrive Scheduler).
  // NEXT_PUBLIC_CALENDLY_URL est conservé tant que la bascule n'est pas confirmée en prod.
  // const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "#";
  const calendlyUrl = "/reserver";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2 p-8 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.25)]">
          <span className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest">
            Capital estimé à {computed.ageRetraiteNum} ans
          </span>
          <span
            className="font-cormorant font-semibold leading-[1.05] tracking-tight whitespace-nowrap"
            style={{ color: "#5D4738", fontSize: "clamp(2rem, 6.5vw, 3rem)" }}
          >
            {fmt(computed.capitalFinal)} €
          </span>
          <span className="font-inter text-xs text-cervus-dark/45">
            sur {computed.nAnnees} an{computed.nAnnees > 1 ? "s" : ""} · hypothèse {(computed.tauxAnnuel * 100).toFixed(0)} %/an
          </span>
        </div>
        <div className="flex flex-col gap-2 p-8 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.25)]">
          <span className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest">
            Économie fiscale annuelle estimée
          </span>
          <span
            className="font-cormorant font-semibold leading-[1.05] tracking-tight whitespace-nowrap"
            style={{ color: "#5D4738", fontSize: "clamp(2rem, 6.5vw, 3rem)" }}
          >
            {fmt(computed.economieFiscale)} €
          </span>
          <span className="font-inter text-xs text-cervus-dark/45">
            Versement {fmt(computed.versementAnnuel)} €/an · TMI {computed.tmi} %
          </span>
        </div>
      </div>

      {/* Avertissement TMI 11% */}
      {computed.tmi === 11 && (
        <div
          className="flex flex-col gap-3 p-5 rounded-xl border"
          style={{ backgroundColor: "#FFF3CD", borderColor: "#F59E0B" }}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <p className="font-inter text-sm text-cervus-dark/80 leading-relaxed">
              Votre taux marginal d&apos;imposition est de 11 %. Dans votre situation,
              l&apos;avantage fiscal du PER est limité. Nous vous recommandons d&apos;échanger
              avec un expert avant de souscrire.
            </p>
          </div>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start font-inter text-sm font-medium text-cervus-dark/70 underline underline-offset-2 hover:text-cervus-gold transition-colors"
          >
            Parler à un expert →
          </a>
        </div>
      )}

      {/* Dual chart */}
      {chartData.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest">
            Progression du capital & cumul d&apos;économie fiscale
          </p>
          <div className="h-72 w-full rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)] p-5 pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="capitalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#795D48" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#795D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" vertical={false} />
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
                  iconType="plainline"
                  wrapperStyle={{ fontFamily: "var(--font-inter)", fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => (
                    <span style={{ color: "#5D4738" }}>
                      {value === "capital" ? "Capital projeté" : "Économie fiscale cumulée"}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="capital"
                  stroke="#5D4738"
                  strokeWidth={2.5}
                  fill="url(#capitalFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#5D4738" }}
                />
                <Area
                  type="monotone"
                  dataKey="economieCumulee"
                  stroke="#795D48"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill="none"
                  dot={false}
                  strokeOpacity={0.55}
                  activeDot={{ r: 3, fill: "#795D48" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CTA fort — focal point */}
      <div className="flex flex-col items-center text-center gap-5 p-8 sm:p-10 rounded-3xl bg-cervus-cream border-2 border-cervus-gold/40 shadow-[0_10px_40px_-14px_rgba(93,71,56,0.35)]">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-cormorant text-3xl sm:text-4xl font-semibold" style={{ color: "#5D4738" }}>
            Affinez votre stratégie avec un expert
          </h3>
          <p className="font-inter text-sm text-cervus-dark/55">
            30 minutes · gratuit · sans engagement · conseil indépendant
          </p>
        </div>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-cervus-gold text-white font-inter text-base font-medium tracking-[0.02em] rounded-[50px] hover:bg-cervus-gold-light transition-colors duration-200 shadow-lg shadow-[#5D4738]/25"
        >
          Réserver mon entretien gratuit
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

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

      {/* Re-send email */}
      <div className="flex flex-col gap-3">
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
                className="flex-1 h-10 border border-cervus-cream rounded-xl bg-[#F2EDE8] px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
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
