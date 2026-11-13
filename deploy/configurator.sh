#!/usr/bin/env bash
set -euo pipefail
cd /home/frappe/frappe-bench
env/bin/python -c 'import crm, crm.sentio.api'
# This one-shot service completes before create-site and every runtime service.
# Assets are generated build output; client site files are under separate site directories.
rm -rf sites/assets
ln -s /home/frappe/frappe-bench/assets sites/assets
printf 'frappe\ncrm\n' > sites/apps.txt
bench set-config -g db_host db
bench set-config -gp db_port 3306
bench set-config -g redis_cache redis://redis-cache:6379
bench set-config -g redis_queue redis://redis-queue:6379
bench set-config -g redis_socketio redis://redis-queue:6379
bench set-config -gp socketio_port 9000
