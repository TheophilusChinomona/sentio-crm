# Deploy Sentio CRM from your GitHub

This repository is the complete CRM application and image build source. Marketing
features are part of `crm.sentio`; do not install the legacy `sentio_marketing` app.

## New deployment in Dokploy

1. Create a **Compose** service, select GitHub repository
   `TheophilusChinomona/sentio-crm`, branch `sentio-v16` (or a tested release tag),
   and Compose path `compose.yaml`. Dokploy clones this repository and builds it.
2. Set the four variables from `.env.example`: `CRM_SITE`, `SENTIO_CLIENT_ID`,
   `DB_ROOT_PASSWORD`, `CRM_ADMIN_PASSWORD`. Use unique strong passwords.
   No Firecrawl key, JSON app manifest, second repository or build secret is needed.
3. Deploy and route HTTPS for your hostname to `frontend`, port **8080**.
   The existing Dokploy external network must be named `dokploy-network`.
4. Login as **Administrator**, using the initial `CRM_ADMIN_PASSWORD`. Check
   `/crm`, `/crm/research`, `/source`, user permissions and site client settings.

Each client gets its own Compose service/project, site and database volumes. Never
reuse one client site's project volumes or encryption keys for another client.
Outreach starts disabled. Mailbox configuration and approval are separate actions.
Environment password changes do not rotate existing database or administrator credentials.

## Build and validation

`deploy/Containerfile` copies this exact source checkout. Framework and base image
revisions are pinned in that file. It does not fetch a second CRM or marketing app.
`deploy/entrypoint.sh` and `start.sh` are adapted from the pinned Frappe Docker
revision named in the Containerfile; its MIT licence is retained alongside them.

The **Sentio image and staging validation** GitHub workflow builds an image, boots a
new synthetic site, checks HTTP routes, runs integration tests, migrates it, then
checks isolation against a second site/database. Only a successful run publishes
`ghcr.io/theophiluschinomona/sentio-crm:sha-<full-commit>`; successful `sentio-v*`
tags also publish matching release image tags. Package visibility must be public
for unauthenticated pulls. A pushed commit or green unit test is not a runtime pass.

Default Dokploy deployment builds the checkout locally. A tested GHCR image can
instead be used with `compose.image.yaml`, selecting that path in Dokploy and
setting `SENTIO_IMAGE` to its exact tag or digest. The image-only Compose has no
build step. Release labels identify the source commit; `/source` links to this
repository. Operators must provide any additional deployed modifications.

## Existing CRM-only site

Back up database, site files and encryption configuration, retain the old image,
and test a restore on a separate staging project first. Preserve the existing
project name and all named volumes (`database`, `sites`, `logs`, `queue`). Never
use `down --volumes` on customer deployments.

The initializer deliberately stops on an existing site lacking the consolidated
marker. After staging validation, use the new image in a one-shot backend:

```
docker compose run --rm --no-deps backend bench --site YOUR-SITE migrate
docker compose run --rm --no-deps backend bench --site YOUR-SITE execute crm.sentio.install.configure_site --kwargs '{"client_id":"YOUR-CLIENT"}'
```

Only after successful migration/configuration and checks, create
`sites/YOUR-SITE/.sentio-consolidated` in the shared sites volume and start services.
Subsequent releases also require an explicit backup and migration; the marker is
not a migration engine. Recovery may require database restore, not just an old image.

## Legacy two-app site

Sites with `sentio_marketing` installed are **blocked** from automatic migration.
Do not uninstall that app: Frappe uninstall deletes its DocTypes and records.
Keep the old image and matching source, restore a backup on staging, and perform
an explicit ownership/data migration before adopting this single-app release.
This consolidation supplies no unverified destructive transfer script.
