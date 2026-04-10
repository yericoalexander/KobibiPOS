"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PosContainer from "@/components/pos/PosContainer";

export default function KasirPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      // Fetch data in background - page renders instantly
      Promise.all([
        fetch("/api/products?active=true").then(r => r.json()),
        fetch("/api/categories").then(r => r.json()),
      ]).then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      });
    }
  }, [status]);

  if (status === "loading") return null;

  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden">
      <PosContainer 
        products={products} 
        categories={categories}
        user={{
          role: (session?.user as any)?.role || 'KASIR'
        }}
      />
    </div>
  );
}
