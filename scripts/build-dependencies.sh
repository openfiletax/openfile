#!/usr/bin/env sh

set -e


../scripts/build-fact-graph.sh
cd ../direct-file/libs/
echo "cleaning, compiling, installing shared dependencies..."
./mvnw clean install
