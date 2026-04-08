import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const token = req.auth;
  const path = req.nextUrl.pathname;
  const isAuthPage = path.startsWith("/login");
  const isApi = path.startsWith("/api");

  if (!token) {
    if (isAuthPage || isApi) {
      return NextResponse.next();
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL("/kasir", req.url));
  }

  // Role checks
  // req.auth in NextAuth v5 contains the session object (req.auth.user.role)
  const role = (token as any)?.user?.role || (token as any)?.role;

  if (path.startsWith("/users") && role !== "OWNER") {
    return NextResponse.redirect(new URL("/kasir", req.url));
  }

  if (path.startsWith("/reports") && role !== "OWNER") {
    return NextResponse.redirect(new URL("/kasir", req.url));
  }

  if (path.startsWith("/products") && role === "KASIR") {
    return NextResponse.redirect(new URL("/kasir", req.url));
  }
  
  if (path.startsWith("/categories") && role === "KASIR") {
    return NextResponse.redirect(new URL("/kasir", req.url));
  }
  
  if (path.startsWith("/settings") && role === "KASIR") {
     return NextResponse.redirect(new URL("/kasir", req.url));
  }

  if (path === "/") {
    return NextResponse.redirect(new URL("/kasir", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
