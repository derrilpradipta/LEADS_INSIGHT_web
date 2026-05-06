// app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

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