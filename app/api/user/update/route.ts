import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  const { username, nama, currentPassword, newPassword } = await request.json();

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || user.password !== currentPassword) {
      return NextResponse.json({ message: "Password lama salah!" }, { status: 401 });
    }

    // Update data
    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        nama: nama,
        password: newPassword || user.password // jika password baru kosong, pakai yang lama
      },
    });

    return NextResponse.json({ message: "Profil diperbarui", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memperbarui profil" }, { status: 500 });
  }
}