import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Method PATCH untuk update role saja
export async function PATCH(request: Request) {
  try {
    const { userId, newRole } = await request.json();

    // Pastikan userId dikirim
    if (!userId || !newRole) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Update di database berdasarkan ID
    // Jika ID kamu di database adalah String (uuid), biarkan apa adanya.
    // Jika ID adalah Int (1, 2, 3), gunakan: where: { id: Number(userId) }
    const updatedUser = await prisma.user.update({
      where: { id: userId }, 
      data: { role: newRole },
    });

    return NextResponse.json({ message: "Role diperbarui", user: updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ message: "Gagal memperbarui database" }, { status: 500 });
  }
}

// Method GET untuk ambil semua user (agar fungsi fetchUsers di frontend jalan)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        // lastInput: true, // pastikan kolom ini ada di schema.prisma
      },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}