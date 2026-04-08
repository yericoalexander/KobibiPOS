"use client";

import { useCartStore } from "@/store/useCartStore";

export default function MenuGrid({ products }: { products: any[] }) {
  const addItem = useCartStore(state => state.addItem);

  const handleAdd = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
  };

  return (
    <div className="overflow-y-auto h-full pr-2 pb-4 custom-scrollbar">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => handleAdd(p)}
            className="group relative flex flex-col justify-between p-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10 active:scale-95 touch-manipulation min-h-[80px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <span className="relative font-semibold text-left text-base mb-2 leading-snug line-clamp-2">
              {p.name}
            </span>
            <span className="relative text-sm font-mono text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/10 px-3 py-1.5 rounded-lg self-start">
              Rp {p.price.toLocaleString("id-ID")}
            </span>
          </button>
        ))}

        {products.length === 0 && (
          <div className="col-span-full flex items-center justify-center text-[var(--color-text-muted)] text-sm italic py-20">
            Produk tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
