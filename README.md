# Full Stack POS System

A modern, production-ready Point of Sale (POS) system inspired by FibrPOS. Built with Next.js 14, Tailwind CSS, PostgreSQL, and Prisma.

## ✨ Features
- **Role-Based Access Control**: Secure logins for OWNER, ADMIN, and KASIR with granular permissions.
- **Advanced Order Status Management**: Track orders via dynamic flows (DRAFT -> UNPAID -> PAID or VOID).
- **Multi-Draft Capability**: Seamlessly switch between multiple pending customer orders without losing state using Zustand.
- **Reporting & Analytics**: Beautiful dashboards with Recharts showing daily revenue, transaction volume, and top products.
- **Print Support**: Integrated `@react-to-print` for thermal receipt printing.
- **Modern UI/UX**: Built with an aesthetically pleasing Next.js and Tailwind UI featuring animations, auto-save feedback, and toast notifications.

## 🚀 Tech Stack
- Frontend: Next.js 14 (App Router), React, Tailwind CSS, Zustand, Recharts, Lucide Icons
- Backend: Next.js API Routes, NextAuth.js v5 (Auth.js)
- Database: PostgreSQL, Prisma ORM
- Deployment: Docker Compose for local development

## 👨‍💻 Local Development Setup

### 1. Requirements
Ensure you have the following installed:
- Node.js (v18+)
- npm or pnpm
- Docker Desktop (for local PostgreSQL)

### 2. Environment Variables
Create a `.env` file in the root directory and ensure it has:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_db?schema=public"
NEXTAUTH_SECRET="super-secret-pos-key-change-in-production"
AUTH_URL="http://localhost:3000"
```

### 3. Spin up Database
To start the local PostgreSQL instance via Docker Compose:
```bash
docker-compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Setup Database & Seed Dummy Data
We have provided a robust seed file that injects products, categories, stores, and test users.
```bash
npx prisma db push
npx prisma db seed
```

### 6. Run Next.js Development Server
```bash
npm run dev
```

The application is now running at `http://localhost:3000`.

## 🔐 Demo Credentials

Use the following credentials to test the various roles:
- **Owner Account**: `owner@test.com` / `password123`
- **Admin Account**: `admin@test.com` / `password123`
- **Kasir Account**: `kasir@test.com` / `password123`

Wait, Kasir has identical experience but is strictly blocked from the Owner Dashboard capabilities natively within middleware and API layer.

## 🏗️ Architecture

- `/app/api`: All modular REST API endpoints protected by `auth()`.
- `/app/(dashboard)`: Layout defining the persistent sidebar and pages.
- `/components`: Interactive client-side components (`MenuGrid`, `DraftBar`, Modals) keeping server components clean.
- `/store`: Zustand stores `useCartStore` and `useDraftStore`.

---
*Built with ❤️ utilizing Advanced GenAI code-pairing workflow.*
