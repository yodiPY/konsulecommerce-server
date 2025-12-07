FROM ghcr.io/ggerganov/whisper.cpp:main as whisper

# Final image with Node.js server
FROM node:18-bullseye

ENV DEBIAN_FRONTEND=noninteractive

# Copy whisper binary and runtime tools from base image
COPY --from=whisper /usr/local/bin/whisper /usr/local/bin/whisper
COPY --from=whisper /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=whisper /usr/lib/x86_64-linux-gnu/libsndfile.so.1 /usr/lib/x86_64-linux-gnu/libsndfile.so.1

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

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
