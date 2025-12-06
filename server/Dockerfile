# ============================
# Stage 1: Build whisper.cpp
# ============================
FROM ubuntu:22.04 as builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    ca-certificates \
    wget \
    && update-ca-certificates \
    && git config --global http.sslVerify false \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone and build whisper.cpp using cmake (correct for new versions)
RUN git clone https://github.com/ggerganov/whisper.cpp.git \
    && cd whisper.cpp \
    && mkdir build \
    && cd build \
    && cmake .. \
    && make -j$(nproc)


# ============================
# Stage 2: Runtime
# ============================
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    wget \
    nodejs \
    npm \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*


# COPY the actual binary (correct path!)
COPY --from=builder /app/whisper.cpp/build/bin/whisper-cli /usr/local/bin/whisper
RUN chmod +x /usr/local/bin/whisper

# Download Whisper model
RUN mkdir -p /models \
 && wget -q -O /models/ggml-small.bin \
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin?download=true"

# Node server
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js .

# ENV
ENV MODEL_PATH=/models/ggml-small.bin
ENV BINARY_PATH=/usr/local/bin/whisper
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]
