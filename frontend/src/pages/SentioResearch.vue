<template>
  <div
    class="flex h-full min-w-0 flex-col overflow-hidden bg-surface-white text-ink-gray-9"
  >
    <LayoutHeader>
      <template #left-header>
        <h1 class="text-lg font-medium text-ink-gray-9">
          {{ __('Research') }}
        </h1>
      </template>
      <template #right-header>
        <Button
          :label="__('Refresh')"
          icon-left="lucide-refresh-cw"
          :loading="records.loading"
          @click="load"
        />
      </template>
    </LayoutHeader>

    <div
      class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
    >
      <p class="max-w-2xl text-p-base leading-relaxed text-ink-gray-6">
        {{
          __(
            'Review source evidence and mailbox results before approving outreach. A valid email does not make a contact approved.',
          )
        }}
      </p>

      <div class="my-6 flex flex-wrap items-end justify-between gap-4">
        <div class="flex w-full flex-wrap items-end gap-3 sm:w-auto">
          <FormControl
            v-model="status"
            type="select"
            :label="__('Mailbox result')"
            :options="statusOptions"
            variant="outline"
            size="md"
            class="w-full sm:w-52"
            @update:model-value="resetPage"
          />
          <Button
            v-if="status"
            :label="__('Clear filter')"
            variant="ghost"
            size="md"
            @click="clearFilter"
          />
        </div>
        <Button
          :label="__('Manage research and reviews')"
          icon-left="lucide-external-link"
          variant="solid"
          size="md"
          href="/desk/sentio-prospect"
          class="w-full sm:w-auto"
        />
      </div>

      <div
        v-if="records.error"
        role="alert"
        class="rounded-3 border border-outline-gray-2 px-5 py-6"
      >
        <div class="flex max-w-xl items-start gap-3">
          <Icon
            icon="alert-circle"
            class="mt-0.5 size-5 shrink-0 text-ink-red-3"
          />
          <div>
            <h2 class="text-base font-medium">
              {{ __('Research could not be loaded') }}
            </h2>
            <p class="mt-1 text-p-base leading-relaxed text-ink-gray-6">
              {{
                __(
                  'Ask your site administrator to check research setup and your role permissions.',
                )
              }}
            </p>
            <Button :label="__('Try again')" class="mt-4" @click="load" />
          </div>
        </div>
      </div>

      <div
        v-else-if="records.loading"
        role="status"
        :aria-label="__('Loading research')"
        class="overflow-hidden rounded-3 border border-outline-gray-2"
      >
        <span class="sr-only">{{ __('Loading research…') }}</span>
        <div aria-hidden="true" class="divide-y divide-outline-gray-2">
          <div
            v-for="row in 5"
            :key="row"
            class="flex items-center gap-6 px-5 py-5"
          >
            <div class="h-3 w-1/3 rounded-2 bg-surface-gray-2" />
            <div class="h-3 w-1/4 rounded-2 bg-surface-gray-2" />
            <div class="ml-auto h-3 w-16 rounded-2 bg-surface-gray-2" />
          </div>
        </div>
      </div>

      <div
        v-else-if="!rows.length"
        class="flex min-h-80 flex-1 flex-col items-center justify-center px-6 py-14 text-center"
      >
        <Icon
          :icon="status ? 'search' : 'folder'"
          class="mb-4 size-7 text-ink-gray-5"
          aria-hidden="true"
        />
        <h2 class="text-lg font-medium text-ink-gray-9">
          {{
            status ? __('No research matches this view') : __('No research yet')
          }}
        </h2>
        <p class="mt-2 max-w-md text-p-base leading-relaxed text-ink-gray-6">
          {{
            status
              ? __('Clear the filter to see all research records.')
              : __('Reviewed research can be imported by a marketing manager.')
          }}
        </p>
        <Button
          v-if="status"
          :label="__('Clear filter')"
          class="mt-5"
          @click="clearFilter"
        />
      </div>

      <template v-else>
        <div
          role="region"
          :aria-label="__('Research records')"
          tabindex="0"
          class="overflow-x-auto rounded-3 border border-outline-gray-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline-gray-4"
        >
          <table
            class="w-full min-w-[740px] border-collapse text-left text-p-base"
          >
            <caption class="sr-only">
              {{
                __('Researched prospects and their review status')
              }}
            </caption>
            <thead class="bg-surface-gray-1 text-ink-gray-6">
              <tr>
                <th
                  v-for="heading in headers"
                  :key="heading"
                  scope="col"
                  class="whitespace-nowrap px-4 py-3 text-sm font-medium"
                >
                  {{ __(heading) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-gray-2">
              <tr
                v-for="row in rows"
                :key="row.name"
                class="hover:bg-surface-gray-1"
              >
                <td class="px-4 py-4">
                  <a
                    :href="
                      '/desk/sentio-prospect/' + encodeURIComponent(row.name)
                    "
                    class="font-medium text-ink-gray-9 underline-offset-4 hover:underline focus-visible:rounded-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline-gray-4"
                    >{{ row.company }}</a
                  >
                </td>
                <td class="px-4 py-4 text-ink-gray-7">
                  {{ row.person_name || __('Not identified') }}
                </td>
                <td class="px-4 py-4 text-ink-gray-7">
                  {{ row.email || __('No email') }}
                </td>
                <td class="px-4 py-4">
                  <Badge
                    :label="row.verification_status"
                    variant="subtle"
                    theme="gray"
                  />
                </td>
                <td class="px-4 py-4 text-ink-gray-7">
                  {{ row.review_status }}
                </td>
                <td class="px-4 py-4">
                  <Badge
                    :label="row.approval_status"
                    variant="subtle"
                    theme="gray"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav
          :aria-label="__('Research pagination')"
          class="mt-4 flex items-center justify-between gap-3"
        >
          <span class="text-sm tabular-nums text-ink-gray-6"
            >{{ __('Page') }} {{ page + 1 }}</span
          >
          <div class="flex gap-2">
            <Button
              :label="__('Previous')"
              :disabled="page === 0"
              @click="changePage(-1)"
            />
            <Button
              :label="__('Next')"
              :disabled="rows.length < 50"
              @click="changePage(1)"
            />
          </div>
        </nav>
      </template>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { Badge, Button, FormControl, createResource } from 'frappe-ui'
import LayoutHeader from '@/components/LayoutHeader.vue'
import Icon from '@/components/Icon.vue'

const headers = [
  'Company',
  'Contact',
  'Email',
  'Mailbox',
  'Research review',
  'Outreach approval',
]
const statuses = ['valid', 'invalid', 'catch-all', 'unknown', 'unverified']
const statusOptions = computed(() => [
  { label: __('All results'), value: '' },
  ...statuses.map((value) => ({ label: __(value), value })),
])
const status = ref('')
const page = ref(0)
const records = createResource({ url: 'frappe.client.get_list', auto: false })
const rows = computed(() => records.data || [])
function resetPage() {
  page.value = 0
  load()
}
function clearFilter() {
  status.value = ''
  resetPage()
}
function changePage(direction) {
  page.value += direction
  load()
}
function load() {
  records
    .submit({
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
    .catch(() => {})
}
load()
</script>
