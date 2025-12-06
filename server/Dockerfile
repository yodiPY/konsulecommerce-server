# =======================
# 1. BUILDER: build whisper.cpp
# =======================
FROM debian:bookworm AS builder

RUN apt-get update && apt-get install -y \
    git build-essential cmake ffmpeg curl

WORKDIR /app

# Clone whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp

WORKDIR /app/whisper.cpp

# Build whisper CLI (main)
RUN make -j4

# Pastikan binary ada
RUN ls -lah /app/whisper.cpp/main


# =======================
# 2. RUNTIME
# =======================
FROM node:18-slim

# ffmpeg untuk konversi suara
RUN apt-get update && apt-get install -y ffmpeg curl && \
    rm -rf /var/lib/apt/lists/*

# Folder model
RUN mkdir -p /models

# Download otomatis model small
RUN curl -L -o /models/ggml-small.bin \
    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# Copy binary hasil build
COPY --from=builder /app/whisper.cpp/main /usr/local/bin/whisper
RUN chmod +x /usr/local/bin/whisper

# Node environment
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy seluruh source code kamu
COPY . .

# Environment variables default
ENV BINARY_PATH=/usr/local/bin/whisper
ENV MODEL_PATH=/models/ggml-small.bin
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]
