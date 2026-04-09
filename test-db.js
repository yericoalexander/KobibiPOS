const { Client } = require('pg');

async function test(connectionString, label) {
  const client = new Client({ connectionString });
  console.log(`\nTesting ${label}...`);
  try {
    await client.connect();
    console.log(`${label} connected successfully!`);
    await client.end();
  } catch (err) {
    console.error(`${label} failed:`, err.message);
  }
}

async function main() {
  await test("postgresql://postgres.cqpuxrsgrymrobreaeyy:KobibiPos2024@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres", "DATABASE_URL (port 5432)");
  await test("postgresql://postgres.cqpuxrsgrymrobreaeyy:KobibiPos2024@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true", "DATABASE_URL_2 (port 6543 pgbouncer format)");
  await test("postgresql://postgres:KobibiPos2024@db.cqpuxrsgrymrobreaeyy.supabase.co:5432/postgres", "DIRECT_URL (original format)");
  await test("postgresql://postgres:KobibiPos2024@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres", "DATABASE_URL with just postgres (Supavisor port 5432)");
}

main();
