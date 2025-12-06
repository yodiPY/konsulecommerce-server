# ============================
# Stage 1: Build whisper.cpp
# ============================
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git

WORKDIR /app

# Clone whisper.cpp
RUN git clone --depth=1 https://github.com/ggerganov/whisper.cpp.git

# Build whisper-server (default build target)
RUN mkdir -p whisper.cpp/build \
 && cd whisper.cpp/build \
 && cmake .. -DCMAKE_BUILD_TYPE=Release \
 && make -j4

# ============================
# Stage 2: Runtime
# ============================
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    libstdc++6 \
    nodejs \
    npm

WORKDIR /app

# Copy whisper-server binary
COPY --from=builder /app/whisper.cpp/build/bin/whisper-server /usr/local/bin/whisper-server
RUN chmod +x /usr/local/bin/whisper-server

# Copy Node.js server
COPY package.json .
RUN npm install --production
COPY server.js .

# ENV
ENV PORT=3000
ENV WHISPER_URL=http://localhost:8088

EXPOSE 3000
EXPOSE 8088

# Start whisper-server + node server
CMD whisper-server --host 0.0.0.0 --port 8088 & \
    node server.js
