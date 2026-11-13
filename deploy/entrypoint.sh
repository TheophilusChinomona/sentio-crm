#!/usr/bin/env bash
set -euo pipefail
umask 0002
# Shared sites/assets is initialized once by configurator before runtime services.
# Runtime containers must never concurrently remove/recreate this shared link.
if [[ ! -L /home/frappe/frappe-bench/sites/assets ]] || [[ ! -d /home/frappe/frappe-bench/sites/assets ]]; then
  echo 'Assets are not configured. Run the Compose configurator service first.' >&2
  exit 1
fi
exec "$@"
