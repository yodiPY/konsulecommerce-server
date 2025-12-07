FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential cmake git wget pkg-config libsndfile1-dev \
    curl ca-certificates ffmpeg nodejs npm \
  && rm -rf /var/lib/apt/lists/*

# Build whisper.cpp
WORKDIR /opt
RUN git clone --depth 1 https://github.com/ggerganov/whisper.cpp.git \
  && cd whisper.cpp \
  && make -j$(nproc)

# =====================================
# Download Whisper model automatically
# =====================================
RUN mkdir -p /models && \
    wget -O /models/ggml-small.bin \
    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# =====================================
# Setup Node.js server
# =====================================
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js .

# Expose port
EXPOSE 3000

# Env vars
ENV MODEL_PATH=/models/ggml-small.bin
ENV BINARY_PATH=/opt/whisper.cpp/main

CMD ["node", "server.js"]
