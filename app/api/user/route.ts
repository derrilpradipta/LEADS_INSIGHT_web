import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    
    const today = new Date();
    const targetMonth = monthParam ? parseInt(monthParam) : today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, targetMonth, 1);
    const lastDay = new Date(currentYear, targetMonth + 1, 0, 23, 59, 59);

    const staffMembers = await prisma.user.findMany({
      where: { role: "STAFF" },
      include: { leads: true },
    });

    const formattedData = staffMembers.map((staff) => {
      const allLeads = staff.leads || [];
      
      // Filter data hanya untuk bulan yang dipilih
      const monthlyLeads = allLeads.filter(l => {
        const d = new Date(l.tanggal);
        return d >= firstDay && d <= lastDay;
      });

      // Hitung Total Akumulasi selama 1 Bulan
      const totalWebMonth = monthlyLeads.reduce((acc, curr) => acc + (curr.orderWeb || 0), 0);
      const totalWAMonth = monthlyLeads.reduce((acc, curr) => acc + (curr.orderWaOts || 0), 0);
      const totalLeadsMonth = monthlyLeads.reduce((acc, curr) => acc + (curr.webMasuk || 0), 0);

      return {
        id: staff.id,
        nama: staff.nama || staff.username,
        username: staff.username,
        monthlyWeb: totalWebMonth,
        monthlyWA: totalWAMonth,
        // Total dari keduanya
        monthlyTotal: totalWebMonth + totalWAMonth,
        totalLeadsMonth: totalLeadsMonth
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}