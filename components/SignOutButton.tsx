"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-red-500/20 transition-all font-medium text-sm"
      title="Keluar"
    >
      <LogOut size={18} />
      <span>Keluar</span>
    </button>
  );
}
