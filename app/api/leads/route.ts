import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let whereClause = {};

    // LOGIKA FILTER KETAT:
    // Jika role bukan ADMIN, maka WAJIB filter berdasarkan userId
    if (role !== "ADMIN") {
      if (!userId || userId === "null") {
        return NextResponse.json([], { status: 200 }); // Kembalikan array kosong jika ID tidak jelas
      }
      whereClause = { userId: Number(userId) };
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { tanggal: 'asc' }
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}