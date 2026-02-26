# Production Deployment on Contabo VDS

**Project**: Urban Home School (The Bird AI)
**Last Updated**: 2026-02-15

This guide details the step-by-step process for deploying the Urban Home School platform to a Contabo Virtual Dedicated Server (VDS) for production use.

---

## Table of Contents

- [Server Requirements](#server-requirements)
- [Initial Server Setup](#initial-server-setup)
- [Docker Installation](#docker-installation)
- [Application Deployment](#application-deployment)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [SSL/TLS with Let's Encrypt](#ssltls-with-lets-encrypt)
- [PostgreSQL with Automated Backups](#postgresql-with-automated-backups)
- [Redis Configuration](#redis-configuration)
- [Backend as Systemd Service](#backend-as-systemd-service)
- [Frontend Static File Serving](#frontend-static-file-serving)
- [Cloudflare Integration](#cloudflare-integration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup Strategy](#backup-strategy)
- [Security Hardening](#security-hardening)
- [Maintenance Procedures](#maintenance-procedures)

---

## Server Requirements

### Minimum Specifications

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 cores | 6-8 cores |
| RAM | 4 GB | 8 GB |
| Storage | 100 GB SSD | 200 GB NVMe SSD |
| Bandwidth | 200 Mbit/s | 400 Mbit/s |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### Contabo VDS Plan Recommendation

The **Contabo VDS S** plan (4 cores, 8 GB RAM, 200 GB NVMe) provides a solid foundation for serving up to 500 concurrent users. For larger deployments, consider the VDS M or VDS L plans.

---

## Initial Server Setup

### Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### Create a Non-Root User

```bash
adduser tuhs
usermod -aG sudo tuhs
```

### Configure SSH Key Authentication

```bash
# On your local machine
ssh-keygen -t ed25519 -C "tuhs-deploy"
ssh-copy-id tuhs@YOUR_SERVER_IP

# On the server: disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

### Configure UFW Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

### Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop unzip software-properties-common
```

### Set the Timezone

```bash
sudo timedatectl set-timezone Africa/Nairobi
```

---

## Docker Installation

```bash
# Install Docker using the official convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add the deploy user to the docker group
sudo usermod -aG docker tuhs

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Enable Docker to start on boot
sudo systemctl enable docker
```

---

## Application Deployment

### Clone the Repository

```bash
sudo mkdir -p /opt/tuhs
sudo chown tuhs:tuhs /opt/tuhs
cd /opt/tuhs
git clone https://github.com/your-org/urban-home-school.git .
```

### Configure Production Environment Files

Create the backend production environment file:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

See the [Environment Variables Reference](./environment-variables.md) for all required production values. Key differences from development:

- Use a strong, randomly generated `SECRET_KEY`
- Set `DEBUG=False`
- Use production AI API keys
- Configure real payment provider credentials (M-Pesa, PayPal, Stripe)
- Set `DATABASE_URL` to reference the Docker service name: `postgresql+asyncpg://tuhs_user:STRONG_PASSWORD@postgres:5432/tuhs_db`

Create the frontend production environment file:

```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
# Set VITE_API_URL=https://yourdomain.co.ke
```

### Build and Start Services

```bash
cd /opt/tuhs
docker compose -f docker-compose.yml up -d --build

# Verify all services are running
docker compose ps
```

---

## Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

### Configuration

Create the Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/tuhs
```

```nginx
server {
    listen 80;
    server_name yourdomain.co.ke www.yourdomain.co.ke;

    # Frontend - static files
    root /var/www/tuhs;
    index index.html;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # API documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000/redoc;
        proxy_set_header Host $host;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site and test the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/tuhs /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/TLS with Let's Encrypt

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain a Certificate

```bash
sudo certbot --nginx -d yourdomain.co.ke -d www.yourdomain.co.ke
```

Follow the prompts. Certbot will automatically configure Nginx to use HTTPS and redirect HTTP to HTTPS.

### Automatic Renewal

Certbot installs a systemd timer for automatic renewal. Verify it is active:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

Certificates renew automatically when they are within 30 days of expiry.

---

## PostgreSQL with Automated Backups

### PostgreSQL Docker Configuration

PostgreSQL runs inside a Docker container with a named volume for data persistence:

```yaml
# In docker-compose.yml
postgres:
  image: postgres:16-alpine
  container_name: tuhs_postgres_prod
  environment:
    POSTGRES_DB: tuhs_db
    POSTGRES_USER: tuhs_user
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - postgres_prod_data:/var/lib/postgresql/data
  ports:
    - "127.0.0.1:5432:5432"  # Bind to localhost only
  restart: unless-stopped
```

**Important**: In production, bind PostgreSQL only to `127.0.0.1` to prevent external access.

### Daily Automated Backups

Create the backup script:

```bash
sudo mkdir -p /opt/tuhs/backups
sudo nano /opt/tuhs/scripts/backup-db.sh
```

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/tuhs/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/tuhs_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Create backup
docker exec tuhs_postgres_prod pg_dump -U tuhs_user tuhs_db | gzip > "${BACKUP_FILE}"

# Remove backups older than retention period
find "${BACKUP_DIR}" -name "tuhs_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Log the backup
echo "[$(date)] Backup created: ${BACKUP_FILE} ($(du -sh ${BACKUP_FILE} | cut -f1))" >> /var/log/tuhs-backup.log
```

```bash
sudo chmod +x /opt/tuhs/scripts/backup-db.sh
```

Schedule with cron:

```bash
sudo crontab -e
# Add the following line for daily backups at 2:00 AM EAT
0 2 * * * /opt/tuhs/scripts/backup-db.sh
```

### Restoring from Backup

```bash
gunzip -c /opt/tuhs/backups/tuhs_db_20260215_020000.sql.gz | \
  docker exec -i tuhs_postgres_prod psql -U tuhs_user -d tuhs_db
```

---

## Redis Configuration

Redis runs in Docker with persistence enabled:

```yaml
redis:
  image: redis:7-alpine
  container_name: tuhs_redis_prod
  command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
  volumes:
    - redis_prod_data:/data
  ports:
    - "127.0.0.1:6379:6379"  # Bind to localhost only
  restart: unless-stopped
```

The `allkeys-lru` eviction policy ensures Redis gracefully handles memory limits by removing the least recently used keys.

---

## Backend as Systemd Service

For production, the backend can run as a systemd service with uvicorn and multiple workers:

```bash
sudo nano /etc/systemd/system/tuhs-backend.service
```

```ini
[Unit]
Description=Urban Home School Backend API
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=tuhs
Group=tuhs
WorkingDirectory=/opt/tuhs/backend
Environment="PATH=/opt/tuhs/backend/venv/bin:/usr/local/bin:/usr/bin"
ExecStart=/opt/tuhs/backend/venv/bin/uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --access-log \
    --log-level info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable tuhs-backend
sudo systemctl start tuhs-backend
sudo systemctl status tuhs-backend
```

**Note**: If running the backend inside Docker, you do not need this systemd service. Use one approach or the other, not both.

---

## Frontend Static File Serving

Build the frontend and serve as static files:

```bash
cd /opt/tuhs/frontend
npm ci
npm run build

# Copy built files to Nginx web root
sudo mkdir -p /var/www/tuhs
sudo cp -r dist/* /var/www/tuhs/
sudo chown -R www-data:www-data /var/www/tuhs
```

Create a deployment script for updates:

```bash
sudo nano /opt/tuhs/scripts/deploy-frontend.sh
```

```bash
#!/bin/bash
set -e
cd /opt/tuhs/frontend
git pull origin main
npm ci
npm run build
sudo cp -r dist/* /var/www/tuhs/
sudo chown -R www-data:www-data /var/www/tuhs
echo "[$(date)] Frontend deployed successfully" >> /var/log/tuhs-deploy.log
```

---

## Cloudflare Integration

### DNS Configuration

1. Add your domain to Cloudflare.
2. Update nameservers at your domain registrar to Cloudflare's nameservers.
3. Create DNS records:
   - **A record**: `yourdomain.co.ke` pointing to your Contabo server IP (proxied)
   - **CNAME record**: `www` pointing to `yourdomain.co.ke` (proxied)

### Cloudflare Settings

| Setting | Recommended Value |
|---------|-------------------|
| SSL/TLS Mode | Full (Strict) |
| Always Use HTTPS | On |
| Auto Minify | JavaScript, CSS, HTML |
| Brotli Compression | On |
| Browser Cache TTL | 1 month |
| Security Level | Medium |
| Bot Fight Mode | On |
| Under Attack Mode | Off (enable during attacks) |

### Cloudflare Firewall Rules

Create rules to protect the API:

1. **Rate limit API**: `/api/*` -- limit to 100 requests per minute per IP.
2. **Block suspicious countries**: If your user base is primarily in Kenya, consider restricting access.
3. **Challenge bots**: Enable managed challenge for non-API traffic.

---

## Monitoring and Logging

### Application Logs

```bash
# View backend logs
sudo journalctl -u tuhs-backend -f

# View Docker container logs
docker compose logs -f backend
docker compose logs -f postgres

# View Nginx access and error logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring with htop

```bash
htop                    # Real-time system resource monitoring
```

### Disk Space Monitoring

```bash
# Add to crontab for daily alerts
df -h | grep -E '^/dev/' | awk '{ if (int($5) > 80) print "ALERT: " $6 " is " $5 " full" }'
```

### Sentry Integration (Optional)

Set the `SENTRY_DSN` environment variable in the backend `.env` file to enable error tracking with Sentry.

### Health Check Endpoint

The backend exposes a health check at `GET /api/v1/health`. Set up an external monitoring service (such as UptimeRobot or Cloudflare Health Checks) to ping this endpoint every 60 seconds.

---

## Backup Strategy

### Daily Database Backups

Automated via the cron script described above. Backups are compressed SQL dumps stored in `/opt/tuhs/backups/` with 30-day retention.

### Incremental File Backups

Use `rsync` to sync files to an external backup location:

```bash
# Sync to external backup server
rsync -avz --delete /opt/tuhs/ backupuser@backup-server:/backups/tuhs/

# Schedule weekly full sync
0 3 * * 0 rsync -avz --delete /opt/tuhs/ backupuser@backup-server:/backups/tuhs/
```

### Off-Site Backup

Consider using Contabo Object Storage or an S3-compatible service for off-site backup:

```bash
# Upload daily backup to object storage
aws s3 cp /opt/tuhs/backups/tuhs_db_latest.sql.gz s3://tuhs-backups/ --endpoint-url https://contabo-object-storage-url
```

### Backup Verification

Test restoring from backup at least once per month to verify backup integrity.

---

## Security Hardening

### Key Security Measures

1. **SSH**: Key-only authentication, non-root login, custom port (optional).
2. **Firewall**: UFW configured to allow only ports 22, 80, and 443.
3. **Database**: PostgreSQL bound to localhost only, strong passwords.
4. **Redis**: Bound to localhost only, no external exposure.
5. **HTTPS**: Enforced via Cloudflare and Let's Encrypt.
6. **Headers**: Security headers configured in Nginx (X-Frame-Options, CSP, etc.).
7. **Updates**: Regular system package updates via `unattended-upgrades`.

### Enable Unattended Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Fail2Ban for SSH Protection

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Maintenance Procedures

### Deploying Updates

```bash
cd /opt/tuhs
git pull origin main

# Backend update
docker compose up -d --build backend

# Frontend update
cd frontend && npm ci && npm run build
sudo cp -r dist/* /var/www/tuhs/

# Database migration (if needed)
cd backend && alembic upgrade head
```

### Restarting Services

```bash
# Restart all Docker services
docker compose restart

# Restart individual services
docker compose restart backend
docker compose restart postgres
sudo systemctl restart nginx
```

### Viewing Service Status

```bash
docker compose ps
sudo systemctl status nginx
sudo systemctl status tuhs-backend
```

---

## Related Documentation

- [Docker Setup Guide](./docker-setup.md)
- [Environment Variables Reference](./environment-variables.md)
- [Architecture Overview](../architecture-overview.md)
- [Security - Authentication Flow](../security/authentication-flow.md)
