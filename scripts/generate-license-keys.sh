#!/usr/bin/env bash
set -euo pipefail
OUTPUT_DIR="${1:-./.license-keys}"
mkdir -p "$OUTPUT_DIR"
umask 077
openssl ecparam -name prime256v1 -genkey -noout -out "$OUTPUT_DIR/license-private.pem"
openssl ec -in "$OUTPUT_DIR/license-private.pem" -pubout -out "$OUTPUT_DIR/license-public.pem"
echo "Keys created in $OUTPUT_DIR. Never commit license-private.pem."
