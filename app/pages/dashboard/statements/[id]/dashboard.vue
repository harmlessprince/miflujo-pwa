<script setup>
import { useAccountStore } from '~/stores/account.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { formatDate, formatToMoney } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const statementId = route.params.id
const statementStore = useBankStatementStore()
const accountStore = useAccountStore()

const {
  currentStatement: stmt,
  detailLoading,
  dashboardSummary,
  dashboardLoading,
  dashboardError,
} = storeToRefs(statementStore)

const selectedAccountIds = ref([])

useHead({
  title: computed(() => stmt.value?.bank_name ? `${stmt.value.bank_name} Dashboard - MiFlujo` : 'Statement Dashboard - MiFlujo'),
})

const cards = computed(() => dashboardSummary.value?.cards ?? {})
const period = computed(() => dashboardSummary.value?.period ?? {})
const comparisonScope = computed(() => dashboardSummary.value?.pattern_account_scope ?? null)
const loading = computed(() => detailLoading.value || dashboardLoading.value)

const selectedAccountLabels = computed(() =>
  selectedAccountIds.value.map((id) => {
    const account = accountStore.accounts.find((item) => String(item.id) === String(id))
    return account?.display_name ?? `Account ${id}`
  })
)

const kpiCards = computed(() => [
  {
    label: 'Opening Balance',
    value: moneyValue(stmt.value?.opening_balance),
    tone: 'text-navy',
    icon: 'account_balance_wallet',
  },
  {
    label: 'Closing Balance',
    value: moneyValue(stmt.value?.closing_balance),
    tone: 'text-navy',
    icon: 'savings',
  },
  {
    label: 'Income',
    value: moneyValue(cards.value.income?.amount),
    meta: countLabel(cards.value.income?.count, 'credit'),
    tone: 'text-success',
    icon: 'south_west',
  },
  {
    label: 'Spend',
    value: moneyValue(cards.value.expense?.amount),
    meta: countLabel(cards.value.expense?.count, 'debit'),
    tone: 'text-primary',
    icon: 'north_east',
  },
  {
    label: 'Statement Cashflow',
    value: moneyValue(cards.value.net_cashflow?.amount),
    meta: cashflowStatusLabel(cards.value.net_cashflow?.status),
    tone: Number(cards.value.net_cashflow?.amount ?? 0) >= 0 ? 'text-success' : 'text-error',
    icon: 'sync_alt',
  },
  {
    label: 'Transactions',
    value: formatNumber(cards.value.transaction_count),
    meta: 'Total rows',
    tone: 'text-navy',
    icon: 'receipt_long',
  },
])

const rankedSections = computed(() => [
  {
    title: 'Top Categories',
    icon: 'category',
    empty: 'No categorized spend found for this statement.',
    items: dashboardSummary.value?.top_categories ?? [],
  },
  {
    title: 'Top Merchants',
    icon: 'storefront',
    empty: 'No merchant spend found for this statement.',
    items: dashboardSummary.value?.top_merchants ?? [],
  },
  {
    title: 'Transfer Persons',
    icon: 'person',
    empty: 'No transfer recipients detected for this statement.',
    items: dashboardSummary.value?.top_transfer_persons ?? [],
  },
  {
    title: 'Financial Institutions',
    icon: 'account_balance',
    empty: 'No banks or financial institutions detected for this statement.',
    items: dashboardSummary.value?.top_financial_institutions ?? [],
  },
  {
    title: 'Payment Processors',
    icon: 'payments',
    empty: 'No payment processors detected for this statement.',
    items: dashboardSummary.value?.top_payment_processors ?? [],
  },
])

const posTerminalUsage = computed(() => dashboardSummary.value?.pos_terminal_usage ?? null)
const channelUsage = computed(() => dashboardSummary.value?.channel_usage ?? [])

const summaryRows = computed(() => {
  const monthly = dashboardSummary.value?.monthly_summary ?? []
  return monthly.length ? monthly : (dashboardSummary.value?.weekly_summary ?? [])
})

const dailyRows = computed(() => (dashboardSummary.value?.cashflow_pattern ?? []).slice(-7))

function moneyValue(value) {
  return value == null ? '-' : formatToMoney(value)
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('en-NG')
}

function countLabel(value, noun) {
  const count = Number(value ?? 0)
  return `${formatNumber(count)} ${noun}${count === 1 ? '' : 's'}`
}

function accountScopeLabel() {
  if (selectedAccountIds.value.length) {
    return `${selectedAccountIds.value.length} comparison account${selectedAccountIds.value.length === 1 ? '' : 's'} selected`
  }
  return 'Statement account only'
}

function cashflowStatusLabel(status) {
  if (!status) return null
  return status.toLowerCase().replace(/_/g, ' ')
}

function itemPct(item) {
  const value = Number(item?.percentage ?? 0)
  return Math.max(0, Math.min(100, value))
}

function toggleAccount(accountId) {
  const id = Number(accountId)
  selectedAccountIds.value = selectedAccountIds.value.includes(id)
    ? selectedAccountIds.value.filter((item) => item !== id)
    : [...selectedAccountIds.value, id]
}

function loadDashboard() {
  return statementStore.fetchDashboardSummary(statementId, { accountIds: selectedAccountIds.value })
}

function retryAll() {
  statementStore.fetchStatement(statementId)
  loadDashboard()
}

onMounted(() => {
  statementStore.fetchStatement(statementId)
  accountStore.fetchAccounts()
  loadDashboard()
})
</script>

<template>
  <MobileContainer>
    <div class="flex items-center gap-2 px-4 pb-2 pt-4">
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-grey text-navy transition-colors hover:bg-surface"
        @click="navigateTo(`/dashboard/statements/${statementId}`)"
      >
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-title-sm font-bold text-navy">Statement Dashboard</h1>
        <p class="truncate text-body-sm text-secondary">
          {{ stmt?.bank_name ?? 'Statement summary' }}
          <template v-if="period.start || stmt?.period_start">
            · {{ formatDate(period.start ?? stmt?.period_start, 'short') }} - {{ formatDate(period.end ?? stmt?.period_end, 'short') }}
          </template>
        </p>
      </div>
    </div>

    <div v-if="loading" class="space-y-4 px-4 pb-8 pt-2">
      <div class="grid grid-cols-2 gap-3">
        <div v-for="n in 6" :key="n" class="h-28 animate-pulse rounded-[8px] border border-grey bg-white" />
      </div>
      <div class="h-40 animate-pulse rounded-[8px] border border-grey bg-white" />
      <div class="h-56 animate-pulse rounded-[8px] border border-grey bg-white" />
    </div>

    <div v-else-if="dashboardError" class="px-4 pb-8 pt-8">
      <section class="rounded-[8px] border border-error/20 bg-error/5 p-5 text-center">
        <span class="material-symbols-outlined text-[40px] text-error" aria-hidden="true">error</span>
        <p class="mt-3 text-title-sm font-semibold text-navy">Could not load dashboard</p>
        <p class="mt-1 text-body-sm text-secondary">{{ dashboardError }}</p>
        <BaseButton class="mt-5 !h-11" type="button" @click="retryAll">Retry</BaseButton>
      </section>
    </div>

    <div v-else-if="!dashboardSummary" class="px-4 pb-8 pt-8">
      <section class="rounded-[8px] border border-grey bg-white p-5 text-center">
        <span class="material-symbols-outlined text-[40px] text-secondary" aria-hidden="true">dashboard</span>
        <p class="mt-3 text-title-sm font-semibold text-navy">No dashboard data yet</p>
        <p class="mt-1 text-body-sm text-secondary">This statement may still be processing or may not have parsed transactions.</p>
        <BaseButton class="mt-5 !h-11" variant="outline" type="button" @click="navigateTo(`/dashboard/statements/${statementId}/transactions`)">
          View Transactions
        </BaseButton>
      </section>
    </div>

    <div v-else class="space-y-4 px-4 pb-8 pt-2">
      <section class="grid grid-cols-2 gap-3">
        <article
          v-for="card in kpiCards"
          :key="card.label"
          class="rounded-[8px] border border-grey bg-white p-3"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <p class="truncate text-label-caps font-bold uppercase tracking-widest text-secondary">{{ card.label }}</p>
            <span class="material-symbols-outlined shrink-0 text-[18px] text-secondary" aria-hidden="true">{{ card.icon }}</span>
          </div>
          <p :class="['truncate text-data-mono text-[17px] font-semibold tabular-nums', card.tone]">{{ card.value }}</p>
          <p v-if="card.meta" class="mt-1 truncate text-body-sm capitalize text-secondary">{{ card.meta }}</p>
        </article>
      </section>

      <section class="rounded-[8px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-title-sm font-bold text-navy">Historical Comparison</h2>
            <p class="text-body-sm text-secondary">Select accounts to compare recurring payments, spikes, and balance movement.</p>
          </div>
          <button
            type="button"
            aria-label="Apply comparison scope"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-grey text-navy hover:bg-surface disabled:opacity-50"
            :disabled="dashboardLoading"
            @click="loadDashboard"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span>
          </button>
        </div>

        <div v-if="accountStore.loading" class="rounded-[8px] border border-grey bg-surface px-3 py-3">
          <p class="text-body-sm text-secondary">Loading accounts...</p>
        </div>
        <div v-else-if="!accountStore.accounts.length" class="rounded-[8px] border border-grey bg-surface px-3 py-3">
          <p class="text-body-sm font-medium text-navy">No accounts found</p>
          <p class="mt-1 text-body-sm text-secondary">Upload more statements to create account comparison context.</p>
        </div>
        <div v-else class="grid gap-2">
          <button
            v-for="account in accountStore.accounts"
            :key="account.id"
            type="button"
            :class="[
              'flex items-center gap-3 rounded-[8px] border px-3 py-2 text-left transition-colors',
              selectedAccountIds.includes(Number(account.id))
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-grey bg-white text-navy hover:bg-surface',
            ]"
            @click="toggleAccount(account.id)"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
              {{ selectedAccountIds.includes(Number(account.id)) ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-body-sm font-semibold">{{ account.display_name }}</span>
              <span v-if="account.account_type" class="block truncate text-body-sm text-secondary">{{ account.account_type }}</span>
            </span>
          </button>
        </div>

        <div v-if="selectedAccountLabels.length" class="mt-4 border-t border-grey/40 pt-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Comparing</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="label in selectedAccountLabels"
              :key="label"
              class="max-w-full truncate rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-body-sm font-medium text-primary"
            >
              {{ label }}
            </span>
          </div>
        </div>

        <div v-if="comparisonScope" class="mt-4 rounded-[8px] border border-grey/50 bg-surface px-3 py-3">
          <p class="text-body-sm font-medium text-navy">Pattern scope applied</p>
          <p class="mt-1 text-body-sm text-secondary">{{ accountScopeLabel() }}</p>
        </div>
      </section>

      <section
        v-if="dashboardSummary.balance_change_explanation?.message"
        class="rounded-[8px] border border-grey bg-white p-4"
      >
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined mt-0.5 text-[22px] text-primary" aria-hidden="true">insights</span>
          <div class="min-w-0">
            <h2 class="text-title-sm font-bold text-navy">Balance Change</h2>
            <p class="mt-1 text-body-sm text-secondary">{{ dashboardSummary.balance_change_explanation.message }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-[8px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-title-sm font-bold text-navy">Channel Usage</h2>
            <p class="text-body-sm text-secondary">How transactions moved through banks, processors, and terminals.</p>
          </div>
          <span class="material-symbols-outlined shrink-0 text-[22px] text-secondary" aria-hidden="true">hub</span>
        </div>

        <div class="mb-3 rounded-[8px] border border-grey/50 bg-surface p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <span class="material-symbols-outlined shrink-0 text-[20px] text-navy" aria-hidden="true">point_of_sale</span>
              <div class="min-w-0">
                <p class="truncate text-body-sm font-semibold text-navy">POS terminals</p>
                <p class="text-body-sm text-secondary">{{ countLabel(posTerminalUsage?.transaction_count, 'transaction') }}</p>
              </div>
            </div>
            <p class="shrink-0 text-data-mono text-body-sm font-medium tabular-nums text-navy">
              {{ moneyValue(posTerminalUsage?.amount) }}
            </p>
          </div>
        </div>

        <div v-if="!channelUsage.length" class="rounded-[8px] border border-grey bg-surface px-3 py-3">
          <p class="text-body-sm text-secondary">No channel usage data is available yet.</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="channel in channelUsage.slice(0, 5)"
            :key="channel.name"
            class="rounded-[8px] border border-grey/40 px-3 py-2"
          >
            <div class="mb-1 flex items-center justify-between gap-3">
              <p class="truncate text-body-sm font-semibold capitalize text-navy">{{ channel.name }}</p>
              <p class="shrink-0 text-data-mono text-body-sm font-medium tabular-nums text-navy">{{ moneyValue(channel.amount) }}</p>
            </div>
            <p class="text-body-sm text-secondary">
              {{ channel.percentage ?? 0 }}% · {{ countLabel(channel.transaction_count, 'transaction') }}
            </p>
          </div>
        </div>
      </section>

      <section class="grid gap-4">
        <article
          v-for="section in rankedSections"
          :key="section.title"
          class="rounded-[8px] border border-grey bg-white p-4"
        >
          <div class="mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">{{ section.icon }}</span>
            <h2 class="text-title-sm font-bold text-navy">{{ section.title }}</h2>
          </div>
          <div v-if="!section.items.length" class="rounded-[8px] border border-grey bg-surface px-3 py-3">
            <p class="text-body-sm text-secondary">{{ section.empty }}</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="item in section.items" :key="`${section.title}-${item.rank}-${item.name}`">
              <div class="mb-1 flex items-center justify-between gap-3">
                <p class="min-w-0 truncate text-body-sm font-semibold text-navy">{{ item.name }}</p>
                <p class="shrink-0 text-data-mono text-body-sm font-medium tabular-nums text-navy">{{ moneyValue(item.amount) }}</p>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-grey/20">
                <div class="h-full rounded-full bg-primary" :style="{ width: `${itemPct(item)}%` }" />
              </div>
              <p class="mt-1 text-body-sm text-secondary">
                {{ item.percentage ?? 0 }}% · {{ countLabel(item.transaction_count, 'transaction') }}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section class="rounded-[8px] border border-grey bg-white p-4">
        <h2 class="mb-3 text-title-sm font-bold text-navy">Period Summary</h2>
        <div v-if="!summaryRows.length" class="rounded-[8px] border border-grey bg-surface px-3 py-3">
          <p class="text-body-sm text-secondary">No period summary is available yet.</p>
        </div>
        <div v-else class="overflow-hidden rounded-[8px] border border-grey/60">
          <div
            v-for="row in summaryRows"
            :key="row.period ?? row.date"
            class="grid grid-cols-[1fr_auto] gap-3 border-b border-grey/40 px-3 py-2 last:border-b-0"
          >
            <div class="min-w-0">
              <p class="truncate text-body-sm font-semibold text-navy">{{ row.period ?? row.date }}</p>
              <p class="text-body-sm text-secondary">{{ formatNumber(row.transaction_count) }} transactions</p>
            </div>
            <div class="text-right">
              <p class="text-data-mono text-body-sm font-medium tabular-nums text-success">+ {{ moneyValue(row.income) }}</p>
              <p class="text-data-mono text-body-sm font-medium tabular-nums text-primary">- {{ moneyValue(row.expense) }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[8px] border border-grey bg-white p-4">
        <h2 class="mb-3 text-title-sm font-bold text-navy">Pattern Intelligence</h2>
        <div class="grid gap-3">
          <div class="rounded-[8px] border border-grey/50 bg-surface p-3">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Recurring Payments</p>
            <p class="mt-1 text-data-mono text-[18px] font-semibold tabular-nums text-navy">{{ formatNumber(dashboardSummary.recurring_payments?.length) }}</p>
          </div>
          <div class="rounded-[8px] border border-grey/50 bg-surface p-3">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Unusual Transactions</p>
            <p class="mt-1 text-data-mono text-[18px] font-semibold tabular-nums text-navy">{{ formatNumber(dashboardSummary.unusual_transactions?.length) }}</p>
          </div>
          <div class="rounded-[8px] border border-grey/50 bg-surface p-3">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Spending Spikes</p>
            <p class="mt-1 text-data-mono text-[18px] font-semibold tabular-nums text-navy">{{ formatNumber(dashboardSummary.spending_spikes?.length) }}</p>
          </div>
        </div>
      </section>

      <section v-if="dailyRows.length" class="rounded-[8px] border border-grey bg-white p-4">
        <h2 class="mb-3 text-title-sm font-bold text-navy">Recent Cashflow</h2>
        <div class="space-y-2">
          <div
            v-for="row in dailyRows"
            :key="row.date"
            class="flex items-center justify-between gap-3 rounded-[8px] border border-grey/40 px-3 py-2"
          >
            <div>
              <p class="text-body-sm font-semibold text-navy">{{ formatDate(row.date, 'short') }}</p>
              <p class="text-body-sm text-secondary">{{ countLabel(row.transaction_count, 'transaction') }}</p>
            </div>
            <p
              :class="[
                'text-data-mono text-body-sm font-medium tabular-nums',
                Number(row.net_cashflow ?? 0) >= 0 ? 'text-success' : 'text-error',
              ]"
            >
              {{ moneyValue(row.net_cashflow) }}
            </p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-3">
        <BaseButton variant="outline" type="button" @click="navigateTo(`/dashboard/statements/${statementId}/transactions`)">
          Transactions
        </BaseButton>
        <BaseButton type="button" @click="navigateTo(`/dashboard/statements/${statementId}`)">
          Details
        </BaseButton>
      </section>
    </div>
  </MobileContainer>
</template>
