<script setup>
import { useDashboardScopeStore } from '~/stores/dashboardScope.store.js'
import { useInsightsStore } from '~/stores/insights.store.js'
import { formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Dashboard — MiFlujo' })

const scopeStore = useDashboardScopeStore()
const insightsStore = useInsightsStore()

const scopeModeLabel = computed(() => {
  const labels = {
    all: 'All accounts',
    single_account: 'Single account',
    multi_account: 'Multiple accounts',
    single_statement: 'Single statement',
    multi_statement: 'Multiple statements',
  }
  return labels[scopeStore.mode] ?? 'All accounts'
})

const activePayloadRows = computed(() =>
  Object.entries(scopeStore.buildPayload()).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? value.join(', ') : value,
  }))
)

function applyDashboardScope() {
  insightsStore.fetchOverview()
}
</script>

<template>
  <MobileContainer>
    <section class="border-b border-grey bg-white px-4 py-5">
      <div class="mb-2 flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">dashboard</span>
        <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Dashboard</p>
      </div>
      <h1 class="text-headline-md font-semibold text-navy">Financial overview</h1>
      <p class="mt-1 text-body-sm text-secondary">
        {{ scopeModeLabel }} · {{ formatDate(scopeStore.start_date, 'short') }} - {{ formatDate(scopeStore.end_date, 'short') }}
      </p>
    </section>

    <DashboardScopeSelector @apply="applyDashboardScope" />

    <section class="space-y-4 px-4 py-5">
      <div class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Active payload</p>
            <p class="mt-1 text-body-sm text-secondary">Shared by dashboard widgets and analytics calls.</p>
          </div>
          <span
            :class="[
              'rounded px-2 py-0.5 text-label-caps font-bold uppercase',
              scopeStore.hasRequiredSelection ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
            ]"
          >
            {{ scopeStore.hasRequiredSelection ? 'Ready' : 'Needs scope' }}
          </span>
        </div>

        <div class="divide-y divide-grey/20">
          <div
            v-for="row in activePayloadRows"
            :key="row.key"
            class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 py-2 first:pt-0 last:pb-0"
          >
            <span class="truncate text-label-caps font-bold text-secondary">{{ row.key }}</span>
            <span class="truncate text-body-sm font-medium text-navy">{{ row.value }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="flex flex-col items-start gap-2 rounded-[10px] border border-grey bg-white p-4 text-left transition-colors hover:border-navy"
          @click="navigateTo('/dashboard/analytics')"
        >
          <span class="material-symbols-outlined text-headline-md text-navy" aria-hidden="true">analytics</span>
          <span class="text-body-sm font-semibold text-navy">Analytics</span>
          <span class="text-label-caps text-secondary">Use this scope</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-start gap-2 rounded-[10px] border border-grey bg-white p-4 text-left transition-colors hover:border-navy"
          @click="navigateTo('/dashboard/statements')"
        >
          <span class="material-symbols-outlined text-headline-md text-navy" aria-hidden="true">description</span>
          <span class="text-body-sm font-semibold text-navy">Statements</span>
          <span class="text-label-caps text-secondary">Pick context</span>
        </button>
      </div>
    </section>
  </MobileContainer>
</template>
