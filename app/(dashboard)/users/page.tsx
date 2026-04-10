"use client";

import { useEffect, useState } from "react";
import { Plus, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  
  // Form minimal
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "KASIR" });

  const fetchUsers = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setUsers(d); setLoading(false); })
      .catch(() => toast.error("Gagal memuat pengguna"));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menambah user");
      toast.success("User berhasil ditambahkan");
      setForm({ name: "", email: "", password: "", role: "KASIR" });
      fetchUsers();
    } catch(e: any) {
      toast.error(e.message);
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">
      
      <div className="md:w-1/3 bg-white border border-[var(--color-border)] rounded-3xl p-6 shadow-sm h-fit shrink-0">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text)]">Tambah Pengguna</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Nama Kasir/Admin</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Email Login</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Password Sementara</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">Peran (Role)</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-all cursor-pointer">
              <option value="KASIR">KASIR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3 mt-2 rounded-xl flex justify-center items-center shadow-md shadow-blue-500/20 transition-all text-sm">
            <UserPlus size={18} className="mr-2" /> Daftarkan Akses
          </button>
        </form>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tim & Kasir</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Kelola staf yang memiliki akses ke sistem FibrPOS</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input 
              type="text" 
              placeholder="Cari team..." 
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-2.5 px-10 focus:outline-none focus:border-[var(--color-accent)] transition-all text-sm pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" 
              width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1"
                title="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>


        <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-[var(--color-text-muted)] text-sm">Memuat team...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)] italic">{search ? 'Team tidak ditemukan' : 'Belum ada team'}</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                    <td className="px-6 py-4 font-semibold flex items-center text-[var(--color-text)]">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mr-3 font-bold text-sm">
                         {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{u.email}</td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                         {u.role}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${u.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                         {u.active ? 'AKTIF' : 'NONAKTIF'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
