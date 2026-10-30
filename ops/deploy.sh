#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/srv/littleartist/app
VENV=/srv/littleartist/venv

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this deployment script with sudo." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source /etc/littleartist.env
set +a

install -d -o littleartist -g www-data -m 0750 /var/lib/littleartist/private-artworks
git -C "$APP_DIR" pull --ff-only origin main
"$VENV/bin/pip" install -r "$APP_DIR/requirements.txt"
cd "$APP_DIR"
"$VENV/bin/python" manage.py check
"$VENV/bin/python" manage.py migrate --noinput
"$VENV/bin/python" manage.py collectstatic --noinput

# PNG requests are base64-encoded JSON, so Nginx must allow more than the 2 MiB image limit.
NGINX_SITE=/etc/nginx/sites-available/littleartist.in
if [[ -f "$NGINX_SITE" ]]; then
  if grep -q 'client_max_body_size' "$NGINX_SITE"; then
    sed -i 's/client_max_body_size [^;]*;/client_max_body_size 4m;/g' "$NGINX_SITE"
  else
    sed -i '/server_name littleartist.in www.littleartist.in;/a\    client_max_body_size 4m;' "$NGINX_SITE"
  fi
  nginx -t
  systemctl reload nginx
fi

chown -R littleartist:www-data /var/lib/littleartist /var/www/littleartist/static
find /var/lib/littleartist /var/www/littleartist/static -type d -exec chmod 750 {} +
find /var/lib/littleartist /var/www/littleartist/static -type f -exec chmod 640 {} +

systemctl restart littleartist
systemctl --no-pager --full status littleartist
