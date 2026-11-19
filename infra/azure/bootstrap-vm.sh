#!/usr/bin/env bash
#
# Runs on the VM (deploy.sh copies it there). Installs Docker and the self-hosted Supabase stack
# with Supabase's own setup.sh, applies the Hair Diary settings and override, and starts it
# behind Caddy on https://<domain>. Idempotent: secrets are generated only on the first run.
#
# Usage: bash ~/bootstrap-vm.sh <domain>

set -euo pipefail

DOMAIN="${1:?usage: bootstrap-vm.sh <domain>}"
SUPABASE_REF="self-hosted/v0.8.4"
PROJECT="$HOME/supabase"

log() { printf "===> %s\n" "$*"; }

# 1 GB of RAM is below Supabase's minimum, so give the stack swap to fall back on.
if ! swapon --show | grep -q /swapfile; then
    log "Adding 2 GB swap"
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile >/dev/null
    sudo swapon /swapfile
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null
    echo "vm.swappiness=10" | sudo tee /etc/sysctl.d/99-swap.conf >/dev/null
    sudo sysctl -q -p /etc/sysctl.d/99-swap.conf
fi

if [ ! -f "$PROJECT/.env" ]; then
    log "Running Supabase setup.sh ($SUPABASE_REF)"
    curl -fsSL "https://raw.githubusercontent.com/supabase/supabase/$SUPABASE_REF/docker/setup.sh" \
        -o /tmp/supabase-setup.sh
    (cd "$HOME" && sh /tmp/supabase-setup.sh -y --ref "$SUPABASE_REF" --project-dir supabase)
fi

cp "$HOME/docker-compose.hairdiary.yml" "$PROJECT/"

# Set KEY=VALUE in .env, replacing the line if it exists.
set_env() {
    if grep -q "^$1=" "$PROJECT/.env"; then
        sed -i "s|^$1=.*|$1=$2|" "$PROJECT/.env"
    else
        echo "$1=$2" >>"$PROJECT/.env"
    fi
}

log "Configuring .env for https://$DOMAIN"
set_env SUPABASE_PUBLIC_URL "https://$DOMAIN"
set_env API_EXTERNAL_URL "https://$DOMAIN/auth/v1"
set_env SITE_URL "https://$DOMAIN"
set_env PROXY_DOMAIN "$DOMAIN"
set_env COMPOSE_FILE "docker-compose.yml:docker-compose.caddy.yml:docker-compose.hairdiary.yml"
set_env STUDIO_DEFAULT_ORGANIZATION "Hair Diary"
set_env STUDIO_DEFAULT_PROJECT "Hair Diary"
# No SMTP server yet, so confirmation emails can't be sent. Revisit with email sign up (#15).
set_env ENABLE_EMAIL_AUTOCONFIRM "true"
set_env ENABLE_PHONE_SIGNUP "false"
chmod 600 "$PROJECT/.env"

log "Starting the stack"
cd "$PROJECT"
sudo docker compose up -d --wait --remove-orphans

log "Installing nightly backup (03:00 UTC, keeps 7 days in ~/backups)"
chmod 755 "$HOME/backup.sh"
(crontab -l 2>/dev/null | grep -v backup.sh || true; echo "0 3 * * * $HOME/backup.sh") | crontab -

echo ""
sudo docker compose ps --format "table {{.Service}}\t{{.Status}}"
echo ""
echo "API URL:          https://$DOMAIN"
echo "Publishable key:  $(grep '^SUPABASE_PUBLISHABLE_KEY=' .env | cut -d= -f2-)"
echo "Anon key:         $(grep '^ANON_KEY=' .env | cut -d= -f2-)"
echo ""
echo "Other secrets (service role key, dashboard and database passwords) stay on this VM."
echo "Print them here with: cd ~/supabase && sh run.sh secrets"
