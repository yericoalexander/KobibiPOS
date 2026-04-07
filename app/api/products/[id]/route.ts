import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === 'KASIR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id: id, storeId: session.user.storeId },
      data: {
        name: body.name,
        price: body.price !== undefined ? Number(body.price) : undefined,
        costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        emoji: body.emoji,
        active: body.active,
        categoryId: body.categoryId,
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === 'KASIR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id: id, storeId: session.user.storeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
