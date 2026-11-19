#!/usr/bin/env bash
#
# Nightly backup on the VM (installed by bootstrap-vm.sh as a cron job): a pg_dump of the
# database and a tarball of the Storage files, kept for 7 days in ~/backups.
# These copies live on the same disk as the data, so download them now and then:
#   scp -i ~/.ssh/hairdiary_azure 'azureuser@<host>:~/backups/*' ./backups/

set -euo pipefail

DEST="$HOME/backups"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$DEST"

sudo docker exec supabase-db pg_dump -U supabase_admin -d postgres -Fc >"$DEST/db-$STAMP.dump"
sudo tar -czf "$DEST/storage-$STAMP.tar.gz" -C "$HOME/supabase/volumes" storage
sudo chown "$(id -u):$(id -g)" "$DEST"/*

find "$DEST" -type f -mtime +7 -delete
