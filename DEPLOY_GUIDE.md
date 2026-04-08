# Panduan Deploy NGANGKRING KOBIBI
## Supabase (Database) + Vercel (Frontend) dengan Auto-Deploy

---

## BAGIAN 1: Setup Supabase Database

### 1. Buat Akun Supabase
1. Buka https://supabase.com
2. Klik "Start your project"
3. Sign up dengan GitHub (RECOMMENDED untuk auto-deploy)
4. Verifikasi email

### 2. Buat Project Baru
1. Klik "New Project"
2. Isi data:
   - **Name**: `ngangkring-kobibi`
   - **Database Password**: Buat password kuat (SIMPAN INI!)
   - **Region**: Singapore (Southeast Asia)
3. Klik "Create new project"
4. Tunggu ~2 menit sampai project siap

### 3. Dapatkan Database URL

**CARA TERMUDAH:**
1. Di dashboard Supabase, klik tombol **"Connect"** (hijau) di kanan atas
2. Pilih **"App Frameworks"** atau **"ORMs"**
3. Pilih **"Prisma"**
4. Copy connection string yang muncul
5. Ganti `[YOUR-PASSWORD]` dengan password database Anda

**CARA ALTERNATIF:**
1. Klik **"Database"** di sidebar kiri (icon database)
2. Klik **"Connection String"** di tab atas
3. Pilih **"URI"** atau **"Connection String"**
4. Copy dan ganti password

**Format yang benar untuk Prisma:**
```
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**PENTING:** 
- Jangan gunakan connection pooling URL (yang ada `pooler.supabase.com`)
- Gunakan direct connection (yang ada `db.xxx.supabase.co:5432`)
- Ganti `[PASSWORD]` dengan password database Anda

---

## BAGIAN 2: Setup GitHub Repository

### 1. Buat Repository GitHub
```bash
# Di terminal, di folder project
git init
git add .
git commit -m "Initial commit - NGANGKRING KOBIBI POS"
```

### 2. Push ke GitHub
1. Buka https://github.com/new
2. Buat repository baru:
   - **Name**: `ngangkring-kobibi`
   - **Private** atau **Public** (terserah)
   - JANGAN centang "Initialize with README"
3. Klik "Create repository"

4. Di terminal, jalankan:
```bash
git remote add origin https://github.com/USERNAME/ngangkring-kobibi.git
git branch -M main
git push -u origin main
```

---

## BAGIAN 3: Deploy ke Vercel dengan Auto-Deploy

### 1. Buat Akun Vercel
1. Buka https://vercel.com
2. Klik "Sign Up"
3. **PENTING**: Sign up dengan GitHub yang sama
4. Authorize Vercel untuk akses GitHub

### 2. Import Project
1. Di Vercel dashboard, klik "Add New..." → "Project"
2. Pilih repository `ngangkring-kobibi`
3. Klik "Import"

### 3. Configure Project
1. **Framework Preset**: Next.js (auto-detect)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 4. Setup Environment Variables
Klik "Environment Variables" dan tambahkan:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-string-here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Cara generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Deploy
1. Klik "Deploy"
2. Tunggu ~2-3 menit
3. Setelah selesai, klik "Visit" untuk lihat website

---

## BAGIAN 4: Setup Database di Production

### 1. Push Schema ke Supabase
Di terminal lokal:
```bash
# Update DATABASE_URL di .env dengan URL Supabase
# Lalu jalankan:
npx prisma db push
```

### 2. Seed Database Production
```bash
npx prisma db seed
```

Ini akan membuat:
- 1 Store: NGANGKRING KOBIBI
- 1 Kategori: Umum
- 1 User Owner: owner@test.com / password123

### 3. Login Pertama Kali
1. Buka website Anda: `https://your-app.vercel.app`
2. Login dengan:
   - Email: `owner@test.com`
   - Password: `password123`
3. **SEGERA** ganti password di menu Settings!

---

## BAGIAN 5: AUTO-DEPLOY Setup ✅

### Cara Kerja Auto-Deploy:
Setelah setup di atas selesai, auto-deploy sudah AKTIF otomatis!

**Workflow:**
1. Edit code di local
2. Commit changes:
   ```bash
   git add .
   git commit -m "Update fitur X"
   ```
3. Push ke GitHub:
   ```bash
   git push origin main
   ```
4. **Vercel otomatis detect push** dan mulai build
5. ~2-3 menit kemudian, website sudah update!

### Monitoring Deploy:
1. Buka https://vercel.com/dashboard
2. Pilih project `ngangkring-kobibi`
3. Tab "Deployments" - lihat status deploy
4. Klik deployment untuk lihat logs

---

## BAGIAN 6: Update Environment Variables (Jika Perlu)

### Di Vercel:
1. Buka project di Vercel dashboard
2. Klik "Settings"
3. Klik "Environment Variables"
4. Edit/tambah variable
5. Klik "Save"
6. **PENTING**: Redeploy untuk apply changes:
   - Pergi ke tab "Deployments"
   - Klik "..." di deployment terakhir
   - Klik "Redeploy"

---

## BAGIAN 7: Custom Domain (Opsional)

### Jika punya domain sendiri:
1. Di Vercel, buka project
2. Klik "Settings" → "Domains"
3. Tambahkan domain Anda
4. Ikuti instruksi untuk update DNS
5. Update `NEXTAUTH_URL` di Environment Variables dengan domain baru

---

## TROUBLESHOOTING

### Error: "Database connection failed"
- Cek DATABASE_URL di Vercel Environment Variables
- Pastikan password benar (tidak ada karakter special yang perlu di-encode)
- Cek Supabase project masih aktif

### Error: "NEXTAUTH_URL is not defined"
- Tambahkan NEXTAUTH_URL di Vercel Environment Variables
- Format: `https://your-app.vercel.app` (tanpa trailing slash)

### Auto-deploy tidak jalan
- Cek GitHub repository connected di Vercel
- Cek branch yang di-deploy adalah `main`
- Lihat logs di Vercel Deployments tab

### Build failed di Vercel
- Lihat error logs di Vercel
- Pastikan `npm run build` berhasil di local
- Cek semua dependencies ada di package.json

---

## CHECKLIST DEPLOYMENT ✅

- [ ] Supabase project created
- [ ] Database URL copied
- [ ] GitHub repository created
- [ ] Code pushed to GitHub main branch
- [ ] Vercel account created (dengan GitHub)
- [ ] Project imported ke Vercel
- [ ] Environment variables configured
- [ ] First deployment success
- [ ] Database schema pushed (prisma db push)
- [ ] Database seeded
- [ ] Login test berhasil
- [ ] Password owner diganti
- [ ] Auto-deploy tested (push code → auto update)

---

## MAINTENANCE

### Update Code:
```bash
# Edit files
git add .
git commit -m "Deskripsi perubahan"
git push origin main
# Vercel auto-deploy dalam 2-3 menit
```

### Backup Database:
Di Supabase dashboard:
1. Settings → Database
2. Scroll ke "Database Backups"
3. Download backup

### Monitor Usage:
- Supabase: Dashboard → Usage
- Vercel: Dashboard → Analytics

---

## SUPPORT

Jika ada masalah:
1. Cek logs di Vercel Deployments
2. Cek Supabase logs di Dashboard
3. Test di local dulu sebelum push

**Selamat! Website Anda sudah live dan auto-deploy! 🎉**
