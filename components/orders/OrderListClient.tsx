"use client";

import { useState, useEffect } from "react";
import { OrderStatus } from "@prisma/client";
import StatusBadge from "./StatusBadge";
import { Search, Edit3, Trash2, CreditCard, Printer, Eye, Calendar, CalendarX, X } from "lucide-react";
import toast from "react-hot-toast";
import { useDraftStore } from "@/store/useDraftStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import PaymentModal from "../modals/PaymentModal";
import ReceiptModal from "../modals/ReceiptModal";
import OrderDetailsModal from "../modals/OrderDetailsModal";
import { cn } from "@/lib/utils";

export default function OrderListClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);

  const draftStore = useDraftStore();
  const cartStore = useCartStore();
  const router = useRouter();

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    // Skip fetching on mount only if initialOrders is already provided (SSR)
    // If initialOrders is empty, we must fetch even on first render
    if (isFirstRender && statusFilter === "ALL" && !selectedDate && initialOrders.length > 0) {
      setIsFirstRender(false);
      return;
    }
    setIsFirstRender(false);

    const controller = new AbortController();
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (selectedDate) params.append("date", selectedDate);
            
            const res = await fetch(`/api/orders?${params.toString()}`, {
              signal: controller.signal
            });
            if (!res.ok) throw new Error("Gagal mengambil data riwayat");
            const data = await res.json();
            setOrders(data);
        } catch (e: any) {
            if (e.name !== 'AbortError') {
              toast.error(e.message);
            }
        } finally {
            if (!controller.signal.aborted) {
              setIsLoading(false);
            }
        }
    };

    const timer = setTimeout(fetchOrders, 150); // Small debounce
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [statusFilter, selectedDate, isFirstRender]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()));
    
    // Status and Date are already filtered on API if set
    return matchSearch;
  });

  const handleAction = async (orderId: string, action: string, data?: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
         method: "PATCH",
         headers: {"Content-Type": "application/json"},
         body: JSON.stringify({ action, ...data })
      });
      if (!res.ok) throw new Error("Gagal melakukan aksi");
      const updated = await res.json();
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      toast.success("Berhasil");
    } catch(e: any) {
      toast.error(e.message);
    }
  }

  const handleEdit = async (order: any) => {
    // 1. API set status to DRAFT
    await handleAction(order.id, "EDIT");
    
    // 2. Load into Zustand
    draftStore.addDraft({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || "",
      tableNumber: order.tableNumber || "",
      items: order.items.map((i: any) => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        subtotal: i.subtotal,
        note: i.note
      })),
      subtotal: order.subtotal
    });
    
    // Also load it into active Kasir immediately so it doesn't appear empty
    cartStore.loadCart(
      order.items.map((i: any) => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        subtotal: i.subtotal,
        note: i.note
      })),
      order.customerName || "",
      order.tableNumber || ""
    );

    draftStore.setActiveDraftId(order.id);
    
    // 3. Redirect to Kasir
    router.push("/kasir");
  };

  const startPayment = (order: any) => {
    setActiveOrder(order);
    setPaymentOpen(true);
  };

  const confirmPay = async (method: string, amount: number) => {
    if (activeOrder) {
      await handleAction(activeOrder.id, "PAY", { paymentMethod: method, amountPaid: amount });
      setPaymentOpen(false);
      setActiveOrder(null);
    }
  };

  const startPrint = (order: any) => {
    setActiveOrder(order);
    setReceiptOpen(true);
  }

  const openDetails = (order: any) => {
    setActiveOrder(order);
    setDetailsOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 bg-white border border-[var(--color-border)] p-1.5 rounded-xl shrink-0 overflow-x-auto custom-scrollbar shadow-sm">
          {["ALL", "DRAFT", "UNPAID", "PAID", "VOID"].map(s => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s as any)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${statusFilter === s ? "bg-[var(--color-accent)] text-white shadow-md shadow-blue-500/10" : "text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"}`}
            >
              {s === "UNPAID" ? "BELUM BAYAR" : s === "PAID" ? "LUNAS" : s === "VOID" ? "BATAL" : s}
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full bg-white border border-[var(--color-border)] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-[var(--color-accent)] transition-all text-sm text-[var(--color-text)] shadow-sm placeholder:text-[var(--color-text-muted)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1"
                title="Hapus pencarian"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white border border-[var(--color-border)] p-1 rounded-xl shadow-sm">
             <div className="flex items-center px-3 text-[var(--color-text-muted)]">
                <Calendar size={18} className="mr-2" />
                <input 
                  type="date" 
                  className="bg-transparent text-sm focus:outline-none text-[var(--color-text)] font-medium"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
             </div>
             {selectedDate && (
               <button 
                 onClick={() => setSelectedDate("")}
                 className="p-2 hover:bg-gray-100 rounded-lg text-red-500 transition-colors"
                 title="Hapus filter tanggal"
               >
                 <CalendarX size={18} />
               </button>
             )}
          </div>
        </div>
      </div>

      {isLoading && (
         <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent"></div>
         </div>
      )}

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Pelanggan</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-muted)] italic">
                    Tidak ada pesanan ditemukan
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr 
                    key={o.id} 
                    onClick={() => openDetails(o)}
                    className="hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-[var(--color-text)]">{o.orderNumber}</td>
                    <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4">
                      {o.customerName || "-"} <span className="text-[var(--color-text-muted)] text-xs ml-1">{o.tableNumber ? `(Meja ${o.tableNumber})` : ''}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[var(--color-accent)]">
                      Rp {o.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {new Date(o.createdAt).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {o.status === "DRAFT" && (
                         <button onClick={() => handleAction(o.id, "SUBMIT")} className="p-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white rounded-lg transition-all" title="Submit (Belum Bayar)">
                           <Edit3 size={16} />
                         </button>
                      )}
                      
                      {o.status === "UNPAID" && (
                        <>
                          <button onClick={() => handleEdit(o)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 rounded-lg transition-all" title="Edit di Kasir">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => startPayment(o)} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 rounded-lg transition-all" title="Tandai Lunas">
                            <CreditCard size={16} />
                          </button>
                        </>
                      )}

                      {o.status === "PAID" && (
                        <button onClick={() => startPrint(o)} className="px-3 py-2 bg-[var(--color-bg)] hover:bg-[var(--color-accent)] text-[var(--color-text-muted)] hover:text-white rounded-lg transition-all border border-[var(--color-border)] flex items-center gap-2 text-xs font-bold" title="Cetak Struk">
                          <Printer size={14} /> Cetak
                        </button>
                      )}

                      {(o.status === "DRAFT" || o.status === "UNPAID") && (
                        <button onClick={() => { setOrderToCancel(o); setCancelModalOpen(true); }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 rounded-lg transition-all ml-2" title="Batalkan (Void)">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)] italic">
            Tidak ada pesanan ditemukan
          </div>
        ) : (
          filteredOrders.map(o => (
            <div 
              key={o.id} 
              onClick={() => openDetails(o)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3 active:scale-[0.98] transition-all cursor-pointer"
            >
              {/* Order Number & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">Order ID</p>
                  <p className="text-sm font-mono font-bold text-[var(--color-text)]">{o.orderNumber}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              {/* Customer & Table */}
              <div className="py-2 border-y border-[var(--color-border)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-1">Pelanggan</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {o.customerName || "-"} {o.tableNumber ? <span className="text-xs text-[var(--color-text-muted)] font-normal ml-1">Meja {o.tableNumber}</span> : ''}
                </p>
              </div>

              {/* Total & Waktu */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">Total</p>
                  <p className="text-sm font-mono font-bold text-[var(--color-accent)]">Rp {o.total.toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">Waktu</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {new Date(o.createdAt).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                {o.status === "DRAFT" && (
                  <button onClick={() => handleAction(o.id, "SUBMIT")} className="flex-1 px-3 py-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1" title="Submit">
                    <Edit3 size={14} /> Submit
                  </button>
                )}
                
                {o.status === "UNPAID" && (
                  <>
                    <button onClick={() => handleEdit(o)} className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => startPayment(o)} className="flex-1 px-3 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1">
                      <CreditCard size={14} /> Bayar
                    </button>
                  </>
                )}

                {o.status === "PAID" && (
                  <button onClick={() => startPrint(o)} className="flex-1 px-3 py-2.5 bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-2">
                    <Printer size={16} /> Cetak Struk
                  </button>
                )}

                {(o.status === "DRAFT" || o.status === "UNPAID") && (
                  <button onClick={() => { setOrderToCancel(o); setCancelModalOpen(true); }} className="px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-xs font-semibold">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {activeOrder && paymentOpen && (
        <PaymentModal 
          isOpen={paymentOpen} 
          onClose={() => {setPaymentOpen(false); setActiveOrder(null)}} 
          subtotal={activeOrder.subtotal} 
          total={activeOrder.total} 
          onConfirm={confirmPay} 
        />
      )}

      {activeOrder && receiptOpen && (
        <ReceiptModal 
          isOpen={receiptOpen} 
          onClose={() => {setReceiptOpen(false); setActiveOrder(null)}} 
          order={activeOrder} 
          store={{ name: "Warung Kobibi", address: "Jl. Contoh No 123", phone: "08123456789", receiptFooter: "Terima Kasih!" }} // normally fetched from settings API or passed as prop, using dummy for now to mock store context
        />
      )}

      {/* CANCEL/VOID CONFIRMATION MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">Batalkan Order?</h2>
              <p className="text-[var(--color-text-muted)] text-sm">
                Apakah Anda yakin ingin membatalkan order <strong className="text-[var(--color-text)] font-extrabold">{orderToCancel?.orderNumber}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
              <button 
                onClick={() => { setCancelModalOpen(false); setOrderToCancel(null); }}
                className="flex-1 py-3 px-4 rounded-xl font-semibold bg-white border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-all text-sm"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  if (orderToCancel) {
                    handleAction(orderToCancel.id, "VOID");
                    setCancelModalOpen(false);
                    setOrderToCancel(null);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-[var(--color-accent)] hover:opacity-90 shadow-md shadow-blue-500/10 text-white transition-all text-sm"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
      {activeOrder && detailsOpen && (
        <OrderDetailsModal 
          isOpen={detailsOpen} 
          onClose={() => {setDetailsOpen(false); setActiveOrder(null)}} 
          order={activeOrder} 
        />
      )}
    </>
  );
}
