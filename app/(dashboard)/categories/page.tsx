"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => { setCategories(d); setLoading(false); })
      .catch(() => toast.error("Gagal memuat kategori"));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error();
      toast.success("Kategori ditambahkan");
      setName("");
      fetchCategories();
    } catch {
      toast.error("Gagal menambah kategori");
    }
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Hapus kategori ${catName}?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Kategori dihapus");
      fetchCategories();
    } catch {
      toast.error("Gagal menghapus kategori");
    }
  }

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kategori Menu</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Kelola jenis kategori produk POS Anda</p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-4 items-center bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-lg">
          <input 
            type="text" 
            placeholder="Kategori baru (mis. Minuman Dingin)" 
            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-accent)] transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="bg-[var(--color-accent)] hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg shadow-amber-500/20 transition-all">
            <Plus size={18} className="mr-2" /> Tambah
          </button>
        </form>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-10 text-center animate-pulse text-[var(--color-text-muted)]">Memuat data...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-surface-2)]/50 text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-medium w-full">Nama Kategori</th>
                  <th className="px-6 py-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {categories.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-[var(--color-text-muted)] italic">Belum ada kategori</td></tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                      <td className="px-6 py-4 font-bold">{c.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
