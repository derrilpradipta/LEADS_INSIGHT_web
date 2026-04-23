import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password, nama } = await request.json();

    // Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Username sudah terdaftar" }, { status: 400 });
    }

    // Buat user baru (Role otomatis ADMIN sesuai schema)
    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        nama, // Menyimpan nama lengkap
      },
    });

    return NextResponse.json({ message: "User berhasil dibuat", user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}