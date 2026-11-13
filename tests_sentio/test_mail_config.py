import unittest
from crm.sentio_mail_config import custom_mail_config


class MailConfigTests(unittest.TestCase):
	def base(self):
		return dict(
			email_account_name="Sales",
			email_id="sales@example.test",
			password="app-secret",
			enable_incoming=True,
			enable_outgoing=True,
			email_server="imap.example.test",
			incoming_port=993,
			incoming_security="SSL/TLS",
			smtp_server="smtp.example.test",
			smtp_port=587,
			outgoing_security="STARTTLS",
		)

	def test_custom_service_is_blank_and_tls_exclusive(self):
		r = custom_mail_config(self.base())
		self.assertEqual(r["service"], "")
		self.assertEqual(r["use_ssl"], 1)
		self.assertEqual(r["use_tls"], 1)
		self.assertEqual(r["use_ssl_for_outgoing"], 0)

	def test_no_incoming_configuration_required_for_send_only(self):
		d = self.base()
		d.update(enable_incoming=False, email_server="", incoming_port="")
		self.assertEqual(custom_mail_config(d)["enable_incoming"], 0)

	def test_missing_server_and_invalid_port_fail(self):
		for changes in [
			{"email_server": "https://imap.example.test"},
			{"smtp_port": 0},
			{"smtp_port": True},
			{"smtp_server": "localhost"},
			{"outgoing_security": "None"},
			{"email_id": "bad"},
		]:
			with self.subTest(changes=changes), self.assertRaises(ValueError):
				custom_mail_config(dict(self.base(), **changes))

	def test_create_requires_real_password(self):
		for password in ["", "********"]:
			with self.assertRaises(ValueError):
				custom_mail_config(dict(self.base(), password=password))

	def test_edit_omits_blank_or_masked_password(self):
		for password in ["", "********"]:
			self.assertNotIn(
				"password", custom_mail_config(dict(self.base(), password=password), editing=True)
			)

	def test_no_arbitrary_document_fields_or_disabled_defaults(self):
		r = custom_mail_config(
			dict(self.base(), owner="Administrator", enable_outgoing=False, default_outgoing=True)
		)
		self.assertNotIn("owner", r)
		self.assertEqual(r["default_outgoing"], 0)

	def test_same_service_flags_never_disable_certificate_validation(self):
		r = custom_mail_config(dict(self.base(), validate_ssl_certificate=0, no_smtp_authentication=1))
		self.assertEqual(r["validate_ssl_certificate"], 1)
		self.assertEqual(r["no_smtp_authentication"], 0)


if __name__ == "__main__":
	unittest.main()
