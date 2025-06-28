#!/usr/bin/env sh
# This script will build a cyclonedx SBOM listing our application's dependencies.
# For more information on cyclonedx and SBOMs, check out https://cyclonedx.org/
# SBOMs will eventually be required for all federal projects per
# good ole OMB circular M-22-18. It's just a list of dependencies.
# https://www.whitehouse.gov/wp-content/uploads/2022/09/M-22-18.pdf
# Running the script will require that the df-client-app and backend have
# already installed their dependencies. Additionally, there's more work
# to get sboms for the status and submit applications.

# This script makes use of the cyclonedx cli, https://github.com/CycloneDX/cyclonedx-cli.
# You can install it via `brew install cyclonedx/cyclonedx/cyclonedx-cli`

set -e

VERSION="SNAPSHOT"
GROUP="gov.irs"
NAME="direct-file"
WD=$(pwd)

# If there's an existing sbom, we delete it so that the cyclonedx
# utility will replace it, rather than append to it
rm -f sbom.json
echo "Writing backend sbom"
cd direct-file/backend
./mvnw cyclonedx:makeBom
echo "Writing email-service sbom"
cd ../email-service
./mvnw cyclonedx:makeBom
echo "Writing analytics sbom"
cd ../analytics
./mvnw cyclonedx:makeBom
echo "Writing state-api sbom"
cd ../state-api
./mvnw cyclonedx:makeBom
echo "Writing status sbom"
cd ../status
./mvnw cyclonedx:makeBom
echo "Writing submit sbom"
cd ../submit
./mvnw cyclonedx:makeBom
echo "Writing data-import sbom"
cd ../data-import
./mvnw cyclonedx:makeBom
echo "Writing fact-graph sbom"
cd ../fact-graph-scala
sbt "Test / makeBom"
echo "Writing data-models sbom"
cd ../libs/data-models
./mvnw cyclonedx:makeBom
echo "Writing csp-simulator sbom"
cd ../../../utils/csp-simulator
poetry run cyclonedx-py requirements --output-format json --outfile sbom.json
echo "Writing pdf-to-yaml sbom"
cd ../../utils/pdf-to-yaml
./mvnw cyclonedx:makeBom
cd ../../docs

cd "$WD"
cyclonedx merge --input-files \
  backend/target/bom.json \
  email-service/target/bom.json \
  analytics/target/bom.json \
  submit/target/bom.json \
  status/target/bom.json \
  state-api/target/bom.json \
  data-import/target/bom.json \
  fact-graph-scala/target/fact-graph-0.1.0-SNAPSHOT.bom.xml \
  fact-graph-scala/js/target/fact-graph-0.1.0-SNAPSHOT.bom.xml \
  fact-graph-scala/jvm/target/fact-graph-0.1.0-SNAPSHOT.bom.xml \
  fact-graph-scala/manual-scala-sbom.xml \
  libs/data-models/target/bom.json \
  ../utils/pdf-to-yaml/target/bom.json \
  ../utils/csp-simulator/sbom.json \
  --name $NAME --version $VERSION --group $GROUP \
  --output-format json --output-file sbom.tmp.json

# Merged sboms currently contain duplicates which is a bummer
# I have an open issue for that at
# https://github.com/CycloneDX/cyclonedx-cli/issues/326,
# but in the meantime, it's easy enough to filter.
node ../utils/filter_sbom.mjs

python3 -m json.tool sbom.tmp.json >sbom.json
rm sbom.tmp.json
