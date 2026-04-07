import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PosContainer from "@/components/pos/PosContainer";
import { redirect } from "next/navigation";

export default async function KasirPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: session.user.storeId, active: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: { storeId: session.user.storeId },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden">
      <PosContainer products={products} categories={categories} />
    </div>
  );
}
