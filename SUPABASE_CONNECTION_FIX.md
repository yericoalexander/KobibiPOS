# Fix Supabase Connection untuk Vercel

## Masalah
Prisma Client tidak bisa connect ke Supabase karena format DATABASE_URL salah.

## Solusi

### 1. Dapatkan Connection String yang Benar dari Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project "ngangkring-kobibi"
3. Klik "Project Settings" (icon ⚙️ di kiri bawah)
4. Klik "Database" di sidebar
5. Scroll ke "Connection string"
6. Pilih tab **"Session mode"** (BUKAN Transaction mode)
7. Copy connection string yang muncul

### 2. Format Connection String

Connection string dari Supabase akan seperti ini:
```
postgresql://postgres.cqpuxrsgrymrobreaeyy:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Ganti `[YOUR-PASSWORD]` dengan password yang sudah di-encode: `Yerico4511%40%3F`

Jadi hasilnya:
```
postgresql://postgres.cqpuxrsgrymrobreaeyy:Yerico4511%40%3F@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING**: Untuk Prisma dengan pgbouncer, tambahkan parameter:
```
postgresql://postgres.cqpuxrsgrymrobreaeyy:Yerico4511%40%3F@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

### 3. Update Environment Variables di Vercel

**DATABASE_URL** (untuk Prisma Client - Session mode):
```
postgresql://postgres.cqpuxrsgrymrobreaeyy:Yerico4511%40%3F@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

**DIRECT_URL** (untuk Prisma Migrations - Direct connection):
```
postgresql://postgres:Yerico4511%40%3F@db.cqpuxrsgrymrobreaeyy.supabase.co:5432/postgres
```

### 4. Cara Update di Vercel

1. Buka https://vercel.com/dashboard
2. Pilih project "kobibi-pos"
3. Klik tab "Settings"
4. Klik "Environment Variables"
5. Klik icon pensil di sebelah DATABASE_URL
6. Paste value baru
7. Klik "Save"
8. Ulangi untuk DIRECT_URL (jika belum ada, klik "Add New")
9. Pilih environment: Production, Preview, Development (semua)
10. Klik "Save"

### 5. Redeploy

Setelah update environment variables:
1. Klik tab "Deployments"
2. Klik titik tiga (...) di deployment teratas
3. Klik "Redeploy"
4. Tunggu sampai status "Ready"

### 6. Test Login

Setelah deployment selesai, coba login:
- URL: https://kobibi-pos.vercel.app
- Email: owner@test.com
- Password: password123

## Troubleshooting

Jika masih error, cek:
1. Password di Supabase benar: `Yerico4511@?`
2. Password di URL sudah di-encode: `Yerico4511%40%3F`
3. User sudah ada di database (jalankan SQL di supabase-setup.sql)
4. Port untuk pooler: 5432 (Session mode) atau 6543 (Transaction mode)
5. Format URL: `postgres.xxx` bukan `postgres:xxx`
