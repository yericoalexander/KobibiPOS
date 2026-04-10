"use client";

import { X, Package, User, Hash, Clock, FileText } from "lucide-react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Rincian Order</h2>
            <p className="text-[10px] font-mono font-bold text-[var(--color-accent)] opacity-70 uppercase tracking-widest">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 border border-[var(--color-border)] bg-white hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 bg-[var(--color-bg)] text-[11px] font-medium border-b border-[var(--color-border)]">
          <div className="p-3 border-r border-[var(--color-border)] flex items-center gap-2">
            <User size={14} className="text-[var(--color-text-muted)]" />
            <span className="truncate">{order.customerName || "Tanpa Nama"}</span>
          </div>
          <div className="p-3 flex items-center gap-2">
            <Hash size={14} className="text-[var(--color-text-muted)]" />
            <span>Meja {order.tableNumber || "-"}</span>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Package size={14} /> 
            Item Pesanan
          </div>
          
          {order.items.map((item: any) => (
            <div key={item.id} className="p-3 bg-white border border-[var(--color-border)] rounded-xl flex flex-col gap-1.5 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-[var(--color-text)] flex-1 pr-4">{item.name}</span>
                <span className="font-mono font-bold text-[var(--color-accent)] text-sm">
                  Rp {(item.qty * item.price).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                <span>{item.qty} x Rp {item.price.toLocaleString("id-ID")}</span>
                {item.note && (
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-[10px] font-medium border border-yellow-100">
                    <FileText size={10} />
                    {item.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER SUMMARY */}
        <div className="p-5 bg-[var(--color-surface-2)]/50 border-t border-[var(--color-border)] shrink-0 space-y-3">
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>Metode Bayar</span>
            <span className="font-bold">{order.paymentMethod || "-"}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]/50">
            <span className="font-bold text-[var(--color-text)]">Total</span>
            <span className="text-xl font-mono font-black text-[var(--color-accent)] animate-in slide-in-from-right duration-300">
              Rp {order.total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)] justify-center pt-2">
            <Clock size={12} />
            Dipesan pada {new Date(order.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}
