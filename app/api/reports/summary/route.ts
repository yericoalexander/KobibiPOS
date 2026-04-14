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

    // Get summary stats for the range
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [summary, unpaidCount, productSalesStats, chartDataRaw] = await Promise.all([
      prisma.order.aggregate({
        where: { storeId, status: OrderStatus.PAID, createdAt: { gte: startOfDay, lte: endOfDay } },
        _sum: { total: true, totalProfit: true },
        _count: { id: true },
        _avg: { total: true }
      }),
      prisma.order.count({
        where: { storeId, status: OrderStatus.UNPAID },
      }),
      // Top products sold for the selected day
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        where: {
          order: {
            storeId,
            status: OrderStatus.PAID,
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        },
        _sum: { qty: true, subtotal: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 20
      }),
      // Aggregated chart data for the last 30 days (Daily Stats)
      // Since standard Prisma groupBy doesn't support DATE(createdAt) without raw sql, 
      // we'll fetch only the essentials and aggregate in memory for 30 days which is small enough.
      prisma.order.findMany({
        where: { 
          storeId, 
          status: OrderStatus.PAID,
          createdAt: { gte: thirtyDaysAgo } 
        },
        select: { createdAt: true, total: true, totalProfit: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const totalRevenue = summary._sum.total || 0;
    const totalProfit = summary._sum.totalProfit || 0;
    const transactionsCount = summary._count.id || 0;
    const avgValue = summary._avg.total || 0;
    const totalCapital = totalRevenue - totalProfit;

    // Aggregate chart data by day in memory (more portable than raw SQL)
    const dailyStatsMap = new Map<string, { date: string, revenue: number, profit: number }>();
    chartDataRaw.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0];
      const existing = dailyStatsMap.get(day) || { date: day, revenue: 0, profit: 0 };
      existing.revenue += o.total;
      existing.profit += o.totalProfit;
      dailyStatsMap.set(day, existing);
    });
    const chartData = Array.from(dailyStatsMap.values());

    // Transform products
    const productSales = productSalesStats.map(stat => ({
      name: stat.name,
      sold: stat._sum.qty || 0,
      revenue: stat._sum.subtotal || 0
    }));

    const dateOrders = await prisma.order.findMany({
      where: { storeId, status: OrderStatus.PAID, createdAt: { gte: startOfDay, lte: endOfDay } },
      select: { id: true, orderNumber: true, createdAt: true, customerName: true, total: true, totalProfit: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      summary: { totalRevenue, totalProfit, totalCapital, transactionsCount, avgValue, unpaidCount },
      topProducts: productSales.slice(0, 5),
      productSales,
      chartData,
      transactions: dateOrders.map(o => ({
        id: o.orderNumber,
        dbId: o.id,
        date: o.createdAt.toLocaleString('id-ID'),
        customer: o.customerName || 'Guest',
        total: o.total,
        profit: o.totalProfit,
        capital: o.total - o.totalProfit
      }))
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
