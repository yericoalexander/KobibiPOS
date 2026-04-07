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
    
    // Get start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayOrders, unpaidCount, productsData, allOrders] = await Promise.all([
      prisma.order.findMany({
        where: { storeId, status: OrderStatus.PAID, createdAt: { gte: startOfDay } },
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

    const totalRevenueToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProfitToday = todayOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const transactionsTodayCount = todayOrders.length;
    const avgValue = transactionsTodayCount > 0 ? totalRevenueToday / transactionsTodayCount : 0;

    // Top products
    const productStats = productsData.map(p => {
      const sold = p.orderItems.filter(oi => oi.order.status === 'PAID').reduce((sum, oi) => sum + oi.qty, 0);
      return { name: p.name, sold };
    }).sort((a, b) => b.sold - a.sold).slice(0, 5);

    return NextResponse.json({
      summary: {
        totalRevenueToday,
        totalProfitToday,
        transactionsTodayCount,
        avgValue,
        unpaidCount
      },
      topProducts: productStats,
      chartData: allOrders.map(o => ({
        date: o.createdAt.toLocaleDateString(),
        revenue: o.total,
        profit: o.totalProfit
      })),
      transactions: allOrders.map(o => ({
        id: o.orderNumber,
        date: o.createdAt.toLocaleString('id-ID'),
        customer: o.customerName || 'Guest',
        total: o.total,
        profit: o.totalProfit
      })).reverse()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
