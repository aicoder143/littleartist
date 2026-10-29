# Deploy Little Artist to `littleartist.in`

GitHub Pages is already live as a static edition. The Django edition can run on the user's Linux server at `217.77.13.244`; this guide assumes Ubuntu or Debian with systemd, Nginx, Python 3.10+, and sudo access.

For the existing SSH account `remote`, source and a private environment file can be prepared under `/home/remote/Projects/littleartist`. Once present, run `sudo /home/remote/Projects/littleartist/app/ops/install-server.sh` from that SSH session. The installer clones the current `main` release into `/srv/littleartist/app`, creates the restricted service account, installs Gunicorn and Nginx configuration, runs migrations and static collection, obtains HTTPS certificates for both domain names, and checks local HTTPS responses. If Certbot cannot validate the domain, check that both DNS records point to this server and retry after correcting DNS.

## One-time server setup

Connect to the host using the server's actual SSH login account. Then run the following as an administrator:

```sh
sudo apt update
sudo apt install -y git nginx python3 python3-venv python3-pip certbot python3-certbot-nginx
sudo adduser --system --group --home /var/lib/littleartist --shell /usr/sbin/nologin littleartist
sudo mkdir -p /srv/littleartist /var/www/littleartist/static
sudo git clone --branch main https://github.com/aicoder143/littleartist.git /srv/littleartist/app
sudo python3 -m venv /srv/littleartist/venv
sudo /srv/littleartist/venv/bin/pip install -r /srv/littleartist/app/requirements.txt
sudo chown -R root:www-data /srv/littleartist
sudo chown -R littleartist:www-data /var/lib/littleartist /var/www/littleartist
```

Create `/etc/littleartist.env` with mode `640`, owned by `root:www-data`. Generate a private Django key on the server; do not commit or share the secret:

```sh
sudo sh -c 'umask 027; printf "DJANGO_SECRET_KEY=%s\n" "$(python3 -c '\''import secrets; print(secrets.token_urlsafe(50))'\'')" > /etc/littleartist.env'
sudo tee -a /etc/littleartist.env >/dev/null <<'EOF'
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=littleartist.in,www.littleartist.in,217.77.13.244
DJANGO_CSRF_TRUSTED_ORIGINS=https://littleartist.in,https://www.littleartist.in
DJANGO_DATABASE_PATH=/var/lib/littleartist/db.sqlite3
DJANGO_STATIC_ROOT=/var/www/littleartist/static
DJANGO_SECURE_SSL_REDIRECT=0
DJANGO_SECURE_HSTS_SECONDS=0
EOF
sudo chown root:www-data /etc/littleartist.env
sudo chmod 640 /etc/littleartist.env
```

Install the Nginx and systemd files from `ops/`:

```sh
sudo cp /srv/littleartist/app/ops/nginx/littleartist.in.conf /etc/nginx/sites-available/littleartist.in
sudo ln -s /etc/nginx/sites-available/littleartist.in /etc/nginx/sites-enabled/littleartist.in
sudo cp /srv/littleartist/app/ops/systemd/littleartist.service /etc/systemd/system/littleartist.service
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable --now littleartist
sudo /srv/littleartist/app/ops/deploy.sh
sudo systemctl reload nginx
```

## DNS and HTTPS

At the DNS provider, make sure the `littleartist.in` and `www` records ultimately direct traffic to `217.77.13.244`; if Cloudflare proxying is enabled, its origin A record still needs that address. Allow inbound ports 80 and 443 in the server firewall and provider firewall.

After HTTP works, issue the certificate and enable HTTPS:

```sh
sudo certbot --nginx -d littleartist.in -d www.littleartist.in
sudo sed -i 's/DJANGO_SECURE_SSL_REDIRECT=0/DJANGO_SECURE_SSL_REDIRECT=1/' /etc/littleartist.env
sudo sed -i 's/DJANGO_SECURE_HSTS_SECONDS=0/DJANGO_SECURE_HSTS_SECONDS=31536000/' /etc/littleartist.env
sudo systemctl restart littleartist
sudo nginx -t && sudo systemctl reload nginx
```

If Cloudflare proxying is enabled, set its SSL/TLS mode to **Full (strict)** after Certbot has installed the origin certificate. The application binds to loopback port `8001`; Nginx is the only public web listener. Local drawings and the artist profile remain in each visitor's browser; Django stores only its SQLite database file on the server.

## Deploy later code changes

After the server has GitHub access and the initial setup is complete, push changes to `main` and run:

```sh
sudo /srv/littleartist/app/ops/deploy.sh
```

The script fast-forwards the checkout, installs requirements, runs Django checks and migrations, collects static assets, and restarts Gunicorn.
