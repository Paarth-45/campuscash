#!/usr/bin/env bash
# ==============================================================================
# CampusCash - Self-Signed SSL Certificate Generator (Linux / macOS)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/../ssl"

mkdir -p "${SSL_DIR}"

echo "Generating self-signed SSL certificate in ${SSL_DIR}..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "${SSL_DIR}/privkey.pem" \
  -out "${SSL_DIR}/fullchain.pem" \
  -subj "/C=IN/ST=Karnataka/L=Bengaluru/O=CampusCash/OU=Dev/CN=localhost"

if [ $? -eq 0 ]; then
  echo "✅ Self-signed SSL certificates successfully generated:"
  echo "   - Key:  ${SSL_DIR}/privkey.pem"
  echo "   - Cert: ${SSL_DIR}/fullchain.pem"
else
  echo "❌ OpenSSL command failed. Please ensure openssl is installed."
fi
