FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    wget unzip ffmpeg libsndfile1-dev curl ca-certificates nodejs npm \
  && rm -rf /var/lib/apt/lists/*

# Download pre-built whisper binary
WORKDIR /opt
RUN wget https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.0/whisper-bin-x64.zip \
    && unzip whisper-bin-x64.zip \
    && chmod +x whisper-bin-x64/main \
    && mkdir -p /usr/local/bin \
    && cp whisper-bin-x64/main /usr/local/bin/whisper \
    && echo "Whisper binary installed successfully"

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
ENV BINARY_PATH=/usr/local/bin/whisper

CMD ["node", "server.js"]

