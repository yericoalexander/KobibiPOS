"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useDraftStore } from "@/store/useDraftStore";
import { User, Hash, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import PaymentModal from "../modals/PaymentModal";

export default function OrderPanel() {
  const { 
    items, customerName, tableNumber, 
    setCustomerName, setTableNumber, 
    updateQty, removeItem, clearCart 
  } = useCartStore();
  
  const { activeDraftId, removeDraft } = useDraftStore();

  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal;

  const getCommonPayload = () => ({
    customerName,
    tableNumber,
    items,
    subtotal,
    total
  });

  const handleSaveAsUnpaid = async () => {
    if (items.length === 0) return toast.error("Keranjang kosong!");
    setIsSubmitting(true);
    try {
      const payload = getCommonPayload();
      
      // If there's an active draft, we check if it was already saved to DB via API (if ID starts with ORD, it is in DB, but actually in our flow Drafts are local until submitted)
      // Actually standard: POST /api/orders
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Gagal simpan order");
      
      const order = await res.json();
      
      // Now set status to UNPAID
      const patchRes = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SUBMIT" })
      });
      
      if (!patchRes.ok) throw new Error("Gagal submit order");

      toast.success("Order tersimpan (Belum Bayar)");
      
      if (activeDraftId) removeDraft(activeDraftId);
      clearCart();

    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayConfirm = async (method: string, amountPaid: number) => {
    setIsSubmitting(true);
    try {
      // 1. Create order
      const payload = getCommonPayload();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal buat order");
      const order = await res.json();

      // 2. Pay order
      const payRes = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PAY", paymentMethod: method, amountPaid })
      });
      if (!payRes.ok) throw new Error("Gagal konfirmasi pembayaran");

      toast.success("Pembayaran Lunas!");
      setPaymentOpen(false);
      
      if (activeDraftId) removeDraft(activeDraftId);
      clearCart();

      // In real life, trigger print receipt here or show modal.

    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
        
        {/* HEADER INFO */}
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 grid grid-cols-2 gap-3 shrink-0">
          <label className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)] transition-all">
            <User size={16} className="text-[var(--color-text-muted)] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Nama Pelanggan" 
              className="bg-transparent w-full text-white placeholder-[var(--color-text-muted)] outline-none"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>
          <label className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm focus-within:border-[var(--color-accent)] focus-within:ring-1 focus-within:ring-[var(--color-accent)] transition-all">
            <Hash size={16} className="text-[var(--color-text-muted)] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Meja" 
              className="bg-transparent w-full text-white placeholder-[var(--color-text-muted)] outline-none"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </label>
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3">
              <span className="text-4xl text-[var(--color-text-muted)]">🛒</span>
              <p className="text-sm">Pilih menu dari daftar</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex flex-col p-3 bg-[var(--color-surface-2)]/40 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl group transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm pr-4">{item.name}</span>
                  <span className="font-mono font-medium text-[var(--color-accent)] whitespace-nowrap text-sm">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <button onClick={() => removeItem(item.id)} className="text-[var(--color-danger)]/70 hover:text-[var(--color-danger)] p-1.5 rounded-lg hover:bg-[var(--color-danger)]/10 transition-colors text-lg font-bold">
                    &times;
                  </button>
                  <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden shrink-0">
                    <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="px-3 py-1 hover:bg-[var(--color-surface-2)] active:bg-[var(--color-border)] transition-colors text-lg font-medium">&minus;</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1 hover:bg-[var(--color-surface-2)] active:bg-[var(--color-border)] text-[var(--color-accent)] transition-colors text-lg font-medium">&#43;</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SUMMARY FOOTER */}
        <div className="p-4 bg-[var(--color-surface-2)]/80 border-t border-[var(--color-border)] shrink-0 space-y-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-10 pb-6 rounded-b-2xl">
          <div className="flex justify-between text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-3">
            <span>Subtotal</span>
            <span className="font-mono">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span className="font-mono text-[var(--color-accent)]">Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handleSaveAsUnpaid}
              disabled={isSubmitting || items.length === 0}
              className="flex items-center justify-center py-3 px-4 rounded-xl font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] hover:border-white/20 transition-all text-sm disabled:opacity-50"
            >
              Simpan Draft
            </button>
            <button 
              onClick={() => items.length > 0 ? setPaymentOpen(true) : toast.error("Keranjang kosong!")}
              disabled={isSubmitting || items.length === 0}
              className="flex items-center justify-center py-3 px-4 rounded-xl font-bold bg-[var(--color-success)] hover:bg-green-600 shadow-lg shadow-green-500/20 text-white transition-all text-sm disabled:opacity-50"
            >
              Bayar Lunas
            </button>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setPaymentOpen(false)} 
        subtotal={subtotal} 
        total={total}
        onConfirm={handlePayConfirm}
      />
    </>
  );
}
