import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. LOGIKA UNTUK MENYIMPAN DATA (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, webMasuk, orderWaOts, orderWeb, userId } = body;

    // Validasi data dasar
    if (!userId) {
      return NextResponse.json({ message: "User ID tidak valid" }, { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        tanggal: new Date(tanggal),
        webMasuk: Number(webMasuk),
        orderWaOts: Number(orderWaOts),
        orderWeb: Number(orderWeb),
        // Tambahkan baris ini karena bersifat 'required' di schema kamu
        closingRate: (Number(orderWaOts) + Number(orderWeb)) / (Number(webMasuk) || 1), 
        user: {
          connect: { id: Number(userId) }
        }
      },
    });

    return NextResponse.json({ message: "Data berhasil disimpan", data: newLead }, { status: 201 });
  } catch (error) {
    console.error("Error POST Leads:", error);
    return NextResponse.json({ message: "Gagal menyimpan ke database" }, { status: 500 });
  }
}

// 2. LOGIKA UNTUK MENGAMBIL DATA (GET) DENGAN FILTER ROLE
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let whereClause = {};

    // Jika bukan ADMIN, hanya boleh lihat inputan sendiri
    if (role !== "ADMIN") {
      if (!userId || userId === "null") {
        return NextResponse.json([], { status: 200 });
      }
      whereClause = { userId: Number(userId) };
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { tanggal: 'desc' } // 'desc' agar data terbaru di atas
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}