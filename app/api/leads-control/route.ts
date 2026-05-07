import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let dateFilter: any = {};

    if (from && to) {
      dateFilter = {
        tanggal: {
          gte: new Date(from),
          lte: new Date(to + "T23:59:59"),
        },
      };
    } else if (month && year) {
      const firstDay = new Date(Number(year), Number(month), 1);
      const lastDay = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59);
      dateFilter = { tanggal: { gte: firstDay, lte: lastDay } };
    }

    const leads = await prisma.lead.findMany({
      where: dateFilter,
      include: { user: { select: { id: true, nama: true, username: true } } },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, tanggal, webMasuk, orderWaOts, orderWeb } = await request.json();
    const updated = await prisma.lead.update({
      where: { id },
      data: {
        tanggal: new Date(tanggal),
        webMasuk: Number(webMasuk),
        orderWaOts: Number(orderWaOts),
        orderWeb: Number(orderWeb),
        closingRate: (Number(orderWaOts) + Number(orderWeb)) / (Number(webMasuk) || 1),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal hapus" }, { status: 500 });
  }
}