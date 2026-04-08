import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === 'KASIR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const storeId = session.user.storeId;
    
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');

    // Get start and end of selected date explicitly handling local time zones
    const startOfDay = new Date();
    if (dateParam) {
      const [year, month, day] = dateParam.split('-');
      startOfDay.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const [dateOrders, unpaidCount, productsData, allOrders] = await Promise.all([
      prisma.order.findMany({
        where: { storeId, status: OrderStatus.PAID, createdAt: { gte: startOfDay, lte: endOfDay } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({
        where: { storeId, status: OrderStatus.UNPAID },
      }),
      prisma.product.findMany({
        where: { storeId }, include: { orderItems: { include: { order: true }} }
      }),
      prisma.order.findMany({
        where: { storeId, status: OrderStatus.PAID },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const totalRevenue = dateOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = dateOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const totalCapital = totalRevenue - totalProfit;
    const transactionsCount = dateOrders.length;
    const avgValue = transactionsCount > 0 ? totalRevenue / transactionsCount : 0;

    // Top products for that date
    const productStats = productsData.map(p => {
      const sold = p.orderItems.filter(oi => oi.order.status === 'PAID' && oi.order.createdAt >= startOfDay && oi.order.createdAt <= endOfDay).reduce((sum, oi) => sum + oi.qty, 0);
      return { name: p.name, sold };
    }).filter(p => p.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 5);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalProfit,
        totalCapital,
        transactionsCount,
        avgValue,
        unpaidCount
      },
      topProducts: productStats,
      chartData: allOrders.map(o => ({
        date: o.createdAt.toLocaleDateString(),
        revenue: o.total,
        profit: o.totalProfit
      })),
      transactions: dateOrders.map(o => ({
        id: o.orderNumber,
        date: o.createdAt.toLocaleString('id-ID'),
        customer: o.customerName || 'Guest',
        total: o.total,
        profit: o.totalProfit,
        capital: o.total - o.totalProfit
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
