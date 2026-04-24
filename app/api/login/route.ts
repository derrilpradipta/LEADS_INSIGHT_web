import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (user && user.password === password) {
      // 1. Response JSON untuk kebutuhan frontend (localStorage)
      const response = NextResponse.json({ 
        message: "Login Berhasil",
        user: {
          id: user.id,
          username: user.username,
          nama: user.nama || user.username,
          role: user.role
        }
      }, { status: 200 });

      // 2. Simpan Cookie untuk Middleware (Sesuai spek Next.js 15)
      const cookieStore = await cookies(); 
      cookieStore.set("auth_token", String(user.username), {
        httpOnly: true, // Aman dari XSS
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // Berlaku 7 hari
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json({ message: "Username atau password salah" }, { status: 401 });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}