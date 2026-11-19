#!/usr/bin/env bash
#
# Apply supabase/migrations/ to the self-hosted prod database on Azure.
# Postgres is not exposed to the internet, so this opens an SSH tunnel to it, reads the database
# password from the VM's .env (never printed or written to disk), and runs `supabase db push`.
#
# Usage: infra/azure/push-migrations.sh [--dry-run]

set -euo pipefail

RG="${RG:-hairdiary-rg}"
VM="${VM:-hairdiary-supabase}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/hairdiary_azure}"
LOCAL_PORT="${LOCAL_PORT:-54329}"
HOST="azureuser@$(az vm show -d -g "$RG" -n "$VM" --query fqdns -o tsv)"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)

cd "$(dirname "$0")/../.."

PGPASSWORD="$(ssh "${SSH_OPTS[@]}" "$HOST" "grep '^POSTGRES_PASSWORD=' ~/supabase/.env | cut -d= -f2-")"
export PGPASSWORD

ssh "${SSH_OPTS[@]}" -f -N -o ExitOnForwardFailure=yes \
    -L "$LOCAL_PORT:127.0.0.1:5432" "$HOST"
TUNNEL_PID="$(pgrep -f "ssh.*-L $LOCAL_PORT:127.0.0.1:5432" | head -n1)"
trap 'kill "$TUNNEL_PID" 2>/dev/null || true' EXIT

# The password comes from PGPASSWORD, so it's not part of the URL or the process list.
# The connection is plain TCP inside the encrypted SSH tunnel, so the CLI's TLS warning is expected.
npx supabase db push "$@" --remote="postgresql://postgres@127.0.0.1:$LOCAL_PORT/postgres"
