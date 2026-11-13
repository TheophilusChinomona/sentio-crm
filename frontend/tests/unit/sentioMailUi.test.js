import { createApp, defineComponent, h, nextTick } from 'vue'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
const { resources } = vi.hoisted(() => ({ resources: [] }))
vi.mock('frappe-ui', () => ({
  createResource: vi.fn((options) => {
    const resource = { ...options, loading: false, submit: vi.fn() }
    resources.push(resource)
    return resource
  }),
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('@framework/ui/telemetry', () => ({
  useTelemetry: () => ({ capture: vi.fn() }),
}))
vi.mock('@/composables/onboarding', () => ({
  useCrmOnboarding: () => ({ completeStep: vi.fn() }),
}))
vi.mock('@/utils', () => ({
  validateEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
}))
import EmailAdd from '@/components/Settings/EmailAdd.vue'
const Input = defineComponent({
  props: ['modelValue', 'name', 'label', 'type', 'options'],
  emits: ['update:modelValue'],
  setup(p, { emit }) {
    return () =>
      h('label', [
        p.label,
        h('input', {
          name: p.name,
          type: p.type === 'checkbox' ? 'checkbox' : 'text',
          value: p.modelValue,
          checked: p.modelValue,
          onInput: (e) =>
            emit(
              'update:modelValue',
              p.type === 'checkbox' ? e.target.checked : e.target.value,
            ),
        }),
      ])
  },
})
let app, host
beforeEach(() => {
  resources.length = 0
  host = document.createElement('div')
  document.body.appendChild(host)
  app = createApp(EmailAdd)
  app.config.globalProperties.__ = globalThis.__
  app.component('FormControl', Input)
  app.component('Button', {
    props: ['label'],
    emits: ['click'],
    render() {
      return h('button', { onClick: () => this.$emit('click') }, this.label)
    },
  })
  app.component('ErrorMessage', {
    props: ['message'],
    render() {
      return h('p', this.message)
    },
  })
  app.mount(host)
})
afterEach(() => {
  app.unmount()
  host.remove()
})
async function choose(label) {
  const p = [...host.querySelectorAll('p')].find((p) => p.textContent === label)
  p.parentElement.click()
  await nextTick()
}
it('shows Zoho region and encrypted mail server fields when incoming is enabled', async () => {
  await choose('Zoho')
  const incoming = host.querySelector('[name="enable_incoming"]')
  incoming.checked = true
  incoming.dispatchEvent(new Event('input'))
  await nextTick()
  expect(host.querySelector('[name="email_server"]')).not.toBeNull()
  expect(host.querySelector('[name="incoming_security"]').value).toBe('SSL/TLS')
  expect(host.querySelector('[name="zoho_region"]')).not.toBeNull()
})
it('keeps custom IMAP separate from Frappe Mail API credentials', async () => {
  await choose('Custom IMAP/SMTP')
  expect(host.querySelector('[name="api_key"]')).toBeNull()
  expect(host.querySelector('[name="zoho_region"]')).toBeNull()
  expect(host.querySelector('[name="password"]')).not.toBeNull()
})
it('retains existing providers without adding custom server fields', async () => {
  await choose('GMail')
  expect(host.querySelector('[name="api_key"]')).toBeNull()
  expect(host.querySelector('[name="zoho_region"]')).toBeNull()
  expect(host.querySelector('[name="password"]')).not.toBeNull()
})
