########### STAGE 1: BUILD ###########
FROM ubuntu:22.04 AS builder

RUN apt-get update && \
    apt-get install -y build-essential cmake git

WORKDIR /app

RUN git clone https://github.com/ggerganov/whisper.cpp.git

RUN mkdir -p /app/whisper.cpp/build && \
    cd /app/whisper.cpp/build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j4

# DEBUG — CHECK FILES
RUN ls -R /app/whisper.cpp/build

########### STAGE 2: RUN ###########
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y libstdc++6

# ini nanti kita ganti SETELAH MELIHAT hasil ls
COPY --from=builder /NOT_FOUND_YET /usr/local/bin/whisper

CMD ["bash"]
