# 🗄️ Database Setup - Kobibi POS

## 📋 Struktur Database

Database sudah dikonfigurasi dengan **data minimal** untuk production:

```
Database Setelah Seed:
├─ Store (1 record)
│  └─ Toko Saya (bisa diubah via Settings)
│
└─ User (1 record)
   └─ Owner (owner@test.com)

Kosong (Anda isi sendiri):
├─ Categories (0 records)
├─ Products (0 records)
├─ Orders (0 records)
└─ Additional Users (0 records)
```

---

## 🚀 Setup Database

### 1. Push Schema ke Database

```bash
npx prisma db push
```

Output:
```
✔ Your database is now in sync with your Prisma schema.
```

### 2. Seed Data Minimal

```bash
npx prisma db seed
```

Output:
```
✓ Store created: Toko Saya
✓ Owner user created: owner@test.com

═══════════════════════════════════════════════════════
  DATABASE SIAP DIGUNAKAN!
═══════════════════════════════════════════════════════

  Login credentials:
  Email    : owner@test.com
  Password : password123

  PENTING:
  1. Login dengan credentials di atas
  2. Ganti password di menu Settings
  3. Update info toko di menu Settings
  4. Tambahkan kategori di menu Categories
  5. Tambahkan produk di menu Products
  6. Buat user kasir/admin di menu Users

═══════════════════════════════════════════════════════
```

---

## 🔐 Login Pertama Kali

Setelah deploy, login dengan:

```
Email    : owner@test.com
Password : password123
```

**PENTING:** Segera ganti password setelah login pertama!

---

## 📝 Langkah Setup Setelah Login

### 1. Update Info Toko

1. Login sebagai Owner
2. Klik menu **"Settings"** (atau icon gear)
3. Update:
   - Nama Toko
   - Alamat
   - Nomor Telepon
   - Footer Struk (pesan terima kasih)
4. Klik **"Save"**

### 2. Ganti Password Owner

1. Di halaman Settings
2. Scroll ke bagian **"Change Password"**
3. Masukkan:
   - Current Password: `password123`
   - New Password: [Password baru yang kuat]
   - Confirm Password: [Ulangi password baru]
4. Klik **"Update Password"**

### 3. Tambah Kategori

1. Klik menu **"Categories"**
2. Klik tombol **"+ Add Category"**
3. Masukkan nama kategori (contoh: Makanan, Minuman, Snack)
4. Klik **"Save"**
5. Ulangi untuk kategori lainnya

### 4. Tambah Produk

1. Klik menu **"Products"**
2. Klik tombol **"+ Add Product"**
3. Isi form:
   - Nama Produk
   - Harga Jual
   - Harga Modal (HPP) - untuk laporan profit
   - Stok Awal
   - Kategori
   - Status (Active/Inactive)
4. Klik **"Save"**
5. Ulangi untuk produk lainnya

### 5. Buat User Kasir/Admin

1. Klik menu **"Users"** (hanya Owner yang bisa akses)
2. Klik tombol **"+ Add User"**
3. Isi form:
   - Nama
   - Email
   - Password
   - Role (KASIR atau ADMIN)
4. Klik **"Save"**
5. Berikan credentials ke kasir/admin Anda

---

## 🎯 Role & Permissions

### OWNER (Super Admin)
✅ Akses semua menu
✅ Lihat laporan & profit
✅ Kelola user (kasir & admin)
✅ Kelola produk & kategori
✅ Kelola settings toko
✅ Kirim email laporan

### ADMIN
✅ Kelola produk & kategori
✅ Lihat riwayat order
✅ Akses kasir (POS)
✅ Kelola settings toko
❌ Tidak bisa kelola user
❌ Tidak bisa lihat profit detail

### KASIR
✅ Akses kasir (POS)
✅ Lihat riwayat order sendiri
❌ Tidak bisa kelola produk
❌ Tidak bisa kelola kategori
❌ Tidak bisa kelola user
❌ Tidak bisa lihat laporan

---

## 🔄 Reset Database (Jika Diperlukan)

Jika ingin reset database dan mulai dari awal:

### Cara 1: Via Prisma (Recommended)

```bash
# Reset database (hapus semua data)
npx prisma migrate reset

# Atau manual:
npx prisma db push --force-reset
npx prisma db seed
```

### Cara 2: Via Supabase Dashboard

1. Buka Supabase dashboard
2. Klik **"Table Editor"**
3. Pilih table yang ingin dihapus
4. Klik **"..."** → **"Truncate table"**
5. Ulangi untuk semua table
6. Jalankan seed lagi: `npx prisma db seed`

---

## 🧪 Testing dengan Data Demo (Opsional)

Jika ingin testing dengan data sample (produk, kategori, transaksi):

### 1. Backup Seed Production

```bash
mv prisma/seed.ts prisma/seed.production.ts
```

### 2. Gunakan Seed Demo

```bash
mv prisma/seed.demo.ts prisma/seed.ts
```

### 3. Seed dengan Data Demo

```bash
npx prisma db seed
```

Akan membuat:
- 3 users (owner, admin, kasir)
- 3 categories (Makanan, Minuman, Snack)
- 12 products
- 1 sample order

### 4. Kembalikan ke Production Seed

```bash
mv prisma/seed.ts prisma/seed.demo.ts
mv prisma/seed.production.ts prisma/seed.ts
```

---

## 📊 Database Schema

### Tables

```
Store
├─ id (String, PK)
├─ name (String)
├─ address (String?)
├─ phone (String?)
├─ currency (String, default: "IDR")
├─ receiptFooter (String)
└─ createdAt (DateTime)

User
├─ id (String, PK)
├─ email (String, unique)
├─ name (String)
├─ password (String, hashed)
├─ role (Enum: OWNER, ADMIN, KASIR)
├─ storeId (String, FK → Store)
├─ active (Boolean)
├─ createdAt (DateTime)
└─ updatedAt (DateTime)

Category
├─ id (String, PK)
├─ name (String)
├─ storeId (String, FK → Store)
└─ createdAt (DateTime)

Product
├─ id (String, PK)
├─ name (String)
├─ price (Float)
├─ emoji (String?)
├─ storeId (String, FK → Store)
├─ categoryId (String?, FK → Category)
├─ active (Boolean)
├─ stock (Int)
├─ costPrice (Float)
└─ createdAt (DateTime)

Order
├─ id (String, PK)
├─ orderNumber (String, unique)
├─ status (Enum: DRAFT, UNPAID, PAID, VOID)
├─ storeId (String, FK → Store)
├─ cashierId (String, FK → User)
├─ subtotal (Float)
├─ total (Float)
├─ totalProfit (Float)
├─ amountPaid (Float?)
├─ change (Float?)
├─ paymentMethod (String?)
├─ customerName (String?)
├─ tableNumber (String?)
├─ paidAt (DateTime?)
├─ createdAt (DateTime)
└─ updatedAt (DateTime)

OrderItem
├─ id (String, PK)
├─ orderId (String, FK → Order)
├─ productId (String, FK → Product)
├─ name (String)
├─ price (Float)
├─ costPrice (Float)
├─ qty (Int)
├─ subtotal (Float)
├─ profit (Float)
└─ note (String?)
```

---

## 🔒 Security Best Practices

### 1. Ganti Password Default

```bash
# Jangan gunakan password123 di production!
# Ganti segera setelah login pertama
```

### 2. Gunakan Password Kuat

Minimal:
- 12 karakter
- Kombinasi huruf besar, kecil, angka, simbol
- Tidak mudah ditebak

### 3. Backup Database Berkala

Di Supabase dashboard:
1. Klik **"Database"** → **"Backups"**
2. Enable automatic backups
3. Download manual backup secara berkala

### 4. Monitor Database Activity

Di Supabase dashboard:
1. Klik **"Database"** → **"Logs"**
2. Monitor query yang mencurigakan
3. Check connection pool usage

---

## 📈 Database Maintenance

### Check Database Size

```sql
-- Di Supabase SQL Editor
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Optimize Database

```sql
-- Vacuum tables (cleanup)
VACUUM ANALYZE;

-- Reindex (improve query performance)
REINDEX DATABASE postgres;
```

### Archive Old Orders

Jika database mulai besar, archive order lama:

```sql
-- Backup orders older than 1 year
CREATE TABLE orders_archive AS 
SELECT * FROM "Order" 
WHERE "createdAt" < NOW() - INTERVAL '1 year';

-- Delete archived orders
DELETE FROM "Order" 
WHERE "createdAt" < NOW() - INTERVAL '1 year';
```

---

## ❓ FAQ

### Q: Bagaimana cara menambah field baru di database?

A: Edit `prisma/schema.prisma`, lalu:
```bash
npx prisma db push
```

### Q: Bagaimana cara backup database?

A: 
1. Via Supabase dashboard → Database → Backups
2. Atau export via SQL:
```bash
pg_dump DATABASE_URL > backup.sql
```

### Q: Bagaimana cara restore backup?

A:
```bash
psql DATABASE_URL < backup.sql
```

### Q: Database penuh, bagaimana?

A: Supabase free tier = 500 MB. Jika penuh:
1. Archive old orders
2. Delete unused data
3. Upgrade ke paid plan ($25/month untuk 8 GB)

---

## 🎉 Selesai!

Database Anda sekarang siap digunakan dengan data minimal. Anda bisa mulai menambahkan kategori, produk, dan user sesuai kebutuhan bisnis Anda.

Good luck! 🚀
