"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";

import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


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

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Kategori Menu</h1>
            <p className="text-[var(--color-text-muted)] mt-1 text-sm md:text-base">Kelola jenis kategori produk POS Anda</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Cari kategori..." 
              className="w-full bg-white border border-[var(--color-border)] focus:border-[var(--color-accent)] rounded-xl py-3 pl-12 pr-10 focus:outline-none transition-all text-sm shadow-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
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
        </div>




        <form onSubmit={handleAdd} className="flex gap-3 items-center bg-white border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <input 
            type="text" 
            placeholder="Kategori baru (mis. Minuman Dingin)" 
            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-accent)] transition-all text-[var(--color-text)] text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-md shadow-blue-500/20 transition-all text-sm">
            <Plus size={18} className="mr-2" /> Tambah
          </button>
        </form>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-[var(--color-text-muted)] text-sm">Memuat data...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold w-full">Nama Kategori</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredCategories.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-[var(--color-text-muted)] italic">{search ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}</td></tr>
                ) : (
                  filteredCategories.map(c => (
                    <tr key={c.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[var(--color-text)]">{c.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Hapus">
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
