"use client";

import { useState } from "react";
import { SimulateurData } from "../types";
import Disclaimer from "./Disclaimer";

interface Props {
  data: SimulateurData;
  onChange: (patch: Partial<SimulateurData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  submitting: boolean;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("33")) return "+" + digits;
  if (digits.startsWith("0")) return "+33" + digits.slice(1);
  return "+" + digits;
}

export default function Step4Contact({ data, onChange, onSubmit, onPrev, submitting }: Props) {
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const phoneValid = data.telephone.replace(/\D/g, "").length >= 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const canSubmit =
    data.prenom.trim() &&
    emailValid &&
    phoneValid &&
    data.otpVerified &&
    data.consentementRdv &&
    data.consentementRgpd;

  async function sendOtp() {
    if (!phoneValid) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone: normalizePhone(data.telephone) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur envoi SMS");
      onChange({ otpSent: true });
    } catch (e: unknown) {
      setOtpError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp() {
    if (data.otpCode.length !== 6) return;
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telephone: normalizePhone(data.telephone),
          code: data.otpCode,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) throw new Error(json.error ?? "Code incorrect ou expiré");
      onChange({ otpVerified: true });
    } catch (e: unknown) {
      setVerifyError(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Vos coordonnées
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Pour recevoir votre rapport personnalisé par email.
        </p>
      </div>

      {/* Prénom */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">Prénom</label>
        <input
          type="text"
          value={data.prenom}
          onChange={(e) => onChange({ prenom: e.target.value })}
          placeholder="Votre prénom"
          className="w-full h-11 border border-cervus-cream rounded-sm bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="votre@email.fr"
          className="w-full h-11 border border-cervus-cream rounded-sm bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors"
        />
      </div>

      {/* Téléphone + OTP */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Téléphone mobile
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={data.telephone}
            onChange={(e) => onChange({ telephone: e.target.value, otpSent: false, otpVerified: false, otpCode: "" })}
            placeholder="06 XX XX XX XX"
            disabled={data.otpVerified}
            className="flex-1 h-11 border border-cervus-cream rounded-sm bg-white px-4 font-inter text-sm text-cervus-dark focus:outline-none focus:border-cervus-gold/60 transition-colors disabled:opacity-50"
          />
          {!data.otpVerified && (
            <button
              type="button"
              onClick={sendOtp}
              disabled={!phoneValid || otpLoading}
              className="px-4 py-2 bg-cervus-gold text-white font-inter text-xs font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30 whitespace-nowrap"
            >
              {otpLoading ? "Envoi…" : data.otpSent ? "Renvoyer" : "Envoyer le code"}
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
        {otpError && <p className="font-inter text-xs text-red-500">{otpError}</p>}

        {/* OTP input */}
        {data.otpSent && !data.otpVerified && (
          <div className="flex flex-col gap-2 mt-1">
            <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
              Code reçu par SMS (6 chiffres — valable 10 min)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={data.otpCode}
                onChange={(e) => onChange({ otpCode: e.target.value.replace(/\D/g, "") })}
                placeholder="_ _ _ _ _ _"
                className="flex-1 h-11 border border-cervus-cream rounded-sm bg-white px-4 font-inter text-sm text-cervus-dark tracking-[0.4em] focus:outline-none focus:border-cervus-gold/60 transition-colors"
              />
              <button
                type="button"
                onClick={verifyOtp}
                disabled={data.otpCode.length !== 6 || verifyLoading}
                className="px-4 py-2 bg-cervus-gold text-white font-inter text-xs font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30"
              >
                {verifyLoading ? "Vérification…" : "Valider"}
              </button>
            </div>
            {verifyError && <p className="font-inter text-xs text-red-500">{verifyError}</p>}
          </div>
        )}
      </div>

      {/* Consentements */}
      <div className="flex flex-col gap-4">
        {[
          {
            key: "consentementRdv" as const,
            text: "J'accepte d'être recontacté par un conseiller Cervus Patrimoine pour approfondir ma simulation.",
          },
          {
            key: "consentementRgpd" as const,
            text: "J'accepte que mes données soient utilisées conformément à la politique de confidentialité.",
          },
        ].map(({ key, text }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 shrink-0 mt-0.5 rounded-sm border-2 flex items-center justify-center transition-colors ${
                data[key]
                  ? "border-cervus-gold bg-cervus-gold"
                  : "border-cervus-cream group-hover:border-cervus-gold/40"
              }`}
              onClick={() => onChange({ [key]: !data[key] })}
            >
              {data[key] && (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="font-inter text-sm text-cervus-dark/60 leading-relaxed">{text}</span>
          </label>
        ))}
      </div>

      <Disclaimer />

      <div className="flex justify-between mt-2">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-cervus-cream text-cervus-dark/60 font-inter text-sm rounded hover:border-cervus-gold/40 transition-colors"
        >
          Précédent
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="px-8 py-3 bg-cervus-gold text-white font-inter text-sm font-medium rounded hover:bg-cervus-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
