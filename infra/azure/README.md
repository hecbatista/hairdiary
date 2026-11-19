# Prod backend: self-hosted Supabase on Azure

Hair Diary's prod backend (used by the `preview` and `production` EAS builds) is Supabase's
[official Docker stack](https://supabase.com/docs/guides/self-hosting/docker) on one Azure VM,
paid for with Azure for Students credit. Dev stays on the local Supabase CLI stack.

## What runs where

| | |
|---|---|
| VM | `Standard_B2ats_v2` (2 vCPU, 1 GB RAM, Ubuntu 24.04), free for students (750 h/month) |
| Disk | 64 GB Premium SSD (P6), matching the student offer's free disks |
| Network | Static public IP with an Azure DNS name: `https://hairdiary-api-<id>.<region>.cloudapp.azure.com` |
| HTTPS | Caddy with an automatic Let's Encrypt certificate |
| Supabase | Pinned to release `self-hosted/v0.8.4` |
| Cost | About $4/month for the public IP; everything else falls under the free offer. The student subscription has no card attached, so it stops instead of charging when the credit runs out. |

1 GB is below Supabase's 4 GB minimum, so [`docker-compose.hairdiary.yml`](docker-compose.hairdiary.yml)
runs only what the app uses, with 2 GB swap behind it:

| Service | Status |
|---|---|
| Postgres, Auth, PostgREST, Storage, Envoy gateway, Caddy | Always on |
| Studio + postgres-meta | On demand (`studio` profile) |
| Realtime, Edge Functions, Supavisor, imgproxy | Off. Need a bigger VM (e.g. `Standard_B2s`, 4 GB) |

Only ports 80 and 443 are open to the internet. SSH (22) is open to the IP you deployed from.
Postgres listens on the VM's localhost only and is reached through an SSH tunnel.

## Deploy

```bash
brew install azure-cli
az login
infra/azure/deploy.sh
```

`deploy.sh` creates the resource group, VM, network rules and an SSH key
(`~/.ssh/hairdiary_azure`), then runs [`bootstrap-vm.sh`](bootstrap-vm.sh) on the VM. That
installs Docker, runs Supabase's `setup.sh` (which generates every secret), applies the Hair
Diary settings, and starts the stack. It ends by printing the API URL and the publishable key.
Re-running it is safe. It deploys to `northcentralus`; Azure for Students only allows a few
regions (`northcentralus`, `canadacentral`, `francecentral`, `swedencentral`, `belgiumcentral`), so
pick another of those if needed:
`LOCATION=canadacentral infra/azure/deploy.sh`.

Then apply the schema:

```bash
infra/azure/push-migrations.sh --dry-run
infra/azure/push-migrations.sh
```

And give the EAS builds the new backend:

```bash
eas env:set --environment production --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://<host> --visibility plaintext
eas env:set --environment production --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <publishable key> --visibility plaintext
```


## Day to day

SSH in with `ssh -i ~/.ssh/hairdiary_azure azureuser@<host>`, then `cd ~/supabase`.

| Task | Command (on the VM, in `~/supabase`) |
|---|---|
| Status | `sudo docker compose ps` |
| Logs | `sudo docker compose logs -f auth` |
| Print secrets | `sh run.sh secrets` |
| Open Studio | `sudo docker compose --profile studio up -d studio meta`, wait about a minute (both are slow to start on 1 GB), then visit `https://<host>` and sign in with the dashboard user from `sh run.sh secrets` |
| Close Studio (frees ~400 MB) | `sudo docker compose stop studio meta` |
| Update Supabase | Back up, then `sh update.sh` and `sudo docker compose pull && sudo docker compose up -d` |

If your IP changes and SSH stops connecting, allow the new one:

```bash
az network nsg rule update -g hairdiary-rg --nsg-name hairdiary-supabaseNSG -n AllowSSHFromMe --source-address-prefixes $(curl -s https://api.ipify.org)/32
```

## Backups

[`backup.sh`](backup.sh) runs nightly at 03:00 UTC: a `pg_dump` of the database and a tarball
of the Storage files, kept 7 days in `~/backups` on the VM. They sit on the same disk as the data,
so copy them off now and then:

```bash
scp -i ~/.ssh/hairdiary_azure 'azureuser@<host>:~/backups/*' ./backups/
```

## Known limits

- No SMTP server, so Auth can't send emails. Email sign ups are auto-confirmed for now; password
  reset and confirmation emails need SMTP (e.g. a free transactional email provider), which is
  part of #15.
- Image transformations are off (no imgproxy). The app doesn't use them.
- One small VM, no redundancy. Fine for a TestFlight beta; move to a bigger VM or hosted Supabase
  before real traffic.

## Tear down

Deletes the VM, disk, IP and every backup on it:

```bash
az group delete -n hairdiary-rg
```
