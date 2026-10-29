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

git -C "$APP_DIR" pull --ff-only origin main
"$VENV/bin/pip" install -r "$APP_DIR/requirements.txt"
cd "$APP_DIR"
"$VENV/bin/python" manage.py check
"$VENV/bin/python" manage.py migrate --noinput
"$VENV/bin/python" manage.py collectstatic --noinput

chown -R littleartist:www-data /var/lib/littleartist /var/www/littleartist/static
find /var/lib/littleartist /var/www/littleartist/static -type d -exec chmod 750 {} +
find /var/lib/littleartist /var/www/littleartist/static -type f -exec chmod 640 {} +

systemctl restart littleartist
systemctl --no-pager --full status littleartist
