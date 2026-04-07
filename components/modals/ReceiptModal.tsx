"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { X, Printer } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  store: any;
}

export default function ReceiptModal({ isOpen, onClose, order, store }: ReceiptModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!isOpen || !order || !store) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
          <h2 className="text-lg font-bold">Cetak Struk</h2>
          <button onClick={onClose} className="p-2 bg-[var(--color-surface)] hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-200 custom-scrollbar flex justify-center">
          {/* Paper element to print */}
          <div ref={componentRef} className="bg-white text-black w-[80mm] min-h-[100mm] p-4 text-xs font-mono relative shadow-md">
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold leading-none mb-1">{store.name}</h1>
              <p>{store.address}</p>
              <p>{store.phone}</p>
              <div className="border-b border-dashed border-black/30 my-2" />
              <p>No: {order.orderNumber}</p>
              <p>Tgl: {new Date(order.createdAt).toLocaleString('id-ID')}</p>
              <p>Kasir: {order.cashier?.name}</p>
              <p>Meja: {order.tableNumber || '-'} | Cust: {order.customerName || '-'}</p>
              <div className="border-b border-dashed border-black/30 my-2" />
            </div>

            <table className="w-full mb-2">
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-1">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-gray-600">{item.qty}x Rp {item.price.toLocaleString("id-ID")}</div>
                    </td>
                    <td className="text-right align-bottom py-1 w-24">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-black/30 my-2 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-bold text-sm mt-1 border-t border-black pt-1">
                <span>TOTAL</span>
                <span>Rp {order.total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="mb-6 space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Bayar ({order.paymentMethod || 'CASH'})</span>
                <span>Rp {(order.amountPaid || order.total).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali</span>
                <span>Rp {(order.change || 0).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="text-center mt-8">
              <p>{store.receiptFooter}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-[var(--color-accent)] hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Printer size={20} />
            Cetak Struk Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
