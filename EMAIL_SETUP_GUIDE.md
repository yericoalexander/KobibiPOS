# 📧 Panduan Setup Email untuk POS Kobibi

## ❌ Masalah yang Terjadi

Error: `Invalid login: 534-5.7.9 Application-specific password required`

**Penyebab:** Google tidak mengizinkan aplikasi pihak ketiga menggunakan password akun biasa. Anda harus menggunakan **App Password** khusus.

---

## ✅ Solusi: Membuat App Password Gmail

### Langkah 1: Aktifkan 2-Step Verification

1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Login dengan akun Gmail Anda: `ricoalexander676@gmail.com`
3. Cari bagian **"2-Step Verification"** atau **"Verifikasi 2 Langkah"**
4. Klik dan ikuti petunjuk untuk mengaktifkannya (biasanya pakai SMS atau Google Authenticator)

### Langkah 2: Generate App Password

1. Setelah 2-Step Verification aktif, kembali ke [Google Account Security](https://myaccount.google.com/security)
2. Cari **"App passwords"** atau **"Sandi aplikasi"**
   - Atau langsung ke: https://myaccount.google.com/apppasswords
3. Klik **"Select app"** → Pilih **"Mail"**
4. Klik **"Select device"** → Pilih **"Other (Custom name)"**
5. Ketik nama: **"Kobibi POS System"**
6. Klik **"Generate"**
7. Google akan menampilkan 16 karakter password seperti: `abcd efgh ijkl mnop`
8. **COPY password ini** (tanpa spasi)

### Langkah 3: Update File .env

Buka file `.env` di root project dan update:

```env
DATABASE_URL="postgresql://root:password123@localhost:5432/pos_db?schema=public"
NEXTAUTH_SECRET="super-secret-pos-key-1234567890"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_EMAIL="ricoalexander676@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"  # <-- Ganti dengan App Password (16 karakter tanpa spasi)
```

### Langkah 4: Restart Development Server

```bash
# Stop server yang sedang berjalan (Ctrl+C)
# Kemudian jalankan ulang:
npm run dev
```

---

## 🧪 Testing Email

Setelah setup, test dengan cara:

1. Buka aplikasi di browser: `http://localhost:3000`
2. Login sebagai OWNER
3. Pergi ke halaman **Reports** (`/reports`)
4. Klik tombol **"Kirim Email Laporan"**
5. Email akan dikirim ke: `ricoalexander676@gmail.com`

---

## 🔧 Alternatif: Gunakan SMTP Lain (Opsional)

Jika tidak ingin pakai Gmail, bisa gunakan layanan lain:

### Menggunakan Mailtrap (untuk testing)

```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_EMAIL="your-mailtrap-username"
SMTP_PASSWORD="your-mailtrap-password"
```

### Menggunakan SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_EMAIL="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

---

## 📝 Catatan Penting

1. **Jangan share App Password** - Simpan dengan aman
2. **App Password berbeda** dengan password login Gmail biasa
3. **Jika lupa**, bisa generate ulang App Password baru
4. **Revoke App Password** jika tidak digunakan lagi dari Google Account Security

---

## ❓ Troubleshooting

### Error: "Invalid login" masih muncul
- Pastikan App Password di-copy dengan benar (16 karakter, tanpa spasi)
- Pastikan 2-Step Verification sudah aktif
- Coba generate App Password baru

### Error: "Connection timeout"
- Cek koneksi internet
- Pastikan port 465 tidak diblokir firewall

### Email tidak masuk
- Cek folder Spam/Junk
- Pastikan email tujuan benar: `ricoalexander676@gmail.com`

---

## 📞 Support

Jika masih ada masalah, screenshot error dan hubungi developer.
