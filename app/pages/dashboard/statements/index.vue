<script setup>
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { formatToMoney, formatDate, cleanObject } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Statements — MiFlujo' })

const store = useBankStatementStore()
const { statements, loading, choices } = storeToRefs(store)

// ── Status filter pills (client-side) ──────────────────────────────────────
const filterStatus = ref('all')

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Failed', value: 'FAILED' },
]

const filteredStatements = computed(() => {
  if (filterStatus.value === 'all') return statements.value
  return statements.value.filter((s) => s.processing_status === filterStatus.value)
})

// ── API filters (bottom sheet) ──────────────────────────────────────────────
const EMPTY_FILTERS = {
  bank_choice: '',
  account_name: '',
  account_number: '',
  processing_status: '',
  transactions_status: '',
  category_status: '',
  channel_status: '',
  entity_status: '',
  confidence_level: '',
  from_date: '',
  to_date: '',
  created_from_date: '',
  created_to_date: '',
}

const showFilters = ref(false)
const draft = ref({ ...EMPTY_FILTERS })
const appliedFilters = ref({ ...EMPTY_FILTERS })

const activeFilterCount = computed(
  () => Object.values(appliedFilters.value).filter((v) => v !== '').length
)

const bankOptions = computed(() =>
  choices.value.map((c) => ({ label: c.name, value: c.key }))
)

const processingStatusOptions = [
  { label: 'Not Started', value: 'NOT_STARTED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
]

const confidenceLevelOptions = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
]

watch(showFilters, (open) => {
  if (open) draft.value = { ...appliedFilters.value }
})

async function applyFilters() {
  appliedFilters.value = { ...draft.value }
  await store.fetchStatements(cleanObject({ ...draft.value }))
  showFilters.value = false
}

async function clearFilters() {
  draft.value = { ...EMPTY_FILTERS }
  appliedFilters.value = { ...EMPTY_FILTERS }
  await store.fetchStatements({})
  showFilters.value = false
}

onMounted(() => {
  store.fetchStatements()
  store.fetchChoices()
})

// ── Delete ──────────────────────────────────────────────────────────────────
const confirmDeleteId = ref(null)

async function confirmDelete() {
  if (!confirmDeleteId.value) return
  await store.deleteStatement(confirmDeleteId.value)
  confirmDeleteId.value = null
}

// ── Display helpers ─────────────────────────────────────────────────────────
const processingStatusClass = (status) => ({
  COMPLETED:   'bg-success/10 text-success',
  PENDING:     'bg-warning/10 text-warning',
  PARTIAL:     'bg-blue-50 text-blue-600',
  NOT_STARTED: 'bg-grey/10 text-secondary',
  FAILED:      'bg-error/10 text-error',
}[status] ?? 'bg-grey/10 text-navy')

const processingStatusLabel = (status) => ({
  COMPLETED:   'Completed',
  PENDING:     'Pending',
  PARTIAL:     'Partial',
  NOT_STARTED: 'Not Started',
  FAILED:      'Failed',
}[status] ?? status)

const confidenceClass = (level) => ({
  HIGH:   'bg-success/10 text-success',
  MEDIUM: 'bg-warning/10 text-warning',
  LOW:    'bg-error/10 text-error',
}[level] ?? 'bg-grey/10 text-secondary')

const isActionable = (stmt) => stmt.processing_status === 'COMPLETED' || stmt.processing_status === 'PARTIAL'
</script>

<template>
  <MobileContainer>
    <!-- Filter Pills + Filter Button -->
    <section class="px-4 pt-4 pb-2">
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          type="button"
          :class="[
            'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-sm font-medium transition-colors',
            filterStatus === f.value
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-grey bg-white text-navy',
          ]"
          @click="filterStatus = f.value"
        >
          {{ f.label }}
        </button>

        <button
          type="button"
          class="relative ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-body-sm font-medium transition-colors"
          :class="activeFilterCount > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-grey bg-white text-navy'"
          @click="showFilters = true"
        >
          <span class="material-symbols-outlined text-[16px]" aria-hidden="true">tune</span>
          Filters
          <span
            v-if="activeFilterCount > 0"
            class="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>
    </section>

    <!-- Loading Skeletons -->
    <div v-if="loading" class="space-y-4 px-4 pb-6 pt-2">
      <div
        v-for="n in 3"
        :key="n"
        class="h-64 animate-pulse rounded-[10px] border border-grey bg-white"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredStatements.length === 0"
      class="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <span class="material-symbols-outlined mb-4 text-[48px] text-secondary" aria-hidden="true">description</span>
      <p class="text-title-sm font-medium text-navy">No statements yet</p>
      <p class="mt-1 text-body-sm text-secondary">Upload a bank statement to get started.</p>
      <BaseButton class="mt-6 max-w-xs" type="button" @click="navigateTo('/dashboard/statements/upload')">
        Upload Statement
      </BaseButton>
    </div>

    <!-- Statement Cards -->
    <div v-else class="space-y-4 px-4 pb-6 pt-2">
      <article
        v-for="stmt in filteredStatements"
        :key="stmt.id"
        class="overflow-hidden rounded-[10px] border border-grey bg-white shadow-sm"
      >
        <div class="p-4">
          <!-- Card Header -->
          <div class="mb-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-title-sm font-bold text-navy truncate">{{ stmt.bank_name }}</h3>
              <p v-if="stmt.account_name" class="text-body-sm text-secondary truncate">{{ stmt.account_name }}</p>
              <p v-if="stmt.account_number" class="text-label-caps font-bold uppercase tracking-widest text-secondary">
                {{ stmt.account_number }}
              </p>
            </div>
            <span
              :class="['shrink-0 rounded px-2 py-1 text-label-caps font-bold uppercase', processingStatusClass(stmt.processing_status)]"
            >
              {{ processingStatusLabel(stmt.processing_status) }}
            </span>
          </div>

          <!-- Period + Uploaded -->
          <div class="mb-3 grid grid-cols-2 gap-3">
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Period</p>
              <p class="text-data-mono font-medium tabular-nums text-navy text-[11px]">
                {{ formatDate(stmt.period_start, 'short') }} – {{ formatDate(stmt.period_end, 'short') }}
              </p>
            </div>
            <div v-if="stmt.created_at">
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Uploaded</p>
              <p class="text-data-mono font-medium tabular-nums text-navy text-[11px]">
                {{ formatDate(stmt.created_at, 'short') }}
              </p>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div
            v-if="isActionable(stmt)"
            class="mb-3 grid grid-cols-2 gap-y-3 border-b border-t border-grey/30 py-3"
          >
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Opening</p>
              <p class="text-data-mono font-medium tabular-nums text-navy text-[12px]">
                {{ formatToMoney(stmt.opening_balance) }}
              </p>
            </div>
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Closing</p>
              <p class="text-data-mono font-medium tabular-nums text-navy text-[12px]">
                {{ stmt.closing_balance != null ? formatToMoney(stmt.closing_balance) : '--' }}
              </p>
            </div>
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Deposits</p>
              <p class="text-data-mono font-medium tabular-nums text-success text-[12px]">
                + {{ stmt.total_deposits != null ? formatToMoney(stmt.total_deposits) : '--' }}
              </p>
            </div>
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Withdrawals</p>
              <p class="text-data-mono font-medium tabular-nums text-primary text-[12px]">
                – {{ stmt.total_withdrawals != null ? formatToMoney(stmt.total_withdrawals) : '--' }}
              </p>
            </div>
          </div>

          <!-- Failed error -->
          <div
            v-else-if="stmt.processing_status === 'FAILED'"
            class="mb-3 flex items-start gap-2 rounded-[6px] border border-error/20 bg-error/5 p-3"
          >
            <span class="material-symbols-outlined shrink-0 text-[18px] text-error" aria-hidden="true">warning</span>
            <p class="text-body-sm text-navy">
              {{ stmt.error_message ?? 'Statement processing failed. Please re-upload.' }}
            </p>
          </div>

          <!-- Processing stage badges -->
          <div class="mb-3 flex flex-wrap gap-1.5">
            <span
              v-if="stmt.transactions_status"
              :class="['rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', processingStatusClass(stmt.transactions_status)]"
            >
              Transactions: {{ processingStatusLabel(stmt.transactions_status) }}
            </span>
            <span
              v-if="stmt.category_status"
              :class="['rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', processingStatusClass(stmt.category_status)]"
            >
              Cat: {{ processingStatusLabel(stmt.category_status) }}
            </span>
            <span
              v-if="stmt.channel_status"
              :class="['rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', processingStatusClass(stmt.channel_status)]"
            >
              Ch: {{ processingStatusLabel(stmt.channel_status) }}
            </span>
            <span
              v-if="stmt.entity_status"
              :class="['rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', processingStatusClass(stmt.entity_status)]"
            >
              Ent: {{ processingStatusLabel(stmt.entity_status) }}
            </span>
            <span
              v-if="stmt.confidence_level"
              :class="['rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', confidenceClass(stmt.confidence_level)]"
            >
              {{ stmt.confidence_level }} Confidence
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Completed / Partial -->
            <template v-if="isActionable(stmt)">
              <BaseButton
                class="flex-1 !h-10 !text-label-caps !font-bold uppercase tracking-widest"
                type="button"
                @click="navigateTo(`/dashboard/statements/${stmt.id}/dashboard`)"
              >
                Dashboard
              </BaseButton>
              <BaseButton
                class="flex-1 !h-10 !text-label-caps !font-bold uppercase tracking-widest"
                variant="outline"
                type="button"
                @click="navigateTo(`/dashboard/statements/${stmt.id}/transactions`)"
              >
                Transactions
              </BaseButton>
            </template>

            <!-- Failed: re-upload -->
            <template v-else-if="stmt.processing_status === 'FAILED'">
              <BaseButton
                class="flex-1 !h-10 !text-label-caps !font-bold uppercase tracking-widest"
                type="button"
                @click="navigateTo(`/dashboard/statements/upload?reupload=${stmt.id}`)"
              >
                Re-Upload
              </BaseButton>
            </template>

            <!-- Pending / Not Started: dimmed -->
            <template v-else>
              <div class="flex h-10 flex-1 cursor-not-allowed items-center justify-center rounded-[10px] bg-grey/20 text-label-caps font-bold uppercase tracking-widest text-secondary opacity-60">
                Processing…
              </div>
            </template>

            <!-- View Detail — always available -->
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-grey text-navy transition-colors hover:bg-surface"
              @click="navigateTo(`/dashboard/statements/${stmt.id}`)"
              title="View detail"
            >
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">info</span>
            </button>

            <!-- Delete -->
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-grey text-secondary transition-colors hover:border-error hover:text-error hover:bg-error/5"
              @click="confirmDeleteId = stmt.id"
              title="Delete statement"
            >
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">delete</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
        @click.self="confirmDeleteId = null"
      >
        <div class="w-full max-w-[430px] rounded-[16px] bg-white p-6 shadow-xl">
          <p class="text-title-sm font-bold text-navy mb-2">Delete Statement?</p>
          <p class="text-body-sm text-secondary mb-6">This action cannot be undone. All associated data will be removed.</p>
          <div class="flex gap-3">
            <BaseButton variant="outline" class="flex-1 !h-12" type="button" @click="confirmDeleteId = null">
              Cancel
            </BaseButton>
            <BaseButton
              class="flex-1 !h-12 !bg-error !border-error"
              type="button"
              @click="confirmDelete"
            >
              Delete
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Filter Bottom Sheet -->
    <BaseDrawer v-model:open="showFilters" side="bottom" content-class="p-0">
      <div class="flex justify-center pt-3 pb-1">
        <div class="h-1 w-10 rounded-full bg-grey/40" />
      </div>

      <div class="flex items-center justify-between px-5 py-4 border-b border-grey/30">
        <h2 class="text-title-sm font-bold text-navy">Filters</h2>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-surface transition-colors"
          @click="showFilters = false"
        >
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
        </button>
      </div>

      <div class="overflow-y-auto px-5 py-5 space-y-6 max-h-[65vh]">

        <!-- Bank -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Bank / Wallet</p>
          <SearchableSelectInput
            v-model="draft.bank_choice"
            :options="bankOptions"
            placeholder="All banks"
            search-placeholder="Search bank..."
          />
        </div>

        <!-- Account Name -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Account Name</p>
          <input
            v-model="draft.account_name"
            type="text"
            placeholder="e.g. John Doe"
            class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-3 text-body-md text-navy focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          />
        </div>

        <!-- Account Number -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Account Number</p>
          <input
            v-model="draft.account_number"
            type="text"
            placeholder="e.g. 0123456789"
            class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-3 text-body-md text-navy focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
          />
        </div>

        <!-- Processing Status -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Status</p>
          <SearchableSelectInput
            v-model="draft.processing_status"
            :options="processingStatusOptions"
            placeholder="Any status"
            search-placeholder="Search status..."
          />
        </div>

        <!-- Transactions Status -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Transactions Status</p>
          <SearchableSelectInput
            v-model="draft.transactions_status"
            :options="processingStatusOptions"
            placeholder="Any"
            search-placeholder="Search..."
          />
        </div>

        <!-- Category Status -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Category Status</p>
          <SearchableSelectInput
            v-model="draft.category_status"
            :options="processingStatusOptions"
            placeholder="Any"
            search-placeholder="Search..."
          />
        </div>

        <!-- Channel Status -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Channel Status</p>
          <SearchableSelectInput
            v-model="draft.channel_status"
            :options="processingStatusOptions"
            placeholder="Any"
            search-placeholder="Search..."
          />
        </div>

        <!-- Entity Status -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Entity Status</p>
          <SearchableSelectInput
            v-model="draft.entity_status"
            :options="processingStatusOptions"
            placeholder="Any"
            search-placeholder="Search..."
          />
        </div>

        <!-- Confidence Level -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Confidence Level</p>
          <SearchableSelectInput
            v-model="draft.confidence_level"
            :options="confidenceLevelOptions"
            placeholder="Any"
            search-placeholder="Search..."
          />
        </div>

        <!-- Statement Period -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-3">Statement Period</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-body-sm text-secondary mb-1.5">From</p>
              <input
                v-model="draft.from_date"
                type="date"
                class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-3 text-body-md text-navy focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              />
            </div>
            <div>
              <p class="text-body-sm text-secondary mb-1.5">To</p>
              <input
                v-model="draft.to_date"
                type="date"
                :min="draft.from_date || undefined"
                class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-3 text-body-md text-navy focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              />
            </div>
          </div>
        </div>

        <!-- Upload Date -->
        <div>
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-3">Upload Date</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-body-sm text-secondary mb-1.5">From</p>
              <input
                v-model="draft.created_from_date"
                type="date"
                class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-3 text-body-md text-navy focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              />
            </div>
            <div>
              <p class="text-body-sm text-secondary mb-1.5">To</p>
              <input
                v-model="draft.created_to_date"
                type="date"
                :min="draft.created_from_date || undefined"
                class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-3 text-body-md text-navy focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 px-5 py-4 border-t border-grey/30">
        <BaseButton
          variant="outline"
          class="flex-1 !h-12 !text-label-caps !font-bold uppercase tracking-widest"
          type="button"
          @click="clearFilters"
        >
          Clear All
        </BaseButton>
        <BaseButton
          class="flex-1 !h-12 !text-label-caps !font-bold uppercase tracking-widest"
          type="button"
          @click="applyFilters"
        >
          Apply Filters
        </BaseButton>
      </div>
    </BaseDrawer>
  </MobileContainer>
</template>
