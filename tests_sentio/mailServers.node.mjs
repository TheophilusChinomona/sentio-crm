import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mailPreset,
  providerForAccount,
  validateManualMail,
  accountState,
} from "../frontend/src/utils/mailServers.js";
const settings = {
  ...mailPreset("EU"),
  email_account_name: "Sales",
  email_id: "sales@example.test",
  password: "app-password",
  enable_incoming: true,
  enable_outgoing: true,
};
test("Zoho requires explicit region and permits manual host override", () => {
  assert.equal(mailPreset().email_server, "");
  assert.equal(mailPreset("EU").email_server, "imappro.zoho.eu");
});
test("custom account edits preserve saved ports and never expose saved password", () => {
  const s = accountState({ smtp_port: 587, use_tls: 1, password: "********" });
  assert.equal(s.smtp_port, 587);
  assert.equal(s.outgoing_security, "STARTTLS");
  assert.equal(s.password, "");
});
test("Zoho and custom accounts are recognised when Frappe service is blank", () => {
  assert.equal(providerForAccount({ email_server: "imappro.zoho.eu" }), "Zoho");
  assert.equal(
    providerForAccount({ email_server: "mail.example.test" }),
    "Custom IMAP/SMTP",
  );
});
test("create validates credentials, encryption and direction", () => {
  assert.equal(validateManualMail(settings), "");
  assert.notEqual(validateManualMail({ ...settings, password: "" }), "");
  assert.notEqual(
    validateManualMail({
      ...settings,
      smtp_server: "https://mail.example.test",
    }),
    "",
  );
  assert.notEqual(validateManualMail({ ...settings, smtp_port: 0 }), "");
});
test("editing can keep password; send-only does not require IMAP", () => {
  assert.equal(
    validateManualMail(
      { ...settings, password: "", enable_incoming: false, email_server: "" },
      true,
    ),
    "",
  );
});
