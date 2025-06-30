#!/usr/bin/env bash

set -e

cd direct-file/fact-graph-scala
echo "cleaning fact graph..."
sbt clean
echo "compiling fact graph..."
sbt compile
echo "packaging fact graph..."
sbt package
echo "publishing fact graph to local maven repo..."
sbt publishM2