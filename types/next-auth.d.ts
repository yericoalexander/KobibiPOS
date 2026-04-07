import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "OWNER" | "ADMIN" | "KASIR";
      storeId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "OWNER" | "ADMIN" | "KASIR";
    storeId: string;
    active?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "OWNER" | "ADMIN" | "KASIR";
    storeId: string;
  }
}
