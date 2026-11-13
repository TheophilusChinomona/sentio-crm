<template>
  <div class="flex h-full flex-col overflow-hidden">
    <LayoutHeader>
      <template #left-header
        ><h1 class="text-lg font-medium text-ink-gray-9">
          {{ __('Research') }}
        </h1></template
      >
      <template #right-header
        ><Button
          :label="__('Refresh')"
          :loading="records.loading"
          @click="load"
      /></template>
    </LayoutHeader>
    <div class="flex-1 overflow-auto p-5">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p class="max-w-2xl text-sm text-ink-gray-6">
          {{
            __(
              'Review source evidence and mailbox results before approving outreach. A valid email does not make a contact approved.',
            )
          }}
        </p>
        <a
          href="/desk/sentio-prospect"
          class="rounded border border-outline-gray-2 px-3 py-2 text-sm"
          >{{ __('Manage research and reviews') }}</a
        >
      </div>
      <div class="mb-4 flex items-center gap-3">
        <label for="verification-filter" class="text-sm">{{
          __('Mailbox result')
        }}</label>
        <select
          id="verification-filter"
          v-model="status"
          class="rounded border border-outline-gray-2 px-3 py-2 text-sm"
          @change="resetPage"
        >
          <option value="">{{ __('All results') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <p v-if="records.error" role="alert" class="py-4 text-sm text-ink-red-5">
        {{
          __(
            'Research could not be loaded. Ask your site administrator to check research setup and your role permissions.',
          )
        }}
      </p>
      <p
        v-else-if="records.loading"
        role="status"
        class="py-8 text-sm text-ink-gray-6"
      >
        {{ __('Loading research…') }}
      </p>
      <p
        v-else-if="!rows.length"
        class="rounded border border-outline-gray-2 p-8 text-sm text-ink-gray-6"
      >
        {{
          __(
            'No research matches this view. Reviewed research can be imported by a marketing manager.',
          )
        }}
      </p>
      <table v-else class="w-full border-collapse text-left text-sm">
        <caption class="sr-only">
          {{
            __('Researched prospects and their review status')
          }}
        </caption>
        <thead>
          <tr class="border-b border-outline-gray-2">
            <th
              v-for="h in headers"
              :key="h"
              scope="col"
              class="p-3 font-medium"
            >
              {{ __(h) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.name"
            class="border-b border-outline-gray-1"
          >
            <td class="p-3">
              <a
                :href="'/desk/sentio-prospect/' + encodeURIComponent(row.name)"
                class="text-ink-gray-9 underline underline-offset-2"
                >{{ row.company }}</a
              >
            </td>
            <td class="p-3">{{ row.person_name || __('Not identified') }}</td>
            <td class="p-3">{{ row.email || __('No email') }}</td>
            <td class="p-3">{{ row.verification_status }}</td>
            <td class="p-3">{{ row.review_status }}</td>
            <td class="p-3">{{ row.approval_status }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 flex items-center gap-3">
        <Button
          :label="__('Previous')"
          :disabled="page === 0 || records.loading"
          @click="changePage(-1)"
        />
        <span class="text-sm text-ink-gray-6"
          >{{ __('Page') }} {{ page + 1 }}</span
        >
        <Button
          :label="__('Next')"
          :disabled="rows.length < 50 || records.loading"
          @click="changePage(1)"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { createResource } from 'frappe-ui'
import LayoutHeader from '@/components/LayoutHeader.vue'
const headers = [
  'Company',
  'Contact',
  'Email',
  'Mailbox',
  'Research review',
  'Outreach approval',
]
const statuses = ['valid', 'invalid', 'catch-all', 'unknown', 'unverified']
const status = ref('')
const page = ref(0)
const records = createResource({ url: 'frappe.client.get_list', auto: false })
const rows = computed(() => records.data || [])
function resetPage() {
  page.value = 0
  load()
}
function changePage(direction) {
  page.value += direction
  load()
}
function load() {
  records.submit({
    doctype: 'Sentio Prospect',
    fields: [
      'name',
      'company',
      'person_name',
      'email',
      'verification_status',
      'review_status',
      'approval_status',
    ],
    filters: status.value ? { verification_status: status.value } : {},
    limit_start: page.value * 50,
    limit_page_length: 50,
    order_by: 'company asc, name asc',
  })
}
load()
</script>
