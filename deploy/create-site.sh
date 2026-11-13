#!/usr/bin/env bash
set -euo pipefail
cd /home/frappe/frappe-bench
: "${CRM_SITE:?Set CRM_SITE}" "${SENTIO_CLIENT_ID:?Set SENTIO_CLIENT_ID}"
# Hostnames/client IDs are paths and JSON input; keep them unambiguous.
[[ "$CRM_SITE" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'Invalid CRM_SITE'; exit 1; }
[[ "$SENTIO_CLIENT_ID" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo 'Invalid SENTIO_CLIENT_ID'; exit 1; }
if [[ -f "sites/$CRM_SITE/site_config.json" ]]; then
  if [[ -f "sites/$CRM_SITE/.sentio-consolidated" ]]; then
    bench --site "$CRM_SITE" execute crm.sentio.install.verify_site --kwargs "{\"client_id\":\"$SENTIO_CLIENT_ID\"}"
    echo 'Existing site retained. Run explicit migration for upgrades (deploy/README.md).'
    exit 0
  fi
  echo 'Existing site retained. Back up and follow deploy/README.md; no automatic migration was performed.' >&2
  exit 1
fi
bench new-site "$CRM_SITE" --db-root-username root --db-root-password "$DB_ROOT_PASSWORD" \
  --admin-password "$CRM_ADMIN_PASSWORD" --mariadb-user-host-login-scope='%' --install-app crm
bench --site "$CRM_SITE" execute crm.sentio.install.configure_site --kwargs "{\"client_id\":\"$SENTIO_CLIENT_ID\"}"
bench --site "$CRM_SITE" set-config host_name "https://$CRM_SITE"
bench --site "$CRM_SITE" enable-scheduler
touch "sites/$CRM_SITE/.sentio-consolidated"
