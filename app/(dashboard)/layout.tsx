import { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, ShoppingCart, Users, Package, Tags, Menu } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { NavItem, MobileNavItem } from "@/components/NavigationItems";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--color-bg)] overflow-hidden text-[var(--color-text)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex-col transition-all duration-300 z-20 shadow-xl shrink-0">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-[var(--color-border)]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg shrink-0 p-1">
            <img src="/kobibi.jpeg" alt="NGANGKRING KOBIBI" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="hidden lg:block ml-3">
            <p className="text-base font-bold leading-tight bg-gradient-to-br from-[var(--color-accent)] to-yellow-300 bg-clip-text text-transparent">
              NGANGKRING
            </p>
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">KOBIBI</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <NavItem href="/kasir" icon={<ShoppingCart size={22} />} label="Kasir (POS)" />
          <NavItem href="/orders" icon={<LayoutDashboard size={22} />} label="Riwayat Order" />
          
          {(role === "OWNER" || role === "ADMIN") && (
            <>
              <div className="hidden lg:block pt-6 pb-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Manajemen
              </div>
              <NavItem href="/products" icon={<Package size={22} />} label="Produk Menu" />
              <NavItem href="/categories" icon={<Tags size={22} />} label="Kategori" />
            </>
          )}

          {role === "OWNER" && (
            <>
              <div className="hidden lg:block pt-6 pb-2 px-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Laporan & Sistem
              </div>
              <NavItem href="/reports" icon={<LayoutDashboard size={22} />} label="Laporan" />
              <NavItem href="/users" icon={<Users size={22} />} label="Kasir & Admin" />
            </>
          )}

          {(role === "OWNER" || role === "ADMIN") && (
            <NavItem href="/settings" icon={<Settings size={22} />} label="Pengaturan" />
          )}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="hidden lg:block px-3 py-2 mb-3 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)]">
            <p className="text-sm font-semibold truncate">{session.user.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{role}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <MobileNavItem href="/kasir" icon={<ShoppingCart size={20} />} label="Kasir" />
        <MobileNavItem href="/orders" icon={<LayoutDashboard size={20} />} label="Riwayat" />
        {(role === "OWNER" || role === "ADMIN") && (
          <MobileNavItem href="/products" icon={<Package size={20} />} label="Produk" />
        )}
        {role === "OWNER" && (
          <MobileNavItem href="/reports" icon={<LayoutDashboard size={20} />} label="Laporan" />
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative isolate overflow-y-auto w-full h-full pb-16 md:pb-0">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[var(--color-accent)]/5 to-transparent -z-10 blur-3xl pointer-events-none" />
        
        {children}
      </main>
    </div>
  );
}
