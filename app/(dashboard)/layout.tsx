import { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, ShoppingCart, Users, Package, Tags, BarChart2 } from "lucide-react";
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
    <div className="flex flex-col md:flex-row h-screen bg-[var(--color-bg)] overflow-hidden text-[var(--color-text)]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 z-20 shadow-xl"
             style={{ background: 'var(--color-sidebar)' }}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0">
            <img src="/kobibi.jpg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold text-white leading-tight">NGANGKRING</p>
            <p className="text-xs font-medium text-white/60">KOBIBI</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem href="/kasir" icon={<ShoppingCart size={20} />} label="Kasir (POS)" />
          <NavItem href="/orders" icon={<LayoutDashboard size={20} />} label="Riwayat Order" />
          
          {(role === "OWNER" || role === "ADMIN") && (
            <>
              <div className="pt-5 pb-1 px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Manajemen
              </div>
              <NavItem href="/products" icon={<Package size={20} />} label="Produk Menu" />
              <NavItem href="/categories" icon={<Tags size={20} />} label="Kategori" />
            </>
          )}

          {(role === "OWNER" || role === "ADMIN") && (
            <>
              <div className="pt-5 pb-1 px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Laporan & Sistem
              </div>
              <NavItem href="/reports" icon={<BarChart2 size={20} />} label="Laporan" />
              <NavItem href="/users" icon={<Users size={20} />} label="Kasir & Admin" />
            </>
          )}

          {(role === "OWNER" || role === "ADMIN") && (
            <NavItem href="/settings" icon={<Settings size={20} />} label="Pengaturan" />
          )}
        </nav>

        {/* User Info & Signout */}
        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2.5 mb-3 bg-white/10 rounded-xl">
            <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
            <p className="text-xs text-white/60 truncate">{role}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-[var(--color-border)] flex items-center justify-around z-50 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <MobileNavItem href="/kasir" icon={<ShoppingCart size={20} />} label="Kasir" />
        <MobileNavItem href="/orders" icon={<LayoutDashboard size={20} />} label="Riwayat" />
        {(role === "OWNER" || role === "ADMIN") && (
          <MobileNavItem href="/products" icon={<Package size={20} />} label="Produk" />
        )}
        {role === "OWNER" && (
          <MobileNavItem href="/reports" icon={<BarChart2 size={20} />} label="Laporan" />
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative isolate overflow-y-auto w-full h-full pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
