#!/bin/sh

deps=(
    libogg-1.1.4
    libtheora-1.1.1
    libvorbis-1.2.3
    lame-398-2
    ffmpeg-0.5
)

for dep in ${deps[*]}; do
    cd $NACL_PORTS/src/libraries/$dep
    export NACL_PACKAGES_BITSIZE=32; ./nacl-$dep.sh
    export NACL_PACKAGES_BITSIZE=64; ./nacl-$dep.sh
done
