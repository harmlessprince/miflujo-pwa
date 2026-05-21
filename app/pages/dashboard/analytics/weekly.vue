<script setup>
import { useInsightsStore } from '~/stores/insights.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { useAccountStore } from '~/stores/account.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Weekly Analysis — MiFlujo' })

const insightsStore = useInsightsStore()
const stmtStore = useBankStatementStore()
const accountStore = useAccountStore()

const { weeklyAnalysis, weeklyLoading } = storeToRefs(insightsStore)

// ── Week reference selector ────────────────────────────────────────────────
const referenceDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedStatementId = ref(null)
const selectedAccountId = ref(null)

const statementOptions = computed(() =>
  stmtStore.statements.map((s) => ({
    value: s.id,
    label: `${s.bank_name ?? s.account_name} – ${formatDate(s.period_start, 'short')} to ${formatDate(s.period_end, 'short')}`,
  }))
)

const accountOptions = computed(() =>
  accountStore.accounts.map((a) => ({
    value: a.id,
    label: a.display_name,
  }))
)

// ── Period bounds from selected statement ──────────────────────────────────
const scopedStatement = computed(() =>
  selectedStatementId.value
    ? stmtStore.statements.find((s) => s.id === selectedStatementId.value) ?? null
    : null
)

const periodMin = computed(() => scopedStatement.value?.period_start ?? null)
const periodMax = computed(() => scopedStatement.value?.period_end ?? null)

function buildParams() {
  const params = { reference_date: referenceDate.value }
  if (selectedStatementId.value) params.bank_statement_id = selectedStatementId.value
  else if (selectedAccountId.value) params.account_id = selectedAccountId.value
  return params
}

async function loadAnalysis() {
  await insightsStore.fetchWeeklyAnalysis(buildParams())
}

function prevWeek() {
  const prev = dayjs(referenceDate.value).subtract(7, 'day').format('YYYY-MM-DD')
  if (periodMin.value && prev < periodMin.value) return
  referenceDate.value = prev
  loadAnalysis()
}

function nextWeek() {
  const next = dayjs(referenceDate.value).add(7, 'day')
  if (next.isAfter(dayjs())) return
  if (periodMax.value && next.format('YYYY-MM-DD') > periodMax.value) return
  referenceDate.value = next.format('YYYY-MM-DD')
  loadAnalysis()
}

const isCurrentWeek = computed(() =>
  dayjs(referenceDate.value).isoWeek() === dayjs().isoWeek() &&
  dayjs(referenceDate.value).year() === dayjs().year()
)

const isAtPeriodStart = computed(() =>
  !!periodMin.value &&
  dayjs(referenceDate.value).subtract(7, 'day').format('YYYY-MM-DD') < periodMin.value
)

watch(selectedStatementId, () => {
  if (periodMin.value && referenceDate.value < periodMin.value) {
    referenceDate.value = periodMin.value
  }
  if (periodMax.value && referenceDate.value > periodMax.value) {
    referenceDate.value = periodMax.value
  }
  loadAnalysis()
})
watch(selectedAccountId, () => loadAnalysis())

// ── Derived data ───────────────────────────────────────────────────────────
const data = weeklyAnalysis

const period = computed(() => data.value?.period ?? null)
const cashflow = computed(() => data.value?.cashflow ?? null)
const cashflowLabel = computed(() => {
  if (selectedStatementId.value) return 'Statement Cashflow'
  if (selectedAccountId.value) return 'Account Cashflow'
  return 'Net Cashflow'
})
const categories = computed(() => data.value?.spending_by_category?.categories ?? [])
const merchantsByAmount = computed(() => data.value?.top_merchants?.by_amount ?? [])
const merchantsByFreq = computed(() => data.value?.top_merchants?.by_frequency ?? [])
const patterns = computed(() => data.value?.patterns ?? null)
const transactions = computed(() => data.value?.transactions ?? null)
const comparison = computed(() => data.value?.comparison ?? null)

const isPartial = computed(() => period.value && !period.value.is_complete)

const cashflowStatusConfig = computed(() => {
  const s = cashflow.value?.cashflow_status
  const map = {
    SURPLUS:    { label: 'Surplus',    class: 'bg-success/10 text-success border-success/20' },
    DEFICIT:    { label: 'Deficit',    class: 'bg-error/10 text-error border-error/20' },
    BREAK_EVEN: { label: 'Break Even', class: 'bg-grey/10 text-secondary border-grey/30' },
  }
  return map[s] ?? null
})

const trendConfig = (trend) => {
  const t = trend?.toUpperCase()
  if (t === 'INCREASE' || t === 'INCREASING') return { icon: 'trending_up', class: 'text-error' }
  if (t === 'DECREASE' || t === 'DECREASING') return { icon: 'trending_down', class: 'text-success' }
  if (t === 'FLUCTUATING') return { icon: 'show_chart', class: 'text-warning' }
  return { icon: 'trending_flat', class: 'text-secondary' }
}

const BAR_COLORS = ['bg-navy', 'bg-primary/70', 'bg-navy/60', 'bg-primary/40', 'bg-navy/40', 'bg-primary/25']
const barColor = (i) => BAR_COLORS[i % BAR_COLORS.length]

const categoryMax = computed(() => {
  if (!categories.value.length) return 1
  return categories.value[0]?.total ?? categories.value[0]?.amount ?? 1
})

const last12Weeks = computed(() => comparison.value?.last_12_weeks ?? [])
const last12Max = computed(() => {
  if (!last12Weeks.value.length) return 1
  return Math.max(...last12Weeks.value.map((w) => w.expenses ?? w.total ?? 0)) || 1
})

const dayLabel = (key) => {
  const map = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' }
  return map[key?.toUpperCase()] ?? key ?? '—'
}

const weekLabel = computed(() => {
  if (!period.value) return null
  return `Week ${period.value.week_number}, ${period.value.year}`
})

onMounted(() => {
  stmtStore.fetchStatements()
  accountStore.fetchAccounts()
  loadAnalysis()
})
</script>

<template>
  <MobileContainer>

    <!-- ── Back + Header ───────────────────────────────────────────────── -->
    <section class="border-b border-grey bg-white px-4 py-4">
      <div class="mb-3 flex items-center gap-3">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-surface"
          @click="navigateTo('/dashboard/analytics')"
        >
          <span class="material-symbols-outlined text-title-sm" aria-hidden="true">arrow_back</span>
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="text-headline-md font-semibold text-navy">Weekly Analysis</h1>
          <p v-if="weekLabel" class="text-body-sm text-secondary">{{ weekLabel }}</p>
        </div>
      </div>

      <!-- Week navigator -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-navy transition-colors',
            isAtPeriodStart ? 'cursor-not-allowed border-grey/30 text-secondary' : 'border-grey hover:bg-surface',
          ]"
          :disabled="isAtPeriodStart"
          @click="prevWeek"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_left</span>
        </button>
        <div class="flex-1 text-center">
          <p class="text-body-sm font-medium text-navy">
            {{ period ? `${formatDate(period.start_date, 'short')} – ${formatDate(period.end_date, 'short')}` : formatDate(referenceDate, 'short') }}
          </p>
          <p v-if="isPartial" class="text-label-caps text-warning">Incomplete week</p>
        </div>
        <button
          type="button"
          :class="[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-navy transition-colors',
            isCurrentWeek || (periodMax && referenceDate >= periodMax) ? 'cursor-not-allowed border-grey/30 text-secondary' : 'border-grey hover:bg-surface',
          ]"
          :disabled="isCurrentWeek || (periodMax && referenceDate >= periodMax)"
          @click="nextWeek"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </section>

    <!-- ── Scope selectors ────────────────────────────────────────────── -->
    <section class="border-b border-grey bg-white px-4 py-4 space-y-3">
      <div>
        <p class="mb-2 text-label-caps font-bold uppercase tracking-widest text-secondary">Statement (optional)</p>
        <SearchableSelectInput
          v-model="selectedStatementId"
          :options="statementOptions"
          placeholder="All statements"
          search-placeholder="Search statement..."
        />
      </div>
      <div v-if="!selectedStatementId">
        <p class="mb-2 text-label-caps font-bold uppercase tracking-widest text-secondary">Account (optional)</p>
        <SearchableSelectInput
          v-model="selectedAccountId"
          :options="accountOptions"
          placeholder="All accounts"
          search-placeholder="Search account..."
        />
      </div>

      <!-- Statement context strip -->
      <div v-if="scopedStatement" class="flex items-center gap-3 rounded-[10px] border border-grey/60 bg-surface px-3 py-2.5">
        <span class="material-symbols-outlined shrink-0 text-[18px] text-navy" aria-hidden="true">account_balance</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-body-sm font-semibold text-navy">{{ scopedStatement.bank_name }}</p>
          <p class="text-label-caps text-secondary">
            <template v-if="scopedStatement.account_number">{{ scopedStatement.account_number }} · </template>
            {{ formatDate(scopedStatement.period_start, 'short') }} – {{ formatDate(scopedStatement.period_end, 'short') }}
          </p>
        </div>
        <p class="shrink-0 text-label-caps text-secondary">Dates constrained</p>
      </div>
    </section>

    <!-- ── Loading ─────────────────────────────────────────────────────── -->
    <div v-if="weeklyLoading" class="space-y-4 px-4 py-4">
      <div v-for="n in 4" :key="n" class="animate-pulse rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 h-4 w-36 rounded bg-grey/40" />
        <div class="grid grid-cols-2 gap-3">
          <div v-for="i in 4" :key="i" class="space-y-2">
            <div class="h-3 w-20 rounded bg-grey/30" />
            <div class="h-6 w-24 rounded bg-grey/40" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── No data ─────────────────────────────────────────────────────── -->
    <div
      v-else-if="!weeklyLoading && !data"
      class="flex flex-col items-center px-6 py-16 text-center"
    >
      <span class="material-symbols-outlined mb-4 text-[48px] text-secondary" aria-hidden="true">date_range</span>
      <p class="text-title-sm font-medium text-navy">No weekly data</p>
      <p class="mt-1 text-body-sm text-secondary">No transactions found for this week. Try a different week or statement.</p>
      <BaseButton class="mt-6 max-w-xs" type="button" @click="loadAnalysis">Retry</BaseButton>
    </div>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <div v-else class="space-y-4 px-4 pb-8 pt-4">

      <!-- Partial alert -->
      <div
        v-if="isPartial"
        class="flex items-start gap-3 rounded-[10px] border border-warning/30 bg-warning/5 p-4"
      >
        <span class="material-symbols-outlined shrink-0 text-[20px] text-warning" aria-hidden="true">schedule</span>
        <div>
          <p class="text-body-sm font-semibold text-navy">Current week in progress</p>
          <p class="mt-0.5 text-body-sm text-secondary">Data shown covers days elapsed so far this week.</p>
        </div>
      </div>

      <!-- Weekly cashflow -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">{{ cashflowLabel }}</p>
          <span
            v-if="cashflowStatusConfig"
            :class="['rounded border px-2 py-0.5 text-label-caps font-bold uppercase', cashflowStatusConfig.class]"
          >
            {{ cashflowStatusConfig.label }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Income</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-success">
              {{ formatToMoney(cashflow?.gross_income ?? cashflow?.income) }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Expenses</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-primary">
              {{ formatToMoney(cashflow?.gross_expenses ?? cashflow?.expenses) }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">{{ cashflowLabel }}</p>
            <p
              :class="['mt-1 text-data-mono font-medium tabular-nums', (cashflow?.net_cashflow ?? 0) >= 0 ? 'text-success' : 'text-error']"
            >
              {{ (cashflow?.net_cashflow ?? 0) >= 0 ? '+' : '' }}{{ formatToMoney(cashflow?.net_cashflow) }}
            </p>
          </div>
          <div v-if="cashflow?.savings_rate != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Savings Rate</p>
            <p class="mt-1 text-data-mono font-medium tabular-nums text-navy">
              {{ Number(cashflow.savings_rate).toFixed(1) }}%
            </p>
          </div>
        </div>
      </section>

      <!-- Transaction stats -->
      <section v-if="transactions" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Transaction Stats</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div v-if="transactions.total_count != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Total</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">{{ transactions.total_count }}</p>
          </div>
          <div v-if="transactions.debit_count != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Debits</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">{{ transactions.debit_count }}</p>
          </div>
          <div v-if="transactions.credit_count != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Credits</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-success">{{ transactions.credit_count }}</p>
          </div>
          <div v-if="transactions.average_debit != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Avg Debit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-primary">{{ formatToMoney(transactions.average_debit) }}</p>
          </div>
          <div v-if="transactions.average_credit != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Avg Credit</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-success">{{ formatToMoney(transactions.average_credit) }}</p>
          </div>
        </div>
      </section>

      <!-- Day-by-day patterns -->
      <section v-if="patterns?.by_day_of_week?.length" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Day-by-Day Spending</p>
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

        <!-- Weekend vs weekday -->
        <div v-if="patterns.weekend_vs_weekday" class="mt-3 grid grid-cols-2 gap-3 border-t border-grey/30 pt-3">
          <div v-if="patterns.weekend_vs_weekday.weekday_spending != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Weekdays</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(patterns.weekend_vs_weekday.weekday_spending) }}
            </p>
          </div>
          <div v-if="patterns.weekend_vs_weekday.weekend_spending != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Weekend</p>
            <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(patterns.weekend_vs_weekday.weekend_spending) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Category breakdown -->
      <section v-if="categories.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Spending by Category</p>
        <div class="space-y-3">
          <div v-for="(cat, idx) in categories.slice(0, 6)" :key="cat.name ?? idx">
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

      <!-- Top merchants -->
      <section v-if="merchantsByAmount.length > 0" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Top Merchants by Amount</p>
        <div class="divide-y divide-grey/20">
          <div
            v-for="(merchant, idx) in merchantsByAmount.slice(0, 5)"
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

      <!-- Comparison -->
      <section v-if="comparison" class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Comparison</p>

        <!-- vs Previous week -->
        <div v-if="comparison.previous_week" class="flex items-center justify-between gap-3">
          <div>
            <p class="text-body-sm font-medium text-navy">vs Last Week</p>
            <p v-if="comparison.previous_week.expenses != null" class="mt-0.5 text-data-mono font-medium tabular-nums text-secondary">
              {{ formatToMoney(comparison.previous_week.expenses) }} last week
            </p>
            <p
              v-if="comparison.previous_week.percentage_change != null"
              :class="['mt-1 text-body-sm font-medium', trendConfig(comparison.previous_week.trend).class]"
            >
              {{ comparison.previous_week.percentage_change > 0 ? '+' : '' }}{{ Number(comparison.previous_week.percentage_change).toFixed(1) }}%
            </p>
          </div>
          <span
            :class="['material-symbols-outlined text-headline-md', trendConfig(comparison.previous_week.trend).class]"
            aria-hidden="true"
          >{{ trendConfig(comparison.previous_week.trend).icon }}</span>
        </div>

        <!-- 4-week average -->
        <div v-if="comparison.four_week_average != null" class="mt-3 border-t border-grey/30 pt-3">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">4-Week Average</p>
          <p class="mt-0.5 text-data-mono font-medium tabular-nums text-navy">
            {{ formatToMoney(comparison.four_week_average) }}
          </p>
        </div>

        <!-- Last 12 weeks sparkline -->
        <div v-if="last12Weeks.length > 0" class="mt-3 border-t border-grey/30 pt-3">
          <p class="mb-3 text-label-caps font-bold uppercase tracking-widest text-secondary">Last 12 Weeks</p>
          <div class="flex items-end gap-1" style="height: 48px;">
            <div
              v-for="(week, idx) in last12Weeks.slice(-12)"
              :key="week.week_number ?? idx"
              class="flex-1"
            >
              <div
                :class="[
                  'w-full rounded-t-sm transition-all',
                  idx === last12Weeks.slice(-12).length - 1 ? 'bg-primary' : 'bg-navy/40',
                ]"
                :style="{
                  height: `${Math.max(Math.round(((week.expenses ?? week.total ?? 0) / last12Max) * 44), 4)}px`,
                }"
                :title="`Wk ${week.week_number}: ${formatToMoney(week.expenses ?? week.total)}`"
              />
            </div>
          </div>
          <div class="mt-1 flex justify-between">
            <span class="text-label-caps text-secondary">{{ last12Weeks.slice(-12)[0]?.week_number ? `Wk ${last12Weeks.slice(-12)[0].week_number}` : '' }}</span>
            <span class="text-label-caps text-primary">This week</span>
          </div>
        </div>
      </section>

    </div>
  </MobileContainer>
</template>
