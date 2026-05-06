import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
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