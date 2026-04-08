"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@test.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Email atau password salah");
      } else {
        toast.success("Login berhasil!");
        router.push("/kasir");
        router.refresh();
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-300 rounded-full shadow-xl flex items-center justify-center">
              <span className="text-4xl font-bold text-white">NK</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-br from-[var(--color-accent)] to-yellow-300 bg-clip-text text-transparent">
              NGANGKRING KOBIBI
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Spesial Sate Satean
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6 pt-0">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                placeholder="mail@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
          </button>
          
          <p className="text-xs text-center text-[var(--color-text-muted)] mt-6">
            Gunakan owner@test.com / password123 untuk masuk.
          </p>
        </form>
      </div>
    </div>
  );
}
