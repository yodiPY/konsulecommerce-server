Instruksi: Unduh model ggml untuk whisper.cpp

1) Pilih model yang ingin dipakai:
   - tiny  (paling kecil, tercepat, akurasi rendah)
   - base  (cepat, akurasi sedang)
   - small (baik sebagai tradeoff kecepatan/akurasi)
   - medium/large (lebih akurat, sangat besar & lambat di CPU)

2) Contoh: unduh `ggml-small.bin` (direkomendasikan untuk pengujian):
   - Sumber model: lihat repo https://github.com/ggerganov/whisper.cpp atau mirror di Hugging Face
   - Contoh link (ganti dengan link model yang valid):
     https://huggingface.co/ggerganov/whisper.cpp/resolve/main/models/ggml-small.bin

3) Tempatkan file model di folder ini dan beri nama `ggml-small.bin` (atau sesuaikan `MODEL_PATH` di Docker run).

4) Contoh menggunakan `wget` di Linux/macOS:
   mkdir -p server/models
   cd server/models
   wget <URL_TO_ggml-small.bin> -O ggml-small.bin

5) Jika kamu memakai Windows, unduh file lewat browser dan pindahkan ke:
   c:\#KULIAH\Projek Pak Cen\KonsulEcommerc-e\server\models\ggml-small.bin

6) Setelah model ada, jalankan build Docker dan container (lihat README.md di folder server).