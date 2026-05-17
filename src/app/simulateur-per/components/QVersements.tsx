import { SimulateurData, ComputedResults } from "../types";

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
  onChange: (p: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QVersements({ data, computed, onChange, onNext, onPrev }: Props) {
  const mensuel = parseFloat(data.versementMensuel);
  const initial = parseFloat(data.versementInitial) || 0;
  const canContinue = mensuel > 0;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Vos versements PER
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Le versement mensuel est obligatoire. L&apos;apport initial est optionnel.
        </p>
      </div>

      {/* Versement initial */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
          Versement initial (apport unique) — optionnel
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.versementInitial}
            onChange={(e) => onChange({ versementInitial: e.target.value })}
            placeholder="0"
            className="w-full h-11 border border-[#E5E0DA] rounded-xl bg-white px-4 pr-10 font-inter text-sm text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-[#555555]/40">€</span>
        </div>
        {initial > 0 && (
          <p className="font-inter text-xs text-[#555555]/60">
            Capitalisé sur toute la durée à {(computed.tauxAnnuel * 100).toFixed(0)} %/an
          </p>
        )}
      </div>

      {/* Versement mensuel */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
          Versement mensuel
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.versementMensuel}
            onChange={(e) => onChange({ versementMensuel: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            placeholder="Ex : 300"
            autoFocus
            className="w-full h-12 border border-[#E5E0DA] rounded-xl bg-white px-4 pr-20 font-inter text-base text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-[#555555]/40">€/mois</span>
        </div>
        {mensuel > 0 && computed.economieFiscale > 0 && (
          <p className="font-inter text-xs text-[#795D48]">
            soit {computed.versementAnnuel.toLocaleString("fr-FR")} €/an — économie fiscale estimée :{" "}
            <strong>{computed.economieFiscale.toLocaleString("fr-FR")} €/an</strong>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-xl hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Suivant
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
