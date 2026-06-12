"use client";

import { AVFormData, AV_PROFILS } from "../types";
import type { AVComputed } from "@/lib/av-engine";

interface Props {
  data: AVFormData;
  computed: AVComputed | null; // aperçu live (null si saisie incomplète)
  onChange: (p: Partial<AVFormData>) => void;
  onNext: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">{label}</label>
      <span className="font-inter text-xs text-[#555555]/60">{hint}</span>
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full h-11 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 pr-10 font-inter text-sm text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-[#555555]/40">€</span>
      </div>
    </div>
  );
}

export default function QParametresAV({ data, computed, onChange, onNext }: Props) {
  const initial = parseFloat(data.versementInitial) || 0;
  const mensuel = parseFloat(data.versementMensuel) || 0;
  const auMoinsUnVersement = initial > 0 || mensuel > 0;
  const situationOk = data.marie !== null;
  const canContinue = auMoinsUnVersement && situationOk && data.dureeAnnees > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Votre projet d&apos;assurance-vie
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Quelques paramètres pour estimer votre capital et l&apos;intérêt d&apos;une gestion optimisée.
        </p>
      </div>

      {/* Versements */}
      <div className="grid sm:grid-cols-2 gap-5">
        <NumberField
          label="Versement initial"
          hint="Apport de départ (optionnel)"
          value={data.versementInitial}
          onChange={(v) => onChange({ versementInitial: v })}
        />
        <NumberField
          label="Versement mensuel"
          hint="Épargne chaque mois (optionnel)"
          value={data.versementMensuel}
          onChange={(v) => onChange({ versementMensuel: v })}
        />
      </div>
      {!auMoinsUnVersement && (
        <p className="font-inter text-xs text-[#555555]/60 italic -mt-4">
          Renseignez au moins un versement (initial ou mensuel) pour continuer.
        </p>
      )}

      {/* Durée */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
            Horizon de placement
          </label>
          <span className="font-cormorant text-2xl font-semibold text-[#5D4738]">
            {data.dureeAnnees} ans
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={30}
          step={1}
          value={data.dureeAnnees}
          onChange={(e) => onChange({ dureeAnnees: parseInt(e.target.value) })}
          className="w-full accent-[#795D48]"
        />
        <div className="flex justify-between font-inter text-[10px] text-[#555555]/40">
          <span>2 ans</span>
          <span>30 ans</span>
        </div>
      </div>

      {/* Profil */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
          Profil de risque
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AV_PROFILS.map((p) => {
            const selected = data.profil === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange({ profil: p.value })}
                className={`flex flex-col items-center gap-0.5 py-3 rounded-xl border text-center transition-colors ${
                  selected
                    ? "border-2 border-[#795D48] bg-[#F5EFE8]"
                    : "border border-[#D4C9BE] bg-[#EDE8E3] hover:border-[#795D48]/40"
                }`}
              >
                <span className={`font-inter text-sm font-medium ${selected ? "text-[#795D48]" : "text-[#555555]"}`}>
                  {p.label}
                </span>
                <span className="font-inter text-[11px] text-[#555555]/55">{p.taux} %/an</span>
              </button>
            );
          })}
        </div>
        <p className="font-inter text-[11px] text-[#555555]/50">
          Rendements hypothétiques, à titre illustratif et non garantis.
        </p>
      </div>

      {/* Situation */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
          Votre situation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: false, label: "Seul(e)", hint: "abattement 4 600 €" },
            { value: true, label: "Marié(e) / pacsé(e)", hint: "abattement 9 200 €" },
          ].map((opt) => {
            const selected = data.marie === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ marie: opt.value })}
                className={`flex flex-col items-center gap-0.5 py-3 rounded-xl border text-center transition-colors ${
                  selected
                    ? "border-2 border-[#795D48] bg-[#F5EFE8]"
                    : "border border-[#D4C9BE] bg-[#EDE8E3] hover:border-[#795D48]/40"
                }`}
              >
                <span className={`font-inter text-sm font-medium ${selected ? "text-[#795D48]" : "text-[#555555]"}`}>
                  {opt.label}
                </span>
                <span className="font-inter text-[11px] text-[#555555]/55">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aperçu live */}
      {computed && canContinue && (
        <div className="rounded-2xl border border-[#D4C9BE] p-5" style={{ backgroundColor: "#EDE8E3" }}>
          <p className="font-inter text-[10px] text-[#795D48] uppercase tracking-[0.12em] mb-3">
            Aperçu — capital projeté au terme
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-cormorant text-4xl font-semibold text-[#5D4738] leading-none">
                {fmt(computed.capitalFinalBrut)} €
              </p>
              <p className="font-inter text-xs text-[#3a3a3a]/55 mt-1">
                valeur brute avant fiscalité de sortie
              </p>
            </div>
            <div className="text-right">
              <p className="font-inter text-[11px] text-[#795D48] uppercase tracking-wide">Net estimé</p>
              <p className="font-cormorant text-xl font-semibold text-[#0f0f0f] leading-none">
                {fmt(computed.capitalNetSansCervus)} €
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!canContinue}
        className="self-end px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-[50px] hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
      >
        Continuer
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
