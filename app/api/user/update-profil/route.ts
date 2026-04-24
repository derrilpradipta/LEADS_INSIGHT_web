import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, username, currentPassword, newPassword } = body;

    // 1. Cari user di DB
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // 2. Verifikasi password lama (Logic asli kamu)
    if (user.password !== currentPassword) {
      return NextResponse.json({ message: "Password lama salah!" }, { status: 401 });
    }

    // 3. Siapkan data update
    const updateData: any = { nama: nama };
    if (newPassword && newPassword.trim() !== "") {
      updateData.password = newPassword;
    }

    // 4. Eksekusi update
    const updatedUser = await prisma.user.update({
      where: { username: username },
      data: updateData,
    });

    return NextResponse.json({ message: "Berhasil", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal memperbarui database" }, { status: 500 });
  }
}