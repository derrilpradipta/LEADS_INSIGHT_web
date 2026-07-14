import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// PATCH — staff edit data milik sendiri
export async function PATCH(request: Request) {
  try {
    const { id, userId, tanggal, webMasuk, orderWeb, orderWaOts, products } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ message: "Tidak diizinkan mengedit data milik orang lain" }, { status: 403 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        tanggal: new Date(tanggal),
        webMasuk: Number(webMasuk),
        orderWeb: Number(orderWeb),
        orderWaOts: Number(orderWaOts),
        closingRate: (Number(orderWaOts) + Number(orderWeb)) / (Number(webMasuk) || 1),
        products: products ?? [],  // ← tambah ini
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/my-leads error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE — staff hapus data milik sendiri
export async function DELETE(request: Request) {
  try {
    const { id, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ message: "Tidak diizinkan menghapus data milik orang lain" }, { status: 403 });
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/my-leads error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}