"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center justify-center lg:justify-start px-3 py-3 lg:px-4 rounded-xl text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 hover:shadow-sm border border-transparent hover:border-[var(--color-danger)]/20 transition-all font-medium"
      title="Keluar"
    >
      <LogOut size={22} />
      <span className="hidden lg:block ml-4">Keluar</span>
    </button>
  );
}
