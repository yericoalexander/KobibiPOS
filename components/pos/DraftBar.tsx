"use client";

import { useDraftStore } from "@/store/useDraftStore";
import { useCartStore } from "@/store/useCartStore";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DraftBar() {
  const { drafts, activeDraftId, addDraft, updateDraft, removeDraft, setActiveDraftId } = useDraftStore();
  const cartStore = useCartStore();

  const handleNewDraft = () => {
    // Basic auto-save current
    saveCurrentToDraft();

    // Create extremely local id
    const newId = Date.now().toString(36);
    addDraft({
      id: newId,
      orderNumber: `DRAFT-${newId.substring(0,4).toUpperCase()}`,
      customerName: "",
      tableNumber: "",
      items: [],
      subtotal: 0
    });
    setActiveDraftId(newId);
    cartStore.clearCart();
    toast.success("Draft baru dibuat");
  };

  const saveCurrentToDraft = () => {
    if (activeDraftId) {
      updateDraft(activeDraftId, {
        customerName: cartStore.customerName,
        tableNumber: cartStore.tableNumber,
        items: cartStore.items,
        subtotal: cartStore.items.reduce((s, i) => s + i.subtotal, 0)
      });
    }
  };

  const handleSwitchDraft = (id: string) => {
    if (id === activeDraftId) return;
    
    // Save current
    saveCurrentToDraft();

    // Load selected
    const target = drafts.find(d => d.id === id);
    if (target) {
      cartStore.loadCart(target.items, target.customerName, target.tableNumber);
      setActiveDraftId(target.id);
    }
  };

  const handleRemoveDraft = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeDraft(id);
    if (activeDraftId === id) {
      cartStore.clearCart();
      const remaining = drafts.filter(d => d.id !== id);
      if (remaining.length > 0) {
        handleSwitchDraft(remaining[remaining.length - 1].id);
      } else {
         setActiveDraftId(null);
      }
    }
  };

  return (
    <div className="flex items-center gap-3 w-full overflow-x-auto custom-scrollbar pt-1 pb-1">
      <button 
        onClick={handleNewDraft}
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-white text-[var(--color-text-muted)] transition-all shadow-sm"
        title="Buat Draft Baru"
      >
        <Plus size={20} />
      </button>

      <div className="flex items-center gap-2">
        {drafts.map(d => {
          const isActive = activeDraftId === d.id;
          return (
            <div 
              key={d.id}
              onClick={() => handleSwitchDraft(d.id)}
              className={cn(
                "group shrink-0 flex items-center px-4 py-2 rounded-xl border cursor-pointer transition-all min-w-[200px] shadow-sm",
                isActive 
                  ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]" 
                  : "bg-white border-[var(--color-border)] hover:border-[var(--color-accent)]/40"
              )}
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className={cn("text-xs font-bold truncate", isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text)]")}>
                  {d.customerName || d.orderNumber}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                  {d.items.length} items • Rp {d.subtotal.toLocaleString("id-ID")}
                </p>
              </div>
              <button 
                onClick={(e) => handleRemoveDraft(e, d.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
        {drafts.length === 0 && (
          <span className="text-sm text-[var(--color-text-muted)] italic px-2">Tidak ada draft aktif</span>
        )}
      </div>
    </div>
  );
}
