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

// Fiscalité de liquidation à une date donnée (miroir du moteur av-engine, pour tracer
// la VALEUR NETTE année par année — sans modifier av-engine). PS 17,2 % dans tous les
// cas ; l'IR dépend de l'antériorité du contrat à l'année considérée (seuil des 8 ans),
// EXACTEMENT comme la fonction sortie() du moteur :
//   - annee >= 8 : abattement 4 600/9 200 € + 7,5 %/12,8 % au prorata du seuil 150 000 € ;
//   - annee  < 8 : pas d'abattement, PFU 12,8 % sur toute la PV (nouveaux contrats post-2017).
function netLiquidatif(valeur: number, base: number, marie: boolean, annee: number): number {
  const pv = Math.max(0, valeur - base);
  const ps = 0.172 * pv;
  let ir: number;
  if (annee >= 8) {
    const abat = marie ? 9200 : 4600;
    const gi = Math.max(0, pv - abat);
    const ratio = base > 0 ? Math.max(0, base - 150000) / base : 0;
    ir = 0.075 * gi * (1 - ratio) + 0.128 * gi * ratio;
  } else {
    ir = 0.128 * pv;
  }
  return valeur - ps - ir;
}

export default function ResultPageAV({ data, computed }: Props) {
  const reserverUrl = "/reserver";
  const profil = AV_PROFILS.find((p) => p.value === data.profil);
  const utile = computed.purgeUtile;

  // Trajectoire de la VALEUR NETTE (ce que vous toucheriez en sortant chaque année).
  const initial = parseFloat(data.versementInitial) || 0;
  const mensuel = parseFloat(data.versementMensuel) || 0;
  const marie = !!data.marie;
  const purgeNetByYear: Record<number, number> = {};
  for (const p of computed.purges) purgeNetByYear[p.annee] = p.partGain - p.psPayes;

  let cumPurge = 0;
  const chartData = computed.courbe.map((pt) => {
    cumPurge += purgeNetByYear[pt.annee] ?? 0;
    const primes = initial + mensuel * 12 * pt.annee;
    const sans = Math.round(netLiquidatif(pt.capitalSans, primes, marie, pt.annee));
    const avec = Math.round(netLiquidatif(pt.capitalAvec, primes + cumPurge, marie, pt.annee));
    return { annee: pt.annee, sans, avec };
  });

  // Échelle Y resserrée sur les données (jamais à partir de 0 → l'écart reste lisible).
  const vals = chartData.flatMap((d) => (utile ? [d.sans, d.avec] : [d.sans]));
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const pad = Math.max((hi - lo) * 0.08, hi * 0.02, 500);
  const yDomain: [number, number] = [
    Math.max(0, Math.floor((lo - pad) / 1000) * 1000),
    Math.ceil((hi + pad) / 1000) * 1000,
  ];

  return (
    <div className="flex flex-col gap-9">
      {/* En-tête */}
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

      {/* HERO — chiffre clé */}
      {utile ? (
        <div
          className="relative overflow-hidden rounded-[28px] px-8 py-10 sm:px-12 sm:py-12 text-center shadow-[0_20px_60px_-24px_rgba(93,71,56,0.55)]"
          style={{ backgroundColor: "#5D4738" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(160,125,98,0.35), transparent 70%)" }}
          />
          <div className="relative">
            <p className="font-inter text-[0.7rem] text-[#EAD9C7] uppercase tracking-[0.2em] mb-4">
              Gain net avec Cervus Patrimoine
            </p>
            <p className="font-cormorant font-semibold text-[#F8F2EA] leading-none" style={{ fontSize: "clamp(3rem, 12vw, 5rem)" }}>
              +&nbsp;{fmt(computed.gainNetCervus)}&nbsp;€
            </p>
            <p className="font-inter text-sm text-[#F2EDE8]/70 mt-5 max-w-md mx-auto">
              Soit un capital net de <strong className="text-[#F8F2EA]">{fmt(computed.capitalNetAvecCervus)} €</strong> au
              terme, contre {fmt(computed.capitalNetSansCervus)} € sans accompagnement.
            </p>
            <p className="font-inter text-[11px] text-[#F2EDE8]/45 mt-3">
              Impôt évité ~{fmt(computed.irEvite)} € · coût de la capitalisation avancée ~{fmt(computed.manqueAGagnerCapitalisation)} €
            </p>
          </div>
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-[28px] px-8 py-10 sm:px-12 sm:py-12 text-center shadow-[0_20px_60px_-24px_rgba(93,71,56,0.45)]"
          style={{ backgroundColor: "#5D4738" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(160,125,98,0.35), transparent 70%)" }}
          />
          <div className="relative">
            <p className="font-inter text-[0.7rem] text-[#EAD9C7] uppercase tracking-[0.2em] mb-4">
              Votre capital net projeté
            </p>
            <p className="font-cormorant font-semibold text-[#F8F2EA] leading-none" style={{ fontSize: "clamp(2.6rem, 11vw, 4.5rem)" }}>
              {fmt(computed.capitalNetSansCervus)}&nbsp;€
            </p>
            <p className="font-inter text-sm text-[#F2EDE8]/70 mt-5 max-w-md mx-auto">
              au terme, après prélèvements sociaux et impôt — sur la base d&apos;un capital brut de{" "}
              {fmt(computed.capitalFinalBrut)} €.
            </p>
          </div>
        </div>
      )}

      {/* Cartes capital */}
      {utile ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Capital final brut", value: computed.capitalFinalBrut, hint: "avant fiscalité de sortie", strong: false },
            { label: "Net sans accompagnement", value: computed.capitalNetSansCervus, hint: "après PS + IR", strong: false },
            { label: "Net avec Cervus Patrimoine", value: computed.capitalNetAvecCervus, hint: "après PS + IR", strong: true },
          ].map((c) => (
            <div
              key={c.label}
              className={`flex flex-col gap-2 p-6 rounded-3xl shadow-[0_8px_30px_-12px_rgba(93,71,56,0.25)] ${
                c.strong ? "bg-cervus-cream border-2 border-cervus-gold/45" : "bg-white border border-[#E4DACE]"
              }`}
            >
              <span className="font-inter text-[11px] uppercase tracking-widest text-cervus-gold/80">{c.label}</span>
              <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.55rem, 5vw, 2.1rem)" }}>
                {fmt(c.value)} €
              </span>
              <span className="font-inter text-xs text-cervus-dark/45">{c.hint}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)]">
            <span className="font-inter text-[11px] uppercase tracking-widest text-cervus-gold/80">Capital final brut</span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)" }}>
              {fmt(computed.capitalFinalBrut)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">avant fiscalité de sortie</span>
          </div>
          <div className="flex flex-col gap-2 p-6 rounded-3xl bg-cervus-cream border-2 border-cervus-gold/45 shadow-[0_8px_30px_-12px_rgba(93,71,56,0.3)]">
            <span className="font-inter text-[11px] uppercase tracking-widest text-cervus-gold/80">Capital projeté net</span>
            <span className="font-cormorant font-semibold text-[#5D4738] leading-[1.05] whitespace-nowrap" style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)" }}>
              {fmt(computed.capitalNetSansCervus)} €
            </span>
            <span className="font-inter text-xs text-cervus-dark/45">après PS + IR au terme</span>
          </div>
        </div>
      )}

      {/* Transparence quand l'accompagnement n'apporte pas de gain fiscal significatif */}
      {!utile && (
        <div className="flex flex-col gap-3 p-6 rounded-2xl border" style={{ backgroundColor: "#EDE5DC", borderColor: "#D4C9BE" }}>
          <div className="flex items-start gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9" stroke="#795D48" strokeWidth="1.5" />
              <path d="M12 8v5" stroke="#795D48" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="#795D48" />
            </svg>
            <div>
              <p className="font-inter text-sm font-semibold text-[#5D4738] mb-1">En toute transparence</p>
              <p className="font-inter text-sm text-[#3a3a3a]/80 leading-relaxed">
                Votre situation ne nécessite pas d&apos;optimisation particulière — c&apos;est précisément
                le genre de constat que nous validons avec vous, sans jamais vous vendre une stratégie inutile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prélèvements sociaux dus */}
      {utile ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-[#E4DACE] bg-white">
            <p className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest mb-1">PS — sans accompagnement</p>
            <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{fmt(computed.totalPSPayes.sansCervus)} €</p>
          </div>
          <div className="p-5 rounded-2xl border border-[#E4DACE] bg-white">
            <p className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest mb-1">PS — avec Cervus Patrimoine</p>
            <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{fmt(computed.totalPSPayes.avecCervus)} €</p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-[#E4DACE] bg-white">
          <p className="font-inter text-[11px] text-cervus-gold/70 uppercase tracking-widest mb-1">Prélèvements sociaux dus au terme</p>
          <p className="font-cormorant text-2xl font-semibold text-[#0f0f0f]">{fmt(computed.totalPSPayes.sansCervus)} €</p>
        </div>
      )}

      {/* Graphique — VALEUR NETTE année par année */}
      {chartData.length > 1 && (
        <div className="flex flex-col gap-4">
          <p className="font-inter text-xs text-cervus-dark/40 uppercase tracking-widest">
            {utile ? "Capital net — avec vs sans accompagnement" : "Capital net projeté"}
          </p>
          <div className="h-72 w-full rounded-3xl bg-white border border-[#E4DACE] shadow-[0_8px_30px_-12px_rgba(93,71,56,0.2)] p-5 pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="avFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#795D48" stopOpacity={0.35} />
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
                  domain={yDomain}
                  allowDataOverflow
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 10, fontFamily: "var(--font-inter)", fill: "#b0a090" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${fmt(Number(value))} €`,
                    !utile ? "Capital net" : name === "avec" ? "Avec Cervus Patrimoine" : "Sans accompagnement",
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
                      {!utile ? "Capital net projeté" : value === "avec" ? "Avec Cervus Patrimoine" : "Sans accompagnement"}
                    </span>
                  )}
                />
                {utile && (
                  <Area
                    type="monotone"
                    dataKey="sans"
                    stroke="#b0a090"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    fill="none"
                    dot={false}
                    activeDot={{ r: 3, fill: "#b0a090" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="avec"
                  stroke="#5D4738"
                  strokeWidth={2.8}
                  fill="url(#avFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#5D4738" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {utile && (
            <p className="font-inter text-[11px] text-cervus-dark/45">
              Valeur nette si vous sortiez à chaque date (après PS et impôt). L&apos;écart se creuse
              grâce à notre accompagnement.
            </p>
          )}
        </div>
      )}

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
