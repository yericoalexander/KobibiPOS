"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports/summary')
      .then(r => r.json())
      .then(setData)
      .catch(() => toast.error("Gagal mengambil laporan"));
  }, []);

  if (!data) return <div className="p-10 text-[var(--color-text-muted)] animate-pulse">Memuat laporan...</div>;
  if (data.error) return <div className="p-10 text-red-500 font-bold bg-red-500/10 border border-red-500 rounded-xl m-6">Error: {data.error}</div>;

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Laporan & Analitik</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Ringkasan performa bisnis Anda</p>
          </div>
          <button className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 rounded-xl text-sm font-semibold hover:border-white/20 transition-all">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Pendapatan" value={`Rp ${(data.summary?.totalRevenueToday || 0).toLocaleString("id-ID")}`} color="text-[var(--color-accent)]" />
          <StatCard title="Keuntungan" value={`Rp ${(data.summary?.totalProfitToday || 0).toLocaleString("id-ID")}`} color="text-green-500" />
          <StatCard title="Transaksi" value={data.summary?.transactionsTodayCount || 0} />
          <StatCard title="Avg. Trans." value={`Rp ${Math.round(data.summary?.avgValue || 0).toLocaleString("id-ID")}`} />
          <StatCard title="Bon Tertunda" value={data.summary?.unpaidCount || 0} color="text-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-bold mb-6">Tren Pendapatan</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e36" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `Rp${v/1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1f', borderColor: '#2e2e36', borderRadius: '12px' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    formatter={(value: any, name: any) => [`Rp ${value.toLocaleString("id-ID")}`, name === 'revenue' ? "Pendapatan" : "Keuntungan"]}
                  />
                  <Line type="monotone" name="revenue" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" name="profit" dataKey="profit" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-bold mb-4">Produk Terlaris</h3>
            <div className="space-y-4">
              {(data.topProducts || []).map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 last:border-0">
                  <span className="font-medium text-sm">{i+1}. {p.name}</span>
                  <span className="text-xs text-[var(--color-accent)] font-bold bg-amber-500/10 px-2 py-1 rounded-lg">{p.sold} terjual</span>
                </div>
              ))}
              {(!data.topProducts || data.topProducts.length === 0) && <div className="text-[var(--color-text-muted)] text-sm italic">Belum ada data</div>}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-lg mt-6">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h3 className="font-bold">Daftar Transaksi Selesai</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-surface-2)]/50 text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-medium">No. Transaksi</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Pelanggan</th>
                  <th className="px-6 py-4 font-medium text-right">Total Pemsukan</th>
                  <th className="px-6 py-4 font-medium text-right">Keuntungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.transactions?.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)] italic">Belum ada transaksi selesai</td></tr>
                ) : (
                  data.transactions?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                      <td className="px-6 py-4 font-bold">{t.id}</td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{t.date}</td>
                      <td className="px-6 py-4">{t.customer}</td>
                      <td className="px-6 py-4 font-mono font-medium text-[var(--color-accent)] text-right">Rp {t.total.toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 font-mono font-medium text-green-500 text-right">Rp {t.profit?.toLocaleString("id-ID") || 0}</td>
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
