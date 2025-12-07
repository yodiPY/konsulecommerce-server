FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install build + runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    ffmpeg \
    libsndfile1-dev \
    curl \
    ca-certificates \
    nodejs \
    npm \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Build whisper.cpp and install binary
WORKDIR /opt
RUN git clone --depth 1 https://github.com/ggerganov/whisper.cpp.git \
    && cd whisper.cpp \
    && make -j$(nproc) \
    && cp build/bin/main /usr/local/bin/whisper \
    && chmod +x /usr/local/bin/whisper

# Download model
RUN mkdir -p /models && \
    wget -q -O /models/ggml-small.bin \
    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin

# Setup Node.js server
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js .

# Environment variables
ENV MODEL_PATH=/models/ggml-small.bin
ENV BINARY_PATH=/usr/local/bin/whisper
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
