import LogoCustomMail from '../../../public/images/mail-server.svg'
import { validateEmail } from '../../utils'

import LogoGmail from '../../../public/images/gmail.png'
import LogoOutlook from '../../../public/images/outlook.png'
import LogoSendgrid from '../../../public/images/sendgrid.png'
import LogoSparkpost from '../../../public/images/sparkpost.webp'
import LogoYahoo from '../../../public/images/yahoo.png'
import LogoYandex from '../../../public/images/yandex.png'
import LogoFrappeMail from '../../../public/images/frappe-mail.svg'

const fixedFields = [
  {
    label: __('Account Name'),
    name: 'email_account_name',
    type: 'text',
    placeholder: __('Support / Sales'),
  },
  {
    label: __('Email ID'),
    name: 'email_id',
    type: 'email',
    placeholder: 'johndoe@example.com',
  },
]

export const incomingOutgoingFields = [
  {
    label: __('Enable Incoming'),
    name: 'enable_incoming',
    type: 'checkbox',
    description: __('If enabled, emails will be pulled from this account.'),
  },
  {
    label: __('Enable Outgoing'),
    name: 'enable_outgoing',
    type: 'checkbox',
    description: __(
      'If enabled, outgoing emails can be sent from this account.',
    ),
  },
  {
    label: __('Default Incoming'),
    name: 'default_incoming',
    type: 'checkbox',
    description: __(
      'If enabled, all replies to your company (eg: replies@yourcompany.com) will come to this account. Note: Only one account can be default incoming.',
    ),
  },
  {
    label: __('Default Outgoing'),
    name: 'default_outgoing',
    type: 'checkbox',
    description: __(
      'If enabled, all outgoing emails will be sent from this account. Note: Only one account can be default outgoing.',
    ),
  },
  {
    label: __('Create Lead from Incoming Emails'),
    name: 'create_lead_from_incoming_email',
    type: 'checkbox',
    description: __(
      'If enabled, a lead will be automatically created when an incoming email is received from an unknown contact.',
    ),
    condition: (state) => state.enable_incoming,
  },
]

export const popularProviderFields = [
  ...fixedFields,
  {
    label: __('Password'),
    name: 'password',
    type: 'password',
    placeholder: '********',
  },
]

export const customProviderFields = [
  ...fixedFields,
  {
    label: __('Frappe Mail Site'),
    name: 'frappe_mail_site',
    type: 'text',
    placeholder: 'https://frappemail.com',
  },
  {
    label: __('API Key'),
    name: 'api_key',
    type: 'text',
    placeholder: '********',
  },
  {
    label: __('API Secret'),
    name: 'api_secret',
    type: 'password',
    placeholder: '********',
  },
]

export const manualServerFields = [
  ...fixedFields,
  {
    label: __(
      'Mailbox password / app password (leave blank to keep when editing)',
    ),
    name: 'password',
    type: 'password',
  },
  {
    label: __('Zoho paid-business region preset (or enter your own servers)'),
    name: 'zoho_region',
    type: 'select',
    condition: (s) => s.service === 'Zoho',
    options: [
      { label: __('Enter server details manually'), value: '' },
      { label: __('United States'), value: 'US' },
      { label: __('Europe'), value: 'EU' },
    ],
  },
  {
    label: __('Login username if different from email'),
    name: 'login_id',
    type: 'text',
  },
  {
    label: __('IMAP server'),
    name: 'email_server',
    type: 'text',
    condition: (s) => s.enable_incoming,
  },
  {
    label: __('IMAP port'),
    name: 'incoming_port',
    type: 'number',
    condition: (s) => s.enable_incoming,
  },
  {
    label: __('Incoming encryption'),
    name: 'incoming_security',
    type: 'select',
    options: ['SSL/TLS', 'STARTTLS'],
    condition: (s) => s.enable_incoming,
  },
  {
    label: __('SMTP server'),
    name: 'smtp_server',
    type: 'text',
    condition: (s) => s.enable_outgoing,
  },
  {
    label: __('SMTP port'),
    name: 'smtp_port',
    type: 'number',
    condition: (s) => s.enable_outgoing,
  },
  {
    label: __('Outgoing encryption'),
    name: 'outgoing_security',
    type: 'select',
    options: ['SSL/TLS', 'STARTTLS'],
    condition: (s) => s.enable_outgoing,
  },
]

export const services = [
  {
    name: 'Zoho',
    icon: LogoCustomMail,
    info: __(
      'Enable IMAP in Zoho and use its account-specific server details. Presets are for paid business mailboxes; edit servers for other regions or plans. Read more',
    ),
    link: 'https://www.zoho.com/mail/help/imap-access.html',
    custom: false,
  },
  {
    name: 'Custom IMAP/SMTP',
    icon: LogoCustomMail,
    info: __(
      'Use the incoming and outgoing settings supplied by your mail host. A mailbox app password may be required. Read more',
    ),
    link: 'https://docs.frappe.io/crm/email-communication',
    custom: false,
  },

  {
    name: 'Frappe Mail',
    icon: LogoFrappeMail,
    info: __(
      'Setting up Frappe Mail requires you to have an API key and API secret for your email account. Read more',
    ),
    link: 'https://github.com/frappe/mail',
    custom: true,
  },
  {
    name: 'GMail',
    label: 'Gmail',
    icon: LogoGmail,
    info: __(
      'Setting up GMail requires you to enable two factor authentication and app specific passwords. Read more',
    ),
    link: 'https://support.google.com/accounts/answer/185833',
    custom: false,
  },
  {
    name: 'Outlook',
    icon: LogoOutlook,
    info: __(
      'Setting up Outlook requires you to enable two factor authentication and app specific passwords. Read more',
    ),
    link: 'https://support.microsoft.com/en-us/account-billing/how-to-get-and-use-app-passwords-5896ed9b-4263-e681-128a-a6f2979a7944',
    custom: false,
  },
  {
    name: 'Sendgrid',
    icon: LogoSendgrid,
    info: __(
      'Setting up Sendgrid requires you to enable two factor authentication and app specific passwords. Read more',
    ),
    link: 'https://sendgrid.com/docs/ui/account-and-settings/two-factor-authentication/',
    custom: false,
  },
  {
    name: 'SparkPost',
    icon: LogoSparkpost,
    info: __(
      'Setting up Sparkpost requires you to enable two factor authentication and app specific passwords. Read more',
    ),
    link: 'https://support.sparkpost.com/docs/my-account-and-profile/enabling-two-factor-authentication',
    custom: false,
  },
  {
    name: 'Yahoo',
    icon: LogoYahoo,
    info: __(
      'Setting up Yahoo requires you to enable two factor authentication and app specific passwords. Read more',
    ),
    link: 'https://help.yahoo.com/kb/SLN15241.html',
    custom: false,
  },
  {
    name: 'Yandex',
    icon: LogoYandex,
    info: __(
      'Setting up Yandex requires you to enable two factor authentication and app specific passwords. Read more',
    ),
    link: 'https://yandex.com/support/id/authorization/app-passwords.html',
    custom: false,
  },
]

export const emailIcon = {
  Zoho: LogoCustomMail,
  'Custom IMAP/SMTP': LogoCustomMail,
  '': LogoCustomMail,
  GMail: LogoGmail,
  Outlook: LogoOutlook,
  Sendgrid: LogoSendgrid,
  SparkPost: LogoSparkpost,
  Yahoo: LogoYahoo,
  Yandex: LogoYandex,
  'Frappe Mail': LogoFrappeMail,
}

export function validateInputs(state, isCustom) {
  if (!state.email_account_name) {
    return __('Account name is required')
  }
  if (!state.email_id) {
    return __('Email ID is required')
  }
  const validEmail = validateEmail(state.email_id)
  if (!validEmail) {
    return __('Invalid email ID')
  }
  if (!isCustom && !state.password) {
    return __('Password is required')
  }
  if (isCustom) {
    if (!state.api_key) {
      return __('API key is required')
    }
    if (!state.api_secret) {
      return
    }
  }
  return ''
}
