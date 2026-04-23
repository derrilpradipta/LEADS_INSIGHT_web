import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); 
    const monthParam = searchParams.get("month");
    
    // Validasi ID
    if (!userId || userId === "null") {
      return NextResponse.json({ message: "User ID tidak valid" }, { status: 400 });
    }

    const today = new Date();
    const targetMonth = monthParam ? parseInt(monthParam) : today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, targetMonth, 1);
    const lastDay = new Date(currentYear, targetMonth + 1, 0, 23, 59, 59);

    // Ambil data User beserta Leads miliknya saja
    const userStats = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        leads: {
          where: {
            tanggal: {
              gte: firstDay,
              lte: lastDay,
            },
          },
        },
      },
    });

    if (!userStats) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    const monthlyLeads = userStats.leads || [];

    // Kalkulasi data untuk dashboard
    const stats = {
      nama: userStats.nama || userStats.username,
      monthlyWeb: monthlyLeads.reduce((acc, curr) => acc + (curr.orderWeb || 0), 0),
      monthlyWA: monthlyLeads.reduce((acc, curr) => acc + (curr.orderWaOts || 0), 0),
      totalLeadsMonth: monthlyLeads.reduce((acc, curr) => acc + (curr.webMasuk || 0), 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}