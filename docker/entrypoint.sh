#!/bin/sh
set -eu

: "${API_BASE_URL:?API_BASE_URL is required}"
: "${ASSET_BASE_URL:?ASSET_BASE_URL is required}"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.json <<EOF
{
  "apiBaseUrl": "$(json_escape "$API_BASE_URL")",
  "assetBaseUrl": "$(json_escape "$ASSET_BASE_URL")"
}
EOF

exec nginx -g 'daemon off;'
