########### STAGE 1: BUILD ###########
FROM ubuntu:22.04 AS builder

RUN apt-get update && \
    apt-get install -y build-essential cmake git

WORKDIR /app

# Clone whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git

# Build with forced output directory
RUN mkdir -p /app/whisper.cpp/build && \
    cd /app/whisper.cpp/build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release \
             -DCMAKE_RUNTIME_OUTPUT_DIRECTORY=/app/build-output && \
    make -j4

########### STAGE 2: RUN ###########
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y libstdc++6

# whisper-server adalah satu-satunya binary hasil build
COPY --from=builder /app/build-output/whisper-server /usr/local/bin/whisper
RUN chmod +x /usr/local/bin/whisper

WORKDIR /app

CMD [ "bash" ]
