-- SUPABASE DATABASE SETUP - FIXED VERSION
-- Jalankan script ini di Supabase SQL Editor SATU PER SATU

-- ========================================
-- STEP 1: Cek tabel yang sudah ada
-- ========================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Store', 'User', 'Category', 'Product', 'Order', 'OrderItem');

-- ========================================
-- STEP 2: Hapus data lama (jika ada)
-- ========================================
DELETE FROM "User" WHERE email = 'owner@test.com';
DELETE FROM "Category" WHERE id = 'cat-001';
DELETE FROM "Store" WHERE id = 'store-001';

-- ========================================
-- STEP 3: Insert Store (TANPA updatedAt)
-- ========================================
INSERT INTO "Store" (id, name, address, phone, currency, "receiptFooter", "createdAt")
VALUES (
  'store-001',
  'NGANGKRING KOBIBI',
  'Jl. Contoh No. 123',
  '087878783166',
  'IDR',
  'Terima Kasih!',
  NOW()
);

-- ========================================
-- STEP 4: Insert User dengan password yang benar
-- Password: password123
-- Hash: $2b$10$90pAG0JOt7GQFaDagQPruOyXumMVjZeX7NVJRHH286eg0JARdBXr2
-- ========================================
INSERT INTO "User" (id, email, password, name, role, active, "storeId", "createdAt", "updatedAt")
VALUES (
  'user-owner-001',
  'owner@test.com',
  '$2b$10$90pAG0JOt7GQFaDagQPruOyXumMVjZeX7NVJRHH286eg0JARdBXr2',
  'Owner',
  'OWNER',
  true,
  'store-001',
  NOW(),
  NOW()
);

-- ========================================
-- STEP 5: Insert Category (TANPA updatedAt)
-- ========================================
INSERT INTO "Category" (id, name, "storeId", "createdAt")
VALUES (
  'cat-001',
  'Umum',
  'store-001',
  NOW()
);

-- ========================================
-- STEP 6: Verifikasi semua data
-- ========================================
SELECT 'Store' as table_name, COUNT(*) as count FROM "Store"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Category', COUNT(*) FROM "Category";

-- ========================================
-- STEP 7: Cek detail user owner
-- ========================================
SELECT id, email, name, role, active, "storeId", 
       LEFT(password, 30) || '...' as password_hash_preview
FROM "User"
WHERE email = 'owner@test.com';
