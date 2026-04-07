import { PrismaClient, OrderStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // 1. Create Store
  const store = await prisma.store.create({
    data: {
      name: 'Warung Kobibi',
      address: 'Jl. Contoh No 123, Jakarta',
      phone: '08123456789',
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
    { name: 'Nasi Goreng', price: 20000, emoji: '🍛', categoryId: catMakanan.id, storeId: store.id },
    { name: 'Mie Ayam', price: 18000, emoji: '🍜', categoryId: catMakanan.id, storeId: store.id },
    { name: 'Soto Ayam', price: 15000, emoji: '🍲', categoryId: catMakanan.id, storeId: store.id },
    { name: 'Ayam Bakar', price: 25000, emoji: '🍗', categoryId: catMakanan.id, storeId: store.id },
    { name: 'Es Teh Manis', price: 5000, emoji: '🍹', categoryId: catMinuman.id, storeId: store.id },
    { name: 'Es Jeruk', price: 7000, emoji: '🍊', categoryId: catMinuman.id, storeId: store.id },
    { name: 'Kopi Hitam', price: 8000, emoji: '☕', categoryId: catMinuman.id, storeId: store.id },
    { name: 'Kopi Susu', price: 12000, emoji: '☕', categoryId: catMinuman.id, storeId: store.id },
    { name: 'Jus Alpukat', price: 15000, emoji: '🥑', categoryId: catMinuman.id, storeId: store.id },
    { name: 'Pisang Goreng', price: 8000, emoji: '🍌', categoryId: catSnack.id, storeId: store.id },
    { name: 'Kentang Goreng', price: 10000, emoji: '🍟', categoryId: catSnack.id, storeId: store.id },
    { name: 'Bakwan', price: 3000, emoji: '🍘', categoryId: catSnack.id, storeId: store.id },
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

    // DRAFT
    await prisma.order.create({
      data: {
        orderNumber: `${orderNumberPrefix}-001`,
        status: OrderStatus.DRAFT,
        customerName: 'Budi (Draft)',
        tableNumber: '1',
        subtotal,
        total,
        storeId: store.id,
        cashierId: kasir.id,
        items: {
          create: [
            { productId: nasiGoreng.id, name: nasiGoreng.name, qty: 1, price: nasiGoreng.price, subtotal: nasiGoreng.price },
            { productId: esTeh.id, name: esTeh.name, qty: 1, price: esTeh.price, subtotal: esTeh.price },
          ]
        }
      }
    });

    // UNPAID
    await prisma.order.create({
      data: {
        orderNumber: `${orderNumberPrefix}-002`,
        status: OrderStatus.UNPAID,
        customerName: 'Andi (Unpaid)',
        tableNumber: '2',
        subtotal,
        total,
        storeId: store.id,
        cashierId: kasir.id,
        items: {
          create: [
            { productId: nasiGoreng.id, name: nasiGoreng.name, qty: 1, price: nasiGoreng.price, subtotal: nasiGoreng.price },
            { productId: esTeh.id, name: esTeh.name, qty: 1, price: esTeh.price, subtotal: esTeh.price },
          ]
        }
      }
    });

    // PAID
    await prisma.order.create({
      data: {
        orderNumber: `${orderNumberPrefix}-003`,
        status: OrderStatus.PAID,
        customerName: 'Siti (Paid)',
        tableNumber: '3',
        subtotal,
        total,
        paymentMethod: 'CASH',
        amountPaid: 30000,
        change: 30000 - total,
        paidAt: new Date(),
        storeId: store.id,
        cashierId: kasir.id,
        items: {
          create: [
            { productId: nasiGoreng.id, name: nasiGoreng.name, qty: 1, price: nasiGoreng.price, subtotal: nasiGoreng.price },
            { productId: esTeh.id, name: esTeh.name, qty: 1, price: esTeh.price, subtotal: esTeh.price },
          ]
        }
      }
    });
  }

  console.log('Seed dummy data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
