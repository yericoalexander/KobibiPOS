"use client";

import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">
      
      <div className="md:w-1/3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-lg h-fit shrink-0">
        <h2 className="text-xl font-bold mb-4">Tambah Pengguna</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Nama Kasir/Admin</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Email Login</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Password Sementara</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-muted)]">Peran (Role)</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2 px-4 focus:outline-none focus:border-[var(--color-accent)]">
              <option value="KASIR">KASIR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-[var(--color-accent)] hover:bg-amber-600 text-white font-bold py-3 mt-4 rounded-xl flex justify-center items-center shadow-lg shadow-amber-500/20 transition-all">
            <UserPlus size={18} className="mr-2" /> Daftarkan Akses
          </button>
        </form>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Tim & Kasir</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Kelola staf yang memiliki akses ke sistem FibrPOS</p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-10 text-center animate-pulse text-[var(--color-text-muted)]">Memuat team...</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-surface-2)]/50 text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                    <td className="px-6 py-4 font-bold flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mr-3">
                         {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{u.email}</td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1 rounded-md text-xs font-bold border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                         {u.role}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${u.active ? 'text-green-500' : 'text-red-500'}`}>
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
