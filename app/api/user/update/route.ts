// app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const { userId, newRole } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) }, 
      data: { role: newRole.toUpperCase() },
    });

    return NextResponse.json({ message: "Role diperbarui", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memperbarui database" }, { status: 500 });
  }
}