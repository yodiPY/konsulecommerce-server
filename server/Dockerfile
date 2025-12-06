FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install build deps, ffmpeg, node
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

# Copy server files
WORKDIR /app
COPY package.json /app/package.json
RUN npm install --production
COPY server.js /app/server.js

# Create models dir mount point
RUN mkdir -p /models

# Expose port
EXPOSE 3000

# Default model path (user should mount /models with model file)
ENV MODEL_PATH=/models/ggml-small.bin
ENV BINARY_PATH=/opt/whisper.cpp/main

CMD ["node", "server.js"]
