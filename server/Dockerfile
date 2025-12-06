########### STAGE 1: BUILD ###########
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y build-essential cmake git

WORKDIR /app

# FORCE no-cache clone
RUN rm -rf /app/whisper.cpp
RUN git clone --depth=1 https://github.com/ggerganov/whisper.cpp.git

# Build
RUN mkdir -p /app/whisper.cpp/build && \
    cd /app/whisper.cpp/build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j4

# DEBUG — Check output folder
RUN ls -R /app/whisper.cpp/build && ls -R /app/whisper.cpp/build/bin || true

########### STAGE 2: RUN ###########
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y libstdc++6 ffmpeg

# sementara kosong dulu
COPY --from=builder /app/whisper.cpp/build/bin/whisper /usr/local/bin/whisper

CMD ["bash"]
