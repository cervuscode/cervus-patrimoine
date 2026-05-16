import { SimulateurData, Profil, ComputedResults } from "../types";
import Disclaimer from "./Disclaimer";

interface Props {
  data: SimulateurData;
  computed: ComputedResults;
  onChange: (patch: Partial<SimulateurData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

const PROFILS: { value: Profil; label: string; taux: string; desc: string }[] = [
  {
    value: "prudent",
    label: "Prudent",
    taux: "3 %/an",
    desc: "Fonds euros et obligations — capital sécurisé, rendement stable",
  },
  {
    value: "equilibre",
    label: "Équilibré",
    taux: "4 %/an",
    desc: "Mix fonds euros et UC — rendement modéré, risque limité",
  },
  {
    value: "dynamique",
    label: "Dynamique",
    taux: "5 %/an",
    desc: "Majoritairement en actions (ETF) — potentiel élevé, risque important",
  },
];

export default function Step3Projection({ data, computed, onChange, onNext, onPrev }: Props) {
  const annee = parseInt(data.anneeNaissance);
  const anneeValid = annee >= 1950 && annee <= 2000;
  const nAnnees = anneeValid ? 64 - (CURRENT_YEAR - annee) : 0;
  const versement = parseFloat(data.versementMensuel);
  const canContinue = anneeValid && nAnnees > 0 && versement > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Votre projection PER
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Estimez votre capital retraite en fonction de votre versement mensuel.
        </p>
      </div>

      {/* Année de naissance */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Année de naissance
        </label>
        <input
          type="number"
          min={1950}
          max={2000}
          value={data.anneeNaissance}
          onChange={(e) => onChange({ anneeNaissance: e.target.value })}
          placeholder="Ex : 1985"
          className="w-full h-11 border border-cervus-cream rounded-sm bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
        {anneeValid && nAnnees > 0 && (
          <p className="font-inter text-xs text-cervus-gold">
            {nAnnees} an{nAnnees > 1 ? "s" : ""} de versements jusqu&apos;à vos 64 ans
          </p>
        )}
        {anneeValid && nAnnees <= 0 && (
          <p className="font-inter text-xs text-red-500">
            Vous avez déjà 64 ans ou plus — la simulation PER ne s&apos;applique pas.
          </p>
        )}
      </div>

      {/* Versement mensuel */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Versement mensuel envisagé
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={data.versementMensuel}
            onChange={(e) => onChange({ versementMensuel: e.target.value })}
            placeholder="Ex : 300"
            className="w-full h-11 border border-cervus-cream rounded-sm bg-white px-4 pr-10 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-inter text-sm text-cervus-dark/30">€</span>
        </div>
        {versement > 0 && computed.economieFiscale > 0 && (
          <p className="font-inter text-xs text-cervus-gold">
            soit {computed.versementAnnuel.toLocaleString("fr-FR")} €/an — économie fiscale estimée :{" "}
            <strong>{computed.economieFiscale.toLocaleString("fr-FR")} €/an</strong>
          </p>
        )}
      </div>

      {/* Profil investisseur */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Profil investisseur
        </label>
        <div className="flex flex-col gap-2">
          {PROFILS.map(({ value, label, taux, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ profil: value })}
              className={`flex items-start gap-4 p-4 rounded-sm border text-left transition-colors duration-150 ${
                data.profil === value
                  ? "border-cervus-gold bg-cervus-gold/5"
                  : "border-cervus-cream hover:border-cervus-gold/40"
              }`}
            >
              <div
                className={`w-4 h-4 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  data.profil === value ? "border-cervus-gold" : "border-cervus-cream"
                }`}
              >
                {data.profil === value && (
                  <div className="w-2 h-2 rounded-full bg-cervus-gold" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-sm font-medium text-cervus-dark">{label}</span>
                  <span className="font-inter text-xs text-cervus-gold bg-cervus-gold/10 px-2 py-0.5 rounded-full">
                    {taux}
                  </span>
                </div>
                <span className="font-inter text-xs text-cervus-dark/50">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Capital preview */}
      {canContinue && computed.capitalFinal > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 p-5 bg-cervus-dark rounded-sm">
          <div className="flex-1 flex flex-col">
            <span className="font-inter text-xs text-white/40 uppercase tracking-widest mb-1">
              Capital estimé à 64 ans
            </span>
            <span className="font-cormorant text-4xl font-light text-cervus-gold-light">
              {computed.capitalFinal.toLocaleString("fr-FR")} €
            </span>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-inter text-xs text-white/40 uppercase tracking-widest mb-1">
              Économie fiscale / an
            </span>
            <span className="font-cormorant text-4xl font-light text-cervus-gold-light">
              {computed.economieFiscale.toLocaleString("fr-FR")} €
            </span>
          </div>
        </div>
      )}

      <Disclaimer />

      <div className="flex justify-between mt-2">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-cervus-cream text-cervus-dark/60 font-inter text-sm rounded hover:border-cervus-gold/40 transition-colors"
        >
          Précédent
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
