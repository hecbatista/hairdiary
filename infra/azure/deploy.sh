#!/usr/bin/env bash
#
# Create the Azure VM for Hair Diary's self-hosted Supabase (prod) and bootstrap it.
# Safe to re-run: existing resources are reused and the bootstrap is idempotent.
#
# Needs: Azure CLI, signed in with `az login` to the Azure for Students subscription.
#
# Usage:
#   infra/azure/deploy.sh
#   LOCATION=canadacentral infra/azure/deploy.sh   # another region the subscription allows
#
# Settings (environment variables):
#   RG         resource group           (default: hairdiary-rg)
#   LOCATION   Azure region             (default: northcentralus; student subscriptions allow only a few regions)
#   VM         VM name                  (default: hairdiary-supabase)
#   SIZE       VM size                  (default: Standard_B2ats_v2, free for students)
#   DNS_LABEL  public DNS label, unique per region (default: hairdiary-api-<random>)
#   SSH_KEY    private key path         (default: ~/.ssh/hairdiary_azure)

set -euo pipefail

RG="${RG:-hairdiary-rg}"
LOCATION="${LOCATION:-northcentralus}"
VM="${VM:-hairdiary-supabase}"
SIZE="${SIZE:-Standard_B2ats_v2}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/hairdiary_azure}"
ADMIN_USER="azureuser"
HERE="$(cd "$(dirname "$0")" && pwd)"

log() { printf "===> %s\n" "$*"; }

az account show -o none 2>/dev/null || {
    echo "Not signed in to Azure. Run: az login" >&2
    exit 1
}
log "Subscription: $(az account show --query name -o tsv)"

if [ ! -f "$SSH_KEY" ]; then
    log "Creating SSH key $SSH_KEY"
    ssh-keygen -t ed25519 -f "$SSH_KEY" -N "" -C "hairdiary-azure" >/dev/null
fi

if az vm show -g "$RG" -n "$VM" -o none 2>/dev/null; then
    log "VM $VM already exists, reusing it"
else
    DNS_LABEL="${DNS_LABEL:-hairdiary-api-$(openssl rand -hex 3)}"

    log "Creating resource group $RG in $LOCATION"
    az group create -n "$RG" -l "$LOCATION" -o none

    # 64 GB Premium SSD matches the free P6 disks in the student offer.
    log "Creating VM $VM ($SIZE, Ubuntu 24.04) with DNS label $DNS_LABEL"
    az vm create \
        -g "$RG" -n "$VM" -l "$LOCATION" \
        --image Ubuntu2404 \
        --size "$SIZE" \
        --admin-username "$ADMIN_USER" \
        --ssh-key-values "$SSH_KEY.pub" \
        --authentication-type ssh \
        --public-ip-sku Standard \
        --public-ip-address-dns-name "$DNS_LABEL" \
        --os-disk-size-gb 64 \
        --storage-sku Premium_LRS \
        --nsg-rule NONE \
        -o none

    NSG="${VM}NSG"
    MY_IP="$(curl -fsS https://api.ipify.org)"
    log "Opening SSH to your current IP only ($MY_IP), and 80/443 to everyone"
    az network nsg rule create -g "$RG" --nsg-name "$NSG" -n AllowSSHFromMe \
        --priority 1000 --access Allow --protocol Tcp --direction Inbound \
        --source-address-prefixes "$MY_IP/32" --destination-port-ranges 22 -o none
    az network nsg rule create -g "$RG" --nsg-name "$NSG" -n AllowHTTP \
        --priority 1010 --access Allow --protocol Tcp --direction Inbound \
        --source-address-prefixes Internet --destination-port-ranges 80 443 -o none
fi

FQDN="$(az vm show -d -g "$RG" -n "$VM" --query fqdns -o tsv)"
[ -n "$FQDN" ] || { echo "VM has no DNS name" >&2; exit 1; }
log "Server: https://$FQDN"

SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)
log "Waiting for SSH"
for _ in $(seq 1 30); do
    ssh "${SSH_OPTS[@]}" -o ConnectTimeout=5 "$ADMIN_USER@$FQDN" true 2>/dev/null && break
    sleep 5
done

log "Copying bootstrap files"
scp "${SSH_OPTS[@]}" -q \
    "$HERE/bootstrap-vm.sh" "$HERE/docker-compose.hairdiary.yml" "$HERE/backup.sh" \
    "$ADMIN_USER@$FQDN:~/"

log "Bootstrapping Supabase on the VM (first run pulls images, a few minutes)"
ssh "${SSH_OPTS[@]}" "$ADMIN_USER@$FQDN" "bash ~/bootstrap-vm.sh '$FQDN'"
