"""Validated custom IMAP/SMTP values; no Frappe imports or network operations."""

import re


def _flag(value):
	return value is True or value == 1 or value == "1"


def _host(value):
	value = str(value or "").strip().lower()
	if len(value) > 253 or not re.fullmatch(
		r"(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", value
	):
		raise ValueError("Enter a mail server hostname without a scheme, path or port")
	return value


def _port(value):
	if isinstance(value, bool) or not str(value).isdigit() or not 1 <= int(value) <= 65535:
		raise ValueError("Mail port must be between 1 and 65535")
	return int(value)


def custom_mail_config(data, *, editing=False):
	"""Return an allowlisted Email Account update, or raise ValueError before I/O."""
	email = str(data.get("email_id") or "").strip()
	if not re.fullmatch(r"[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+", email):
		raise ValueError("Enter a valid full email address")
	name = str(data.get("email_account_name") or "").strip()
	if not name:
		raise ValueError("Account name is required")
	incoming = _flag(data.get("enable_incoming"))
	outgoing = _flag(data.get("enable_outgoing"))
	if not incoming and not outgoing:
		raise ValueError("Enable incoming or outgoing mail")
	result = dict(
		service="",
		email_account_name=name,
		email_id=email,
		enable_incoming=int(incoming),
		enable_outgoing=int(outgoing),
		default_incoming=int(incoming and _flag(data.get("default_incoming"))),
		default_outgoing=int(outgoing and _flag(data.get("default_outgoing"))),
		use_imap=1,
		validate_ssl_certificate=1,
		no_smtp_authentication=0,
		always_use_account_email_id_as_sender=1,
		create_lead_from_incoming_email=int(incoming and _flag(data.get("create_lead_from_incoming_email"))),
	)
	password = data.get("password")
	if password and password != "********":
		result["password"] = password
	elif not editing:
		raise ValueError("A mailbox password or app password is required")
	login = str(data.get("login_id") or "").strip()
	result.update(login_id_is_different=int(bool(login)), login_id=login or None)
	for enabled, server, port, security, ssl, tls in [
		(incoming, "email_server", "incoming_port", "incoming_security", "use_ssl", "use_starttls"),
		(outgoing, "smtp_server", "smtp_port", "outgoing_security", "use_ssl_for_outgoing", "use_tls"),
	]:
		if enabled:
			mode = data.get(security)
			if mode not in ("SSL/TLS", "STARTTLS"):
				raise ValueError("Choose SSL/TLS or STARTTLS for each enabled connection")
			result.update(
				{
					server: _host(data.get(server)),
					port: _port(data.get(port)),
					ssl: int(mode == "SSL/TLS"),
					tls: int(mode == "STARTTLS"),
				}
			)
	return result
