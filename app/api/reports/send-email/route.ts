import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === 'KASIR') {
      return NextResponse.json({ error: 'Terlarang: Hanya Owner/Admin' }, { status: 403 });
    }

    const storeId = session.user.storeId;
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
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      }),
      prisma.product.findMany({
        where: { storeId },
        include: { orderItems: { include: { order: true } } }
      })
    ]);

    const totalRevenue = dateOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = dateOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const totalCapital = totalRevenue - totalProfit;
    const transactionsCount = dateOrders.length;

    // Calculate product sales
    const productSales = productsData.map(p => {
      const soldItems = p.orderItems.filter(oi => 
        oi.order.status === OrderStatus.PAID && 
        oi.order.createdAt >= startOfDay && 
        oi.order.createdAt <= endOfDay
      );
      const sold = soldItems.reduce((sum, oi) => sum + oi.qty, 0);
      const revenue = soldItems.reduce((sum, oi) => sum + (oi.price * oi.qty), 0);
      return { name: p.name, sold, revenue };
    }).filter(p => p.sold > 0).sort((a, b) => b.sold - a.sold);

    const emailDateStr = new Date(startOfDay).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const smtpHost = process.env.SMTP_HOST;
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpEmail || !smtpPassword) {
      return NextResponse.json({ error: 'Sistem email belum dikonfigurasi di Server (Vercel Environment Variables).' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 465,
      secure: true,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: `"Ngangkring Kobibi" <${smtpEmail}>`,
      to: 'ricoalexander676@gmail.com', // destination email
      subject: `E-Statement Penjualan - ${emailDateStr}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; background-color: #fcfcfc;">
          <div style="background-color: #f59e0b; color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Laporan Penjualan Harian</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Ngangkring Kobibi - Spesial Sate Satean</p>
          </div>
          
          <div style="padding: 24px;">
            <p style="color: #444; font-size: 15px;">Halo Owner,</p>
            <p style="color: #444; font-size: 15px;">Berikut adalah rangkuman performa bisnis Anda pada <strong>${emailDateStr}</strong>:</p>
            
            <div style="background-color: #fff; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-top: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #111; border-bottom: 2px solid #f59e0b; display: inline-block; padding-bottom: 4px;">Ringkasan Keuangan</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f6f6f6; color: #666;">Total Transaksi</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f6f6f6; text-align: right; font-weight: bold; color: #111;">${transactionsCount} Trx</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f6f6f6; color: #666;">Omzet (Kotor)</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f6f6f6; text-align: right; font-weight: bold; color: #f59e0b; font-size: 16px;">Rp ${totalRevenue.toLocaleString("id-ID")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f6f6f6; color: #666;">Modal (HPP)</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f6f6f6; text-align: right; font-weight: bold; color: #3b82f6;">Rp ${totalCapital.toLocaleString("id-ID")}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; color: #111; font-weight: bold; font-size: 16px;">Laba Bersih</td>
                  <td style="padding: 12px 0 0; text-align: right; font-weight: 800; color: #22c55e; font-size: 20px;">Rp ${totalProfit.toLocaleString("id-ID")}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fff; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-top: 24px;">
              <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #111; border-bottom: 2px solid #22c55e; display: inline-block; padding-bottom: 4px;">Detail Produk Terjual</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="text-align: left;">
                    <th style="padding: 10px; border-bottom: 2px solid #eee; font-size: 12px; color: #888; text-transform: uppercase;">Nama Produk</th>
                    <th style="padding: 10px; border-bottom: 2px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; text-align: center;">Qty</th>
                    <th style="padding: 10px; border-bottom: 2px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productSales.map(p => `
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #f9f9f9; font-size: 14px; color: #111;">${p.name}</td>
                      <td style="padding: 10px; border-bottom: 1px solid #f9f9f9; font-size: 14px; text-align: center; color: #111;">${p.sold}</td>
                      <td style="padding: 10px; border-bottom: 1px solid #f9f9f9; font-size: 14px; text-align: right; font-weight: bold; color: #111;">Rp ${p.revenue.toLocaleString("id-ID")}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center; line-height: 1.5;">
              Laporan ini dibuat otomatis oleh Sistem POS Ngangkring Kobibi.<br>
              Mohon tidak membalas email ini.
            </p>
          </div>
          
          <div style="background-color: #111; color: #666; padding: 15px; text-align: center; font-size: 11px;">
            &copy; 2026 Ngangkring Kobibi POS. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengirim email' }, { status: 500 });
  }
}
