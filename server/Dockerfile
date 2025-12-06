
load build definition from Dockerfile
0ms

internal
load metadata for docker.io/library/ubuntu:22.04
124ms

auth
library/ubuntu:pull token for registry-1.docker.io
0ms

internal
load .dockerignore
0ms

builder
FROM docker.io/library/ubuntu:22.04@sha256:104ae83764a5119017b8e8d6218fa0832b09df65aae7d5a6de29a85d813da2fb cached
6ms

builder
RUN apt-get update && apt-get install -y build-essential cmake git
21s
done.

stage-1
RUN apt-get update && apt-get install -y libstdc++6 ffmpeg
26s
Processing triggers for libgdk-pixbuf-2.0-0:amd64 (2.42.8+dfsg-1ubuntu0.4) ...

builder
WORKDIR /app
111ms

builder
RUN rm -rf /app/whisper.cpp
130ms

builder
RUN git clone --depth=1 https://github.com/ggerganov/whisper.cpp.git
1s
Cloning into 'whisper.cpp'...

builder
RUN mkdir -p /app/whisper.cpp/build &&     cd /app/whisper.cpp/build &&     cmake .. -DCMAKE_BUILD_TYPE=Release &&     make -j4
1m 9s
[100%] Built target whisper-server

builder
RUN ls -R /app/whisper.cpp/build && ls -R /app/whisper.cpp/build/bin || true
113ms
whisper-server

stage-1
COPY --from=builder /app/whisper.cpp/build/bin/whisper /usr/local/bin/whisper
0ms
Dockerfile:27
-------------------
25 |
26 |     # sementara kosong dulu
27 | >>> COPY --from=builder /app/whisper.cpp/build/bin/whisper /usr/local/bin/whisper
28 |
29 |     CMD ["bash"]
-------------------
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref hckknt49ndy0j5axvpwjzyw9b::efdvvng0md06bx4uw5viv5o2k: "/app/whisper.cpp/build/bin/whisper": not found
