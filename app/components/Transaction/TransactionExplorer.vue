<script setup>
import { useTransactionStore } from '~/stores/transaction.store.js'
import { debounce } from '~/utils/helpers.js'
import dayjs from 'dayjs'

const props = defineProps({
  fixedParams: { type: Object, default: () => ({}) },
  emptyTitle: { type: String, default: 'No transactions found' },
  emptyMessage: { type: String, default: 'Try adjusting your filters or search query.' },
  emptyZeroMessage: { type: String, default: 'No transactions yet.' },
  showUploadCta: { type: Boolean, default: false },
  backPath: { type: String, default: null },
})

const transactionStore = useTransactionStore()

const searchQuery = ref('')
const semanticQuery = ref('')
const period = ref('all')
const startDate = ref('')
const endDate = ref('')
const directionFilter = ref('all')
const depositMin = ref('')
const depositMax = ref('')
const withdrawalMin = ref('')
const withdrawalMax = ref('')
const limit = ref('')
const filtersOpen = ref(false)

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'weekly', label: 'Week' },
  { value: 'monthly', label: 'Month' },
  { value: 'custom', label: 'Custom' },
]

const DIRECTION_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Credits' },
  { value: 'debit', label: 'Debits' },
]

const LIMIT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
]

function resolvePeriodDates(p) {
  const today = dayjs()
  if (p === 'weekly') return { start: today.subtract(6, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') }
  if (p === 'monthly') return { start: today.startOf('month').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') }
  return { start: startDate.value, end: endDate.value }
}

const activeFilterCount = computed(() => {
  let count = 0
  if (semanticQuery.value) count++
  if (directionFilter.value !== 'all') count++
  if (period.value !== 'all') count++
  if (period.value === 'custom' && startDate.value) count++
  if (period.value === 'custom' && endDate.value) count++
  if (depositMin.value) count++
  if (depositMax.value) count++
  if (withdrawalMin.value) count++
  if (withdrawalMax.value) count++
  if (limit.value) count++
  return count
})

const filteredTransactions = computed(() => {
  if (directionFilter.value === 'all') return transactionStore.transactions
  return transactionStore.transactions.filter((t) =>
    directionFilter.value === 'credit'
      ? t.direction === 'credit' || t.deposit > 0
      : t.direction === 'debit' || t.withdrawal > 0,
  )
})

function buildParams() {
  const params = { ...props.fixedParams }
  if (searchQuery.value) params.description = searchQuery.value
  if (semanticQuery.value) params.semantic_search = semanticQuery.value
  const { start, end } = resolvePeriodDates(period.value)
  if (start) params.start_date = start
  if (end) params.end_date = end
  if (depositMin.value) params.deposit_min = depositMin.value
  if (depositMax.value) params.deposit_max = depositMax.value
  if (withdrawalMin.value) params.withdrawal_min = withdrawalMin.value
  if (withdrawalMax.value) params.withdrawal_max = withdrawalMax.value
  if (limit.value) params.limit = limit.value
  return params
}

async function loadTransactions() {
  await transactionStore.fetchTransactions(buildParams())
}

const debouncedSearch = debounce(() => loadTransactions(), 600)

function applyFilters() {
  filtersOpen.value = false
  loadTransactions()
}

function clearFilters() {
  searchQuery.value = ''
  semanticQuery.value = ''
  period.value = 'all'
  startDate.value = ''
  endDate.value = ''
  directionFilter.value = 'all'
  depositMin.value = ''
  depositMax.value = ''
  withdrawalMin.value = ''
  withdrawalMax.value = ''
  limit.value = ''
  filtersOpen.value = false
  loadTransactions()
}

watch(searchQuery, () => debouncedSearch())
watch(period, (val) => { if (val !== 'custom') loadTransactions() })

onMounted(() => loadTransactions())
</script>

<template>
  <!-- Filter Bar -->
  <section class="sticky top-0 z-10 border-b border-grey bg-white">
    <div class="flex items-center gap-2 px-4 py-3">
      <div class="relative flex-1">
        <span
          class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-title-sm text-secondary"
          aria-hidden="true"
        >search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search transactions..."
          class="h-11 w-full rounded-[10px] border border-grey bg-surface pl-10 pr-4 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="button"
        :class="[
          'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border transition-colors',
          filtersOpen || activeFilterCount > 0
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-grey bg-white text-navy',
        ]"
        :aria-label="`${filtersOpen ? 'Hide' : 'Show'} filters`"
        @click="filtersOpen = !filtersOpen"
      >
        <span class="material-symbols-outlined text-title-sm" aria-hidden="true">tune</span>
        <span
          v-if="activeFilterCount > 0"
          class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
        >{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Filter Panel -->
    <div v-if="filtersOpen" class="space-y-4 border-t border-grey px-4 pb-4 pt-3">

      <!-- Semantic Search -->
      <div>
        <div class="mb-2 text-label-caps font-bold text-navy">SEMANTIC SEARCH</div>
        <div class="relative">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-title-sm text-secondary"
            aria-hidden="true"
          >auto_awesome</span>
          <input
            v-model="semanticQuery"
            type="text"
            placeholder="e.g. food, subscriptions, transfers…"
            class="h-11 w-full rounded-[10px] border border-grey bg-surface pl-10 pr-4 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Period -->
      <div>
        <div class="mb-2 text-label-caps font-bold text-navy">PERIOD</div>
        <div class="flex rounded-[10px] border border-grey bg-surface p-1">
          <button
            v-for="opt in PERIOD_OPTIONS"
            :key="opt.value"
            type="button"
            :class="[
              'flex-1 rounded-[8px] py-2 text-body-sm font-medium transition-colors',
              period === opt.value ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-grey/30',
            ]"
            @click="period = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Custom date range -->
        <div v-if="period === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-body-sm text-navy">From</label>
            <input
              v-model="startDate"
              type="date"
              class="h-11 w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="mb-1 block text-body-sm text-navy">To</label>
            <input
              v-model="endDate"
              type="date"
              class="h-11 w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <!-- Direction -->
      <div>
        <div class="mb-2 text-label-caps font-bold text-navy">DIRECTION</div>
        <div class="flex rounded-[10px] border border-grey bg-surface p-1">
          <button
            v-for="opt in DIRECTION_OPTIONS"
            :key="opt.value"
            type="button"
            :class="[
              'flex-1 rounded-[8px] py-2 text-body-sm font-medium transition-colors',
              directionFilter === opt.value ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-grey/30',
            ]"
            @click="directionFilter = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Deposit Range -->
      <div>
        <div class="mb-2 text-label-caps font-bold text-navy">DEPOSIT RANGE (₦)</div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-body-sm text-navy">Min</label>
            <input
              v-model="depositMin"
              type="number"
              min="0"
              placeholder="0"
              class="h-11 w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="mb-1 block text-body-sm text-navy">Max</label>
            <input
              v-model="depositMax"
              type="number"
              min="0"
              placeholder="Any"
              class="h-11 w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <!-- Withdrawal Range -->
      <div>
        <div class="mb-2 text-label-caps font-bold text-navy">WITHDRAWAL RANGE (₦)</div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-body-sm text-navy">Min</label>
            <input
              v-model="withdrawalMin"
              type="number"
              min="0"
              placeholder="0"
              class="h-11 w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="mb-1 block text-body-sm text-navy">Max</label>
            <input
              v-model="withdrawalMax"
              type="number"
              min="0"
              placeholder="Any"
              class="h-11 w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <!-- Result Limit -->
      <div>
        <div class="mb-2 text-label-caps font-bold text-navy">RESULT LIMIT</div>
        <div class="flex rounded-[10px] border border-grey bg-surface p-1">
          <button
            v-for="opt in LIMIT_OPTIONS"
            :key="opt.value"
            type="button"
            :class="[
              'flex-1 rounded-[8px] py-2 text-body-sm font-medium transition-colors',
              limit === opt.value ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-grey/30',
            ]"
            @click="limit = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-1">
        <button
          type="button"
          class="flex-1 rounded-[10px] border border-grey py-2.5 text-body-sm font-medium text-navy transition-colors hover:bg-surface"
          @click="clearFilters"
        >
          Clear All
        </button>
        <BaseButton class="flex-1" @click="applyFilters">Apply</BaseButton>
      </div>
    </div>
  </section>

  <!-- Loading Skeletons -->
  <section v-if="transactionStore.loading" class="space-y-3 px-4 py-4">
    <div
      v-for="i in 6"
      :key="i"
      class="animate-pulse rounded-[12px] border border-grey bg-white p-4"
    >
      <div class="mb-3 flex items-center justify-between">
        <div class="h-5 w-14 rounded-full bg-grey/50" />
        <div class="h-4 w-24 rounded bg-grey/30" />
      </div>
      <div class="mb-3 h-4 w-3/4 rounded bg-grey/30" />
      <div class="mb-3 h-6 w-2/5 rounded bg-grey/30" />
      <div class="flex gap-2">
        <div class="h-5 w-20 rounded-full bg-grey/30" />
        <div class="h-5 w-10 rounded-full bg-grey/20" />
      </div>
    </div>
  </section>

  <!-- Empty State -->
  <section
    v-else-if="filteredTransactions.length === 0"
    class="flex flex-col items-center px-6 py-16 text-center"
  >
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
      <span class="material-symbols-outlined text-display-lg text-secondary" aria-hidden="true">receipt_long</span>
    </div>
    <h2 class="mb-2 text-title-sm font-semibold text-navy">{{ emptyTitle }}</h2>
    <p class="mb-6 text-body-sm text-secondary">
      {{ transactionStore.total === 0 ? emptyZeroMessage : emptyMessage }}
    </p>
    <div class="flex w-full flex-col gap-3">
      <BaseButton
        v-if="showUploadCta && transactionStore.total === 0"
        class="flex w-full items-center justify-center gap-2"
        @click="navigateTo('/dashboard/statements/upload')"
      >
        <span class="material-symbols-outlined text-title-sm" aria-hidden="true">upload_file</span>
        Upload Statement
      </BaseButton>
      <button
        v-else-if="activeFilterCount > 0 || searchQuery"
        type="button"
        class="text-body-sm font-medium text-primary"
        @click="clearFilters"
      >
        Clear filters
      </button>
      <BaseButton
        v-else-if="backPath"
        variant="outline"
        class="max-w-xs self-center"
        @click="navigateTo(backPath)"
      >
        Go Back
      </BaseButton>
    </div>
  </section>

  <!-- Transaction List -->
  <section v-else class="space-y-3 px-4 py-4">
    <TransactionCard
      v-for="transaction in filteredTransactions"
      :key="transaction.id"
      :transaction="transaction"
      @select="navigateTo(`/dashboard/transactions/${$event.id}`)"
    />
  </section>
</template>
