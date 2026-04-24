import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

   if (user && user.password === password) {
      // Login Sukses
      return NextResponse.json({ 
        message: "Login Berhasil",
        user: {
          id: user.id,
          nama: user.nama || user.username,
          role: user.role // Kirim role (ADMIN/STAFF) dari database
        }
      }, { status: 200 });
    } else {
      // Login Gagal
      return NextResponse.json({ message: "Username atau password salah" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}