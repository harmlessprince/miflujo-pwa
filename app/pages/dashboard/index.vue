<script setup>
import { useDashboardScopeStore } from '~/stores/dashboardScope.store.js'
import { useInsightsStore } from '~/stores/insights.store.js'
import { formatDate, formatToMoney } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Dashboard — MiFlujo' })

const scopeStore = useDashboardScopeStore()
const insightsStore = useInsightsStore()

const {
  loading,
  overviewError,
  totalIncome,
  totalSpent,
  netCashflow,
  transactionStats,
} = storeToRefs(insightsStore)

const incomeValue = computed(() => totalIncome.value?.total_income ?? totalIncome.value?.total ?? totalIncome.value?.amount ?? null)
const spentValue = computed(() => totalSpent.value?.total_spent ?? totalSpent.value?.total ?? totalSpent.value?.amount ?? null)
const netValue = computed(() => netCashflow.value?.net_cashflow ?? netCashflow.value?.net ?? null)
const txCount = computed(() => transactionStats.value?.total_count ?? transactionStats.value?.transaction_count ?? null)

const hasOverviewData = computed(() =>
  incomeValue.value !== null || spentValue.value !== null || netValue.value !== null || txCount.value !== null
)

const summaryCards = computed(() => [
  { id: 'income', label: 'Income', value: incomeValue.value, tone: 'text-success', format: 'money' },
  { id: 'spent', label: 'Spent', value: spentValue.value, tone: 'text-primary', format: 'money' },
  { id: 'cashflow', label: 'Net Cashflow', value: netValue.value, tone: netValue.value >= 0 ? 'text-success' : 'text-error', format: 'moneySigned' },
  { id: 'transactions', label: 'Transactions', value: txCount.value, tone: 'text-navy', format: 'count' },
])

function formatCardValue(card) {
  if (card.value === null || card.value === undefined) return '-'
  if (card.format === 'count') return Number(card.value).toLocaleString('en-NG')
  if (card.format === 'moneySigned') return `${Number(card.value) >= 0 ? '+' : ''}${formatToMoney(card.value)}`
  return formatToMoney(card.value)
}

function applyDashboardScope() {
  insightsStore.fetchOverview()
}

onMounted(() => {
  insightsStore.fetchOverview()
})
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
        {{ scopeStore.modeLabel }} · {{ formatDate(scopeStore.start_date, 'short') }} - {{ formatDate(scopeStore.end_date, 'short') }}
      </p>
    </section>

    <DashboardScopeSelector @apply="applyDashboardScope" />

    <section class="space-y-4 px-4 py-5">
      <div class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Scope status</p>
            <p class="mt-1 text-body-sm text-secondary">{{ scopeStore.modeDescription }}</p>
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

        <div v-if="scopeStore.payloadRows.length" class="divide-y divide-grey/20">
          <div
            v-for="row in scopeStore.payloadRows"
            :key="row.key"
            class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 py-2 first:pt-0 last:pb-0"
          >
            <span class="truncate text-label-caps font-bold text-secondary">{{ row.key }}</span>
            <span class="truncate text-body-sm font-medium text-navy">{{ row.value }}</span>
          </div>
        </div>
        <p v-else class="rounded-[8px] border border-grey/60 bg-surface px-3 py-3 text-body-sm text-secondary">
          This scope only needs the current mode. No extra selector payload is required yet.
        </p>
      </div>

      <div v-if="loading" class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-4 h-3 w-28 animate-pulse rounded bg-grey/40" />
        <div class="grid grid-cols-2 gap-4">
          <div v-for="item in 4" :key="item" class="space-y-2">
            <div class="h-3 w-20 animate-pulse rounded bg-grey/30" />
            <div class="h-6 w-28 animate-pulse rounded bg-grey/40" />
          </div>
        </div>
      </div>

      <div v-else-if="overviewError" class="rounded-[10px] border border-error/30 bg-white p-4">
        <p class="text-body-sm font-medium text-error">{{ overviewError }}</p>
        <BaseButton class="mt-4 !h-11" type="button" @click="applyDashboardScope">
          Retry
        </BaseButton>
      </div>

      <div v-else-if="!hasOverviewData" class="rounded-[10px] border border-grey bg-white p-5 text-center">
        <span class="material-symbols-outlined text-display-lg text-secondary" aria-hidden="true">insights</span>
        <h2 class="mt-3 text-title-sm font-medium text-navy">No dashboard data yet</h2>
        <p class="mt-1 text-body-sm text-secondary">Upload a statement or choose a scope with processed transactions.</p>
        <BaseButton class="mt-4 !h-11" type="button" @click="navigateTo('/dashboard/statements/upload')">
          Upload Statement
        </BaseButton>
      </div>

      <section v-else class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Overview</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <div v-for="card in summaryCards" :key="card.id">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">{{ card.label }}</p>
            <p :class="['mt-1 text-data-mono font-medium tabular-nums', card.tone]">
              {{ formatCardValue(card) }}
            </p>
          </div>
        </div>
      </section>

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
