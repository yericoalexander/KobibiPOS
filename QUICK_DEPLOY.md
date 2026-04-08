# Quick Deploy Reference

## 🚀 Deploy Pertama Kali

### 1. Supabase (2 menit)
```
1. https://supabase.com → Sign up dengan GitHub
2. New Project → Name: ngangkring-kobibi
3. Copy DATABASE_URL dari Settings → Database → Connection string
```

### 2. GitHub (1 menit)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/ngangkring-kobibi.git
git push -u origin main
```

### 3. Vercel (3 menit)
```
1. https://vercel.com → Sign up dengan GitHub
2. Import repository: ngangkring-kobibi
3. Add Environment Variables:
   - DATABASE_URL (dari Supabase)
   - NEXTAUTH_URL (https://your-app.vercel.app)
   - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
   - SMTP_* (email settings)
4. Deploy
```

### 4. Setup Database (2 menit)
```bash
# Update .env dengan DATABASE_URL Supabase
npx prisma db push
npx prisma db seed
```

### 5. Test
```
1. Buka https://your-app.vercel.app
2. Login: owner@test.com / password123
3. Ganti password di Settings
```

---

## 🔄 Auto-Deploy (Setelah Setup)

```bash
# Edit code
git add .
git commit -m "Update feature"
git push origin main
# ✅ Vercel auto-deploy dalam 2-3 menit!
```

---

## 📝 Environment Variables

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=random-32-char-string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

---

## ⚡ Commands

```bash
# Local development
npm run dev

# Build test
npm run build

# Database
npx prisma db push          # Push schema
npx prisma db seed          # Seed data
npx prisma studio           # Open database GUI

# Git
git status
git add .
git commit -m "message"
git push origin main        # Trigger auto-deploy
```

---

## 🔍 Monitoring

- **Vercel Deployments**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Actions**: https://github.com/USERNAME/ngangkring-kobibi/actions

---

## 🆘 Quick Fixes

### Build Failed
```bash
# Test locally first
npm run build
# Fix errors, then push
```

### Database Error
```bash
# Check connection
npx prisma db push
```

### Auto-deploy not working
```
1. Check GitHub connected in Vercel
2. Check branch is 'main'
3. Check build logs in Vercel
```
