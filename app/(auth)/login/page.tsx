"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("owner@test.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [role, setRole] = useState("KASIR");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal melakukan registrasi");
        toast.success("Registrasi berhasil! Silakan masuk.");
        setIsRegister(false);
      } else {
        const res = await signIn("credentials", { redirect: false, email, password });
        if (res?.error) {
          toast.error("Email atau password salah");
        } else {
          toast.success("Login berhasil!");
          router.push("/kasir");
          router.refresh();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[var(--color-border)]">

        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[var(--color-accent)] rounded-2xl shadow-lg flex items-center justify-center">
              <span className="text-3xl font-extrabold text-white">NK</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--color-text)]">NGANGKRING KOBIBI</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Sistem Kasir & Manajemen Toko</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-8 gap-2 pb-2">
          <button type="button" onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isRegister ? "bg-[var(--color-accent)] text-white shadow-md" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}>
            Masuk
          </button>
          <button type="button" onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isRegister ? "bg-[var(--color-accent)] text-white shadow-md" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}>
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Nama Lengkap</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)] transition-all"
                placeholder="Masukkan nama Anda" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)] transition-all"
              placeholder="mail@contoh.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 pr-12 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)] transition-all"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Pilih Peran (Role)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)] transition-all cursor-pointer">
                <option value="OWNER">OWNER (Pemilik Toko)</option>
                <option value="ADMIN">ADMIN (Manajer)</option>
                <option value="KASIR">KASIR (Staf Toko)</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <div className="flex items-center gap-2">
                {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                <span>{isRegister ? "Daftar Akun Baru" : "Masuk ke Sistem"}</span>
              </div>
            )}
          </button>

          <p className="text-[11px] text-center text-[var(--color-text-muted)] pt-1">
            {!isRegister
              ? <>Demo: <code className="text-[var(--color-accent)] font-semibold">owner@test.com</code> / <code className="text-[var(--color-accent)] font-semibold">password123</code></>
              : "Dengan mendaftar, Anda menyetujui ketentuan layanan kami."}
          </p>
        </form>
      </div>
    </div>
  );
}
