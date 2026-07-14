import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET — ambil semua produk
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: "Gagal ambil produk" }, { status: 500 });
  }
}

// POST — tambah produk baru
export async function POST(request: Request) {
  try {
    const { nama } = await request.json();
    if (!nama?.trim()) {
      return NextResponse.json({ message: "Nama produk tidak boleh kosong" }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: { nama: nama.trim() },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Produk sudah ada" }, { status: 409 });
    }
    return NextResponse.json({ message: "Gagal tambah produk" }, { status: 500 });
  }
}

// PATCH — update nama atau status aktif
export async function PATCH(request: Request) {
  try {
    const { id, nama, aktif } = await request.json();
    if (!id) return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });

    const data: any = {};
    if (nama !== undefined) data.nama = nama.trim();
    if (aktif !== undefined) data.aktif = aktif;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(product);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Nama produk sudah dipakai" }, { status: 409 });
    }
    return NextResponse.json({ message: "Gagal update produk" }, { status: 500 });
  }
}

// DELETE — hapus produk
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Produk dihapus" });
  } catch {
    return NextResponse.json({ message: "Gagal hapus produk" }, { status: 500 });
  }
}