import { NextRequest, NextResponse } from 'next/server';
import * as pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);

    // LOGIC PARSING: Memecah teks PDF menjadi baris data
    // Berdasarkan file Anda, kita mencari baris yang mengandung tanggal (xx/xx/26)
    const lines = data.text.split('\n');
    const leadsData = lines
      .map(line => {
        const parts = line.trim().split(/\s+/);
        // Contoh target baris: "1. 25/03/26 19 2 2 21"
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
      .filter(item => item !== null);

    return NextResponse.json({ success: true, data: leadsData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}