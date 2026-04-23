import { NextRequest, NextResponse } from 'next/server';
// Gunakan import biasa tanpa nama fungsi dulu
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Gunakan pengecekan manual atau casting agar TypeScript tidak komplain
    // @ts-ignore
    const parse = typeof pdf === 'function' ? pdf : pdf.default;
    const data = await parse(buffer);

    const lines: string[] = data.text.split('\n');
    const leadsData = lines
      .map((line: string) => {
        const parts = line.trim().split(/\s+/);
        // Mencari baris yang mengandung tanggal format /26
        if (parts.length >= 4 && parts[1]?.includes('/26')) {
          return {
            tanggal: parts[1],
            webMasuk: parseInt(parts[2]),
            orderWaOts: parseInt(parts[3]),
            orderWeb: parseInt(parts[4]),
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({ success: true, data: leadsData });
  } catch (error) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}