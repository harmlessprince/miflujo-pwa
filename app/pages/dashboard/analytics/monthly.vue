<script setup>
import { useInsightsStore } from '~/stores/insights.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Monthly Analysis — MiFlujo' })

const route = useRoute()
const insightsStore = useInsightsStore()
const stmtStore = useBankStatementStore()

const { monthlyAnalysis, monthlyLoading } = storeToRefs(insightsStore)

// ── Statement selector ─────────────────────────────────────────────────────
const selectedStatementId = ref(
  route.query.statement_id ? Number(route.query.statement_id) : null
)

const statementOptions = computed(() =>
  stmtStore.statements.map((s) => ({
    value: s.id,
    label: `${s.bank_name ?? s.account_name} – ${formatDate(s.period_start, 'short')} to ${formatDate(s.period_end, 'short')}`,
  }))
)

async function loadAnalysis() {
  if (!selectedStatementId.value) return
  await insightsStore.fetchMonthlyAnalysis(selectedStatementId.value)
}

watch(selectedStatementId, (id) => { if (id) loadAnalysis() })

// ── Statement context ──────────────────────────────────────────────────────
const scopedStatement = computed(() =>
  selectedStatementId.value
    ? stmtStore.statements.find((s) => s.id === selectedStatementId.value) ?? null
    : null
)

// ── Derived data ───────────────────────────────────────────────────────────
const data = monthlyAnalysis

const period = computed(() => data.value?.period ?? null)
const cashflow = computed(() => data.value?.cashflow ?? null)
const projection = computed(() => cashflow.value?.projection ?? null)
const isPartial = computed(() => !period.value?.is_complete || projection.value?.is_partial)

const cashflowStatusConfig = computed(() => {
  const s = cashflow.value?.cashflow_status
  const map = {
    SURPLUS:    { label: 'Surplus',    class: 'bg-success/10 text-success border-success/20' },
    DEFICIT:    { label: 'Deficit',    class: 'bg-error/10 text-error border-error/20' },
    BREAK_EVEN: { label: 'Break Even', class: 'bg-grey/10 text-secondary border-grey/30' },
  }
  return map[s] ?? null
})

const transactions = computed(() => data.value?.transactions ?? null)
const patterns = computed(() => data.value?.patterns ?? null)
const categories = computed(() => data.value?.spending_by_category?.categories ?? [])
const topMerchants = computed(() => data.value?.top_merchants?.by_amount ?? [])
const recurringPayments = computed(() => data.value?.recurring_payments?.detected_subscriptions ?? [])
const comparison = computed(() => data.value?.comparison ?? null)
const dataQuality = computed(() => data.value?.data_quality ?? null)

const categoryMax = computed(() => {
  if (!categories.value.length) return 1
  return categories.value[0]?.total ?? categories.value[0]?.amount ?? 1
})

const trendConfig = (trend) => {
  const t = trend?.toUpperCase()
  if (t === 'INCREASE' || t === 'INCREASING') return { icon: 'trending_up', class: 'text-error' }
  if (t === 'DECREASE' || t === 'DECREASING') return { icon: 'trending_down', class: 'text-success' }
  if (t === 'FLUCTUATING') return { icon: 'show_chart', class: 'text-warning' }
  return { icon: 'trending_flat', class: 'text-secondary' }
}

const BAR_COLORS = ['bg-navy', 'bg-primary/70', 'bg-navy/60', 'bg-primary/40', 'bg-navy/40', 'bg-primary/25', 'bg-navy/25', 'bg-grey/60']
const barColor = (i) => BAR_COLORS[i % BAR_COLORS.length]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayLabel = (key) => {
  const map = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' }
  return map[key?.toUpperCase()] ?? key ?? '—'
}

const hasWarnings = computed(() =>
  (dataQuality.value?.validation_warnings?.length ?? 0) > 0 ||
  (dataQuality.value?.duplicate_transactions?.length ?? 0) > 0 ||
  (dataQuality.value?.transfer_analysis?.transfer_pair_count ?? 0) > 0
)

onMounted(() => {
  stmtStore.fetchStatements()
  if (selectedStatementId.value) loadAnalysis()
})
</script>

<template>
  <MobileContainer>

    <!-- ── Back + Header ───────────────────────────────────────────────── -->
    <section class="flex items-center gap-3 border-b border-grey bg-white px-4 py-4">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-surface"
        @click="navigateTo('/dashboard/analytics')"
      >
        <span class="material-symbols-outlined text-title-sm" aria-hidden="true">arrow_back</span>
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="text-headline-md font-semibold text-navy">Monthly Analysis</h1>
        <p v-if="period" class="text-body-sm text-secondary">{{ period.month }} {{ period.year }}</p>
      </div>
    </section>

    <!-- ── Statement picker ────────────────────────────────────────────── -->
    <section class="border-b border-grey bg-white px-4 py-4">
      <p class="mb-2 text-label-caps font-bold uppercase tracking-widest text-secondary">Statement</p>
      <SearchableSelectInput
        v-model="selectedStatementId"
        :options="statementOptions"
        placeholder="Choose a statement…"
        search-placeholder="Search statement..."
      />

      <!-- Statement context strip -->
      <div v-if="scopedStatement" class="mt-3 flex items-center gap-3 rounded-[10px] border border-grey/60 bg-surface px-3 py-2.5">
        <span class="material-symbols-outlined shrink-0 text-[18px] text-navy" aria-hidden="true">account_balance</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-body-sm font-semibold text-navy">{{ scopedStatement.bank_name }}</p>
          <p class="text-label-caps text-secondary">
            <template v-if="scopedStatement.account_number">{{ scopedStatement.account_number }} · </template>
            {{ formatDate(scopedStatement.period_start, 'short') }} – {{ formatDate(scopedStatement.period_end, 'short') }}
          </p>
        </div>
        <div v-if="data?.transactions?.total_count != null" class="shrink-0 text-right">
          <p class="text-data-mono font-medium tabular-nums text-navy">{{ data.transactions.total_count }}</p>
          <p class="text-label-caps text-secondary">txns</p>
        </div>
      </div>
    </section>

    <!-- ── No statement selected ──────────────────────────────────────── -->
    <div
      v-if="!selectedStatementId"
      class="flex flex-col items-center px-6 py-16 text-center"
    >
      <span class="material-symbols-outlined mb-4 text-[48px] text-secondary" aria-hidden="true">calendar_month</span>
      <p class="text-title-sm font-medium text-navy">Select a statement</p>
      <p class="mt-1 text-body-sm text-secondary">Choose a processed statement above to view its monthly analysis.</p>
    </div>

    <!-- ── Loading ─────────────────────────────────────────────────────── -->
    <div v-else-if="monthlyLoading" class="space-y-4 px-4 py-4">
      <div v-for="n in 5" :key="n" class="animate-pulse rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 h-4 w-36 rounded bg-grey/40" />
        <div class="grid grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="space-y-2">
            <div class="h-3 w-20 rounded bg-grey/30" />
            <div class="h-6 w-24 rounded bg-grey/40" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── No data returned ───────────────────────────────────────────── -->
    <div
      v-else-if="!monthlyLoading && !data"
      class="flex flex-col items-center px-6 py-16 text-center"
    >
      <span class="material-symbols-outlined mb-4 text-[48px] text-secondary" aria-hidden="true">bar_chart</span>
      <p class="text-title-sm font-medium text-navy">No analysis available</p>
      <p class="mt-1 text-body-sm text-secondary">This statement may not have enough processed transactions yet.</p>
      <BaseButton class="mt-6 max-w-xs" type="button" @click="loadAnalysis">Retry</BaseButton>
    </div>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <div v-else class="space-y-4 px-4 pb-8 pt-4">

      <!-- Partial period alert -->
      <div
        v-if="isPartial"
        class="flex items-start gap-3 rounded-[10px] border border-warning/30 bg-warning/5 p-4"
      >
        <span class="material-symbols-outlined shrink-0 text-[20px] text-warning" aria-hidden="true">schedule</span>
        <div>
          <p class="text-body-sm font-semibold text-navy">Incomplete period</p>
          <p class="mt-0.5 text-body-sm text-secondary">
            {{ projection?.disclaimer ?? period?.disclaimer ?? 'This period is not yet complete. Projected values are estimates.' }}
          </p>
        </div>
      </div>

      <!-- Cashflow overview -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Cashflow</p>
          <span
            v-if="cashflowStatusConfig"
            :class="['rounded border px-2 py-0.5 text-label-caps font-bold uppercase', cashflowStatusConfig.class]"
          >
            {{ cashflowStatusConfig.label }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Gross Income</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(cashflow?.gross_income) }}
            </p>
            <p v-if="isPartial && projection?.projected_income != null" class="text-label-caps text-secondary">
              Proj: {{ formatToMoney(projection.projected_income) }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Gross Expenses</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(cashflow?.gross_expenses) }}
            </p>
            <p v-if="isPartial && projection?.projected_expenses != null" class="text-label-caps text-secondary">
              Proj: {{ formatToMoney(projection.projected_expenses) }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Net Cashflow</p>
            <p
              :class="['mt-1 text-data-mono font-medium tabular-nums', (cashflow?.net_cashflow ?? 0) >= 0 ? 'text-success' : 'text-error']"
            >
              {{ (cashflow?.net_cashflow ?? 0) >= 0 ? '+' : '' }}{{ formatToMoney(cashflow?.net_cashflow) }}
            </p>
            <p v-if="isPartial && projection?.projected_net_cashflow != null" class="text-label-caps text-secondary">
              Proj: {{ formatToMoney(projection.projected_net_cashflow) }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Savings Rate</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-navy">
              {{ cashflow?.savings_rate != null ? Number(cashflow.savings_rate).toFixed(1) + '%' : '—' }}
            </p>
          </div>
          <div v-if="cashflow?.net_income != null && cashflow.net_income !== cashflow.gross_income">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Net Income</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(cashflow.net_income) }}
            </p>
          </div>
          <div v-if="cashflow?.net_expenses != null && cashflow.net_expenses !== cashflow.gross_expenses">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Net Expenses</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(cashflow.net_expenses) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Transaction stats -->
      <section v-if="transactions" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Transaction Stats</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Total</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ transactions.total_count }}</p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Daily Avg</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ transactions.daily_average_count != null ? Number(transactions.daily_average_count).toFixed(1) : '—' }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Debits</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">{{ transactions.debit_count }}</p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Credits</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-success">{{ transactions.credit_count }}</p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Avg Debit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(transactions.average_debit) }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Avg Credit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(transactions.average_credit) }}
            </p>
          </div>
          <div v-if="transactions.largest_debit?.amount">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Largest Debit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(transactions.largest_debit.amount) }}
            </p>
          </div>
          <div v-if="transactions.largest_credit?.amount">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Largest Credit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(transactions.largest_credit.amount) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Spending patterns -->
      <section v-if="patterns" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Spending Patterns</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div v-if="patterns.daily_burn_rate != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Daily Burn Rate</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(patterns.daily_burn_rate) }}
            </p>
          </div>
          <div v-if="patterns.highest_spending_day">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Highest Day</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ patterns.highest_spending_day }}</p>
          </div>
          <div v-if="patterns.lowest_spending_day">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Lowest Day</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ patterns.lowest_spending_day }}</p>
          </div>
          <div v-if="patterns.weekend_vs_weekday?.weekday_spending != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Weekday Spend</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(patterns.weekend_vs_weekday.weekday_spending) }}
            </p>
          </div>
          <div v-if="patterns.weekend_vs_weekday?.weekend_spending != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Weekend Spend</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(patterns.weekend_vs_weekday.weekend_spending) }}
            </p>
          </div>
        </div>

        <!-- Day-of-week bar chart -->
        <div v-if="patterns.by_day_of_week?.length" class="mt-4 border-t border-grey/30 pt-4">
          <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">By Day of Week</p>
          <div class="space-y-2">
            <div
              v-for="day in patterns.by_day_of_week"
              :key="day.day"
              class="flex items-center gap-3"
            >
              <span class="w-8 shrink-0 text-label-caps font-bold text-secondary">{{ dayLabel(day.day) }}</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-grey/20">
                <div
                  class="h-2 rounded-full bg-navy transition-all"
                  :style="{ width: `${Math.min((day.total / (patterns.by_day_of_week[0]?.total || 1)) * 100, 100)}%` }"
                />
              </div>
              <span class="w-20 shrink-0 text-right text-data-mono font-medium tabular-nums text-navy text-[11px]">
                {{ formatToMoney(day.total) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Top categories -->
      <section v-if="categories.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Spending by Category</p>
        <div class="space-y-3">
          <div v-for="(cat, idx) in categories.slice(0, 8)" :key="cat.name ?? idx">
            <div class="mb-1 flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <span class="text-label-caps font-bold text-secondary">{{ cat.rank ?? idx + 1 }}</span>
                <span class="truncate text-body-sm font-medium text-navy">{{ cat.name }}</span>
              </div>
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
            <p v-if="cat.transaction_count" class="mt-0.5 text-label-caps text-secondary">
              {{ cat.transaction_count }} transactions
            </p>
          </div>
        </div>
      </section>

      <!-- Top merchants -->
      <section v-if="topMerchants.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Top Merchants</p>
        <div class="divide-y divide-grey/20">
          <div
            v-for="(merchant, idx) in topMerchants.slice(0, 8)"
            :key="merchant.merchant ?? idx"
            class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <span class="w-5 shrink-0 text-center text-label-caps font-bold text-secondary">{{ idx + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-body-sm font-medium text-navy">{{ merchant.merchant }}</p>
              <p v-if="merchant.category" class="text-label-caps text-secondary">{{ merchant.category }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-data-mono font-medium tabular-nums text-navy">{{ formatToMoney(merchant.total) }}</p>
              <p v-if="merchant.frequency" class="text-label-caps text-secondary">{{ merchant.frequency }} txns</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recurring payments -->
      <section v-if="recurringPayments.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Recurring Payments</p>
          <span v-if="data?.recurring_payments?.total_monthly_recurring" class="text-data-mono font-medium tabular-nums text-navy">
            {{ formatToMoney(data.recurring_payments.total_monthly_recurring) }}/mo
          </span>
        </div>
        <div class="divide-y divide-grey/20">
          <div
            v-for="sub in recurringPayments"
            :key="sub.merchant"
            class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5">
              <span class="material-symbols-outlined text-[16px] text-navy" aria-hidden="true">autorenew</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-body-sm font-medium text-navy">{{ sub.merchant }}</p>
              <p class="text-label-caps text-secondary">{{ sub.category }} · {{ sub.frequency }}</p>
              <p v-if="sub.next_expected" class="mt-0.5 text-label-caps text-secondary">
                Next: {{ formatDate(sub.next_expected, 'short') }}
              </p>
            </div>
            <p class="shrink-0 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(sub.average_amount) }}
            </p>
          </div>
        </div>
        <p
          v-if="data?.recurring_payments?.percentage_of_expenses != null"
          class="mt-3 border-t border-grey/30 pt-3 text-body-sm text-secondary"
        >
          {{ Number(data.recurring_payments.percentage_of_expenses).toFixed(1) }}% of total expenses
        </p>
      </section>

      <!-- Comparison -->
      <section v-if="comparison" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Comparison</p>

        <!-- Previous month -->
        <div v-if="comparison.previous_month" class="flex items-center justify-between gap-3">
          <div>
            <p class="text-body-sm font-medium text-navy">vs Last Month</p>
            <p v-if="comparison.previous_month.expenses != null" class="mt-0.5 text-data-mono font-medium tabular-nums text-secondary">
              {{ formatToMoney(comparison.previous_month.expenses) }} last month
            </p>
            <p
              v-if="comparison.previous_month.percentage_change != null"
              :class="['mt-1 text-body-sm font-medium', trendConfig(comparison.previous_month.trend).class]"
            >
              {{ comparison.previous_month.percentage_change > 0 ? '+' : '' }}{{ Number(comparison.previous_month.percentage_change).toFixed(1) }}% expenses
            </p>
          </div>
          <span
            :class="['material-symbols-outlined text-headline-md', trendConfig(comparison.previous_month.trend).class]"
            aria-hidden="true"
          >
            {{ trendConfig(comparison.previous_month.trend).icon }}
          </span>
        </div>

        <!-- Multi-period averages -->
        <div class="mt-3 grid grid-cols-2 gap-3 border-t border-grey/30 pt-3">
          <div v-if="comparison.three_month_average">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">3-Month Avg</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(comparison.three_month_average) }}
            </p>
          </div>
          <div v-if="comparison.six_month_average">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">6-Month Avg</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(comparison.six_month_average) }}
            </p>
          </div>
          <div v-if="comparison.trend_direction" class="col-span-2">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Overall Trend</p>
            <div class="mt-0.5 flex items-center gap-1.5">
              <span
                :class="['material-symbols-outlined text-[18px]', trendConfig(comparison.trend_direction).class]"
                aria-hidden="true"
              >{{ trendConfig(comparison.trend_direction).icon }}</span>
              <span :class="['text-body-sm font-medium', trendConfig(comparison.trend_direction).class]">
                {{ comparison.trend_direction.charAt(0) + comparison.trend_direction.slice(1).toLowerCase() }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Data quality disclosures -->
      <section v-if="hasWarnings" class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">info</span>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Data Quality</p>
        </div>

        <div class="space-y-2">
          <!-- Validation warnings -->
          <div
            v-for="(warn, i) in dataQuality?.validation_warnings ?? []"
            :key="`warn-${i}`"
            class="flex items-start gap-2 rounded-[6px] bg-warning/5 px-3 py-2"
          >
            <span class="material-symbols-outlined shrink-0 text-[16px] text-warning" aria-hidden="true">warning</span>
            <p class="text-body-sm text-navy">{{ warn }}</p>
          </div>

          <!-- Duplicate exclusions -->
          <div
            v-if="(dataQuality?.duplicate_transactions?.length ?? 0) > 0"
            class="flex items-start gap-2 rounded-[6px] bg-grey/5 px-3 py-2"
          >
            <span class="material-symbols-outlined shrink-0 text-[16px] text-secondary" aria-hidden="true">content_copy</span>
            <p class="text-body-sm text-navy">
              {{ dataQuality.duplicate_transactions.length }} duplicate transactions excluded from analysis.
            </p>
          </div>

          <!-- Transfer pair exclusions -->
          <div
            v-if="(dataQuality?.transfer_analysis?.transfer_pair_count ?? 0) > 0"
            class="flex items-start gap-2 rounded-[6px] bg-grey/5 px-3 py-2"
          >
            <span class="material-symbols-outlined shrink-0 text-[16px] text-secondary" aria-hidden="true">swap_horiz</span>
            <p class="text-body-sm text-navy">
              {{ dataQuality.transfer_analysis.transfer_pair_count }} internal transfer pairs detected and excluded from net metrics.
            </p>
          </div>
        </div>

        <p v-if="dataQuality?.data_completeness_percentage != null" class="mt-3 text-body-sm text-secondary">
          Data completeness: {{ Number(dataQuality.data_completeness_percentage).toFixed(1) }}%
        </p>
      </section>

    </div>
  </MobileContainer>
</template>
