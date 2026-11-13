# Maintaining the Sentio fork

Sentio remains the `crm` Frappe application. The research/import/policy features
are under `crm/sentio`, including five `Sentio` DocTypes. Zoho/custom mail adapters
are `crm/api/sentio_mail.py`, `crm/sentio_mail_config.py` and the corresponding UI.
The frontend Research page and source link are included. There is no separately
installed marketing app in this architecture.

## Deliberate upstream updates

- Keep `origin` as your Sentio GitHub and `upstream` as `frappe/crm`.
- Create an update branch from `sentio-v16`, select a stable upstream release,
  inspect changes and merge it. Do not enable automatic production merges.
- Preserve `crm` app identity, upstream patches/migrations and copyright notices.
  Keep hook additions at the end of `crm/hooks.py`; do not replace upstream hooks.
- Review `crm/sentio`, custom mailbox settings, Research UI, root Compose,
  deployment scripts and the Sentio build workflow after every merge.
- Upgrade pinned Framework/base revisions deliberately. Run existing frontend,
  backend and Sentio tests, then the image/staging workflow on the update branch
  using workflow_dispatch. Exercise restricted users and restored customer data
  on separate staging before approving a production release.
- Tag a tested Sentio release. Deploy its image/source and migrate after backup.
  Keep the previous image and matching source for recovery.

## Local checks

```
python3 -m unittest discover -s tests_sentio
python3 -m unittest discover -s crm/sentio/tests
node --test tests_sentio/mailServers.node.mjs
cd frontend && yarn test:run
```

Runtime integration and database isolation checks are executed by
`.github/workflows/builds.yml`; inspect the actual run result before deployment.
See [deployment instructions](../../deploy/README.md). Historical two-app release
notes are kept in `first-release-notes.md` and are not current installation steps.

## Inherited GitHub automation

Upstream release/marketplace/review/translation bots and upstream-specific server,
UI and migration jobs are retained for future merge comparison, but job-guarded
to `frappe/crm`; they cannot run against or publish into Frappe from this fork.
Sentio uses its own image/staging workflow and keeps frontend/linters available.
Upstream backend test suites remain in source; running their ERPNext-dependent
matrix on Sentio requires deliberate setup rather than falling back to Frappe 15.
