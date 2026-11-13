import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
from frappe.permissions import add_permission, update_permission_property


def ensure_role():
	if not frappe.db.exists("Role", "Sentio Marketing Manager"):
		frappe.get_doc(
			{
				"doctype": "Role",
				"role_name": "Sentio Marketing Manager",
				"desk_access": 1,
			}
		).insert(ignore_permissions=True)


def setup():
	ensure_role()
	create_custom_fields(
		{
			"CRM Organization": [
				{
					"fieldname": "sentio_account_id",
					"label": "Research account ID",
					"fieldtype": "Data",
					"unique": 1,
					"read_only": 1,
				}
			],
			"CRM Lead": [
				{
					"fieldname": "sentio_prospect",
					"label": "Researched prospect",
					"fieldtype": "Link",
					"options": "Sentio Prospect",
					"read_only": 1,
				}
			],
			"CRM Deal": [
				{
					"fieldname": "sentio_prospect",
					"label": "Researched prospect",
					"fieldtype": "Link",
					"options": "Sentio Prospect",
					"read_only": 1,
				}
			],
		},
		update=True,
	)
	# Manager receives only the CRM entity permissions needed for reviewed imports/promotion.
	for dt in ["CRM Organization", "CRM Lead"]:
		if not frappe.db.exists("Custom DocPerm", {"parent": dt, "role": "Sentio Marketing Manager"}):
			# Native helper copies standard DocPerm rows before creating the first custom rule.
			add_permission(dt, "Sentio Marketing Manager", 0)
			for permission in ("read", "write", "create"):
				update_permission_property(dt, "Sentio Marketing Manager", 0, permission, 1)
	frappe.clear_cache()


def configure_site(client_id):
	"""CLI-only bootstrap. Does not grant outreach permission or connect a mailbox."""
	settings = frappe.get_single("Sentio Marketing Settings")
	settings.client_id = client_id
	settings.outreach_enabled = 0
	settings.save()


def check_legacy_app():
	if "sentio_marketing" in frappe.get_installed_apps():
		frappe.throw(
			"This site still installs the separate sentio_marketing app. "
			"Use the legacy image and a restored staging backup to plan migration; "
			"do not uninstall the app, which deletes its records."
		)


def verify_site(client_id):
	check_legacy_app()
	settings = frappe.get_single("Sentio Marketing Settings")
	if settings.client_id != client_id:
		frappe.throw("Configured client does not match this site's client. Refusing to start.")
