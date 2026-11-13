# Built-in research and reviewed outreach

These features ship inside the CRM app under `crm.sentio`.

## What it does

- One configured client per site. Imports reject a different client ID. Separate Frappe sites/databases are the tenant boundary; Organizations are prospects, not client workspaces.
- Research records preserve account/contact IDs, public phones, named versus shared email type, role status, original verification provider/date/receipt, source URLs and research holds. Aliases do not become invented people.
- Immutable evidence observations sit alongside CRM Organizations. Supported named candidates can be promoted to CRM Leads by a manager. Imports do not trigger website enrichment; no provider keys, paid calls or budget assumptions are included.
- Outreach eligibility, research review and mailbox validity are separate. Imports never grant approval. Reviewed corrections are not silently overwritten by a differing import; older source runs are rejected. Exact reimports preserve existing state.
- A manager records actual recipient-eligibility evidence and reviews an exact email subject/body. Ordinary CRM-linked communications are checked against that approval, content fingerprint, sender domain, single recipient and suppression state. Subject/text/link changes require a new copy review.
- The Frappe 16 Email Queue mixin rechecks just before standard queued delivery, including scheduled/retried messages. Replies stop unsolicited follow-ups; an explicit reply to the same person's incoming Communication may still pass review. Exact first-line opt-outs create a suppression record. Other opt-out language requires human handling, but any reply pauses marketing follow-ups. Transport errors pause outreach rather than claiming a confirmed hard bounce. No automatic campaign scheduler is provided.
- Public `/source` information links to source, licence and build/install material. Keep exact deployed revisions available to users; hosting/support can be charged while preserving their AGPL rights.

## Site setup

Use the [single-app deployment guide](../../deploy/README.md). Open **Sentio
Marketing Settings** in Desk, set the site's client ID and authorised sender
domain, and keep outreach off during staging. Only assign `Sentio Marketing
Manager` to reviewers. `Sales User` can view research and prepare drafts.
Mailbox configuration requires the site's Email Account permissions.

## Import the existing research

The CLI consumes only the exact reviewed allowlist in a marketing workspace's `client.json` and four CSVs in the selected run. It rejects traversal/symlink paths, preserves historical dates and excludes unmatched bulk research that is absent from those reviewed contacts.

```sh
python3 -m crm.sentio.prepare --workspace /path/to/marketing \
  --client-id YOUR-CLIENT --run-id YYYYMMDDTHHMMSSZ \
  --output /private/path/research-batches.json
```

This only writes a permission-restricted local JSON file. It contains batches of at most 100 records with `dry_run: true`; it makes no network requests. Submit each batch, after authorising transfer to that client's own site, to `/api/method/crm.sentio.api.import_research` using a permission-scoped Frappe API user. Run every batch as a dry run first. Explicitly set `dry_run: false` to write only after review. There is no upload/send/provider-research action in this repository's preparation command. Do not commit these JSON files.

Source IDs are the deduplication key. Unchanged reimports preserve reviews/follow-up stops; differing reviewed records require explicit reconciliation. CRM Organization name collisions with an unrelated existing record are errors for manual reconciliation, not permission to merge branches. Each import RPC is transactional, but a multi-batch import is not a single transaction; reconcile returned counts before continuing after a failure.

## Client workflow

1. **Research** in the CRM sidebar shows mailbox and review states. Open an item in Desk to inspect fields/evidence. Unidentified people and missing emails remain visibly missing.
2. A marketing manager identifies the real named contact, resolves research holds and records actual recipient eligibility. Use **Approve outreach**; this does not enable global sending or grant permission by itself. If reviewed source attributes change, approval resets.
3. Create a CRM lead only for a supported named candidate. Shared inboxes stay research-only in this initial conservative workflow.
4. Create a **Sentio Email Draft**, including the actual subject, signature, links and body. A manager sets its status to Reviewed after saving the final text. Editing the text resets it to Draft. In CRM, use that reviewed message and the linked recipient. CC/BCC are not approved by this first-version flow.
5. After site tests and mailbox checks, a site administrator may enable reviewed outreach. Stop/suppress requests are recorded in **Sentio Suppression**. `resume_after_review` can reset a non-suppressed paused record to Pending with fresh evidence; it cannot override a suppression or itself grant approval.

Hooks protect CRM Lead/Deal-linked Communication and standard Email Queue delivery. They do not prevent a privileged administrator from changing code, direct SMTP outside Frappe, unrelated applications or emails already delivered. System emails such as password resets are not treated as prospect outreach. This is an operational review workflow, not a certification of consent or legal compliance.

## Validation

Local policy/adapter tests: `python3 -m unittest discover -s crm/sentio/tests`.
The image workflow runs the full frontend suite and disposable database tests.
Review the actual GitHub run before deployment; browser interaction, real mailbox
authentication, sending and reply ingestion require separate staging checks.
No research files, provider keys or mailbox credentials belong in GitHub.
