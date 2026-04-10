import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active') === 'true';

    const products = await prisma.product.findMany({
      where: { 
        storeId: session.user.storeId,
        ...(onlyActive ? { active: true } : {})
      },
      include: { category: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === 'KASIR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: Number(body.price),
        costPrice: body.costPrice ? Number(body.costPrice) : 0,
        stock: body.stock ? Number(body.stock) : 0,
        emoji: body.emoji || '🍽️',
        categoryId: body.categoryId || null,
        storeId: session.user.storeId
      }
    });

    return NextResponse.json(product);
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

    await prisma.product.updateMany({
      where: { storeId: session.user.storeId },
      data: {
        stock: { increment: 10 }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
