"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SimulateurData } from "../types";
import Disclaimer from "./Disclaimer";

const PHONE_WHITELIST = new Set(["0781196794"]);
const OTP_DURATION_S = 10 * 60; // 10 minutes
const RESEND_COOLDOWN_S = 30;

interface Props {
  data: SimulateurData;
  onChange: (p: Partial<SimulateurData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/\s/g, "");
  if (cleaned.startsWith("0")) return "+33" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+33" + cleaned;
}

function isValidFrenchMobile(phone: string): boolean {
  return /^0[67]\d{8}$/.test(phone.replace(/\s/g, ""));
}

function formatCountdown(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function QTelephone({ data, onChange, onPrev, onSubmit, submitting }: Props) {
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Countdown: seconds remaining for current OTP
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resend cooldown: seconds remaining before resend is allowed
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phoneRaw = data.telephone.replace(/\s/g, "");
  const phoneValid = isValidFrenchMobile(data.telephone);
  const isWhitelisted = PHONE_WHITELIST.has(phoneRaw);
  const canSubmit = phoneValid && data.otpVerified;
  const otpExpired = data.otpSent && !data.otpVerified && countdown === 0;

  // Start 10-min OTP countdown
  function startCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(OTP_DURATION_S);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Start 30s resend cooldown
  function startResendCooldown() {
    if (resendRef.current) clearInterval(resendRef.current);
    setResendCooldown(RESEND_COOLDOWN_S);
    resendRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (resendRef.current) clearInterval(resendRef.current);
    };
  }, []);

  // Mark-pending on page leave (visibilitychange + beforeunload)
  const markPending = useCallback(() => {
    if (!data.email || data.otpVerified) return;
    navigator.sendBeacon(
      "/api/mark-pending",
      new Blob([JSON.stringify({ email: data.email })], { type: "application/json" })
    );
  }, [data.email, data.otpVerified]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") markPending();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", markPending);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", markPending);
    };
  }, [markPending]);

  async function sendOtp() {
    if (!phoneValid || resendCooldown > 0) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone: data.telephone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur envoi SMS");
      onChange({ otpSent: true });
      startCountdown();
      startResendCooldown();
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
          telephone: isWhitelisted ? data.telephone : normalizePhone(data.telephone),
          code: data.otpCode,
          email: data.email,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) throw new Error(json.error ?? "Code incorrect ou expiré");
      if (countdownRef.current) clearInterval(countdownRef.current);
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
        <h2 className="font-cormorant text-[2.5rem] font-light text-[#0f0f0f] mb-1 leading-tight">
          Votre numéro de téléphone
        </h2>
        <p className="font-inter text-sm text-[#555555]">
          Un code de vérification vous sera envoyé par SMS.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-inter text-xs text-cervus-gold uppercase tracking-[0.08em]">
          Téléphone mobile (06 ou 07)
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
            className="flex-1 h-11 border border-[#E5E0DA] rounded-xl bg-white px-4 font-inter text-sm text-[#0f0f0f] focus:outline-none focus:border-[#795D48] transition-colors disabled:opacity-50"
          />
          {!data.otpVerified && (
            <button
              type="button"
              onClick={sendOtp}
              disabled={!phoneValid || otpLoading || resendCooldown > 0}
              className="px-4 py-2 bg-[#795D48] text-white font-inter text-xs font-medium rounded-xl hover:bg-[#6a5040] transition-colors disabled:opacity-30 whitespace-nowrap"
            >
              {otpLoading
                ? "Envoi…"
                : resendCooldown > 0
                ? `Attendre ${resendCooldown}s`
                : data.otpSent
                ? "Renvoyer"
                : "Envoyer le code"}
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
        {otpError && <p className="font-inter text-xs text-red-500">{otpError}</p>}

        {/* OTP saisie + état */}
        {data.otpSent && !data.otpVerified && (
          <div className="flex flex-col gap-2 mt-1">
            {/* Countdown ou expiré */}
            {countdown > 0 ? (
              <p className="font-inter text-xs text-cervus-gold">
                Code valable encore {formatCountdown(countdown)}
              </p>
            ) : (
              <p className="font-inter text-xs text-red-500">
                Votre code a expiré —{" "}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendCooldown > 0}
                  className="underline font-medium disabled:opacity-50"
                >
                  Recevoir un nouveau code
                </button>
              </p>
            )}

            {!otpExpired && (
              <>
                <label className="font-inter text-xs text-cervus-gold uppercase tracking-[0.08em]">
                  Code reçu par SMS (6 chiffres)
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
                    className="flex-1 h-11 border border-[#E5E0DA] rounded-xl bg-white px-4 font-inter text-sm text-[#0f0f0f] tracking-[0.4em] focus:outline-none focus:border-[#795D48] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={data.otpCode.length !== 6 || verifyLoading}
                    className="px-4 py-2 bg-[#795D48] text-white font-inter text-xs font-medium rounded-xl hover:bg-[#6a5040] transition-colors disabled:opacity-30"
                  >
                    {verifyLoading ? "Vérification…" : "Valider"}
                  </button>
                </div>
                {verifyError && <p className="font-inter text-xs text-red-500">{verifyError}</p>}
              </>
            )}
          </div>
        )}
      </div>

      <Disclaimer />

      <p className="font-inter text-xs text-[#555555]/60 leading-relaxed">
        En cliquant sur Voir mes résultats, vous acceptez d&apos;être recontacté par Cervus Patrimoine
        et nos politiques de confidentialité.
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="font-inter text-sm text-[#555555]/60 hover:text-[#555555] transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="px-8 py-3 bg-[#795D48] text-white font-inter text-sm font-semibold rounded-xl hover:bg-[#6a5040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
