import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password untuk user owner
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // 1. Create Store (Data minimal - bisa diubah nanti via Settings)
  const store = await prisma.store.create({
    data: {
      name: 'NGANGKRING KOBIBI',
      address: 'Alamat Toko',
      phone: '087878783166',
      currency: 'IDR',
      receiptFooter: 'Terima Kasih!',
    },
  });

  console.log('✓ Store created:', store.name);

  // 2. Create default category
  const category = await prisma.category.create({
    data: {
      name: 'Umum',
      storeId: store.id,
    },
  });

  console.log('✓ Default category created:', category.name);

  // 3. Create Owner User
  const owner = await prisma.user.create({
    data: {
      name: 'Owner',
      email: 'owner@test.com',
      password: hashedPassword,
      role: Role.OWNER,
      storeId: store.id,
      active: true,
    },
  });

  // 4. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: Role.ADMIN,
      storeId: store.id,
      active: true,
    },
  });

  // 5. Create Kasir User
  const kasir = await prisma.user.create({
    data: {
      name: 'Kasir',
      email: 'kasir@test.com',
      password: hashedPassword,
      role: Role.KASIR,
      storeId: store.id,
      active: true,
    },
  });

  console.log('✓ Users created: Owner, Admin, Kasir');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DATABASE SIAP DIGUNAKAN!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('  Login credentials:');
  console.log('  Email (Owner) : owner@test.com');
  console.log('  Email (Admin) : admin@test.com');
  console.log('  Email (Kasir) : kasir@test.com');
  console.log('  Password      : password123');
  console.log('');
  console.log('  PENTING:');
  console.log('  1. Login dengan credentials di atas');
  console.log('  2. Ganti password di menu Settings');
  console.log('  3. Update info toko di menu Settings');
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
