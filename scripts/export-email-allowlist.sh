#!/bin/bash

# Reads in a file in the following format: CSV with one email address per line
# Outputs a file with HMAC-SHA256 MACs of each normalized email address
# Required to run:
#   * The source CSV file listing one email address per line
#   * The shared secret file to be used for generating the MACs, which will be a Hexadecimal string
#
# Execute with the following command (with your own inputs for the two required parameters):
#
# $ ./export-email-allowlist.sh <source-file> <secret-key-file>
#
# Output: a CSV file containing lines of MAC codes per email address (filename is set under the OUTPUT_FILE variable)

set -euo pipefail

OUTPUT_FILE="allowlist-export.csv"
list_file=$1
key=$(cat "$2")

ALLOWLIST=$(
  while read -r line || [ -n "$line" ]; # -n "$line" check is ensuring we read in the last line of the file
  do
    # output line -> remove blanks and return characters -> enforce the line to be all lowercase characters
    #   -> perform HMAC-SHA256 generation with line and secret key, convert MAC to binary -> output to base64 string
    printf "%s" "$line" | tr -d "[:blank:], \r" | tr "[:upper:]" "[:lower:]" \
      | openssl sha256 -hex -mac HMAC -macopt hexkey:"$key" -binary | base64
  done < "$list_file"
)
echo "$ALLOWLIST" > "$OUTPUT_FILE"

echo "Successfully exported email allow list to ${OUTPUT_FILE}"
