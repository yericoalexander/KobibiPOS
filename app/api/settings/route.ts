import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const store = await prisma.store.findUnique({
      where: { id: session.user.storeId }
    });
    
    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === 'KASIR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    
    const store = await prisma.store.update({
      where: { id: session.user.storeId },
      data: {
        name: body.name,
        address: body.address,
        phone: body.phone,
        currency: body.currency,
        receiptFooter: body.receiptFooter,
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
