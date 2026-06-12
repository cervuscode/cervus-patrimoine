"use client";

import { AVFormData } from "../types";

interface Props {
  data: AVFormData;
  onChange: (p: Partial<AVFormData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

function isValidFrenchMobile(phone: string): boolean {
  return /^0[67]\d{8}$/.test(phone.replace(/\s/g, ""));
}

export default function QTelephoneAV({ data, onChange, onPrev, onSubmit, submitting }: Props) {
  const phoneValid = isValidFrenchMobile(data.telephone);
  const codeValid = data.otpCode.length === 6;
  const canSubmit = phoneValid && data.otpVerified;

  // NOTE étape 3 : aucun appel API ici pour l'instant.
  // - "Envoyer le code" → TODO POST /api/send-otp (Twilio)
  // - "Valider"        → TODO POST /api/verify-otp + migration liste Brevo AV
  // Pour permettre la navigation front complète, l'OTP est simulé visuellement.
  function envoyerCode() {
    if (!phoneValid) return;
    onChange({ otpSent: true, otpCode: "" });
  }
  function validerCode() {
    if (!codeValid) return;
    onChange({ otpVerified: true });
  }

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="inline-flex items-center gap-2 self-start bg-[#795D48]/10 border border-[#795D48]/20 rounded-full px-3 py-1">
        <span className="font-inter text-xs text-[#795D48] font-medium">Vos résultats sont prêts</span>
        <span className="font-inter text-xs text-[#795D48]/60">dernière étape</span>
      </div>

      <div>
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Votre numéro de téléphone
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Un code de vérification vous sera envoyé par SMS.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
          Téléphone mobile (06 ou 07)
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={data.telephone}
            onChange={(e) => onChange({ telephone: e.target.value, otpSent: false, otpVerified: false, otpCode: "" })}
            placeholder="06 XX XX XX XX"
            disabled={data.otpVerified}
            autoFocus
            className="flex-1 h-11 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 font-inter text-sm text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors disabled:opacity-50"
          />
          {!data.otpVerified && (
            <button
              type="button"
              onClick={envoyerCode}
              disabled={!phoneValid}
              className="px-4 py-2 bg-[#795D48] text-white font-inter text-xs font-medium rounded-[50px] hover:bg-[#6a5040] transition-colors disabled:opacity-30 whitespace-nowrap"
            >
              {data.otpSent ? "Renvoyer" : "Envoyer le code"}
            </button>
          )}
          {data.otpVerified && (
            <div className="flex items-center gap-1.5 text-green-600 font-inter text-sm shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Vérifié
            </div>
          )}
        </div>
        {data.telephone && !phoneValid && (
          <p className="font-inter text-xs text-red-500">
            Numéro invalide — utilisez un numéro mobile français (06 ou 07).
          </p>
        )}

        {data.otpSent && !data.otpVerified && (
          <div className="flex flex-col gap-2 mt-1">
            <label className="font-inter text-xs text-[#795D48] uppercase tracking-[0.08em]">
              Code reçu par SMS (6 chiffres)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={data.otpCode}
                onChange={(e) => onChange({ otpCode: e.target.value.replace(/\D/g, "") })}
                onKeyDown={(e) => e.key === "Enter" && codeValid && validerCode()}
                placeholder="_ _ _ _ _ _"
                className="flex-1 h-11 border border-[#D4C9BE] rounded-xl bg-[#F2EDE8] px-4 font-inter text-sm text-[#0f0f0f] tracking-[0.4em] focus:outline-none focus:border-[#795D48] transition-colors"
              />
              <button
                type="button"
                onClick={validerCode}
                disabled={!codeValid}
                className="px-4 py-2 bg-[#795D48] text-white font-inter text-xs font-medium rounded-[50px] hover:bg-[#6a5040] transition-colors disabled:opacity-30"
              >
                Valider
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="font-inter text-xs text-[#555555]/60 leading-relaxed">
        Simulation pédagogique indicative — ne constitue pas un conseil personnalisé. En continuant,
        vous acceptez d&apos;être recontacté par Cervus Patrimoine conformément à notre politique de
        confidentialité.
      </p>

      <div className="flex items-center justify-between">
        <button onClick={onPrev} className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors">
          ← Précédent
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-[50px] hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? "Calcul en cours…" : "Voir mes résultats"}
          {!submitting && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
