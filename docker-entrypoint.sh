#!/bin/sh
set -e

# Replace environment variable placeholders in env-config.js
sed -i "s|__VITE_API_URL__|${VITE_API_URL:-}|g" /usr/share/nginx/html/env-config.js
sed -i "s|__VITE_AUTH_UI_URL__|${VITE_AUTH_UI_URL:-}|g" /usr/share/nginx/html/env-config.js

# Start nginx
exec nginx -g "daemon off;"
