"use client";

import { useCartStore } from "@/store/useCartStore";

export default function MenuGrid({ products }: { products: any[] }) {
  const { items, addItem, updateQty, removeItem } = useCartStore();

  const handleAdd = (product: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
  };

  const handleDecrease = (product: any, currentQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQty <= 1) {
      removeItem(product.id);
    } else {
      updateQty(product.id, currentQty - 1);
    }
  };

  const handleIncrease = (product: any, currentQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateQty(product.id, currentQty + 1);
  };

  return (
    <div className="overflow-y-auto h-full pr-2 pb-20 custom-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => {
          const cartItem = items.find((i) => i.id === p.id);
          const currentQty = cartItem ? cartItem.qty : 0;

          return (
            <div
              key={p.id}
              onClick={(e) => currentQty === 0 && handleAdd(p, e)}
              className={`group relative flex flex-col justify-between p-4 bg-[var(--color-surface)] border ${currentQty > 0 ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'} rounded-xl transition-all duration-200 ${currentQty === 0 ? 'hover:border-[var(--color-accent)]/50 active:scale-95 touch-manipulation cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 hover:bg-[var(--color-surface-2)]' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-semibold text-base leading-snug flex-1 pr-2">
                  {p.name}
                </span>
              </div>
              
              <div className="flex items-end justify-between gap-2 mt-auto">
                <span className="text-sm font-mono text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/10 px-3 py-1.5 rounded-lg">
                  Rp {p.price.toLocaleString("id-ID")}
                </span>

                {currentQty > 0 ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs text-[var(--color-text-muted)] font-medium px-2 py-1">
                      Stok: <span className={p.stock <= 5 ? 'text-orange-400 font-bold' : 'text-[var(--color-accent)]'}>{Math.max(0, p.stock - currentQty)}</span>
                    </span>
                    <div className="flex items-center bg-[var(--color-background)] rounded-lg p-1 border border-[var(--color-border)] h-9" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDecrease(p, currentQty, e)}
                        className="w-8 h-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 rounded-md transition-colors active:scale-95 text-lg"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold tabular-nums text-sm">
                        {currentQty}
                      </span>
                      <button
                        onClick={(e) => handleIncrease(p, currentQty, e)}
                        className="w-8 h-full flex items-center justify-center text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 rounded-md transition-colors active:scale-95 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)] font-medium px-2 py-1">
                    Stok: <span className={p.stock <= 5 ? 'text-orange-400 font-bold' : 'text-[var(--color-accent)]'}>{p.stock}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="col-span-full flex items-center justify-center text-[var(--color-text-muted)] text-sm italic py-20">
            Produk tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
