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
      className={`flex items-center justify-center lg:justify-start px-3 py-3 lg:px-4 rounded-xl hover:shadow-sm border transition-all group relative ${
        isActive
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20 font-semibold"
          : "text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-2)] border-transparent hover:border-[var(--color-border)] font-medium"
      }`}
      title={label}
    >
      <span className={`${isActive ? "text-[var(--color-accent)]" : "group-hover:text-[var(--color-accent)]"} transition-colors`}>
        {icon}
      </span>
      <span className="hidden lg:block ml-4">{label}</span>
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
      <span className={isActive ? "bg-[var(--color-accent)]/20 p-1.5 rounded-xl shadow-inner" : "p-1.5"}>
        {icon}
      </span>
      <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{label}</span>
    </Link>
  );
}
