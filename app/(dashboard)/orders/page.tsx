import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderListClient from "@/components/orders/OrderListClient";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Load last 50 orders unconditionally for now, client side filtering for speed
  const orders = await prisma.order.findMany({
    where: { storeId: session.user.storeId },
    include: { items: true, cashier: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Kelola dan lihat status seluruh pesanan</p>
        </div>
        
        <OrderListClient initialOrders={orders} />
      </div>
    </div>
  );
}
