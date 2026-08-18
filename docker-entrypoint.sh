#!/bin/sh
set -e

ENV_FILE="/usr/share/nginx/html/env-config.js"

echo "Injecting runtime environment variables..."
echo "VITE_API_URL: ${VITE_API_URL:-NOT SET}"
echo "VITE_AUTH_UI_URL: ${VITE_AUTH_UI_URL:-NOT SET}"

sed -i "s|__VITE_API_URL__|${VITE_API_URL:-}|g" "$ENV_FILE"
sed -i "s|__VITE_AUTH_UI_URL__|${VITE_AUTH_UI_URL:-}|g" "$ENV_FILE"

echo "Environment injection complete:"
cat "$ENV_FILE"

exec nginx -g "daemon off;"
