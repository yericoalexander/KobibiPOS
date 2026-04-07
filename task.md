# POS Web Application Task List

This task list breaks down the implementation of the full-stack POS application based on the user's requirements.

## 1. Project Initialization & Setup
- [x] Initialize Next.js 14 project (App Router) with TypeScript & Tailwind CSS
- [x] Install dependencies (Zustand, React Hot Toast, Recharts, react-to-print, Prisma, NextAuth.js v5, etc.)
- [x] Configure [docker-compose.yml](file:///Volumes/PS210/PROJECT-RICO/NGANGKRING-KOBIBI/docker-compose.yml) for local PostgreSQL
- [x] Set up basic Tailwind CSS configurations, CSS variables, and fonts (Plus Jakarta Sans, DM Sans, DM Mono)

## 2. Database & Schema
- [x] Design Prisma schema ([schema.prisma](file:///Volumes/PS210/PROJECT-RICO/NGANGKRING-KOBIBI/prisma/schema.prisma)) for [User](file:///Volumes/PS210/PROJECT-RICO/NGANGKRING-KOBIBI/types/next-auth.d.ts#13-19), `Store`, [Category](file:///Volumes/PS210/PROJECT-RICO/NGANGKRING-KOBIBI/components/pos/CategoryFilter.tsx#11-42), `Product`, [Order](file:///Volumes/PS210/PROJECT-RICO/NGANGKRING-KOBIBI/components/pos/OrderPanel.tsx#10-214), and `OrderItem`
- [x] Create seed script ([seed.ts](file:///Volumes/PS210/PROJECT-RICO/NGANGKRING-KOBIBI/prisma/seed.ts)) with store, 3 users, categories, 12 products, and sample orders
- [x] Run initial Prisma migrations and seed the database

## 3. Authentication & API Core
- [x] Set up NextAuth v5 in `app/api/auth/[...nextauth]` using Prisma adapter and Credentials provider
- [x] Implement robust `auth.ts` logic mapping roles: OWNER, ADMIN, KASIR
- [x] Create layout and middleware checks to secure routes based on roles

## 4. State Management
- [x] Implement `useCartStore.ts` (Zustand) for the active shopping cart
- [x] Implement `useDraftStore.ts` (Zustand) for managing multiple active and suspended POS drafts

## 5. API Routes Implementation
- [x] `/api/products` (GET, POST), `/api/products/[id]` (PATCH, DELETE)
- [x] `/api/categories` (GET, POST, DELETE)
- [x] `/api/orders` (GET (list), POST (create draft))
- [x] `/api/orders/[id]` (GET, PATCH (update/status), DELETE (void))
- [x] `/api/reports/summary` (GET) and `/api/reports/export` (GET)
- [x] `/api/users` (GET, POST) and `/api/settings` (GET, PATCH)

## 6. Main POS Interface (`/kasir`)
- [x] Layout scaffolding (MenuGrid, OrderPanel, DraftBar, CategoryFilter)
- [x] Integrate fetching of products from API
- [x] Implement adding/removing items to cart logic
- [x] Implement multiple drafts saving logic (switching between drafts auto-saving)
- [x] Create PaymentModal (cash/transfer/qris calculations and updates)
- [x] Create ReceiptModal with `@react-to-print` for printing structured receipt
- [x] Implement transition logic: SUBMIT (DRAFT -> UNPAID), PAY (UNPAID/DRAFT -> PAID), VOID

## 7. Order History (`/orders`)
- [/] UI to list orders with filters (bisa search by ID, customer name)
- [/] Include detailed OrderCard or expanded view showing items and status badge
- [ ] Implement "Edit Order" flow that resets UNPAID to DRAFT and loads it into POS store

## 8. Management Dashboards
- [ ] **Products** (`/products`): Full CRUD interface, active/inactive toggle
- [ ] **Categories** (`/categories`): Creating/managing categories
- [ ] **Users** (`/users`): Owner-only access, add new KASIR/ADMIN
- [ ] **Settings** (`/settings`): Store configuration, Tax, Currency, Receipt text

## 9. Reports & Analytics (`/reports`)
- [ ] Fetch statistics from `/api/reports/summary`
- [ ] Implement SummaryCards: Total Revenue, Transactions Count, Avg Value, Unpaid Count
- [ ] Implement Recharts visualizations: Revenue Line Chart, Orders Bar Chart, Top Products Pie Chart
- [ ] CSV Export button functionality

## 10. Polishing & Error Handling
- [ ] Add loading skeletons for data fetching
- [ ] Add react-hot-toast notifications for all API success/errors
- [ ] Final visual tweaks and dark/light mode optimization
- [ ] Review all inputs and API actions for type safety and edge cases

## 11. Final Documentation
- [ ] Generate comprehensive `README.md` with setup/start instructions
