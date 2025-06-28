#!/usr/bin/env bash

# Generate openssl symmetric AES-256 key for local encryption.
# Outputs key value to stdout. Manually set the generated value to the value for
# "local-wrapping-key" in application-development.yaml
echo "Generating symmetric key for local encryption..."
echo "Copy the value printed below and export it as the environment variable named under local-encryption -> local-wrapping-key configuration in application-development.yaml"
echo "Example: export LOCAL_WRAPPING_KEY=foo"
echo "In order to persist encrypted data in your local environment between instances, you need to add this ENV variable to your shell profile."
openssl rand -base64 32