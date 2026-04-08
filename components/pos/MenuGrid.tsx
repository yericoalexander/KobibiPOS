"use client";

import { useCartStore } from "@/store/useCartStore";
import { Plus, Minus } from "lucide-react";

export default function MenuGrid({ products }: { products: any[] }) {
  const { items, addItem, updateQty, removeItem } = useCartStore();

  const handleAdd = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
  };

  const handleIncrease = (productId: string, currentQty: number) => {
    updateQty(productId, currentQty + 1);
  };

  const handleDecrease = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeItem(productId);
    } else {
      updateQty(productId, currentQty - 1);
    }
  };

  return (
    <div className="overflow-y-auto h-full pr-2 pb-4 custom-scrollbar">
      <div className="grid grid-cols-1 gap-3">
        {products.map((p) => {
          const cartItem = items.find((item) => item.id === p.id);
          const qtyInCart = cartItem ? cartItem.qty : 0;
          const remainingStock = p.stock - qtyInCart;
          const isOutOfStock = remainingStock <= 0;

          return (
            <div
              key={p.id}
              onClick={() => qtyInCart === 0 && !isOutOfStock && handleAdd(p)}
              className={`relative p-4 rounded-2xl transition-all cursor-pointer ${
                qtyInCart > 0
                  ? 'bg-[var(--color-surface-2)] border border-[var(--color-accent)]/30'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 active:scale-[0.98]'
              } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 leading-tight">
                    {p.name}
                  </h3>
                  <div className="inline-block px-3 py-1.5 bg-[var(--color-accent)]/10 rounded-lg">
                    <span className="text-base font-bold text-[var(--color-accent)] font-mono">
                      Rp {p.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Right: Stock & Qty Control */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Stock Info */}
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    isOutOfStock 
                      ? 'text-red-500 bg-red-500/10' 
                      : remainingStock <= 5 
                        ? 'text-orange-400 bg-orange-400/10' 
                        : 'text-[var(--color-text-muted)] bg-[var(--color-surface)]'
                  }`}>
                    {isOutOfStock ? 'Habis' : `Stok: ${remainingStock}`}
                  </div>

                  {/* Qty Control (only show if in cart) */}
                  {qtyInCart > 0 && (
                    <div 
                      className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleDecrease(p.id, qtyInCart)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-border)] transition-colors"
                      >
                        <Minus size={16} className="text-[var(--color-text-muted)]" />
                      </button>
                      
                      <div className="w-10 text-center font-bold text-lg">
                        {qtyInCart}
                      </div>

                      <button
                        onClick={() => handleIncrease(p.id, qtyInCart)}
                        disabled={remainingStock <= 0}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} className="text-[var(--color-accent)]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="flex items-center justify-center text-[var(--color-text-muted)] text-sm italic py-20">
            Produk tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
