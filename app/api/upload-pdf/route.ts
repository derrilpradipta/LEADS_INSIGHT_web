import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Solusi: Gunakan require di dalam fungsi untuk menghindari build error
    const pdf = require('pdf-parse');
    
    // Kadang library ini membungkus fungsinya di .default tergantung environment
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
            webMasuk: parseInt(parts[2]) || 0,
            orderWaOts: parseInt(parts[3]) || 0,
            orderWeb: parseInt(parts[4]) || 0,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({ success: true, data: leadsData });
  } catch (error: any) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: "Gagal memproses PDF" }, { status: 500 });
  }
}