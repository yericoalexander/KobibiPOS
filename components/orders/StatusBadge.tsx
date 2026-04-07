"use client";

import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  let color = "";
  let label = "";

  switch (status) {
    case "DRAFT":
      color = "bg-gray-500/10 text-gray-400 border-gray-500/20";
      label = "DRAFT";
      break;
    case "UNPAID":
      color = "bg-amber-500/10 text-amber-500 border-amber-500/20";
      label = "BELUM BAYAR";
      break;
    case "PAID":
      color = "bg-green-500/10 text-green-500 border-green-500/20";
      label = "LUNAS";
      break;
    case "VOID":
      color = "bg-red-500/10 text-red-500 border-red-500/20";
      label = "BATAL";
      break;
  }

  return (
    <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold border", color)}>
      {label}
    </span>
  );
}
