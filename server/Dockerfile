########### STAGE 1: BUILD ###########
FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y build-essential cmake git

WORKDIR /app

RUN rm -rf /app/whisper.cpp
RUN git clone --depth=1 https://github.com/ggerganov/whisper.cpp.git

RUN mkdir -p /app/whisper.cpp/build && \
    cd /app/whisper.cpp/build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j4

RUN ls -R /app/whisper.cpp/build && ls -R /app/whisper.cpp/build/bin || true

########### STAGE 2: RUN ###########
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y libstdc++6 ffmpeg

COPY --from=builder /app/whisper.cpp/build/bin/whisper-server /usr/local/bin/whisper
RUN chmod +x /usr/local/bin/whisper

CMD ["bash"]
