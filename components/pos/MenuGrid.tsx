import React, { useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";

const ProductCard = React.memo(({ p, qtyInCart, handleAdd, handleIncrease, handleDecrease }: any) => {
  const remainingStock = p.stock - qtyInCart;
  const isOutOfStock = remainingStock <= 0;

  return (
    <div
      onClick={() => qtyInCart === 0 && !isOutOfStock && handleAdd(p)}
      className={`relative p-4 rounded-3xl transition-all duration-300 cursor-pointer shadow-sm border ${
        qtyInCart > 0
          ? 'bg-blue-50 border-[var(--color-accent)] shadow-blue-500/10'
          : 'bg-white border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:shadow-md active:scale-[0.98]'
      } ${isOutOfStock ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base md:text-lg mb-2 leading-tight text-[var(--color-text)]">
            {p.name}
          </h3>
          <div className="inline-block px-3 py-1.5 bg-[var(--color-accent)]/10 rounded-xl">
            <span className="text-base font-extrabold text-[var(--color-accent)] font-mono">
              Rp {p.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Right: Stock & Qty Control */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Stock Info */}
          <div className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider border ${
            isOutOfStock 
              ? 'text-red-500 bg-red-50 border-red-100' 
              : remainingStock <= 5 
                ? 'text-orange-600 bg-orange-50 border-orange-100' 
                : 'text-gray-500 bg-gray-50 border-gray-100'
          }`}>
            {isOutOfStock ? 'Habis' : `Stok: ${remainingStock}`}
          </div>

          {/* Qty Control (only show if in cart) */}
          {qtyInCart > 0 && (
            <div 
              className="flex items-center bg-white border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleDecrease(p.id, qtyInCart)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-xl font-bold text-gray-400"
               >
                &minus;
              </button>
              
              <div className="w-10 text-center font-extrabold text-base text-[var(--color-text)]">
                {qtyInCart}
              </div>

              <button
                onClick={() => handleIncrease(p.id, qtyInCart)}
                disabled={remainingStock <= 0}
                className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xl font-bold text-[var(--color-accent)]"
              >
                &#43;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

export default function MenuGrid({ products }: { products: any[] }) {
  const { items, addItem, updateQty, removeItem } = useCartStore();

  const handleAdd = useCallback((product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
  }, [addItem]);

  const handleIncrease = useCallback((productId: string, currentQty: number) => {
    updateQty(productId, currentQty + 1);
  }, [updateQty]);

  const handleDecrease = useCallback((productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeItem(productId);
    } else {
      updateQty(productId, currentQty - 1);
    }
  }, [removeItem, updateQty]);

  return (
    <div className="overflow-y-auto h-full pr-2 pb-10 custom-scrollbar">
      <div className="grid grid-cols-1 gap-4">
        {products.map((p) => {
          const cartItem = items.find((item) => item.id === p.id);
          const qtyInCart = cartItem ? cartItem.qty : 0;

          return (
            <ProductCard
              key={p.id}
              p={p}
              qtyInCart={qtyInCart}
              handleAdd={handleAdd}
              handleIncrease={handleIncrease}
              handleDecrease={handleDecrease}
            />
          );
        })}

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)] py-20 bg-gray-50/50 rounded-3xl border border-dashed border-[var(--color-border)]">
            <span className="text-4xl mb-2">🍽️</span>
            <p className="text-sm font-medium italic">Produk tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
