// Custom mailbox helpers. Provider selection never guesses a mailbox's region.
export function manualProvider(service) {
  return !service || ['Zoho', 'Custom IMAP/SMTP'].includes(service)
}
export function providerForAccount(account) {
  if (account.service) return account.service
  return /(?:^|\.)zoho\.(?:com|eu|in|com\.au|jp|ca|sa|com\.cn)$/.test(
    account.email_server || account.smtp_server || '',
  )
    ? 'Zoho'
    : 'Custom IMAP/SMTP'
}
export function mailPreset(region = '') {
  const suffix = { US: 'com', EU: 'eu' }[region]
  return {
    email_server: suffix ? `imappro.zoho.${suffix}` : '',
    incoming_port: 993,
    incoming_security: 'SSL/TLS',
    smtp_server: suffix ? `smtppro.zoho.${suffix}` : '',
    smtp_port: 465,
    outgoing_security: 'SSL/TLS',
  }
}
export function accountState(account = {}) {
  return {
    ...mailPreset(),
    ...account,
    service: providerForAccount(account),
    password: '',
    login_id: account.login_id || '',
    incoming_security: account.use_starttls ? 'STARTTLS' : 'SSL/TLS',
    outgoing_security: account.use_ssl_for_outgoing
      ? 'SSL/TLS'
      : account.use_tls
        ? 'STARTTLS'
        : 'SSL/TLS',
  }
}
export function validateManualMail(state, editing = false) {
  if (!state.email_account_name?.trim()) return 'Account name is required'
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(state.email_id || ''))
    return 'Enter a valid full email address'
  if (!editing && (!state.password || state.password === '********'))
    return 'Mailbox password or app password is required'
  if (!state.enable_incoming && !state.enable_outgoing)
    return 'Enable incoming or outgoing mail'
  for (const [enabled, host, port, mode] of [
    [
      state.enable_incoming,
      state.email_server,
      state.incoming_port,
      state.incoming_security,
    ],
    [
      state.enable_outgoing,
      state.smtp_server,
      state.smtp_port,
      state.outgoing_security,
    ],
  ]) {
    if (!enabled) continue
    if (!host || !/^[a-z0-9.-]+$/i.test(host) || !host.includes('.'))
      return 'Enter the mail server hostname without a scheme, path or port'
    if (!/^\d+$/.test(String(port)) || Number(port) < 1 || Number(port) > 65535)
      return 'Enter a valid mail port'
    if (!['SSL/TLS', 'STARTTLS'].includes(mode))
      return 'Choose SSL/TLS or STARTTLS'
  }
  return ''
}
