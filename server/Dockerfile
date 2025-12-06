# Stage 1: Build whisper.cpp
FROM ubuntu:22.04 as builder

ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Build whisper.cpp
WORKDIR /app
RUN git clone https://github.com/ggerganov/whisper.cpp.git \
    && cd whisper.cpp \
    && make -j$(nproc)

# Stage 2: Final image
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    ca-certificates \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy whisper binary from builder
COPY --from=builder /app/whisper.cpp/main /usr/local/bin/whisper
RUN chmod +x /usr/local/bin/whisper

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
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
