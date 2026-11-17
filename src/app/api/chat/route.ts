import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatMessage = { role: "user" | "assistant"; content: string };

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT) return true;
  if (rateBuckets.size > 1_000) {
    for (const [key, value] of rateBuckets) {
      if (value.resetAt <= now) rateBuckets.delete(key);
    }
  }
  return false;
}

const BASE_INSTRUCTIONS = `Kamu adalah Ustadz Arabi, tutor percakapan bahasa Arab yang ramah, sabar, dan menyenangkan untuk siswa Madrasah Tsanawiyah (MTs) kelas VII–IX di Indonesia.

TUJUAN UTAMA:
- Latih maharah kalam (keterampilan berbicara), bukan memberi kuliah tata bahasa yang panjang.
- Gunakan bahasa Arab fusha yang sederhana, alami, dan sesuai tingkat pemula hingga menengah.
- Tulis kalimat Arab dengan harakat jika memungkinkan.
- Ajukan SATU pertanyaan atau satu giliran percakapan pada akhir jawaban agar siswa terdorong membalas.
- Berikan apresiasi yang tulus dan koreksi dengan lembut. Jangan mempermalukan siswa.

FORMAT JAWABAN:
1. Respons percakapan dalam bahasa Arab (1–3 kalimat pendek).
2. Terjemahan bahasa Indonesia secara ringkas.
3. Jika jawaban siswa memiliki kesalahan, tambahkan bagian “✍️ Perbaikan” berisi bentuk yang lebih tepat dan alasan sederhana. Jika tidak ada kesalahan penting, jangan memaksakan koreksi.
4. Tambahkan satu pertanyaan lanjutan dalam bahasa Arab.

PEDAGOGI:
- Sesuaikan kosakata dengan tingkat siswa MTs. Hindari ungkapan yang terlalu rumit.
- Jika siswa belum memahami, berikan petunjuk atau contoh, bukan langsung menyalahkan.
- Bila siswa menulis dalam bahasa Indonesia, bantu terjemahkan ke bahasa Arab dan ajak mengulanginya.
- Bedakan bentuk sapaan laki-laki dan perempuan jika relevan, serta jelaskan secara sederhana.
- Jangan mengarang nilai atau mengklaim telah mendengar pelafalan jika input hanya berupa teks.
- Jangan meminta nama lengkap, alamat, nomor telepon, sekolah spesifik, atau data pribadi siswa.
- Tetap fokus pada pembelajaran bahasa Arab dan percakapan yang aman untuk anak.
- Jawab dengan singkat, hangat, dan interaktif.`;

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Tunggu satu menit sebelum mencoba lagi." }, { status: 429 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI belum diaktifkan. Tambahkan OPENAI_API_KEY pada file .env.local atau Environment Variables di Vercel." },
      { status: 503 }
    );
  }

  let body: { messages?: ChatMessage[]; grade?: string; level?: string; scenario?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 12) {
    return NextResponse.json({ error: "Percakapan tidak valid. Kirim maksimal 12 pesan terakhir." }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") {
      return NextResponse.json({ error: "Isi pesan tidak valid." }, { status: 400 });
    }
    const content = item.content.trim();
    if (!content || content.length > 1200) {
      return NextResponse.json({ error: "Setiap pesan harus berisi 1–1.200 karakter." }, { status: 400 });
    }
    messages.push({ role: item.role, content });
  }

  const grade = ["VII", "VIII", "IX"].includes(body.grade ?? "") ? body.grade : "VII–IX";
  const level = ["Pemula", "Menengah"].includes(body.level ?? "") ? body.level : "Pemula";
  const scenario = typeof body.scenario === "string" ? body.scenario.slice(0, 700) : "";
  const instructions = `${BASE_INSTRUCTIONS}\n\nKONTEKS SISWA: Kelas ${grade}; tingkat kemampuan ${level}.\n${scenario ? `SKENARIO ROLEPLAY: ${scenario}\nTetap berada dalam peran tersebut selama percakapan.` : "Mode percakapan bebas: pilih topik ringan yang dekat dengan kehidupan siswa."}`;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      instructions,
      input: messages.map((message) => ({ role: message.role, content: message.content })),
      max_output_tokens: 450,
      store: false,
    });

    const reply = response.output_text?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Tutor belum menghasilkan jawaban. Silakan coba kembali." }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Arabic tutor API error:", error);
    return NextResponse.json(
      { error: "Maaf, tutor AI sedang mengalami gangguan. Periksa API key, kuota API, lalu coba lagi." },
      { status: 502 }
    );
  }
}
