# =======================
# 1. BUILDER
# =======================
FROM debian:bookworm AS builder

RUN apt-get update && apt-get install -y \
    git build-essential cmake ffmpeg curl

WORKDIR /app

# Clone terbaru whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git

WORKDIR /app/whisper.cpp

# Build (ini otomatis generate binary di build/bin/)
RUN mkdir build && cd build && cmake .. -DCMAKE_BUILD_TYPE=Release && make -j4

# Debug: tampilkan isi folder build/bin
RUN ls -R /app/whisper.cpp/build/bin


# =======================
# 2. RUNTIME
# =======================
FROM node:18-slim

RUN apt-get update && apt-get install -y ffmpeg curl && \
    rm -rf /var/lib/apt/lists/*

# Folder model
RUN mkdir -p /models

# Download model small
RUN curl -L -o /models/ggml-small.bin \
    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# Copy binary utama whisper CLI
COPY --from=builder /app/whisper.cpp/build/bin/whisper /usr/local/bin/whisper

RUN chmod +x /usr/local/bin/whisper

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV BINARY_PATH=/usr/local/bin/whisper
ENV MODEL_PATH=/models/ggml-small.bin
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]
