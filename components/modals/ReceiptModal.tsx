"use client";
 
 import { useRef } from "react";
 import { useReactToPrint } from "react-to-print";
 import { X, Printer, MessageCircle, Share2, FileDown } from "lucide-react";
 import jsPDF from 'jspdf';
 import toast from "react-hot-toast";
 
 interface ReceiptModalProps {
   isOpen: boolean;
   onClose: () => void;
   order: any;
   store: any;
 }
 
 export default function ReceiptModal({ isOpen, onClose, order, store }: ReceiptModalProps) {
   const componentRef = useRef<HTMLDivElement>(null);
   const filename = `STRUK-${(order.customerName || order.orderNumber).toUpperCase()}`;
   
   const handlePrint = useReactToPrint({
     contentRef: componentRef,
     documentTitle: filename,
   });
 
   const generatePDFBlob = (): Blob => {
     const margin = 7;
     const width = 80;
 
     // ── PASS 1: calculate required document height ──────────────────────
     const tempDoc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, 500] });
     tempDoc.setFont("courier", "normal");
     tempDoc.setFontSize(7.5);
     const splitAddress = tempDoc.splitTextToSize(store.address || '', width - 15);
 
     const headerH   = 12                              // top margin y-start
                     + 6                               // store name
                     + (splitAddress.length * 4)       // address lines
                     + 5                               // phone
                     + 5;                              // separator
     const orderH    = 4                               // NO. ORDER
                     + 4                               // TANGGAL
                     + 4                               // PELANGGAN
                     + (order.tableNumber ? 4 : 0)     // MEJA (optional)
                     + (order.cashier?.name ? 4 : 0)   // KASIR (optional)
                     + 6;                              // separator
     const itemsH    = order.items.length * 10;        // each item = 4 (name) + 6 (price line)
     const totalsH   = 6                               // separator
                     + 6                               // SUBTOTAL
                     + 6                               // TOTAL
                     + 4                               // BAYAR
                     + 4                               // KEMBALI
                     + 12                              // footer gap
                     + 10;                             // bottom padding
 
     const docHeight = headerH + orderH + itemsH + totalsH;
 
     // ── PASS 2: generate PDF at exact height ────────────────────────────
     const doc = new jsPDF({
       orientation: 'p',
       unit: 'mm',
       format: [80, docHeight]
     });
 
     const centerX = width / 2;
     let y = 12;
 
     // Header
     doc.setFont("courier", "bold");
     doc.setFontSize(14);
     doc.text(store.name.toUpperCase(), centerX, y, { align: 'center' });
     y += 6;
 
     doc.setFont("courier", "normal");
     doc.setFontSize(7.5);
     doc.text(splitAddress, centerX, y, { align: 'center' });
     y += (splitAddress.length * 4);
     doc.text(store.phone || '', centerX, y, { align: 'center' });
     y += 5;
 
     doc.text("------------------------------------------", centerX, y, { align: 'center' });
     y += 5;
 
     // Order Info
     const infoX = margin;
     doc.setFontSize(7.5);
     doc.text(`NO. ORDER : ${order.orderNumber}`, infoX, y);
     y += 4;
     doc.text(
       `TANGGAL   : ${new Date(order.createdAt).toLocaleDateString('id-ID')} ` +
       `${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
       infoX, y
     );
     y += 4;
     doc.text(`PELANGGAN : ${order.customerName || '-'}`, infoX, y);
     if (order.tableNumber) {
       y += 4;
       doc.text(`MEJA      : ${order.tableNumber}`, infoX, y);
     }
     y += 4;
     if (order.cashier?.name) {
       doc.text(`KASIR     : ${order.cashier.name.toUpperCase()}`, infoX, y);
       y += 4;
     }
 
     doc.text("------------------------------------------", centerX, y, { align: 'center' });
     y += 6;
 
     // Items
     order.items.forEach((item: any) => {
       doc.setFont("courier", "bold");
       doc.text(item.name.toUpperCase(), infoX, y);
       y += 4;
       doc.setFont("courier", "normal");
       doc.text(`${item.qty} x ${item.price.toLocaleString("id-ID")}`, infoX, y);
       doc.text(item.subtotal.toLocaleString("id-ID"), width - margin, y, { align: 'right' });
       y += 6;
     });
 
     doc.text("------------------------------------------", centerX, y, { align: 'center' });
     y += 6;
 
     // Totals
     doc.setFont("courier", "normal");
     doc.setFontSize(8);
     doc.text("SUBTOTAL", infoX, y);
     doc.text(order.subtotal.toLocaleString("id-ID"), width - margin, y, { align: 'right' });
     y += 6;
 
     doc.setFont("courier", "bold");
     doc.setFontSize(9);
     doc.text("TOTAL", infoX, y);
     doc.text(order.total.toLocaleString("id-ID"), width - margin, y, { align: 'right' });
     y += 6;
 
     doc.setFont("courier", "normal");
     doc.setFontSize(8);
     doc.text(`BAYAR (${order.paymentMethod || 'CASH'})`, infoX, y);
     doc.text((order.amountPaid || order.total).toLocaleString("id-ID"), width - margin, y, { align: 'right' });
     y += 4;
     doc.text("KEMBALI", infoX, y);
     doc.text((order.change || 0).toLocaleString("id-ID"), width - margin, y, { align: 'right' });
     y += 10;
 
     // Footer
     doc.setFontSize(9);
     doc.text(store.receiptFooter || 'Terima Kasih!', centerX, y, { align: 'center' });
 
     return doc.output('blob');
   };
 
   const handleSharePDF = async () => {
     const blob = generatePDFBlob();
     const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });
     
     const shareData = {
       files: [file],
       title: `Struk ${store.name}`,
       text: `Berikut adalah struk pesanan Anda (${order.orderNumber}) dari ${store.name}.`,
     };
 
     if (navigator.canShare && navigator.canShare(shareData)) {
       try {
         await navigator.share(shareData);
       } catch (error: any) {
         if (error.name !== 'AbortError') {
           toast.error("Gagal membagikan struk");
           handleDownloadPDF(blob); // Fallback
         }
       }
     } else {
       toast.error("Fitur berbagi tidak didukung di browser ini. Mengunduh PDF...");
       handleDownloadPDF(blob);
     }
   };
 
   const handleDownloadPDF = (blob?: Blob) => {
     const pdfBlob = blob || generatePDFBlob();
     const url = URL.createObjectURL(pdfBlob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `${filename}.pdf`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
   };
 
   if (!isOpen || !order || !store) return null;
 
   return (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[82vh] md:max-h-[85vh]">
         
         <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] shrink-0">
           <h2 className="text-lg font-bold text-[var(--color-text)]">Cetak Struk</h2>
           <button onClick={onClose} className="p-2 border border-[var(--color-border)] bg-white hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors">
             <X size={20} />
           </button>
         </div>
 
         <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 custom-scrollbar flex justify-center scrolling-touch">
           {/* Paper element to print */}
           <style jsx global>{`
             @media print {
               @page {
                 margin: 0;
                 size: 80mm auto;
               }
               body {
                 margin: 0;
                 -webkit-print-color-adjust: exact;
               }
               .print-container {
                 width: 80mm !important;
                 margin: 0 auto !important;
                 padding: 8mm !important;
                 box-shadow: none !important;
                 border: none !important;
                 display: block !important;
               }
               .no-print {
                 display: none !important;
               }
               /* Hide desktop/browser UI */
               header, footer, nav, .fixed {
                 display: none !important;
               }
             }
           `}</style>
           
           <div 
             ref={componentRef} 
             className="print-container bg-white text-black w-full max-w-[80mm] min-h-[100mm] p-6 text-[12px] font-mono relative shadow-md border border-gray-100"
             style={{ fontFamily: "'Courier New', Courier, monospace" }}
           >
             <div className="text-center mb-4">
               <h1 className="text-xl font-bold leading-tight mb-1 uppercase tracking-tight">{store.name}</h1>
               <p className="text-[10px] leading-relaxed px-2 font-medium">{store.address}</p>
               <p className="text-[10px] font-medium">{store.phone}</p>
               <div className="border-b border-dashed border-black/40 my-4" />
               
               <div className="text-left space-y-1 text-[10px] tabular-nums">
                 <div className="flex justify-between">
                   <span>NOMOR ORDER</span>
                   <span className="font-bold">{order.orderNumber}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>TANGGAL</span>
                   <span>{new Date(order.createdAt).toLocaleDateString('id-ID')} {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <div className="flex justify-between uppercase">
                   <span>KASIR</span>
                   <span className="font-medium">{order.cashier?.name || '-'}</span>
                 </div>
                 <div className="flex justify-between uppercase">
                   <span>PELANGGAN</span>
                   <span className="font-medium">{order.customerName || '-'} {order.tableNumber ? `(Meja ${order.tableNumber})` : ''}</span>
                 </div>
               </div>
               <div className="border-b border-dashed border-black/40 my-4" />
             </div>
 
              <div className="space-y-3 mb-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-[11px] leading-tight">
                    <div className="font-bold uppercase mb-0.5">{item.name}</div>
                    <div className="flex justify-between items-center tabular-nums">
                      <span className="text-[10px] italic font-medium opacity-80">{item.qty} x {item.price.toLocaleString("id-ID")}</span>
                      <span className="font-bold">{item.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-black/40 my-4 pt-4 space-y-1.5 text-[11px] tabular-nums">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>{order.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 border-t border-black pt-2">
                  <span>TOTAL</span>
                  <span className="text-xl">{order.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
  
              <div className="mb-6 space-y-1.5 mt-4 text-[10px] tabular-nums">
                <div className="flex justify-between">
                  <span className="uppercase font-medium">BAYAR ({order.paymentMethod || 'CASH'})</span>
                  <span>{(order.amountPaid || order.total).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>KEMBALI</span>
                  <span>{(order.change || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>
  
              <div className="text-center mt-10 mb-2">
                <p className="text-[10px] font-bold italic tracking-wide">{store.receiptFooter || 'Terima Kasih!'}</p>
              </div>
           </div>
         </div>
 
         <div className="p-4 border-t border-[var(--color-border)] bg-white shrink-0 grid grid-cols-2 gap-3 pb-safe">
           <button 
             onClick={handleSharePDF}
             className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/20 active:scale-95 transition-all text-xs sm:text-sm group"
           >
             <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
             Kirim WA
           </button>
           <button
             onClick={handlePrint}
             className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[var(--color-accent)] hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/20 transition-all text-xs sm:text-sm"
           >
             <Printer size={18} />
             Cetak
           </button>
         </div>
       </div>
     </div>
   );
 }
