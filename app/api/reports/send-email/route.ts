import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    // Authentication: Check for cron secret OR user session
    const authHeader = req.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    let storeId: string | undefined;

    if (isCron) {
      // Find the first admin/owner to get the store context
      const owner = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        select: { storeId: true }
      });
      if (!owner) return NextResponse.json({ error: 'No owner found' }, { status: 400 });
      storeId = owner.storeId;
    } else {
      const session = await auth();
      if (!session?.user || session.user.role === 'KASIR') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      storeId = session.user.storeId;
    }

    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');

    const startOfDay = new Date();
    if (dateParam) {
      const [year, month, day] = dateParam.split('-');
      startOfDay.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const [dateOrders, productsData] = await Promise.all([
      prisma.order.findMany({
        where: { storeId, status: OrderStatus.PAID, createdAt: { gte: startOfDay, lte: endOfDay } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.findMany({
        where: { storeId }, include: { orderItems: { include: { order: true }} }
      })
    ]);

    const totalRevenue = dateOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = dateOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const totalCapital = totalRevenue - totalProfit;
    const transactionsCount = dateOrders.length;

    // Top products
    const productStats = productsData.map(p => {
      const sold = p.orderItems.filter(oi => oi.order.status === 'PAID' && oi.order.createdAt >= startOfDay && oi.order.createdAt <= endOfDay).reduce((sum, oi) => sum + oi.qty, 0);
      return { name: p.name, sold };
    }).filter(p => p.sold > 0).sort((a, b) => b.sold - a.sold);

    // Format HTML Email
    const targetDateStr = startOfDay.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #1a1a1f; color: #f59e0b; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #fff; }
        .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.8; color: #a1a1aa; }
        .content { padding: 30px 20px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
        .summary-card.profit { background-color: #f0fdf4; border-color: #bbf7d0; }
        .summary-card p { margin: 0 0 5px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .summary-card h3 { margin: 0; font-size: 18px; color: #0f172a; }
        .summary-card.profit h3 { color: #166534; }
        h2 { font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px; }
        .product-list { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .product-list th { text-align: left; padding: 10px; background-color: #f1f5f9; font-size: 12px; color: #475569; }
        .product-list td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .transaction-list { width: 100%; border-collapse: collapse; font-size: 12px; }
        .transaction-list th { background-color: #1a1a1f; color: #a1a1aa; padding: 10px; text-align: left; }
        .transaction-list td { border-bottom: 1px solid #e2e8f0; padding: 10px; color: #334155; }
        .footer { background-color: #1a1a1f; padding: 20px; text-align: center; font-size: 12px; color: #a1a1aa; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Laporan Harian Kasir</h1>
          <p>E-Statement • ${targetDateStr}</p>
        </div>
        
        <div class="content">
          <div class="summary-grid">
            <div class="summary-card">
              <p>Pendapatan Kotor</p>
              <h3>Rp ${totalRevenue.toLocaleString("id-ID")}</h3>
            </div>
            <div class="summary-card profit">
              <p>Untung Bersih</p>
              <h3>Rp ${totalProfit.toLocaleString("id-ID")}</h3>
            </div>
            <div class="summary-card">
              <p>Modal (HPP)</p>
              <h3>Rp ${totalCapital.toLocaleString("id-ID")}</h3>
            </div>
            <div class="summary-card">
              <p>Total Transaksi</p>
              <h3>${transactionsCount} Trx</h3>
            </div>
          </div>

          <h2>Produk Terjual</h2>
          <table class="product-list">
            <tr><th>Nama Produk</th><th style="text-align:right">Terjual</th></tr>
            ${productStats.length === 0 ? '<tr><td colspan="2" style="text-align:center;color:#94a3b8">Tidak ada produk terjual</td></tr>' : ''}
            ${productStats.map(p => `<tr><td>${p.name}</td><td style="text-align:right"><b>${p.sold}</b></td></tr>`).join('')}
          </table>

          <h2>Daftar Transaksi</h2>
          <table class="transaction-list">
            <tr>
              <th>ID Validasi</th>
              <th>Waktu</th>
              <th style="text-align:right">Total</th>
              <th style="text-align:right">Untung</th>
            </tr>
            ${dateOrders.length === 0 ? '<tr><td colspan="4" style="text-align:center">Tidak ada transaksi</td></tr>' : ''}
            ${dateOrders.map(o => `
            <tr>
              <td><span style="font-family:monospace; background:#e2e8f0; padding:2px 4px; border-radius:4px">${o.orderNumber}</span></td>
              <td>${o.createdAt.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</td>
              <td style="text-align:right; font-family:monospace; font-weight:bold; color:#0f172a">Rp ${o.total.toLocaleString("id-ID")}</td>
              <td style="text-align:right; font-family:monospace; font-weight:bold; color:#16a34a">Rp ${o.totalProfit.toLocaleString("id-ID")}</td>
            </tr>`).join('')}
          </table>
        </div>

        <div class="footer">
          Dikirim secara otomatis oleh <b>Sistem POS Kobibi</b><br>
          Semoga hari esok lebih baik dari hari ini.
        </div>
      </div>
    </body>
    </html>
    `;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ error: 'Pengaturan Email SMTP belum di-configure pada server.' }, { status: 400 });
    }

    const mailOptions = {
      from: `"Kobibi POS" <${process.env.SMTP_EMAIL}>`,
      to: 'ricoalexander676@gmail.com', // As requested
      subject: `Laporan Penjualan Kobibi - ${targetDateStr}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Gagal mengirim email', details: error.message }, { status: 500 });
  }
}
