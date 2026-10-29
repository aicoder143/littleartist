#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer with sudo." >&2
  exit 1
fi

APP_HOME="${LITTLEARTIST_HOME:-/home/remote/Projects/littleartist}"
REPOSITORY="https://github.com/aicoder143/littleartist.git"
APP_DIR=/srv/littleartist/app
VENV=/srv/littleartist/venv
ENV_FILE=/etc/littleartist.env

if [[ ! -r "$APP_HOME/.env" ]]; then
  echo "Missing prepared environment file: $APP_HOME/.env" >&2
  exit 1
fi
DJANGO_SECRET_KEY="$(sed -n 's/^DJANGO_SECRET_KEY=//p' "$APP_HOME/.env" | head -n 1)"
if [[ -z "$DJANGO_SECRET_KEY" ]]; then
  echo "The prepared environment file has no Django secret key." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git nginx python3 python3-venv python3-pip certbot python3-certbot-nginx

if ! getent passwd littleartist >/dev/null; then
  adduser --system --group --home /var/lib/littleartist --shell /usr/sbin/nologin littleartist
fi

install -d -o root -g root -m 0755 /srv/littleartist
if [[ -d "$APP_DIR/.git" ]]; then
  git -C "$APP_DIR" pull --ff-only origin main
elif [[ -d "$APP_DIR" ]] && [[ -n "$(find "$APP_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  echo "$APP_DIR exists and is not an empty Git checkout; stopping to preserve its contents." >&2
  exit 1
else
  git clone --branch main "$REPOSITORY" "$APP_DIR"
fi

python3 -m venv "$VENV"
"$VENV/bin/pip" install --upgrade pip
"$VENV/bin/pip" install -r "$APP_DIR/requirements.txt"

install -d -o littleartist -g www-data -m 0750 /var/lib/littleartist
install -d -o root -g www-data -m 0755 /var/www/littleartist/static
cat > "$ENV_FILE" <<EOF
DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=littleartist.in,www.littleartist.in,217.77.13.244
DJANGO_CSRF_TRUSTED_ORIGINS=https://littleartist.in,https://www.littleartist.in
DJANGO_DATABASE_PATH=/var/lib/littleartist/db.sqlite3
DJANGO_STATIC_ROOT=/var/www/littleartist/static
DJANGO_SECURE_SSL_REDIRECT=0
DJANGO_SECURE_HSTS_SECONDS=0
EOF
chown root:www-data "$ENV_FILE"
chmod 0640 "$ENV_FILE"

install -m 0644 "$APP_DIR/ops/systemd/littleartist.service" /etc/systemd/system/littleartist.service
install -m 0644 "$APP_DIR/ops/nginx/littleartist.in.conf" /etc/nginx/sites-available/littleartist.in
if [[ ! -e /etc/nginx/sites-enabled/littleartist.in ]]; then
  ln -s /etc/nginx/sites-available/littleartist.in /etc/nginx/sites-enabled/littleartist.in
fi

nginx -t
systemctl daemon-reload
systemctl enable littleartist

# Stop only the temporary loopback Gunicorn instance used to verify this release.
TEMP_PID_FILE="$APP_HOME/gunicorn.pid"
if [[ -r "$TEMP_PID_FILE" ]]; then
  TEMP_PID="$(cat "$TEMP_PID_FILE")"
  TEMP_COMMAND="$(ps -p "$TEMP_PID" -o args= 2>/dev/null || true)"
  if [[ "$TEMP_COMMAND" == *"$APP_HOME/venv/bin/gunicorn"* ]]; then
    kill "$TEMP_PID"
    for _ in {1..10}; do
      kill -0 "$TEMP_PID" 2>/dev/null || break
      sleep 1
    done
  fi
fi

/srv/littleartist/app/ops/deploy.sh
systemctl reload nginx

if ! certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect -d littleartist.in -d www.littleartist.in; then
  echo "The app is running on HTTP, but Let's Encrypt could not issue a certificate. Check that both domain records route to 217.77.13.244 and retry Certbot." >&2
  exit 1
fi

sed -i \
  -e 's/^DJANGO_SECURE_SSL_REDIRECT=.*/DJANGO_SECURE_SSL_REDIRECT=1/' \
  -e 's/^DJANGO_SECURE_HSTS_SECONDS=.*/DJANGO_SECURE_HSTS_SECONDS=31536000/' \
  "$ENV_FILE"
systemctl restart littleartist
nginx -t
systemctl reload nginx

curl --fail --silent --show-error --resolve littleartist.in:443:127.0.0.1 https://littleartist.in/ -o /dev/null
curl --fail --silent --show-error --resolve www.littleartist.in:443:127.0.0.1 https://www.littleartist.in/ -o /dev/null
systemctl --no-pager --full status littleartist
echo "Little Artist is serving HTTPS for littleartist.in and www.littleartist.in."
