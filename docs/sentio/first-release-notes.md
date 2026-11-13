# Historical first release (superseded by consolidation)

# Sentio CRM fork

This branch is based on Frappe CRM v16.0.3 (e113ab9847de4a5198f1c7e48da328227c37cfc2). Upstream remains `frappe/crm`; app/module/package name stays `crm` so existing sites and dependencies remain compatible. Copyright and AGPL licence notices are preserved.

## First-version changes

- Zoho and custom IMAP/SMTP in Settings → Email → Accounts, including explicit US/EU paid-business presets, editable hostnames/ports, SSL/TLS or STARTTLS, incoming-only/outgoing-only accounts and password-preserving edits.
- Permission-first server adapter. Ordinary user input is allowlisted; plaintext transport, invalid ports and malformed server names are rejected before connection. Creating/editing a mailbox requires the corresponding Email Account permissions on that client site. No credentials are bundled, logged or shared through source exports.
- Research navigation, readable verification/review states and a direct link to manager review/evidence forms supplied by the separate `sentio_marketing` app.
- A visible Source code link, backed by the marketing app's `/source` page.

Existing Gmail, Outlook and Frappe Mail paths are retained. Zoho preset selection does not assert a mailbox's region, plan, IMAP entitlement or authentication method; obtain its exact server settings and app-password requirements from the account owner.

## Build and installation

Use the companion https://github.com/TheophilusChinomona/sentio-marketing repository's `deploy/` files. The image app manifest must include this fork AND the marketing app; simply changing an image label does not install CRM. Package name remains `crm` even though this repository is named `sentio-crm` (Bench reads the pyproject name).

A source-controlled branch/image is not automatically a tested live deployment. First create an isolated staging site, install `crm` and `sentio_marketing`, run the integration tests, check the Research screen, then connect a test mailbox with the owner's authorisation. Do not replace an existing production image without backup, compatibility review, migration and a rollback path.

## Checks

- Existing frontend suite plus new component tests: `cd frontend && yarn test:run`.
- Mail server pure tests: `node --test tests_sentio/mailServers.node.mjs`.
- Python custom-mail validation: `python3 -m unittest discover -s tests_sentio`.
- Run full Frappe integration tests on a Bench site for DB permissions, credential validation and real mailbox behaviour. No test message is sent by the local unit checks.

The initial local unit runner used Node 24 and a temporary dependency installation because no Bench/Framework checkout or Docker daemon permission was available. A complete production asset build, browser session, SMTP/IMAP connection and database migration are not claimed by those unit checks.

## Keeping up with upstream

Fetch a chosen upstream release, compare it with this small change set, merge on a new branch and rerun all tests. Rebuild both apps together against Frappe 16. Never silently track a changing develop branch in production. Tag each deployed fork/app revision and provide corresponding source and build instructions through `/source`.
