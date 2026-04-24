import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    // Menghapus cookie dengan mengeset maxAge ke 0
    cookieStore.set("auth_token", "", {
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({ message: "Logout Berhasil" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error saat logout" }, { status: 500 });
  }
}