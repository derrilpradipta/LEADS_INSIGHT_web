// app/api/user/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        // Ambil data lead terakhir milik user ini
        leads: {
          orderBy: {
            createdAt: 'desc', // Urutkan dari yang paling baru
          },
          take: 1, // Ambil 1 data saja (yang terbaru)
          select: {
            createdAt: true,
          }
        }
      },
      orderBy: { nama: 'asc' }
    });

    // Format data agar 'lastInput' mudah dibaca oleh Frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      nama: user.nama,
      username: user.username,
      role: user.role,
      lastInput: user.leads[0]?.createdAt || null, // Ambil tanggal dari lead pertama jika ada
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}