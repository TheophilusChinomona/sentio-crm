#!/usr/bin/env bash
# Disposable CI sites only. Never invoke against a customer deployment.
set -euo pipefail
umask 077
[[ "${CRM_SITE:-}" == 'sentio.localhost' ]] || { echo 'Refusing non-CI site'; exit 1; }
# Public source page proves routing/readiness without treating an auth rejection as an outage.
curl --fail --retry 30 --retry-delay 3 --retry-all-errors --max-time 10 \
  -H 'Host: sentio.localhost' http://127.0.0.1:18080/source -o /tmp/sentio-response
grep -q 'Sentio CRM source code' /tmp/sentio-response
# Check the actual protected CRM page with the synthetic administrator session.
curl --fail --max-time 30 -c /tmp/sentio-cookies \
  -H 'Host: sentio.localhost' --data-urlencode 'usr=Administrator' \
  --data-urlencode "pwd=$CRM_ADMIN_PASSWORD" http://127.0.0.1:18080/api/method/login \
  -o /tmp/sentio-login
python3 -c 'import json; assert json.load(open("/tmp/sentio-login"))["message"] == "Logged In"'
for route in /crm /crm/research; do
  curl --fail --max-time 30 -b /tmp/sentio-cookies -H 'Host: sentio.localhost' \
    "http://127.0.0.1:18080$route" -o /tmp/sentio-response
  test -s /tmp/sentio-response
done
docker compose exec -T backend bench --site sentio.localhost set-config allow_tests true
docker compose exec -T backend bench --site sentio.localhost run-tests --module crm.sentio.tests.integration_frappe
# Check explicit migration and idempotent setup on the disposable new site.
docker compose exec -T backend bench --site sentio.localhost migrate
# A second site/database proves research does not cross the site boundary.
docker compose exec -T backend bench new-site other.localhost \
  --db-root-username root --db-root-password "$DB_ROOT_PASSWORD" \
  --admin-password "$CRM_ADMIN_PASSWORD" --mariadb-user-host-login-scope='%' --install-app crm
docker compose exec -T backend bench --site other.localhost execute crm.sentio.install.configure_site \
  --kwargs '{"client_id":"other-client"}'
docker compose exec -T --workdir /home/frappe/frappe-bench/sites backend ../env/bin/python ../apps/crm/deploy/check-isolation.py
