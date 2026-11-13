"""Synthetic isolation check for disposable CI sites; never connects to customer sites."""

import frappe

from crm.sentio.api import import_research
from crm.sentio.policy import source_key

record = dict(
	client_id="test-client",
	account_id="isolation-account",
	contact_id="isolation-contact",
	company="Synthetic isolation fixture",
	email="fixture@example.test",
	person_name="Fixture",
	email_type="named-work",
	role_status="supported",
	verification_status="valid",
	verification_provider="fixture",
	verified_at="2026-11-13T00:00:00Z",
	verification_ref="fixture",
	review_status="draft",
	source_url="https://example.test/contact",
	source_run="ci-isolation",
	selected=True,
	evidence=[],
)
for site in ("sentio.localhost", "other.localhost"):
	frappe.init(site=site, sites_path="sites")
	frappe.connect()
	try:
		frappe.set_user("Administrator")
		settings = frappe.get_single("Sentio Marketing Settings")
		assert not settings.outreach_enabled
		if site == "sentio.localhost":
			import_research("test-client", [record], False)
			assert frappe.db.exists("Sentio Prospect", source_key(record))
			frappe.db.commit()
		else:
			assert settings.client_id == "other-client"
			assert not frappe.db.exists("Sentio Prospect", source_key(record))
			try:
				import_research("test-client", [record], False)
			except frappe.PermissionError:
				pass
			else:
				raise AssertionError("Cross-client import unexpectedly accepted")
	finally:
		frappe.destroy()
print("Two independent sites verified; outreach remains disabled")
