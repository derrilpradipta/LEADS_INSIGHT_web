import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

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
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let dateFilter: any = {};

    if (from && to) {
      dateFilter = { tanggal: { gte: new Date(from), lte: new Date(to + "T23:59:59") } };
    } else if (month && year) {
      const firstDay = new Date(Number(year), Number(month), 1);
      const lastDay = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59);
      dateFilter = { tanggal: { gte: firstDay, lte: lastDay } };
    }

    let whereClause: any = { ...dateFilter };
    if (role !== "ADMIN") {
      if (!userId || userId === "null") return NextResponse.json([]);
      whereClause.userId = Number(userId);
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}