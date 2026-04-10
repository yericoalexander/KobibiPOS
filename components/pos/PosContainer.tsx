"use client";

import { useState, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import MenuGrid from "./MenuGrid";
import OrderPanel from "./OrderPanel";
import DraftBar from "./DraftBar";
import CategoryFilter from "./CategoryFilter";
import { ShoppingBag, X, Settings, LogOut, User, Menu as MenuIcon } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

function MobileCartFloatingButton({ onClick }: { onClick: () => void }) {
  const { items } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  
  return (
    <button 
      onClick={onClick}
      className="bg-[var(--color-accent)] text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative focus:outline-none hover:scale-105 active:scale-95 transition-transform"
    >
      <ShoppingBag size={24} />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[var(--color-bg)] shadow-md">
          {totalItems}
        </span>
      )}
    </button>
  );
}

function MobileCartHeader({ onClose }: { onClose: () => void }) {
  const { items } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
      <div>
        <h2 className="text-lg font-bold">Keranjang Order</h2>
        <p className="text-xs text-[var(--color-text-muted)]">{totalItems} items • Rp {subtotal.toLocaleString("id-ID")}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-2 bg-[var(--color-surface-2)] hover:bg-red-500/10 hover:text-red-500 rounded-full text-[var(--color-text-muted)] transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}

export default function PosContainer({ 
  products, 
  categories,
  user = { role: 'KASIR' }
}: { 
  products: any[];
  categories: any[];
  user?: { role: string };
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // ONLY recalculate when deferredSearch or activeCategory changes
  const filteredProducts = products.filter(p => {
    const searchLower = deferredSearch.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchLower) || 
                        (p.category?.name || "").toLowerCase().includes(searchLower);
    const matchCategory = activeCategory ? p.categoryId === activeCategory : true;
    return matchSearch && matchCategory;
  });


  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex flex-1 overflow-hidden px-4 md:px-6 gap-6 relative">
        
        {/* LEFT COMPONENT - 60% */}
        <div className="w-full lg:w-3/5 flex flex-col h-full space-y-4 pb-[80px] lg:pb-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text)] shrink-0">Menu</h1>
            <div className="relative flex-1 max-w-xs">
              <input 
                type="text" 
                placeholder="Cari menu..." 
                className="w-full bg-white border border-[var(--color-border)] rounded-full px-4 pr-10 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Menu Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 bg-white hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl transition-all active:scale-95"
              >
                <MenuIcon size={20} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center">
                          <User size={20} className="text-[var(--color-accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold truncate">{user.role}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">Menu Akun</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/settings");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors text-left"
                      >
                        <Settings size={18} className="text-[var(--color-text-muted)]" />
                        <span className="text-sm font-medium">Pengaturan</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-left"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Keluar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <CategoryFilter 
            categories={categories} 
            active={activeCategory} 
            onChange={setActiveCategory} 
          />

          <div className="flex-1 overflow-hidden mt-4">
            <MenuGrid products={filteredProducts} />
          </div>
        </div>

        {/* RIGHT COMPONENT - 40% */}
        <div className="hidden lg:flex w-2/5 flex-col h-full pb-4">
          <OrderPanel />
        </div>
      </div>

      {/* DRAFT BAR AT BOTTOM */}
      <div className="h-16 shrink-0 border-t border-[var(--color-border)] bg-white flex items-center px-4 md:px-6 z-10 shadow-sm">
        <DraftBar />
      </div>

      {/* MOBILE CART FLOATING BUTTON */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40">
        <MobileCartFloatingButton onClick={() => setIsMobileCartOpen(true)} />
      </div>

      {/* MOBILE CART SLIDE-UP OVERLAY */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsMobileCartOpen(false)} 
          />
          <div className="bg-white w-full h-[88vh] rounded-t-3xl shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 pb-[76px] md:pb-6">
            <MobileCartHeader onClose={() => setIsMobileCartOpen(false)} />
            <div className="flex-1 overflow-hidden p-2 relative">
              <OrderPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
