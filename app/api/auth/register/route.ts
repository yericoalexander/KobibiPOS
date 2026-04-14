import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Find the main store
    let store = await prisma.store.findFirst();
    
    if (!store) {
      // Create a default store if absolutely none exists
      store = await prisma.store.create({
        data: {
          name: 'NGANGKRING KOBIBI',
          address: 'Jl. A. Yani Gg. III, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53131',
          phone: '087878783166',
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        storeId: store.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    });
  } catch (error: any) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json({ error: 'Gagal melakukan registrasi' }, { status: 500 });
  }
}

