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

    const dateOrders = await prisma.order.findMany({
      where: { storeId, status: OrderStatus.PAID, createdAt: { gte: startOfDay, lte: endOfDay } },
      orderBy: { createdAt: 'desc' }
    });

    const totalRevenue = dateOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = dateOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const totalCapital = totalRevenue - totalProfit;
    const transactionsCount = dateOrders.length;

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
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Laporan Penjualan Harian</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Ngangkring Kobibi</p>
          </div>
          <div style="padding: 20px;">
            <p>Halo Owner,</p>
            <p>Berikut adalah ringkasan penjualan pada <strong>${emailDateStr}</strong>:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Transaksi Sukses</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${transactionsCount} Trx</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Pendapatan Kotor (Omzet)</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #f59e0b; font-weight: bold;">Rp ${totalRevenue.toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Modal (HPP)</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #3b82f6;">Rp ${totalCapital.toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Pendapatan Bersih (Untung)</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #22c55e; font-weight: bold; font-size: 16px;">Rp ${totalProfit.toLocaleString("id-ID")}</td>
              </tr>
            </table>
            
            <p style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
              Laporan ini dibuat otomatis oleh Sistem POS Ngangkring Kobibi.
            </p>
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
