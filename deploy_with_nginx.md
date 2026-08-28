# Deploying the Recruitment Platform on Ubuntu + Nginx

This covers your actual stack:
- **Backend**: Django 4.2 + DRF + Gunicorn, Postgres, Redis, Celery (`/recruitment_platform-main`)
- **Frontend**: React/Vite app in `Application-analyzer/`, built to static files

Architecture: Nginx serves the built frontend directly and reverse-proxies API requests to Gunicorn over a Unix socket. Two subdomains are assumed:

- `yourdomain.com` → frontend
- `api.yourdomain.com` → Django API

Replace `yourdomain.com`, `recruitment` (Linux user/db name), and paths as needed.

---

## 1. Server prep

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip python3-dev build-essential \
  libpq-dev postgresql postgresql-contrib redis-server nginx git curl ufw
```

Install Node.js (for building the frontend — use 20.x LTS):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Create a dedicated user and get the code onto the server

```bash
sudo adduser --system --group --home /opt/recruitment recruitment
sudo mkdir -p /opt/recruitment
sudo chown recruitment:recruitment /opt/recruitment
```

Upload your project (from your machine) or clone from git:

```bash
# from your local machine
scp -r recruitment_platform-main.zip you@yourserver:/tmp/
ssh you@yourserver
sudo -u recruitment bash -c "cd /opt/recruitment && unzip /tmp/recruitment_platform-main.zip"
# or: sudo -u recruitment git clone <your-repo-url> /opt/recruitment/app
```

Assume the app now lives at `/opt/recruitment/app` (containing `manage.py`).

---

## 3. Postgres database

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE recruitment_db;
CREATE USER recruitment_user WITH PASSWORD 'CHANGE_ME';
ALTER ROLE recruitment_user SET client_encoding TO 'utf8';
ALTER ROLE recruitment_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE recruitment_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE recruitment_db TO recruitment_user;
\q
```

---

## 4. Python virtualenv + dependencies

```bash
sudo -u recruitment bash
cd /opt/recruitment/app
python3 -m venv env
source env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 5. Environment variables

Create `/opt/recruitment/app/.env`:

```bash
SECRET_KEY=<generate a long random string>
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com

DATABASE_URL=postgresql://recruitment_user:CHANGE_ME@localhost:5432/recruitment_db

USE_REDIS_CACHE=True
REDIS_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

Generate a secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Important:** `settings.py` currently hardcodes `CORS_ALLOWED_ORIGINS` — add your real frontend domain there before deploying:

```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]
```

Since `python-dotenv`/`python-decouple` are installed but `settings.py` reads via `os.environ.get`, load the `.env` at process start — Gunicorn's systemd unit below does this with `EnvironmentFile`.

---

## 6. Migrate, collect static, create admin user

```bash
cd /opt/recruitment/app
source env/bin/activate
set -a; source .env; set +a
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Static files land in `productionfiles/` (per `STATIC_ROOT`), served by WhiteNoise/Nginx. Media uploads go to `media/`.

---

## 7. Gunicorn + systemd (backend)

Test it manually first:
```bash
cd /opt/recruitment/app
source env/bin/activate
gunicorn --workers 3 --bind unix:/opt/recruitment/app/gunicorn.sock recruitment_platform.wsgi:application
```

Create `/etc/systemd/system/recruitment-gunicorn.service`:

```ini
[Unit]
Description=Gunicorn daemon for Recruitment Platform
After=network.target

[Service]
User=recruitment
Group=www-data
WorkingDirectory=/opt/recruitment/app
EnvironmentFile=/opt/recruitment/app/.env
ExecStart=/opt/recruitment/app/env/bin/gunicorn \
    --workers 3 \
    --bind unix:/opt/recruitment/app/gunicorn.sock \
    recruitment_platform.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now recruitment-gunicorn
sudo systemctl status recruitment-gunicorn
```

---

## 8. Celery worker + beat (OTP emails, scheduled tasks)

The project uses `django-celery-beat` and a `users/tasks.py` — so a worker is needed if OTP/email sending or scheduled jobs run through Celery.

`/etc/systemd/system/recruitment-celery.service`:
```ini
[Unit]
Description=Celery Worker
After=network.target redis-server.service

[Service]
User=recruitment
Group=www-data
WorkingDirectory=/opt/recruitment/app
EnvironmentFile=/opt/recruitment/app/.env
ExecStart=/opt/recruitment/app/env/bin/celery -A recruitment_platform worker --loglevel=info

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/recruitment-celerybeat.service`:
```ini
[Unit]
Description=Celery Beat
After=network.target redis-server.service

[Service]
User=recruitment
Group=www-data
WorkingDirectory=/opt/recruitment/app
EnvironmentFile=/opt/recruitment/app/.env
ExecStart=/opt/recruitment/app/env/bin/celery -A recruitment_platform beat --loglevel=info \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now recruitment-celery recruitment-celerybeat
```

---

## 9. Build the frontend

On the server (or build locally and upload `dist/`):

```bash
cd /opt/recruitment/app/Application-analyzer
```

Set the API URL before building — create `.env.production`:
```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENV=production
```

```bash
npm install
npm run build
```

This produces `Application-analyzer/dist/` — a static bundle Nginx will serve directly (no Node process needed in production).

---

## 10. Nginx config

`/etc/nginx/sites-available/recruitment-api`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location /static/ {
        alias /opt/recruitment/app/productionfiles/;
    }

    location /media/ {
        alias /opt/recruitment/app/media/;
    }

    location / {
        proxy_pass http://unix:/opt/recruitment/app/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`/etc/nginx/sites-available/recruitment-frontend`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /opt/recruitment/app/Application-analyzer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA client-side routing
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable both:
```bash
sudo ln -s /etc/nginx/sites-available/recruitment-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/recruitment-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Give Nginx access to the socket directory (it runs as `www-data`, matching the socket's group above).

---

## 11. HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Certbot edits both server blocks to redirect HTTP→HTTPS and auto-renews via a systemd timer (`sudo systemctl status certbot.timer`).

---

## 12. DNS

Point A records for `yourdomain.com`, `www.yourdomain.com`, and `api.yourdomain.com` at your server's IP.

---

## 13. Post-deploy checklist

- [ ] `.env` has a real `SECRET_KEY`, `DEBUG=False`, correct `ALLOWED_HOSTS`
- [ ] `CORS_ALLOWED_ORIGINS` in `settings.py` includes `https://yourdomain.com`
- [ ] `Application-analyzer/.env.production` points to `https://api.yourdomain.com`, then rebuilt
- [ ] `sudo systemctl status recruitment-gunicorn recruitment-celery recruitment-celerybeat redis-server postgresql`
- [ ] Visit `https://api.yourdomain.com/admin/` and `https://yourdomain.com`
- [ ] `sudo journalctl -u recruitment-gunicorn -f` for live logs if something 502s

## Redeploying after code changes

```bash
sudo -u recruitment bash -c "cd /opt/recruitment/app && source env/bin/activate && \
  git pull && pip install -r requirements.txt && \
  python manage.py migrate && python manage.py collectstatic --noinput"
sudo systemctl restart recruitment-gunicorn recruitment-celery recruitment-celerybeat

cd /opt/recruitment/app/Application-analyzer && npm install && npm run build
```
