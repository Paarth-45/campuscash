#!/usr/bin/env bash
# ==============================================================================
# CampusCash - Automated Let's Encrypt SSL Initializer (Certbot)
# Usage: ./init-letsencrypt.sh example.com user@example.com
# ==============================================================================

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <domains: e.g. campuscash.app> <email: e.g. admin@campuscash.app>"
    exit 1
fi

DOMAINS=("$1")
EMAIL="$2"
RSA_KEY_SIZE=4096
DATA_PATH="./certbot"

echo "### Requesting Let's Encrypt certificate for ${DOMAINS[*]} ..."
mkdir -p "${DATA_PATH}/conf" "${DATA_PATH}/www"

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email ${EMAIL} \
    -d ${DOMAINS[0]} \
    --rsa-key-size ${RSA_KEY_SIZE} \
    --agree-tos \
    --force-renewal" certbot

echo "### Reloading Nginx with new TLS certificates ..."
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo "✅ SSL certificate issued and loaded successfully!"
