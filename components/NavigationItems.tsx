"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2.5 rounded-xl transition-all group ${
        isActive
          ? "bg-white/20 text-white font-semibold shadow-sm"
          : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
      }`}
      title={label}
    >
      <span className={`shrink-0 ${isActive ? "text-white" : "group-hover:text-white"} transition-colors`}>
        {icon}
      </span>
      <span className="ml-3 text-sm">{label}</span>
    </Link>
  );
}

export function MobileNavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors gap-1 ${
        isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
      }`}
    >
      <span className={isActive ? "bg-[var(--color-accent-light)] p-1.5 rounded-xl" : "p-1.5"}>
        {icon}
      </span>
      <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{label}</span>
    </Link>
  );
}
