// SEED DEMO - File ini berisi data sample untuk testing/demo
// Jika ingin menggunakan data demo, rename file ini jadi seed.ts

import { PrismaClient, OrderStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // 1. Create Store
  const store = await prisma.store.create({
    data: {
      name: 'NGANGKRING KOBIBI',
      address: 'Jl. A. Yani Gg. III, Pesayangan, Kedungwuluh, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53131',
      phone: '087878783166',
    },
  });

  // 2. Create Users
  const owner = await prisma.user.create({
    data: {
      name: 'Owner Kobibi',
      email: 'owner@test.com',
      password: hashedPassword,
      role: Role.OWNER,
      storeId: store.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Kobibi',
      email: 'admin@test.com',
      password: hashedPassword,
      role: Role.ADMIN,
      storeId: store.id,
    },
  });

  const kasir = await prisma.user.create({
    data: {
      name: 'Kasir Kobibi',
      email: 'kasir@test.com',
      password: hashedPassword,
      role: Role.KASIR,
      storeId: store.id,
    },
  });

  // 3. Create Categories
  const catMakanan = await prisma.category.create({ data: { name: 'Makanan', storeId: store.id } });
  const catMinuman = await prisma.category.create({ data: { name: 'Minuman', storeId: store.id } });
  const catSnack = await prisma.category.create({ data: { name: 'Snack', storeId: store.id } });

  // 4. Create Products
  const products = [
    { name: 'Nasi Goreng', price: 20000, emoji: '🍛', categoryId: catMakanan.id, storeId: store.id, stock: 100, costPrice: 12000 },
    { name: 'Mie Ayam', price: 18000, emoji: '🍜', categoryId: catMakanan.id, storeId: store.id, stock: 100, costPrice: 10000 },
    { name: 'Soto Ayam', price: 15000, emoji: '🍲', categoryId: catMakanan.id, storeId: store.id, stock: 100, costPrice: 9000 },
    { name: 'Ayam Bakar', price: 25000, emoji: '🍗', categoryId: catMakanan.id, storeId: store.id, stock: 50, costPrice: 15000 },
    { name: 'Es Teh Manis', price: 5000, emoji: '🍹', categoryId: catMinuman.id, storeId: store.id, stock: 200, costPrice: 2000 },
    { name: 'Es Jeruk', price: 7000, emoji: '🍊', categoryId: catMinuman.id, storeId: store.id, stock: 150, costPrice: 3000 },
    { name: 'Kopi Hitam', price: 8000, emoji: '☕', categoryId: catMinuman.id, storeId: store.id, stock: 100, costPrice: 3000 },
    { name: 'Kopi Susu', price: 12000, emoji: '☕', categoryId: catMinuman.id, storeId: store.id, stock: 100, costPrice: 5000 },
    { name: 'Jus Alpukat', price: 15000, emoji: '🥑', categoryId: catMinuman.id, storeId: store.id, stock: 80, costPrice: 8000 },
    { name: 'Pisang Goreng', price: 8000, emoji: '🍌', categoryId: catSnack.id, storeId: store.id, stock: 150, costPrice: 4000 },
    { name: 'Kentang Goreng', price: 10000, emoji: '🍟', categoryId: catSnack.id, storeId: store.id, stock: 120, costPrice: 5000 },
    { name: 'Bakwan', price: 3000, emoji: '🍘', categoryId: catSnack.id, storeId: store.id, stock: 200, costPrice: 1500 },
  ];

  for (const prod of products) {
    await prisma.product.create({ data: prod });
  }

  // Get products back to link into orders
  const allProducts = await prisma.product.findMany();
  const nasiGoreng = allProducts.find(p => p.name === 'Nasi Goreng');
  const esTeh = allProducts.find(p => p.name === 'Es Teh Manis');

  // 5. Sample orders
  if (nasiGoreng && esTeh) {
    const d = new Date();
    const orderNumberPrefix = `ORD-${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;

    const subtotal = nasiGoreng.price + esTeh.price;
    const total = subtotal;
    const totalProfit = (nasiGoreng.price - nasiGoreng.costPrice) + (esTeh.price - esTeh.costPrice);

    // PAID Order
    await prisma.order.create({
      data: {
        orderNumber: `${orderNumberPrefix}-001`,
        status: OrderStatus.PAID,
        customerName: 'Siti',
        tableNumber: '3',
        subtotal,
        total,
        totalProfit,
        paymentMethod: 'CASH',
        amountPaid: 30000,
        change: 30000 - total,
        paidAt: new Date(),
        storeId: store.id,
        cashierId: kasir.id,
        items: {
          create: [
            { 
              productId: nasiGoreng.id, 
              name: nasiGoreng.name, 
              qty: 1, 
              price: nasiGoreng.price, 
              costPrice: nasiGoreng.costPrice,
              subtotal: nasiGoreng.price,
              profit: nasiGoreng.price - nasiGoreng.costPrice
            },
            { 
              productId: esTeh.id, 
              name: esTeh.name, 
              qty: 1, 
              price: esTeh.price, 
              costPrice: esTeh.costPrice,
              subtotal: esTeh.price,
              profit: esTeh.price - esTeh.costPrice
            },
          ]
        }
      }
    });
  }

  console.log('✓ Seed demo data created successfully');
  console.log('');
  console.log('Login credentials:');
  console.log('- Owner: owner@test.com / password123');
  console.log('- Admin: admin@test.com / password123');
  console.log('- Kasir: kasir@test.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
