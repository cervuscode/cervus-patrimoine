"use client";

import { useState } from "react";
import { SimulateurData } from "../types";
import Disclaimer from "./Disclaimer";

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("33")) return "+" + digits;
  if (digits.startsWith("0")) return "+33" + digits.slice(1);
  return "+" + digits;
}

export default function QTelephone({ data, onChange, onPrev, onSubmit, submitting }: Props) {
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const phoneValid = data.telephone.replace(/\D/g, "").length >= 10;
  const canSubmit = phoneValid && data.otpVerified;

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
    <div className="flex flex-col gap-8 pt-8">
      <div>
        <h2 className="font-cormorant text-3xl font-light text-cervus-dark mb-1">
          Votre numéro de téléphone
        </h2>
        <p className="font-inter text-sm text-cervus-dark/50">
          Nous vous envoyons un code pour vérifier votre identité.
        </p>
      </div>

      {/* Téléphone + bouton envoi OTP */}
      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-cervus-dark/50 uppercase tracking-widest">
          Téléphone mobile
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={data.telephone}
            onChange={(e) =>
              onChange({ telephone: e.target.value, otpSent: false, otpVerified: false, otpCode: "" })
            }
            onKeyDown={(e) => e.key === "Enter" && phoneValid && !data.otpSent && sendOtp()}
            placeholder="06 XX XX XX XX"
            disabled={data.otpVerified}
            autoFocus
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

        {/* Saisie du code OTP */}
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
                onKeyDown={(e) => e.key === "Enter" && data.otpCode.length === 6 && verifyOtp()}
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

      <Disclaimer />

      {/* Consentement passif */}
      <p className="font-inter text-xs text-cervus-dark/40 leading-relaxed">
        En cliquant sur Voir mes résultats, vous acceptez d&apos;être recontacté par Cervus Patrimoine
        et nos politiques de confidentialité.
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-cervus-dark/40 hover:text-cervus-dark/70 transition-colors"
        >
          ← Précédent
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
