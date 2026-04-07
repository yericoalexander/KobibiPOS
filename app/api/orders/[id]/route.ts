import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: id, storeId: session.user.storeId },
      include: { items: true, cashier: { select: { name: true } } }
    });
    
    if (!order) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const action = body.action;

    let updateData: any = {};
    
    const existingOrder = await prisma.order.findUnique({ where: { id: id, storeId: session.user.storeId }});
    if (!existingOrder) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    switch (action) {
      case 'SUBMIT':
        if (existingOrder.status !== 'DRAFT') throw new Error("Can only submit DRAFT");
        updateData.status = OrderStatus.UNPAID;
        break;
      case 'PAY':
        if (existingOrder.status !== 'DRAFT' && existingOrder.status !== 'UNPAID') throw new Error("Invalid status for PAY");
        updateData.status = OrderStatus.PAID;
        updateData.paidAt = new Date();
        updateData.paymentMethod = body.paymentMethod;
        updateData.amountPaid = Number(body.amountPaid);
        updateData.change = updateData.amountPaid - existingOrder.total;
        
        // Stock Deduction
        const orderItems = await prisma.orderItem.findMany({ where: { orderId: id } });
        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } }
          });
        }
        break;
      case 'EDIT':
        if (existingOrder.status !== 'UNPAID') throw new Error("Can only edit UNPAID");
        updateData.status = OrderStatus.DRAFT;
        break;
      case 'VOID':
        updateData.status = OrderStatus.VOID;
        break;
      case 'UPDATE_ITEMS':
        if (existingOrder.status !== 'DRAFT' && existingOrder.status !== 'UNPAID') throw new Error("Read-only order");
        
        const productIds = body.items?.map((i: any) => i.id) || [];
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
        const productMap = Object.fromEntries(products.map(p => [p.id, p]));
        
        let totalProfitUpdate = 0;
        const mappedItems = body.items?.map((item: any) => {
          const dbProduct = productMap[item.id];
          const costPrice = dbProduct ? dbProduct.costPrice : 0;
          const profit = (item.price - costPrice) * item.qty;
          totalProfitUpdate += profit;
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

        // We delete old items and recreate
        await prisma.orderItem.deleteMany({ where: { orderId: id } });
        updateData.items = { create: mappedItems };
        updateData.subtotal = body.items?.reduce((sum: number, item: any) => sum + item.subtotal, 0) || 0;
        updateData.total = updateData.subtotal;
        updateData.totalProfit = totalProfitUpdate;
        updateData.customerName = body.customerName;
        updateData.tableNumber = body.tableNumber;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: updateData,
      include: { items: true }
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    // DELETE replaces status with VOID based on requirements
    await prisma.order.update({
      where: { id: id, storeId: session.user.storeId },
      data: { status: OrderStatus.VOID }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
