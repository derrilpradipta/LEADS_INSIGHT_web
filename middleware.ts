import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Ambil token dari cookie
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Jika mencoba masuk dashboard tapi tidak punya token
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika sudah login tapi malah mau ke halaman login
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Hanya proteksi dashboard dan halaman login
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};