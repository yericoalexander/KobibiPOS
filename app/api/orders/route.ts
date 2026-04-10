import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const dateStr = searchParams.get('date');

    const where: any = { storeId: session.user.storeId };
    if (status) where.status = status;
    
    if (dateStr) {
      const date = new Date(dateStr);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      where.createdAt = {
        gte: start,
        lte: end
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        cashier: { select: { name: true } },
        items: true // added items for detailed view if needed
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    // Generate order number
    const d = new Date();
    const prefix = `ORD-${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
    const count = await prisma.order.count({
      where: {
        storeId: session.user.storeId,
        createdAt: { gte: new Date(d.setHours(0,0,0,0)) }
      }
    });
    const orderNumber = `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    const productIds = body.items?.map((i: any) => i.id) || [];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    let totalProfit = 0;
    const itemsData = body.items?.map((item: any) => {
      const dbProduct = productMap[item.id];
      const costPrice = dbProduct ? dbProduct.costPrice : 0;
      const profit = (item.price - costPrice) * item.qty;
      totalProfit += profit;

      return {
        productId: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        costPrice: costPrice,
        subtotal: item.subtotal,
        profit: profit,
        note: item.note
      };
    }) || [];

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.DRAFT,
        storeId: session.user.storeId,
        cashierId: session.user.id,
        subtotal: body.subtotal || 0,
        total: body.total || 0,
        totalProfit: totalProfit,
        customerName: body.customerName,
        tableNumber: body.tableNumber,
        items: {
          create: itemsData
        }
      },
      include: { items: true }
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
