"use client";

import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  let color = "";
  let label = "";

  switch (status) {
    case "DRAFT":
      color = "bg-gray-100 text-gray-600 border-gray-200";
      label = "DRAFT";
      break;
    case "UNPAID":
      color = "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20";
      label = "BELUM BAYAR";
      break;
    case "PAID":
      color = "bg-green-100 text-green-700 border-green-200";
      label = "LUNAS";
      break;
    case "VOID":
      color = "bg-red-100 text-red-600 border-red-200";
      label = "BATAL";
      break;
  }

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-extrabold border tracking-wider", color)}>
      {label}
    </span>
  );
}
