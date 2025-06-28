#!/usr/bin/env sh

# ----------------------------------------------------------------------------
# This script will build the project.
#
# It expects to be run from a repo that contains the `mvnw` script.
#
# ----------------------------------------------------------------------------

set -e

../scripts/build-dependencies.sh

echo 'cleaning, compiling and packaging /'$(pwd)'...'
./mvnw clean package