const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up production database...');

  // Check if already setup
  const existingStore = await prisma.store.findFirst();
  if (existingStore) {
    console.log('✅ Database already setup!');
    return;
  }

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Create Store
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

  // Create default category
  const category = await prisma.category.create({
    data: {
      name: 'Umum',
      storeId: store.id,
    },
  });

  console.log('✓ Default category created:', category.name);

  // Create Owner User
  const owner = await prisma.user.create({
    data: {
      name: 'Owner',
      email: 'owner@test.com',
      password: hashedPassword,
      role: 'OWNER',
      storeId: store.id,
      active: true,
    },
  });

  console.log('✓ Owner user created:', owner.email);
  console.log('');
  console.log('🎉 Database setup complete!');
  console.log('Login: owner@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
