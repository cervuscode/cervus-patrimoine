"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center justify-center rounded-[50px] border border-cervus-gold px-6 py-3 text-sm font-medium text-cervus-bronze transition-colors hover:bg-cervus-gold hover:text-cervus-bronze"
    >
      Se déconnecter
    </button>
  );
}
