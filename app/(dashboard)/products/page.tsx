"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", costPrice: "", stock: "", emoji: "🍔", categoryId: "", active: true });

  const fetchData = async () => {
    try {
      const [resP, resC] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      setProducts(await resP.json());
      setCategories(await resC.json());
      setLoading(false);
    } catch {
      toast.error("Gagal memuat data produk");
    }
  };

  useEffect(() => { fetchData() }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", price: "", costPrice: "", stock: "", emoji: "🍔", categoryId: categories.length > 0 ? categories[0].id : "", active: true });
    setIsModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price.toString(), costPrice: p.costPrice?.toString() || "0", stock: p.stock?.toString() || "0", emoji: p.emoji || "🍔", categoryId: p.categoryId || "", active: p.active });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...form, price: Number(form.price), costPrice: Number(form.costPrice), stock: Number(form.stock)})
      });
      if (!res.ok) throw new Error();
      
      toast.success(`Produk ${editingId ? 'diperbarui' : 'disimpan'}`);
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan produk");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if(!confirm(`Hapus produk ${name}?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produk dihapus");
      fetchData();
    } catch { 
      toast.error("Gagal menghapus produk");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Produk Menu</h1>
            <p className="text-[var(--color-text-muted)] text-sm md:text-base mt-1">Manajemen katalog menu POS Anda</p>
          </div>
          <button onClick={openNew} className="hidden sm:flex w-auto bg-[var(--color-accent)] hover:bg-amber-600 text-white font-bold py-3 px-4 md:px-6 rounded-xl items-center justify-center shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap">
            <Plus size={18} className="mr-2" /> Tambah Produk
          </button>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-10 text-center animate-pulse text-[var(--color-text-muted)]">Memuat katalog...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--color-surface-2)]/50 text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Menu</th>
                    <th className="px-6 py-4 font-medium">Kategori</th>
                    <th className="px-6 py-4 font-medium">Harga Beli</th>
                    <th className="px-6 py-4 font-medium">Harga Jual</th>
                    <th className="px-6 py-4 font-medium">Stok</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {products.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-muted)] italic">Katalog masih kosong</td></tr>
                  ) : (
                    products.map(p => (
                      <tr key={p.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                        <td className="px-6 py-4 font-bold flex items-center">
                          <span className="text-2xl mr-3">{p.emoji}</span>
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">{p.category?.name || '-'}</td>
                        <td className="px-6 py-4 font-mono font-medium text-red-500">Rp {p.costPrice?.toLocaleString("id-ID") || 0}</td>
                        <td className="px-6 py-4 font-mono font-medium text-[var(--color-accent)]">Rp {p.price.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4 font-mono font-medium">{p.stock}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {p.active ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEdit(p)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all mr-2" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">Memuat katalog...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">Katalog masih kosong</div>
          ) : (
            products.map(p => (
              <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
                {/* Product Name & Emoji */}
                <div className="flex items-start gap-3">
                  <span className="text-4xl flex-shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-white truncate">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {p.category?.name || '-'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${p.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {p.active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--color-border)]/50">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium">Harga Beli</p>
                    <p className="text-sm font-mono font-bold text-red-500">Rp {(p.costPrice || 0).toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium">Harga Jual</p>
                    <p className="text-sm font-mono font-bold text-[var(--color-accent)]">Rp {p.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium">Stok</p>
                    <p className={`text-sm font-mono font-bold ${p.stock <= 5 ? 'text-orange-400' : 'text-green-400'}`}>{p.stock}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 px-3 py-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-1">
                    <Edit3 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="flex-1 px-3 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-sm font-semibold flex items-center justify-center gap-1">
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON */}
      <button 
        onClick={openNew}
        className="sm:hidden fixed bottom-24 right-4 z-40 w-16 h-16 bg-[var(--color-accent)] hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 focus:outline-none"
      >
        <Plus size={28} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] shrink-0">
              <h2 className="text-lg md:text-xl font-bold">{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[var(--color-surface)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 md:p-6 space-y-4 flex-1">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 text-[var(--color-text-muted)]">Emoji</label>
                  <input type="text" required value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--color-accent)] text-2xl text-center" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 text-[var(--color-text-muted)]">Nama Produk</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)] text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 text-[var(--color-text-muted)]">Kategori</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-[var(--color-accent)] text-sm">
                    <option value="">- Tanpa Kategori -</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 text-[var(--color-text-muted)]">Stok</label>
                  <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)] text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 text-[var(--color-text-muted)]">Harga Jual (Rp)</label>
                  <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)] text-sm" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 text-[var(--color-text-muted)]">Harga Beli (Rp)</label>
                  <input type="number" required value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)] text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                 <label className="flex items-center cursor-pointer">
                   <div className="relative">
                     <input type="checkbox" className="sr-only" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                     <div className={`block w-14 h-8 rounded-full transition-colors ${form.active ? 'bg-[var(--color-accent)]' : 'bg-gray-600'}`}></div>
                     <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${form.active ? 'transform translate-x-6' : ''}`}></div>
                   </div>
                   <div className="ml-3 font-semibold text-xs md:text-sm">Produk Aktif (Bisa dibeli)</div>
                 </label>
              </div>

              <div className="pt-4 sticky bottom-0 bg-[var(--color-surface)]">
                <button type="submit" className="w-full bg-[var(--color-accent)] hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm md:text-base">
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
