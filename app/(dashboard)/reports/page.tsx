"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail, TrendingUp, DollarSign, ShoppingCart, FileDown, FileText } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSending, setIsSending] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/reports/summary?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Gagal mengambil laporan");
        setIsLoading(false);
      });
  }, [selectedDate]);

  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const dateFormatted = new Date(selectedDate).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("NGANGKRING KOBIBI", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("E-Statement Penjualan Harian", 105, 28, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Tanggal: ${dateFormatted}`, 105, 34, { align: "center" });

    // Financial Summary Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Ringkasan Keuangan", 14, 45);
    
    autoTable(doc, {
      startY: 48,
      head: [['Keterangan', 'Nilai']],
      body: [
        ['Total Transaksi', `${data.summary.transactionsCount} Trx`],
        ['Total Omzet (Kotor)', `Rp ${data.summary.totalRevenue.toLocaleString("id-ID")}`],
        ['Total Modal (HPP)', `Rp ${data.summary.totalCapital.toLocaleString("id-ID")}`],
        ['Total Untung Bersih', `Rp ${data.summary.totalProfit.toLocaleString("id-ID")}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }, // Blue-600
    });

    // Product Sales Table
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Detail Penjualan Produk", 14, finalY);
    
    autoTable(doc, {
      startY: finalY + 3,
      head: [['Nama Produk', 'Terjual', 'Total Omzet']],
      body: data.productSales.map((p: any) => [
        p.name, 
        p.sold, 
        `Rp ${p.revenue.toLocaleString("id-ID")}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] }, // Green-500
    });

    doc.save(`Laporan_Kobibi_${selectedDate}.pdf`);
    toast.success("PDF berhasil diunduh");
  };

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

  // No more full-screen spinner. We show the shell and use skeletons.

  if (data?.error) return (
    <div className="p-6">
      <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
        <p className="text-red-500 font-bold">Error: {data.error}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20 md:pb-6">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 md:p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-[var(--color-accent)] to-yellow-300 bg-clip-text text-transparent">
                Laporan Statistik
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Ringkasan performa bisnis Anda berdasarkan tanggal</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all"
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportPDF}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--color-surface-2)] text-[var(--color-text)] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-border)] transition-all border border-[var(--color-border)] disabled:opacity-50"
                  title="Unduh PDF"
                  disabled={isLoading || !data}
                >
                  <FileText size={16} className="text-red-500" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={handleSendEmail}
                  disabled={isSending || isLoading || !data}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Mail size={16} />
                  )}
                  <span className="hidden lg:inline">Tutup Kasir & Kirim</span>
                  <span className="lg:hidden">Kirim</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard 
            title="Pendapatan Kotor" 
            subtitle="Omzet"
            value={isLoading ? 0 : (data?.summary?.totalRevenue || 0)} 
            icon={<DollarSign size={20} />}
            color="amber"
            isLoading={isLoading}
            isCurrency
          />
          <StatCard 
            title="Pendapatan Bersih" 
            subtitle="Untung"
            value={isLoading ? 0 : (data?.summary?.totalProfit || 0)} 
            icon={<TrendingUp size={20} />}
            color="green"
            isLoading={isLoading}
            isCurrency
          />
          <StatCard 
            title="Total Modal" 
            subtitle="HPP"
            value={isLoading ? 0 : (data?.summary?.totalCapital || 0)} 
            icon={<ShoppingCart size={20} />}
            color="blue"
            isLoading={isLoading}
            isCurrency
          />
          <StatCard 
            title="Transaksi Sukses" 
            subtitle="Total"
            value={isLoading ? 0 : (data?.summary?.transactionsCount || 0)} 
            icon={<ShoppingCart size={20} />}
            color="purple"
            isLoading={isLoading}
          />
        </div>

        {/* Chart & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Chart */}
          <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 md:p-6 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base md:text-lg">Tren Pendapatan</h3>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]"></div>
                  <span className="text-[var(--color-text-muted)]">Omzet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[var(--color-text-muted)]">Untung</span>
                </div>
              </div>
            </div>
            
            {isLoading ? (
               <div className="h-64 md:h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent"></div>
               </div>
            ) : data?.chartData && data.chartData.length > 0 ? (
              <div className="h-64 md:h-80 w-full -ml-4 md:-ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} 
                      tickLine={false} 
                      axisLine={false}
                      width={45}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#e2e8f0', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                      formatter={(value: any, name: any) => [
                        `Rp ${Number(value).toLocaleString("id-ID")}`, 
                        name === 'revenue' ? "Omzet" : "Untung"
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      name="revenue" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#ffffff' }} 
                      activeDot={{ r: 6, strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      name="profit" 
                      dataKey="profit" 
                      stroke="#22c55e" 
                      strokeWidth={3} 
                      dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#ffffff' }} 
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 md:h-80 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
                  <TrendingUp size={32} className="text-[var(--color-text-muted)]" />
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-sm font-medium">Belum ada data grafik</p>
                  <p className="text-[var(--color-text-muted)] text-xs mt-1">Lakukan transaksi untuk melihat tren pendapatan</p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Product Sales */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 md:p-6 overflow-hidden flex flex-col h-[400px] lg:h-auto">
            <h3 className="font-bold text-lg mb-4 shrink-0">Penjualan Produk</h3>
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 bg-[var(--color-surface-2)] animate-pulse rounded-xl" />
                ))
              ) : (data?.productSales || []).map((p: any, i: number) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-3 bg-[var(--color-surface-2)]/40 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex items-center justify-center w-7 h-7 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg text-xs font-bold shrink-0">
                      {i+1}
                    </span>
                    <span className="font-medium text-sm truncate" title={p.name}>
                      {p.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-xs text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-lg mb-1">
                      {p.sold}x
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      Rp {p.revenue.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
              {!isLoading && (!data?.productSales || data.productSales.length === 0) && (
                <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                  Belum ada data di tanggal ini
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
            <h3 className="font-bold text-lg">Daftar Transaksi</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Rekap invoice pada tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Mobile View */}
          <div className="block md:hidden divide-y divide-[var(--color-border)]">
            {isLoading ? (
               [1,2,3].map(i => <div key={i} className="p-4 h-24 bg-white animate-pulse" />)
            ) : data?.transactions?.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)] text-sm italic">
                Tidak ada transaksi di tanggal ini
              </div>
            ) : (
              data?.transactions?.map((t: any) => (
                <div key={t.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="bg-[var(--color-bg)] text-[var(--color-text)] px-2 py-1 rounded-md font-mono text-[10px] border border-[var(--color-border)] inline-block font-bold">
                        {t.id}
                      </span>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-medium">{t.date}</p>
                      <p className="font-bold text-sm mt-1 text-[var(--color-text)]">{t.customer}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <p className="text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-bold">Omzet</p>
                      <p className="font-mono font-bold text-[var(--color-accent)]">
                        Rp {t.total?.toLocaleString("id-ID") || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <p className="text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-bold">Modal</p>
                      <p className="font-mono font-bold text-blue-500">
                        Rp {t.capital?.toLocaleString("id-ID") || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                      <p className="text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-bold">Untung</p>
                      <p className="font-mono font-bold text-green-600">
                        Rp {t.profit?.toLocaleString("id-ID") || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">No. Transaksi</th>
                  <th className="px-6 py-4 font-bold">Waktu</th>
                  <th className="px-6 py-4 font-bold">Pelanggan</th>
                  <th className="px-6 py-4 font-bold text-right">Omzet</th>
                  <th className="px-6 py-4 font-bold text-right">Modal</th>
                  <th className="px-6 py-4 font-bold text-right">Untung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4 h-12 bg-[var(--color-surface-2)]"></td>
                    </tr>
                  ))
                ) : data?.transactions?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[var(--color-text-muted)] italic">
                      Tidak ada transaksi di tanggal ini
                    </td>
                  </tr>
                ) : (
                  data?.transactions?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-white px-2.5 py-1 rounded-md font-mono text-xs border border-[var(--color-border)] font-bold text-[var(--color-text)]">
                          {t.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] text-[11px] font-medium">{t.date}</td>
                      <td className="px-6 py-4 font-semibold text-[var(--color-text)]">{t.customer}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-[var(--color-accent)] font-bold">
                          Rp {t.total?.toLocaleString("id-ID") || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-blue-600 font-semibold">
                          Rp {t.capital?.toLocaleString("id-ID") || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 font-mono font-bold">
                          Rp {t.profit?.toLocaleString("id-ID") || 0}
                        </span>
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
  );
}

function StatCard({ 
  title, 
  subtitle,
  value, 
  icon,
  color = "amber",
  isLoading = false,
  isCurrency = false
}: { 
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "amber" | "green" | "blue" | "purple";
  isLoading?: boolean;
  isCurrency?: boolean;
}) {
  const colorClasses = {
    amber: "text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl hover:shadow-lg hover:border-[var(--color-border)]/80 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[var(--color-text-muted)] text-xs font-medium mb-0.5">{title}</p>
          <p className="text-[var(--color-text-muted)] text-[10px]">({subtitle})</p>
        </div>
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 w-full bg-[var(--color-surface-2)] animate-pulse rounded-lg" />
      ) : (
        <p className={`text-xl md:text-2xl font-bold font-mono ${colorClasses[color].split(' ')[0]} truncate`}>
          {isCurrency ? `Rp ${Number(value).toLocaleString("id-ID")}` : value}
        </p>
      )}
    </div>
  );
}
