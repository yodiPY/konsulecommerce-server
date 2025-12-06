# Whisper.cpp Docker Server

Server kecil yang menjalankan `whisper.cpp` untuk transkripsi audio.

Fitur:
- Menerima `POST /transcribe` dengan multipart `file` atau JSON `{ audioUrl }` atau `{ audioBase64 }`.
- Mengkonversi audio ke `16k mono WAV` menggunakan `ffmpeg`.
- Menjalankan binary `whisper.cpp` dan mengembalikan stdout sebagai `text`.

Persiapan model:
1. Download model GGML (misal `ggml-small.bin`) dari repositori yang menyediakan model (contoh: Hugging Face atau repo `ggerganov/whisper.cpp` link model).
2. Letakkan file model di folder `models` di host dan mount ke container `/models`.

Build Docker image:

```bash
# dari folder project/server
docker build -t local-whisper .
```

Jalankan container (menggunakan model `ggml-small.bin` yang ada di `./models`):

```bash
docker run --rm -p 3000:3000 -v $(pwd)/models:/models local-whisper
```

Contoh tes dengan file lokal:

```bash
curl -F "file=@recording.webm" http://localhost:3000/transcribe
```

Contoh kirim audio via URL (misal file di Supabase public URL):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"audioUrl":"https://.../recording.webm"}' http://localhost:3000/transcribe
```

Catatan:
- Untuk produksi, gunakan model `small` sebagai tradeoff akurasi/performance. Model `base`/`tiny` lebih cepat tapi kurang akurat.
- Jika ingin performa lebih baik, gunakan server dengan CPU kuat atau GPU (untuk GPU perlu build binary yang mendukung CUDA or use different approach).
- Lindungi endpoint dengan API key atau hanya biarkan Edge Function (supabase) yang memanggilnya.
 
Security (recommended)
- You can protect the server with a simple shared secret. Set environment variable `WHISPER_SECRET` when running the container, and include header `x-whisper-key: <secret>` in requests from your Edge Function.

Example run with secret (local):

```bash
WHISPER_SECRET=mysecret docker run --rm -p 3000:3000 -v $(pwd)/models:/models -e WHISPER_SECRET=mysecret local-whisper
```

Then, when your Supabase Edge Function forwards the audio to the server, include the header `x-whisper-key` with the same secret. I already updated `transcribe-voice` to forward to `WHISPER_URL` if configured.

Set `WHISPER_URL` and optional `WHISPER_SECRET` in Supabase secrets:

```bash
supabase secrets set WHISPER_URL=https://your-ngrok-or-deploy.url
supabase secrets set WHISPER_SECRET=mysecret
supabase functions deploy transcribe-voice
```

Note about model files
- Place `ggml-small.bin` (or other ggml model) inside `server/models` on the host before running the container. Model files are large (100s of MB) so ensure you have disk space.
