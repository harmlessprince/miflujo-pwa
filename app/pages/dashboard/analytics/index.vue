<script setup>
import { useInsightsStore } from '~/stores/insights.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { useAccountStore } from '~/stores/account.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Spending Insights — MiFlujo' })

const insightsStore = useInsightsStore()
const stmtStore = useBankStatementStore()
const accountStore = useAccountStore()

const {
  loading,
  totalIncome,
  totalSpent,
  netCashflow,
  transactionStats,
  byCategory,
  byMerchant,
  burnRate,
  categoryConfidence,
  monthOverMonth,
  scopeType,
  scopeStatementId,
  scopeAccountId,
  startDate,
  endDate,
} = storeToRefs(insightsStore)

// ── Scope period bounds ────────────────────────────────────────────────────
const scopedStatement = computed(() => {
  if (scopeType.value !== 'statement' || !scopeStatementId.value) return null
  return stmtStore.statements.find((s) => s.id === scopeStatementId.value) ?? null
})

const scopedAccount = computed(() => {
  if (scopeType.value !== 'account' || !scopeAccountId.value) return null
  return accountStore.accounts.find((a) => a.id === scopeAccountId.value) ?? null
})

// ── Derived helpers ────────────────────────────────────────────────────────
const incomeValue = computed(() => {
  const v = totalIncome.value
  if (!v) return null
  return v?.total_income ?? v?.total ?? v?.amount ?? v
})

const spentValue = computed(() => {
  const v = totalSpent.value
  if (!v) return null
  return v?.total_spent ?? v?.total ?? v?.amount ?? v
})

const netValue = computed(() => netCashflow.value?.net_cashflow ?? netCashflow.value?.net ?? null)
const savingsRate = computed(() => netCashflow.value?.savings_rate ?? null)

const cashflowStatusConfig = computed(() => {
  const s = netCashflow.value?.cashflow_status
  const configs = {
    SURPLUS:     { label: 'Surplus',    class: 'text-success bg-success/10' },
    DEFICIT:     { label: 'Deficit',    class: 'text-error bg-error/10' },
    BREAK_EVEN:  { label: 'Break Even', class: 'text-secondary bg-grey/10' },
  }
  return configs[s] ?? null
})

const categoryMax = computed(() => {
  if (!byCategory.value.length) return 1
  return byCategory.value[0]?.total ?? byCategory.value[0]?.amount ?? 1
})

const TOP_CATEGORIES = computed(() => byCategory.value.slice(0, 8))
const TOP_MERCHANTS  = computed(() => byMerchant.value.slice(0, 6))

const txCount    = computed(() => transactionStats.value?.total_count ?? transactionStats.value?.transaction_count ?? null)
const avgDebit   = computed(() => transactionStats.value?.average_debit ?? null)
const avgCredit  = computed(() => transactionStats.value?.average_credit ?? null)
const burnPerDay = computed(() => burnRate.value?.daily_burn_rate ?? burnRate.value?.burn_rate ?? null)

const momExpenses          = computed(() => monthOverMonth.value?.previous_month?.expenses ?? null)
const momChange            = computed(() => monthOverMonth.value?.previous_month?.percentage_change ?? null)
const momTrend             = computed(() => monthOverMonth.value?.previous_month?.trend ?? monthOverMonth.value?.trend_direction ?? null)
const momTrendConfig       = computed(() => {
  const t = momTrend.value?.toUpperCase()
  if (t === 'DECREASE' || t === 'DECREASING') return { icon: 'trending_down', class: 'text-success', label: 'Down' }
  if (t === 'INCREASE' || t === 'INCREASING') return { icon: 'trending_up',   class: 'text-error',   label: 'Up' }
  return { icon: 'trending_flat', class: 'text-secondary', label: 'Stable' }
})

const confHigh   = computed(() => categoryConfidence.value?.high_percentage   ?? categoryConfidence.value?.high_count   ?? null)
const confMedium = computed(() => categoryConfidence.value?.medium_percentage ?? categoryConfidence.value?.medium_count ?? null)
const confLow    = computed(() => categoryConfidence.value?.low_percentage    ?? categoryConfidence.value?.low_count    ?? null)
const confTotal  = computed(() => categoryConfidence.value?.total_count ?? 1)

const hasOverviewData = computed(() =>
  incomeValue.value !== null || spentValue.value !== null || txCount.value !== null
)

const dateRangeLabel = computed(() =>
  `${formatDate(startDate.value, 'short')} – ${formatDate(endDate.value, 'short')}`
)

// ── Category bar color cycling ─────────────────────────────────────────────
const BAR_COLORS = [
  'bg-navy',
  'bg-primary/70',
  'bg-navy/60',
  'bg-primary/40',
  'bg-navy/40',
  'bg-primary/25',
  'bg-navy/25',
  'bg-grey/60',
]
function barColor(index) {
  return BAR_COLORS[index % BAR_COLORS.length]
}

onMounted(() => {
  stmtStore.fetchStatements()
  accountStore.fetchAccounts()
  insightsStore.fetchOverview()
})
</script>

<template>
  <MobileContainer>

    <!-- ── Page Header ──────────────────────────────────────────────────── -->
    <section class="border-b border-grey bg-white px-4 py-5">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-headline-md font-semibold text-navy">Spending Insights</h1>
        <p class="shrink-0 text-label-caps font-bold text-secondary">{{ dateRangeLabel }}</p>
      </div>
    </section>

    <DashboardScopeSelector @apply="insightsStore.fetchOverview" />

    <section v-if="scopedStatement || scopedAccount" class="border-b border-grey bg-white px-4 py-3">
      <div v-if="scopedStatement" class="flex items-center gap-3 rounded-[10px] border border-grey/60 bg-surface px-3 py-2.5">
        <span class="material-symbols-outlined shrink-0 text-[18px] text-navy" aria-hidden="true">account_balance</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-body-sm font-semibold text-navy">{{ scopedStatement.bank_name }}</p>
          <p class="text-label-caps text-secondary">
            <template v-if="scopedStatement.account_number">{{ scopedStatement.account_number }} · </template>
            {{ formatDate(scopedStatement.period_start, 'short') }} – {{ formatDate(scopedStatement.period_end, 'short') }}
          </p>
        </div>
        <div v-if="txCount !== null" class="shrink-0 text-right">
          <p class="text-data-mono font-medium tabular-nums text-navy">{{ txCount }}</p>
          <p class="text-label-caps text-secondary">txns</p>
        </div>
      </div>
      <div v-else class="flex items-center gap-3 rounded-[10px] border border-grey/60 bg-surface px-3 py-2.5">
        <span class="material-symbols-outlined shrink-0 text-[18px] text-navy" aria-hidden="true">account_balance_wallet</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-body-sm font-semibold text-navy">{{ scopedAccount.display_name }}</p>
          <p v-if="scopedAccount.account_number" class="text-label-caps text-secondary">{{ scopedAccount.account_number }}</p>
        </div>
      </div>
    </section>

    <!-- ── Loading skeleton ────────────────────────────────────────────── -->
    <div v-if="loading" class="space-y-4 px-4 py-4">
      <div class="animate-pulse rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 h-4 w-32 rounded bg-grey/40" />
        <div class="grid grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="space-y-2">
            <div class="h-3 w-20 rounded bg-grey/30" />
            <div class="h-7 w-28 rounded bg-grey/40" />
          </div>
        </div>
      </div>
      <div v-for="n in 3" :key="n" class="animate-pulse rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 h-4 w-40 rounded bg-grey/40" />
        <div class="space-y-3">
          <div v-for="i in 4" :key="i" class="space-y-1.5">
            <div class="flex justify-between">
              <div class="h-3 w-24 rounded bg-grey/30" />
              <div class="h-3 w-16 rounded bg-grey/30" />
            </div>
            <div class="h-2 w-full rounded-full bg-grey/20">
              <div :class="['h-2 rounded-full bg-grey/50', `w-${Math.floor(Math.random() * 6 + 1)}/12`]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Empty state (no data) ──────────────────────────────────────── -->
    <div
      v-else-if="!loading && !hasOverviewData"
      class="flex flex-col items-center px-6 py-16 text-center"
    >
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
        <span class="material-symbols-outlined text-display-lg text-secondary" aria-hidden="true">insights</span>
      </div>
      <h2 class="mb-2 text-title-sm font-semibold text-navy">No insights yet</h2>
      <p class="mb-6 text-body-sm text-secondary">Upload a bank statement to start seeing spending analytics.</p>
      <BaseButton class="max-w-xs" type="button" @click="navigateTo('/dashboard/statements/upload')">
        Upload Statement
      </BaseButton>
    </div>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <div v-else class="space-y-4 px-4 pb-8 pt-4">

      <!-- KPI Cards 2×2 -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Summary</p>
          <span
            v-if="cashflowStatusConfig"
            :class="['rounded px-2 py-0.5 text-label-caps font-bold uppercase', cashflowStatusConfig.class]"
          >
            {{ cashflowStatusConfig.label }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <!-- Income -->
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Income</p>
            <p v-if="incomeValue !== null" class="mt-1 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(incomeValue) }}
            </p>
            <p v-else class="mt-1 text-body-sm text-secondary">—</p>
          </div>
          <!-- Spent -->
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Spent</p>
            <p v-if="spentValue !== null" class="mt-1 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(spentValue) }}
            </p>
            <p v-else class="mt-1 text-body-sm text-secondary">—</p>
          </div>
          <!-- Net Cashflow -->
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Net Cashflow</p>
            <p
              v-if="netValue !== null"
              :class="['mt-1 text-data-mono font-medium tabular-nums', netValue >= 0 ? 'text-success' : 'text-error']"
            >
              {{ netValue >= 0 ? '+' : '' }}{{ formatToMoney(netValue) }}
            </p>
            <p v-else class="mt-1 text-body-sm text-secondary">—</p>
          </div>
          <!-- Transaction Count -->
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Transactions</p>
            <p v-if="txCount !== null" class="mt-1 text-data-mono font-medium tabular-nums text-navy">
              {{ txCount }}
            </p>
            <p v-else class="mt-1 text-body-sm text-secondary">—</p>
          </div>
          <!-- Savings Rate (if available) -->
          <div v-if="savingsRate !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Savings Rate</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-navy">
              {{ Number(savingsRate).toFixed(1) }}%
            </p>
          </div>
          <!-- Burn Rate (if available) -->
          <div v-if="burnPerDay !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Daily Burn</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(burnPerDay) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Transaction Stats -->
      <section v-if="transactionStats" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Transaction Averages</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div v-if="avgDebit !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Avg. Debit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">{{ formatToMoney(avgDebit) }}</p>
          </div>
          <div v-if="avgCredit !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Avg. Credit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-success">{{ formatToMoney(avgCredit) }}</p>
          </div>
          <div v-if="transactionStats.debit_count != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Debits</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ transactionStats.debit_count }}</p>
          </div>
          <div v-if="transactionStats.credit_count != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Credits</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ transactionStats.credit_count }}</p>
          </div>
        </div>
      </section>

      <!-- Category Breakdown -->
      <section v-if="TOP_CATEGORIES.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Spending by Category</p>
        <div class="space-y-3">
          <div v-for="(cat, idx) in TOP_CATEGORIES" :key="cat.name ?? idx">
            <div class="mb-1 flex items-center justify-between gap-2">
              <span class="truncate text-body-sm font-medium text-navy">{{ cat.name }}</span>
              <div class="flex shrink-0 items-center gap-2">
                <span v-if="cat.percentage != null" class="text-body-sm text-secondary">
                  {{ Number(cat.percentage).toFixed(1) }}%
                </span>
                <span class="text-data-mono font-medium tabular-nums text-navy">
                  {{ formatToMoney(cat.total ?? cat.amount) }}
                </span>
              </div>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-grey/20">
              <div
                :class="['h-1.5 rounded-full transition-all', barColor(idx)]"
                :style="{ width: `${Math.min(((cat.total ?? cat.amount ?? 0) / categoryMax) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Top Merchants -->
      <section v-if="TOP_MERCHANTS.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Top Merchants</p>
        <div class="divide-y divide-grey/20">
          <div
            v-for="(merch, idx) in TOP_MERCHANTS"
            :key="merch.merchant ?? idx"
            class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <span class="w-5 shrink-0 text-center text-label-caps font-bold text-secondary">{{ idx + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-body-sm font-medium text-navy">{{ merch.merchant }}</p>
              <p v-if="merch.category" class="text-label-caps text-secondary">{{ merch.category }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-data-mono font-medium tabular-nums text-navy">{{ formatToMoney(merch.total) }}</p>
              <p v-if="merch.frequency" class="text-label-caps text-secondary">{{ merch.frequency }} txns</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Month-over-Month -->
      <section v-if="monthOverMonth" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">vs Last Month</p>
        <div class="flex items-center justify-between gap-3">
          <div>
            <p v-if="momExpenses !== null" class="text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(momExpenses) }} last month
            </p>
            <p v-if="momChange !== null" :class="['mt-1 text-body-sm font-medium', momTrendConfig.class]">
              {{ momChange > 0 ? '+' : '' }}{{ Number(momChange).toFixed(1) }}% expenses
            </p>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span :class="['material-symbols-outlined text-headline-md', momTrendConfig.class]" aria-hidden="true">
              {{ momTrendConfig.icon }}
            </span>
            <span :class="['text-label-caps font-bold', momTrendConfig.class]">{{ momTrendConfig.label }}</span>
          </div>
        </div>
        <div v-if="monthOverMonth.three_month_average" class="mt-3 grid grid-cols-2 gap-3 border-t border-grey/30 pt-3">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">3-Month Avg</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(monthOverMonth.three_month_average) }}
            </p>
          </div>
          <div v-if="monthOverMonth.six_month_average">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">6-Month Avg</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(monthOverMonth.six_month_average) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Category Confidence -->
      <section v-if="categoryConfidence && confTotal > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Category Confidence</p>
        <div class="space-y-2.5">
          <div class="flex items-center gap-3">
            <span class="w-14 shrink-0 text-body-sm font-medium text-success">High</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-grey/20">
              <div class="h-2 rounded-full bg-success transition-all" :style="{ width: `${confHigh ?? 0}%` }" />
            </div>
            <span class="w-10 shrink-0 text-right text-data-mono font-medium tabular-nums text-navy">
              {{ confHigh != null ? Math.round(confHigh) + '%' : '—' }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-14 shrink-0 text-body-sm font-medium text-warning">Medium</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-grey/20">
              <div class="h-2 rounded-full bg-warning transition-all" :style="{ width: `${confMedium ?? 0}%` }" />
            </div>
            <span class="w-10 shrink-0 text-right text-data-mono font-medium tabular-nums text-navy">
              {{ confMedium != null ? Math.round(confMedium) + '%' : '—' }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-14 shrink-0 text-body-sm font-medium text-error">Low</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-grey/20">
              <div class="h-2 rounded-full bg-error transition-all" :style="{ width: `${confLow ?? 0}%` }" />
            </div>
            <span class="w-10 shrink-0 text-right text-data-mono font-medium tabular-nums text-navy">
              {{ confLow != null ? Math.round(confLow) + '%' : '—' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Analysis shortcuts -->
      <section class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="flex flex-col items-start gap-2 rounded-[10px] border border-grey bg-white p-4 text-left transition-colors hover:border-navy"
          @click="navigateTo('/dashboard/analytics/monthly')"
        >
          <span class="material-symbols-outlined text-headline-md text-navy" aria-hidden="true">calendar_month</span>
          <p class="text-body-sm font-semibold text-navy">Monthly Analysis</p>
          <p class="text-label-caps text-secondary">Full month breakdown</p>
        </button>
        <button
          type="button"
          class="flex flex-col items-start gap-2 rounded-[10px] border border-grey bg-white p-4 text-left transition-colors hover:border-navy"
          @click="navigateTo('/dashboard/analytics/weekly')"
        >
          <span class="material-symbols-outlined text-headline-md text-navy" aria-hidden="true">date_range</span>
          <p class="text-body-sm font-semibold text-navy">Weekly Analysis</p>
          <p class="text-label-caps text-secondary">Week-by-week view</p>
        </button>
      </section>

    </div>

  </MobileContainer>
</template>
