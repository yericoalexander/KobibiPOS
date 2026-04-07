"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [store, setStore] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setStore);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store)
      });
      if (!res.ok) throw new Error();
      toast.success("Pengaturan tersimpan");
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (!store) return <div className="p-10 animate-pulse text-[var(--color-text-muted)]">Memuat pengaturan...</div>;

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 mx-auto shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-[var(--color-accent)]">Pengaturan Toko</h1>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Nama Bisnis</label>
            <input type="text" value={store.name || ''} onChange={e => setStore({...store, name: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 focus:border-[var(--color-accent)] focus:outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Alamat Lengkap</label>
            <textarea value={store.address || ''} onChange={e => setStore({...store, address: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 focus:border-[var(--color-accent)] focus:outline-none h-24" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Nomor Telepon</label>
            <input type="text" value={store.phone || ''} onChange={e => setStore({...store, phone: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 focus:border-[var(--color-accent)] focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Footer Struk</label>
            <input type="text" value={store.receiptFooter || ''} onChange={e => setStore({...store, receiptFooter: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 focus:border-[var(--color-accent)] focus:outline-none" />
          </div>

          <div className="pt-4 flex justify-end">
             <button disabled={saving} type="submit" className="bg-[var(--color-accent)] hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg shadow-amber-500/20 transition-all">
               <Save size={18} className="mr-2" /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
