"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="inline-flex items-center justify-center gap-3 rounded-[50px] bg-cervus-gold px-8 py-4 text-base font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold-dark"
    >
      Se connecter avec Google
    </button>
  );
}
