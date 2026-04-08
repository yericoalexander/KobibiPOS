"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Settings, Mail } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/summary?date=${selectedDate}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => toast.error("Gagal mengambil laporan"));
  }, [selectedDate]);

  const handleSendEmail = async () => {
    setIsSending(true);
    const toastId = toast.loading("Menyiapkan E-Statement...");
    try {
      const res = await fetch(`/api/reports/send-email?date=${selectedDate}`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal mengirim email');
      }
      toast.success("Laporan berhasil dikirim ke email!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  if (!data) return <div className="p-10 text-[var(--color-text-muted)] animate-pulse">Memuat laporan...</div>;
  if (data.error) return <div className="p-10 text-red-500 font-bold bg-red-500/10 border border-red-500 rounded-xl m-6">Error: {data.error}</div>;

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 md:p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Laporan Statistik</h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">Ringkasan performa bisnis Anda berdasarkan tanggal</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
            />
            <Link href="/settings" className="md:hidden flex items-center justify-center p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl hover:border-white/20 transition-all text-[var(--color-text-muted)]">
              <Settings size={18} />
            </Link>
            <button 
              onClick={handleSendEmail}
              disabled={isSending}
              className="flex items-center gap-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/40 transition-all disabled:opacity-50"
            >
              {isSending ? <><span className="animate-pulse">Mengirim...</span></> : <><Mail size={16} /> Tutup Kasir & Kirim</>}
            </button>
            <button className="hidden md:flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-4 py-2 rounded-xl text-sm font-semibold hover:border-white/20 transition-all">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pendapatan Kotor (Omzet)" value={`Rp ${(data.summary?.totalRevenue || 0).toLocaleString("id-ID")}`} color="text-[var(--color-accent)]" />
          <StatCard title="Pendapatan Bersih (Untung)" value={`Rp ${(data.summary?.totalProfit || 0).toLocaleString("id-ID")}`} color="text-green-500" />
          <StatCard title="Total Modal (HPP)" value={`Rp ${(data.summary?.totalCapital || 0).toLocaleString("id-ID")}`} color="text-blue-500" />
          <StatCard title="Transaksi Sukses" value={data.summary?.transactionsCount || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-bold mb-6">Tren Pendapatan Semua Waktu</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e36" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `Rp${v/1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1f', borderColor: '#2e2e36', borderRadius: '12px' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [`Rp ${value.toLocaleString("id-ID")}`, name === 'revenue' ? "Pendapatan Kotor" : "Keuntungan"]}
                  />
                  <Line type="monotone" name="revenue" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" name="profit" dataKey="profit" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-bold mb-4">Produk Terlaris {selectedDate}</h3>
            <div className="space-y-4">
              {(data.topProducts || []).map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 last:border-0">
                  <span className="font-medium text-sm w-3/5 truncate" title={p.name}>{i+1}. {p.name}</span>
                  <span className="text-xs text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-2 py-1 rounded-lg shrink-0">{p.sold} terjual</span>
                </div>
              ))}
              {(!data.topProducts || data.topProducts.length === 0) && <div className="text-[var(--color-text-muted)] text-sm italic">Belum ada data di tanggal ini</div>}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm mt-6 mb-12">
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-[var(--color-surface-2)]/30 to-transparent">
            <div>
              <h3 className="font-bold text-lg">Daftar Transaksi</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Rekap invoice pada tanggal {selectedDate}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#1a1a1f] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">No. Transaksi</th>
                  <th className="px-6 py-4 font-semibold">Jam/Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold text-right">Pendapatan Kotor</th>
                  <th className="px-6 py-4 font-semibold text-right">Modal / HPP</th>
                  <th className="px-6 py-4 font-semibold text-right">Keuntungan Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]/50">
                {data.transactions?.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-[var(--color-text-muted)] italic">Tidak ada transaksi di tanggal ini</td></tr>
                ) : (
                  data.transactions?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[var(--color-surface-2)]/20 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="bg-[var(--color-surface-2)] px-2.5 py-1 rounded-md font-mono text-xs text-[var(--color-text)] border border-[var(--color-border)]">{t.id}</span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] text-xs">{t.date}</td>
                      <td className="px-6 py-4 font-medium">{t.customer}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-[var(--color-accent)] font-semibold">Rp {t.total?.toLocaleString("id-ID") || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-blue-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">Rp {t.capital?.toLocaleString("id-ID") || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2 text-green-500 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                          <span className="font-mono font-bold">Rp {t.profit?.toLocaleString("id-ID") || 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color = "text-white" }: { title: string, value: string | number, color?: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl hover:shadow-lg transition-all text-center">
      <p className="text-[var(--color-text-muted)] text-sm font-medium mb-1">{title}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}
