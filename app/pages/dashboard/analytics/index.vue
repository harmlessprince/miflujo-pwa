<script setup>
import { useInsightsStore } from '~/stores/insights.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { useAccountStore } from '~/stores/account.store.js'
import { useDashboardScopeStore } from '~/stores/dashboardScope.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Spending Insights — MiFlujo' })

const insightsStore = useInsightsStore()
const stmtStore = useBankStatementStore()
const accountStore = useAccountStore()
const scopeStore = useDashboardScopeStore()

const {
  loading,
  totalIncome,
  totalSpent,
  netCashflow,
  transactionStats,
  byCategory,
  byMerchant,
  transferPersons,
  financialInstitutions,
  paymentProcessors,
  posTerminalUsage,
  burnRate,
  categoryConfidence,
  monthOverMonth,
  scopeType,
  scopeStatementId,
  scopeAccountId,
  startDate,
  endDate,
  cashflowExcludeCategories,
  cashflowExcludeFlags,
  cashflowCategoryDraft,
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
  return v?.net_income ?? v?.total_income ?? v?.total ?? v?.amount ?? v
})

const spentValue = computed(() => {
  const v = totalSpent.value
  if (!v) return null
  return v?.net_expenses ?? v?.total_spent ?? v?.total ?? v?.amount ?? v
})

const netValue = computed(() => netCashflow.value?.net_cashflow ?? netCashflow.value?.net ?? null)
const cashflowLabel = computed(() => {
  if (scopeType.value === 'statement') return 'Statement Cashflow'
  if (scopeType.value === 'account') return 'Account Cashflow'
  return 'Net Cashflow'
})
const grossNetValue = computed(() => netCashflow.value?.gross_net_cashflow ?? null)
const excludedIncomeValue = computed(() => netCashflow.value?.excluded_income ?? totalIncome.value?.excluded_income ?? 0)
const excludedExpensesValue = computed(() => netCashflow.value?.excluded_expenses ?? totalSpent.value?.excluded_expenses ?? 0)
const hasCashflowExclusions = computed(() =>
  cashflowExcludeCategories.value.length > 0 || cashflowExcludeFlags.value.length > 0
)
const hasExcludedAmounts = computed(() =>
  Number(excludedIncomeValue.value || 0) > 0 || Number(excludedExpensesValue.value || 0) > 0
)
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
const TOP_TRANSFER_PERSONS = computed(() => transferPersons.value.slice(0, 5))
const TOP_FINANCIAL_INSTITUTIONS = computed(() => financialInstitutions.value.slice(0, 5))
const TOP_PAYMENT_PROCESSORS = computed(() => paymentProcessors.value.slice(0, 5))
const posCount = computed(() => posTerminalUsage.value?.transaction_count ?? null)
const posAmount = computed(() => posTerminalUsage.value?.amount ?? null)

const entityInsightSections = computed(() => [
  {
    title: 'Transfer Persons',
    icon: 'person',
    items: TOP_TRANSFER_PERSONS.value,
    empty: 'No transfer recipients detected yet.',
  },
  {
    title: 'Financial Institutions',
    icon: 'account_balance',
    items: TOP_FINANCIAL_INSTITUTIONS.value,
    empty: 'No banks or financial institutions detected yet.',
  },
  {
    title: 'Payment Processors',
    icon: 'payments',
    items: TOP_PAYMENT_PROCESSORS.value,
    empty: 'No payment processors detected yet.',
  },
])

const txCount    = computed(() => transactionStats.value?.total_count ?? transactionStats.value?.transaction_count ?? null)
const avgDebit   = computed(() => transactionStats.value?.average_debit ?? null)
const avgCredit  = computed(() => transactionStats.value?.average_credit ?? null)
const burnPerDay = computed(() => burnRate.value?.daily_burn_rate ?? burnRate.value?.burn_rate ?? null)
const projectedSpending = computed(() => burnRate.value?.projected_month_end_spending ?? null)
const burnComparison = computed(() => burnRate.value?.comparison_to_previous_period ?? null)
const burnTrendConfig = computed(() => {
  const trend = burnComparison.value?.trend?.toUpperCase()
  if (trend === 'DECREASING') return { icon: 'trending_down', class: 'text-success', label: 'Decreasing' }
  if (trend === 'INCREASING') return { icon: 'trending_up', class: 'text-error', label: 'Increasing' }
  return { icon: 'trending_flat', class: 'text-secondary', label: 'Stable' }
})

const momCurrent = computed(() => monthOverMonth.value?.current_period ?? null)
const momPrevious = computed(() => monthOverMonth.value?.previous_period ?? null)
const momChanges = computed(() => monthOverMonth.value?.changes ?? {})
const momMetricRows = computed(() => [
  {
    key: 'income',
    label: 'Income',
    color: 'text-success',
    change: momChanges.value?.income,
    current: momCurrent.value?.income,
    previous: momPrevious.value?.income,
    positiveTrend: 'INCREASE',
  },
  {
    key: 'expenses',
    label: 'Expenses',
    color: 'text-primary',
    change: momChanges.value?.expenses,
    current: momCurrent.value?.expense,
    previous: momPrevious.value?.expense,
    positiveTrend: 'DECREASE',
  },
  {
    key: 'net_cashflow',
    label: 'Net Cashflow',
    color: (momCurrent.value?.net_cashflow ?? 0) >= 0 ? 'text-success' : 'text-error',
    change: momChanges.value?.net_cashflow,
    current: momCurrent.value?.net_cashflow,
    previous: momPrevious.value?.net_cashflow,
    positiveTrend: 'INCREASE',
  },
])
const topCategoryInsight = computed(() => monthOverMonth.value?.top_category_insight ?? null)
const savingSuggestions = computed(() => monthOverMonth.value?.money_saving_suggestions ?? [])

function trendClass(row) {
  const trend = row.change?.trend_direction?.toUpperCase()
  if (!trend || trend === 'STABLE') return 'text-secondary'
  return trend === row.positiveTrend ? 'text-success' : 'text-error'
}

function trendIcon(row) {
  const trend = row.change?.trend_direction?.toUpperCase()
  if (trend === 'INCREASE') return 'trending_up'
  if (trend === 'DECREASE') return 'trending_down'
  return 'trending_flat'
}

function formatPercent(value) {
  if (value === null || value === undefined) return '—'
  const num = Number(value)
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`
}

function applyCashflowExclusions() {
  insightsStore.fetchOverview()
}

function addCashflowCategory() {
  insightsStore.addCashflowExcludeCategory()
}

function clearCashflowAdjustments() {
  insightsStore.clearCashflowExclusions()
  insightsStore.fetchOverview()
}

const averageConfidencePercent = computed(() => {
  const value = categoryConfidence.value?.average_confidence
  if (value === null || value === undefined) return null
  return Number(value) <= 1 ? Number(value) * 100 : Number(value)
})

const categorizedCount = computed(() => categoryConfidence.value?.categorized_count ?? null)
const lowConfidenceCount = computed(() => categoryConfidence.value?.low_confidence_count ?? 0)
const lowConfidenceTransactions = computed(() => categoryConfidence.value?.low_confidence_transactions ?? [])

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

onMounted(async () => {
  await Promise.all([
    stmtStore.fetchStatements(),
    accountStore.fetchAccounts(),
  ])
  scopeStore.resetDateRangeForScope(stmtStore.statements)
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

    <section class="border-b border-grey bg-white px-4 py-3">
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Cashflow Adjustments</p>
          <button
            v-if="hasCashflowExclusions"
            type="button"
            class="shrink-0 text-label-caps font-bold text-primary"
            @click="clearCashflowAdjustments"
          >
            Reset
          </button>
        </div>

        <div class="flex gap-2">
          <input
            v-model="cashflowCategoryDraft"
            type="text"
            class="h-10 min-w-0 flex-1 rounded-[8px] border border-grey bg-white px-3 text-body-sm text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            placeholder="Category"
            @keydown.enter.prevent="addCashflowCategory"
          >
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary text-white disabled:opacity-50"
            :disabled="!cashflowCategoryDraft.trim()"
            @click="addCashflowCategory"
          >
            <span class="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
          </button>
        </div>

        <div v-if="cashflowExcludeCategories.length" class="flex flex-wrap gap-2">
          <button
            v-for="category in cashflowExcludeCategories"
            :key="category"
            type="button"
            class="flex items-center gap-1 rounded-[8px] border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-body-sm font-medium text-primary"
            @click="insightsStore.removeCashflowExcludeCategory(category)"
          >
            <span class="truncate">{{ category }}</span>
            <span class="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="option in insightsStore.cashflowExclusionFlagOptions"
            :key="option.value"
            type="button"
            :class="[
              'flex items-center gap-2 rounded-[8px] border px-3 py-2 text-left text-body-sm font-medium transition-colors',
              cashflowExcludeFlags.includes(option.value)
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-grey bg-white text-navy',
            ]"
            @click="insightsStore.toggleCashflowExcludeFlag(option.value)"
          >
            <span class="material-symbols-outlined shrink-0 text-[18px]" aria-hidden="true">
              {{ cashflowExcludeFlags.includes(option.value) ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <span class="min-w-0 truncate">{{ option.label }}</span>
          </button>
        </div>

        <BaseButton
          type="button"
          variant="outline"
          :disabled="loading"
          @click="applyCashflowExclusions"
        >
          Apply Adjustments
        </BaseButton>
      </div>
    </section>

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
          <!-- Cashflow -->
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">{{ cashflowLabel }}</p>
            <p
              v-if="netValue !== null"
              :class="['mt-1 text-data-mono font-medium tabular-nums', netValue >= 0 ? 'text-success' : 'text-error']"
            >
              {{ netValue >= 0 ? '+' : '' }}{{ formatToMoney(netValue) }}
            </p>
            <p v-else class="mt-1 text-body-sm text-secondary">—</p>
          </div>
          <div v-if="hasCashflowExclusions && grossNetValue !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Gross Cashflow</p>
            <p :class="['mt-1 text-data-mono font-medium tabular-nums', grossNetValue >= 0 ? 'text-success' : 'text-error']">
              {{ grossNetValue >= 0 ? '+' : '' }}{{ formatToMoney(grossNetValue) }}
            </p>
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
          <div v-if="hasExcludedAmounts">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Excluded In</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(excludedIncomeValue) }}
            </p>
          </div>
          <div v-if="hasExcludedAmounts">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Excluded Out</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(excludedExpensesValue) }}
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

      <!-- Burn Rate -->
      <section v-if="burnRate" class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Burn Rate</p>
          <div v-if="burnComparison" class="flex items-center gap-1">
            <span :class="['material-symbols-outlined text-[18px]', burnTrendConfig.class]" aria-hidden="true">
              {{ burnTrendConfig.icon }}
            </span>
            <span :class="['text-label-caps font-bold', burnTrendConfig.class]">{{ burnTrendConfig.label }}</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div v-if="burnPerDay !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Daily Burn</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ formatToMoney(burnPerDay) }}</p>
          </div>
          <div v-if="projectedSpending !== null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Projected Spend</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">{{ formatToMoney(projectedSpending) }}</p>
          </div>
          <div v-if="burnRate.days_elapsed != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Days Elapsed</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ burnRate.days_elapsed }}</p>
          </div>
          <div v-if="burnComparison?.previous_burn_rate != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Previous Burn</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(burnComparison.previous_burn_rate) }}
            </p>
          </div>
        </div>
        <p v-if="burnComparison?.flag_alert" class="mt-3 rounded bg-error/10 px-3 py-2 text-body-sm font-medium text-error">
          Burn rate is up {{ formatPercent(burnComparison.change_percentage) }} versus the previous period.
        </p>
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
            <span class="w-5 shrink-0 text-center text-label-caps font-bold text-secondary">{{ merch.rank }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-body-sm font-medium text-navy">{{ merch.name }}</p>
              <p v-if="merch.category" class="text-label-caps text-secondary">{{ merch.category }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-data-mono font-medium tabular-nums text-navy">{{ formatToMoney(merch.amount) }}</p>
              <p v-if="merch.transaction_count" class="text-label-caps text-secondary">{{ merch.transaction_count }} txns</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Entity Intelligence -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Entity Intelligence</p>
          <div v-if="posCount !== null" class="shrink-0 text-right">
            <p class="text-data-mono font-semibold tabular-nums text-navy">{{ posCount }}</p>
            <p class="text-label-caps text-secondary">POS txns</p>
          </div>
        </div>

        <div v-if="posCount !== null" class="mb-4 rounded-[8px] border border-grey/60 bg-surface p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <span class="material-symbols-outlined shrink-0 text-[20px] text-navy" aria-hidden="true">point_of_sale</span>
              <div class="min-w-0">
                <p class="truncate text-body-sm font-semibold text-navy">POS terminal usage</p>
                <p class="text-label-caps text-secondary">{{ posCount }} transactions</p>
              </div>
            </div>
            <p class="shrink-0 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(posAmount ?? 0) }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <article
            v-for="section in entityInsightSections"
            :key="section.title"
            class="border-t border-grey/30 pt-4 first:border-t-0 first:pt-0"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">{{ section.icon }}</span>
              <h2 class="text-body-sm font-semibold text-navy">{{ section.title }}</h2>
            </div>
            <p v-if="!section.items.length" class="rounded-[8px] border border-grey/60 bg-surface px-3 py-2 text-body-sm text-secondary">
              {{ section.empty }}
            </p>
            <div v-else class="divide-y divide-grey/20">
              <div
                v-for="item in section.items"
                :key="`${section.title}-${item.rank}-${item.name}`"
                class="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span class="w-5 shrink-0 text-center text-label-caps font-bold text-secondary">{{ item.rank }}</span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-body-sm font-medium text-navy">{{ item.name }}</p>
                  <p class="text-label-caps text-secondary">{{ item.transaction_count ?? 0 }} txns</p>
                </div>
                <p class="shrink-0 text-data-mono font-medium tabular-nums text-navy">
                  {{ formatToMoney(item.amount ?? 0) }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Month-over-Month -->
      <section v-if="monthOverMonth" class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Month over Month</p>
            <p v-if="momCurrent && momPrevious" class="mt-1 text-body-xs text-secondary">
              {{ formatDate(momCurrent.start, 'short') }} – {{ formatDate(momCurrent.end, 'short') }}
              vs {{ formatDate(momPrevious.start, 'short') }} – {{ formatDate(momPrevious.end, 'short') }}
            </p>
          </div>
        </div>
        <div class="space-y-3">
          <div
            v-for="row in momMetricRows"
            :key="row.key"
            class="border-b border-grey/20 pb-3 last:border-b-0 last:pb-0"
          >
            <div class="mb-1 flex items-center justify-between gap-2">
              <p class="text-body-sm font-semibold text-navy">{{ row.label }}</p>
              <div :class="['flex shrink-0 items-center gap-1 text-body-sm font-semibold', trendClass(row)]">
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{ trendIcon(row) }}</span>
                <span>{{ formatPercent(row.change?.percentage_change) }}</span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Current</p>
                <p :class="['mt-0.5 text-data-mono font-medium tabular-nums', row.color]">
                  {{ row.current >= 0 && row.key === 'net_cashflow' ? '+' : '' }}{{ formatToMoney(row.current ?? 0) }}
                </p>
              </div>
              <div>
                <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Previous</p>
                <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
                  {{ row.previous >= 0 && row.key === 'net_cashflow' ? '+' : '' }}{{ formatToMoney(row.previous ?? 0) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="topCategoryInsight" class="mt-3 border-t border-grey/30 pt-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Top Category</p>
          <p class="mt-1 text-body-sm text-navy">{{ topCategoryInsight.message }}</p>
        </div>
        <div v-if="savingSuggestions.length" class="mt-3 space-y-2 border-t border-grey/30 pt-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Suggestions</p>
          <div
            v-for="(suggestion, idx) in savingSuggestions"
            :key="suggestion.type ?? idx"
            class="flex gap-2 text-body-sm text-navy"
          >
            <span class="material-symbols-outlined mt-0.5 text-[16px] text-primary" aria-hidden="true">tips_and_updates</span>
            <p>{{ suggestion.message }}</p>
          </div>
        </div>
      </section>

      <!-- Category Confidence -->
      <section v-if="categoryConfidence" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Category Confidence</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Categorized</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ categorizedCount ?? '—' }}</p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Needs Review</p>
            <p :class="['mt-0.5 text-data-mono font-medium tabular-nums', lowConfidenceCount > 0 ? 'text-error' : 'text-success']">
              {{ lowConfidenceCount }}
            </p>
          </div>
        </div>
        <div v-if="averageConfidencePercent !== null" class="mt-4">
          <div class="mb-1 flex items-center justify-between gap-3">
            <p class="text-body-sm font-medium text-navy">Average confidence</p>
            <p class="text-data-mono font-medium tabular-nums text-navy">{{ averageConfidencePercent.toFixed(0) }}%</p>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-grey/20">
            <div
              class="h-2 rounded-full bg-success transition-all"
              :style="{ width: `${Math.min(averageConfidencePercent, 100)}%` }"
            />
          </div>
        </div>
        <div v-if="lowConfidenceTransactions.length" class="mt-4 divide-y divide-grey/20 border-t border-grey/30 pt-2">
          <div
            v-for="txn in lowConfidenceTransactions.slice(0, 5)"
            :key="txn.id"
            class="py-2.5 first:pt-0 last:pb-0"
          >
            <div class="mb-1 flex items-center justify-between gap-3">
              <p class="truncate text-body-sm font-medium text-navy">{{ txn.description }}</p>
              <p class="shrink-0 text-data-mono font-medium tabular-nums text-error">
                {{ Math.round(Number(txn.confidence ?? 0) * 100) }}%
              </p>
            </div>
            <p class="text-label-caps text-secondary">{{ txn.category }}</p>
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
