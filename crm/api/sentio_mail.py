"""Permission-first custom mailbox administration for the CRM settings UI."""

import frappe
from crm.sentio_mail_config import custom_mail_config


@frappe.whitelist()
def save_account(data: dict, name: str | None = None):
	if not isinstance(data, dict):
		frappe.throw("Mail settings must be an object")
	if name:
		doc = frappe.get_doc("Email Account", name)
		doc.check_permission("write")
		if doc.service:
			frappe.throw("Use the existing provider editor for this account")
	else:
		if not frappe.has_permission("Email Account", "create"):
			frappe.throw("Not permitted to create email accounts", frappe.PermissionError)
		doc = frappe.new_doc("Email Account")
	try:
		values = custom_mail_config(data, editing=bool(name))
	except ValueError as error:
		frappe.throw(str(error))
	for key, value in values.items():
		setattr(doc, key, value)
	if not name:
		doc.email_sync_option = "ALL"
		doc.initial_sync_count = 100
		if values["enable_incoming"]:
			doc.append("imap_folder", {"append_to": "CRM Lead", "folder_name": "INBOX"})
	# Standard Email Account validation handles credentials; no incoming probe for send-only accounts.
	try:
		doc.save()
	except (frappe.PermissionError, frappe.ValidationError):
		raise
	except Exception:
		frappe.throw(
			"Could not connect to this mailbox. Check its servers, encryption, access settings and app password."
		)
	return {"name": doc.name}
