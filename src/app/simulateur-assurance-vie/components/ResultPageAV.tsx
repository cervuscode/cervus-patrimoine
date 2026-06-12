"use client";

import { AVFormData, AV_PROFILS } from "../types";
import type { AVComputed } from "@/lib/av-engine";
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
  data: AVFormData;
  computed: AVComputed;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

const MODES_GESTION = [
  {
    titre: "Gestion libre",
    desc: "Vous choisissez et arbitrez vous-même vos supports. Autonomie maximale, mais nécessite du temps et des connaissances.",
  },
  {
    titre: "Gestion pilotée",
    desc: "L'allocation est déléguée à une équipe selon votre profil de risque. Un équilibre entre délégation et accessibilité.",
  },
  {
    titre: "Gestion sous mandat",
    desc: "Un mandat de gestion confié à un professionnel qui décide pour vous, dans un cadre défini avec vous.",
  },
];

export default function ResultPageAV({ data, computed }: Props) {
  const reserverUrl = "/reserver";
  const profil = AV_PROFILS.find((p) => p.value === data.profil);

  const chartData = computed.courbe.map((pt) => ({
    annee: pt.annee,
    sans: pt.capitalSans,
    avec: pt.capitalAvec,
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
        {profil && (
          <span className="inline-block font-inter text-xs text-cervus-gold bg-cervus-gold/10 px-3 py-1 rounded-full">
            Profil {profil.label} — {profil.taux} %/an · horizon {data.dureeAnnees} ans
          </span>
        )}
      </div>

      {/* Chiffres clés — comparaison uniquement si la purge est pertinente */}
      {computed.purgeUtile ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)]">
            <span className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest">
              Capital final brut
            </span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)" }}>
              {fmt(computed.capitalFinalBrut)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">avant fiscalité de sortie</span>
          </div>
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)]">
            <span className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest">
              Net sans optimisation
            </span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)" }}>
              {fmt(computed.capitalNetSansCervus)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">après PS + IR au terme</span>
          </div>
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-cervus-cream border-2 border-cervus-gold/40 shadow-[0_8px_30px_-12px_rgba(93,71,56,0.3)]">
            <span className="font-inter text-[11px] text-cervus-gold uppercase tracking-widest">
              Net avec optimisation Cervus
            </span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)" }}>
              {fmt(computed.capitalNetAvecCervus)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">purges réinvesties + fiscalité résiduelle</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)]">
            <span className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest">
              Capital final brut
            </span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)" }}>
              {fmt(computed.capitalFinalBrut)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">avant fiscalité de sortie</span>
          </div>
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-cervus-cream border-2 border-cervus-gold/40 shadow-[0_8px_30px_-12px_rgba(93,71,56,0.3)]">
            <span className="font-inter text-[11px] text-cervus-gold uppercase tracking-widest">
              Capital projeté net
            </span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)" }}>
              {fmt(computed.capitalNetSansCervus)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">après PS + IR au terme</span>
          </div>
        </div>
      )}

      {/* Chiffre phare OU message de transparence */}
      {computed.purgeUtile ? (
        <div className="flex flex-col items-center text-center gap-2 p-8 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.25)]">
          <span className="font-inter text-[11px] text-cervus-gold uppercase tracking-widest">
            Gain net de la stratégie de purge
          </span>
          <span className="font-cormorant text-5xl font-semibold text-[#5D4738] leading-none">
            + {fmt(computed.gainNetCervus)} €
          </span>
          <span className="font-inter text-xs text-cervus-dark/50 mt-1">
            Impôt évité ~{fmt(computed.irEvite)} € · coût de la capitalisation avancée ~{fmt(computed.manqueAGagnerCapitalisation)} €
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-6 rounded-2xl border" style={{ backgroundColor: "#EDE5DC", borderColor: "#D4C9BE" }}>
          <div className="flex items-start gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9" stroke="#795D48" strokeWidth="1.5" />
              <path d="M12 8v5" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="#795D48" />
            </svg>
            <div>
              <p className="font-inter text-sm font-semibold text-[#5D4738] mb-1">En toute transparence</p>
              <p className="font-inter text-sm text-[#3a3a3a]/80 leading-relaxed">{computed.messagePurge}</p>
            </div>
          </div>
          <p className="font-inter text-sm text-[#3a3a3a]/75 leading-relaxed ml-9">
            Votre situation ne nécessite pas de stratégie de purge particulière — c&apos;est précisément
            le genre de constat que nous validons avec vous, sans vous vendre une optimisation inutile.
          </p>
        </div>
      )}

      {/* Prélèvements sociaux dus — honnêteté */}
      {computed.purgeUtile ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-[#E4DACE] bg-white">
            <p className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest mb-1">PS — sans optimisation</p>
            <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{fmt(computed.totalPSPayes.sansCervus)} €</p>
          </div>
          <div className="p-5 rounded-2xl border border-[#E4DACE] bg-white">
            <p className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest mb-1">PS — avec optimisation</p>
            <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{fmt(computed.totalPSPayes.avecCervus)} €</p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-[#E4DACE] bg-white">
          <p className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest mb-1">
            Prélèvements sociaux dus au terme
          </p>
          <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{fmt(computed.totalPSPayes.sansCervus)} €</p>
        </div>
      )}

      {/* Graphique : deux trajectoires */}
      {chartData.length > 1 && (
        <div className="flex flex-col gap-4">
          <p className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest">
            {computed.purgeUtile
              ? "Évolution du capital — avec vs sans optimisation"
              : "Évolution du capital projeté"}
          </p>
          <div className="h-72 w-full rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)] p-5 pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="avFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#795D48" stopOpacity={0.4} />
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
                    !computed.purgeUtile
                      ? "Capital projeté"
                      : name === "avec"
                      ? "Avec optimisation"
                      : "Sans optimisation",
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
                      {!computed.purgeUtile
                        ? "Capital projeté"
                        : value === "avec"
                        ? "Avec optimisation Cervus"
                        : "Sans optimisation"}
                    </span>
                  )}
                />
                {computed.purgeUtile && (
                  <Area
                    type="monotone"
                    dataKey="sans"
                    stroke="#b0a090"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    fill="none"
                    dot={false}
                    activeDot={{ r: 3, fill: "#b0a090" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="avec"
                  stroke="#5D4738"
                  strokeWidth={2.5}
                  fill="url(#avFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#5D4738" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Encadré pédagogique : modes de gestion */}
      <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-3xl border border-[#D4C9BE]" style={{ backgroundColor: "#EDE8E3" }}>
        <div>
          <p className="font-inter text-[11px] text-cervus-gold uppercase tracking-widest mb-1">Le point clé</p>
          <h3 className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">Le mode de gestion est central</h3>
          <p className="font-inter text-sm text-[#3a3a3a]/75 leading-relaxed mt-2">
            Au-delà du contrat lui-même, c&apos;est le mode de gestion qui façonne la performance et le
            risque réels de votre assurance-vie. Voici les trois grandes approches — sans qu&apos;aucune
            ne soit recommandée ici : ce choix se fait avec un conseiller, selon votre situation.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {MODES_GESTION.map((m) => (
            <div key={m.titre} className="rounded-2xl border border-[#D4C9BE] p-4" style={{ backgroundColor: "#F2EDE8" }}>
              <p className="font-cormorant text-lg font-semibold text-[#0f0f0f] mb-1">{m.titre}</p>
              <p className="font-inter text-xs text-[#3a3a3a]/70 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA final */}
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
          href={reserverUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-cervus-gold text-white font-inter text-base font-medium tracking-[0.02em] rounded-[50px] hover:bg-cervus-gold-light transition-colors duration-200 shadow-lg shadow-[#5D4738]/25"
        >
          Prendre rendez-vous
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Mention obligatoire */}
      <div className="p-5 bg-cervus-cream/40 border border-cervus-cream rounded-xl">
        <p className="font-inter text-xs text-cervus-dark/50 leading-relaxed italic">
          Simulation pédagogique indicative — ne constitue pas un conseil personnalisé. Les performances
          passées ne préjugent pas des performances futures. Les rendements affichés sont hypothétiques
          et non garantis ; la fiscalité réelle dépend de votre situation et de la réglementation en vigueur.
        </p>
      </div>

      {/* Footer réglementaire */}
      <div className="border-t border-cervus-cream pt-6 text-center">
        <p className="font-inter text-[10px] text-cervus-dark/30">
          Cervus Patrimoine · ORIAS n° 25006770 · Mandataire d&apos;Intermédiaire d&apos;Assurance
        </p>
      </div>
    </div>
  );
}
