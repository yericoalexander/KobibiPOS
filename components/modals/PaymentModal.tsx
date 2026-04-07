"use client";

import { useState } from "react";
import { X, CreditCard, Banknote, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  total: number;
  onConfirm: (method: string, amount: number) => void;
}

export default function PaymentModal({ isOpen, onClose, subtotal, total, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState<string>("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    let paid = Number(amountPaid.replace(/\D/g, ""));
    if (method !== "CASH") paid = total;
    onConfirm(method, paid);
  };

  const cashAmount = Number(amountPaid.replace(/\D/g, ""));
  const change = method === "CASH" ? Math.max(0, cashAmount - total) : 0;
  const isSufficient = method !== "CASH" || cashAmount >= total;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">Pembayaran</h2>
          <button onClick={onClose} className="p-2 bg-[var(--color-surface)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-1 text-center bg-[var(--color-surface-2)]/50 p-3 rounded-xl border border-[var(--color-border)]">
            <p className="text-[var(--color-text-muted)] text-xs font-medium">Total Tagihan</p>
            <p className="text-3xl font-bold font-mono text-[var(--color-accent)]">Rp {total.toLocaleString("id-ID")}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "CASH", label: "Tunai", icon: <Banknote size={20} className="mb-1" /> },
                { id: "QRIS", label: "QRIS", icon: <QrCode size={20} className="mb-1" /> },
                { id: "TRANSFER", label: "Transfer", icon: <CreditCard size={20} className="mb-1" /> },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMethod(m.id); setAmountPaid(""); }}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all",
                    method === m.id 
                      ? "border-[var(--color-accent)] bg-amber-500/10 text-[var(--color-accent)]" 
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:border-white/20"
                  )}
                >
                  {m.icon}
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {method === "CASH" && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Jumlah Uang Diterima</p>
              
              <div className="flex flex-wrap gap-1.5 pb-1 text-xs">
                {[10000, 20000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                        const newTotal = (Number(amountPaid.replace(/\D/g, "")) + val);
                        setAmountPaid(newTotal.toLocaleString("id-ID"));
                    }}
                    className="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full font-semibold hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    +{val / 1000}k
                  </button>
                ))}
                <button
                    type="button"
                    onClick={() => setAmountPaid(total.toLocaleString("id-ID"))}
                    className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-semibold hover:bg-amber-500 hover:text-white transition-colors"
                >
                    Pas
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg text-[var(--color-text-muted)]">Rp</span>
                <input
                  type="text"
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-3 pl-10 pr-3 text-xl font-mono focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                  value={amountPaid}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAmountPaid(val ? Number(val).toLocaleString("id-ID") : "");
                  }}
                />
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">Kembalian</span>
                <span className={cn("text-lg font-mono font-bold", change > 0 ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]")}>
                  Rp {change.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!isSufficient}
            className="w-full py-3 rounded-xl font-bold text-white bg-[var(--color-accent)] hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
}
