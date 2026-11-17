# Lughati — Arabic Learning Assistant

Website pembelajaran bahasa Arab untuk siswa MTs dengan fokus pada **maharah kalam** (keterampilan berbicara). Dibangun menggunakan Next.js App Router, TypeScript, React, dan OpenAI Responses API.

## Fitur

- Dashboard belajar dengan XP, streak, dan progress materi.
- Materi bahasa Arab kelas VII, VIII, dan IX.
- Kosakata dengan transliterasi, arti, contoh kalimat, dan fitur text-to-speech browser.
- AI Conversation dengan koreksi dan penjelasan bahasa Arab–Indonesia.
- Roleplay percakapan: perkenalan, kelas, kantin, pasar, hobi, dan rutinitas.
- Kuis pilihan ganda dengan skor dan XP.
- Kamus mini dengan pencarian dan filter kategori.
- Speech-to-text melalui Web Speech API (dukungan tergantung browser dan perangkat).
- Progress disimpan di LocalStorage; tidak membutuhkan akun atau database.
- Backend AI berada di `src/app/api/chat/route.ts`. API key hanya dibaca di server.

## Persyaratan

- Node.js 20.9 atau lebih baru (disarankan Node.js 22 LTS).
- npm.
- API key OpenAI untuk mengaktifkan AI Tutor.

## Menjalankan di komputer lokal

1. Ekstrak project, lalu masuk ke folder project:

   ```bash
   cd arabic-learning-assistant
   ```

2. Instal dependensi:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env.local`.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env.local
   ```

4. Isi `.env.local`:

   ```env
   OPENAI_API_KEY=isi_api_key_anda
   OPENAI_MODEL=gpt-6-luna
   ```

   `OPENAI_MODEL` bersifat opsional. Jika tidak diisi, aplikasi menggunakan `gpt-6-luna`.

5. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

6. Buka `http://localhost:3000`.

> Tanpa `OPENAI_API_KEY`, seluruh halaman pembelajaran tetap dapat dibuka, tetapi permintaan ke AI Tutor akan menampilkan instruksi konfigurasi API key.

## Deploy ke GitHub dan Vercel

### A. Upload ke GitHub

1. Buat repository baru di GitHub.
2. Jangan unggah `.env.local` atau API key.
3. Dari terminal pada folder project jalankan:

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Lughati Arabic Learning Assistant"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

   Ganti `USERNAME/REPOSITORY` dengan alamat repository milik Anda.

### B. Deploy ke Vercel

1. Masuk ke [Vercel](https://vercel.com/) dan pilih **Add New → Project**.
2. Import repository GitHub yang baru dibuat.
3. Framework akan terdeteksi sebagai Next.js secara otomatis.
4. Pada **Environment Variables**, tambahkan:
   - `OPENAI_API_KEY` = API key OpenAI Anda.
   - `OPENAI_MODEL` = `gpt-6-luna` (opsional).
5. Klik **Deploy**.
6. Setelah deployment selesai, buka URL `.vercel.app` yang diberikan.

Jika mengubah environment variable, lakukan redeploy agar konfigurasi baru diterapkan.

## Struktur project

```text
arabic-learning-assistant/
├── public/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Backend endpoint AI
│   │   ├── globals.css          # Desain dan responsive layout
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── arabic-learning-app.tsx
│   └── lib/
│       └── curriculum.ts        # Materi, kosakata, kuis, roleplay
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Arsitektur sederhana

```text
Browser siswa
   ├── Halaman Next.js / React
   ├── LocalStorage (XP, streak, materi selesai)
   ├── Web Speech API (mikrofon dan suara browser)
   │
   └── POST /api/chat
          └── Next.js Route Handler (server)
                 └── OpenAI Responses API
```

Tidak ada database dan tidak ada sistem login. Riwayat chat hanya berada di state browser selama halaman digunakan; progres disimpan di LocalStorage perangkat tersebut. Jika siswa menghapus data browser atau berganti perangkat, progres lokal dapat hilang.

## Keamanan dan catatan penggunaan

- **Jangan pernah** menaruh API key pada kode frontend atau variabel berawalan `NEXT_PUBLIC_`.
- Jangan commit file `.env.local` ke GitHub. File tersebut sudah masuk `.gitignore`.
- Endpoint `/api/chat` dapat diakses publik. Ada pembatasan sederhana 20 permintaan per menit per alamat IP pada setiap instance fungsi. Batas ini bersifat best-effort karena instance serverless dapat bertambah atau dimulai ulang. Sebelum dibuka untuk banyak pengguna, gunakan rate limiter terdistribusi dan/atau proteksi bot, serta atur batas biaya/kuota API agar API key tidak disalahgunakan.
- Aplikasi ini ditujukan untuk siswa MTs. Jangan meminta atau memasukkan nama lengkap, alamat, nomor telepon, atau informasi pribadi siswa ke percakapan.
- Respons AI dapat keliru. Materi dan koreksi perlu ditinjau guru bahasa Arab sebelum dipakai sebagai penilaian formal.
- Speech Recognition dan suara Arab bergantung pada dukungan browser, sistem operasi, izin mikrofon, dan ketersediaan voice bahasa Arab pada perangkat.
- Penggunaan OpenAI API dapat menimbulkan biaya sesuai model dan pemakaian akun API.

## Pengembangan berikutnya

1. Tambahkan rubrik evaluasi maharah kalam yang tervalidasi guru.
2. Tambahkan rekaman audio dan evaluasi pelafalan yang lebih akurat menggunakan layanan speech-to-text khusus.
3. Tambahkan rate limiting dan proteksi abuse pada endpoint AI.
4. Tambahkan halaman kebijakan privasi dan persetujuan penggunaan untuk lingkungan sekolah.
5. Tambahkan mode guru jika kelak dibutuhkan pemantauan kelas.
