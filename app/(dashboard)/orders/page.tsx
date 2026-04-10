import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderListClient from "@/components/orders/OrderListClient";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Move data fetching to client for instant "sat-set" navigation.
  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Kelola dan lihat status seluruh pesanan</p>
        </div>
        
        <OrderListClient initialOrders={[]} />
      </div>
    </div>
  );
}
