<script setup>
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const store = useBankStatementStore()
const { currentStatement: stmt, detailLoading: loading } = storeToRefs(store)

useHead({ title: computed(() => stmt.value ? `${stmt.value.bank_name} — MiFlujo` : 'Statement — MiFlujo') })

onMounted(() => store.fetchStatement(route.params.id))

// ── Display helpers ─────────────────────────────────────────────────────────
const processingStatusClass = (status) => ({
  COMPLETED:   'bg-success/10 text-success border-success/20',
  PENDING:     'bg-warning/10 text-warning border-warning/20',
  PARTIAL:     'bg-blue-50 text-blue-600 border-blue-200',
  NOT_STARTED: 'bg-grey/10 text-secondary border-grey/20',
  FAILED:      'bg-error/10 text-error border-error/20',
}[status] ?? 'bg-grey/10 text-secondary border-grey/20')

const processingStatusLabel = (status) => ({
  COMPLETED:   'Completed',
  PENDING:     'Pending',
  PARTIAL:     'Partial',
  NOT_STARTED: 'Not Started',
  FAILED:      'Failed',
}[status] ?? (status ?? '—'))

const confidenceClass = (level) => ({
  HIGH:   'bg-success/10 text-success border-success/20',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  LOW:    'bg-error/10 text-error border-error/20',
}[level] ?? 'bg-grey/10 text-secondary border-grey/20')

const parseConfidencePct = computed(() => {
  const v = stmt.value?.parse_confidence
  if (v == null) return null
  return v <= 1 ? Math.round(v * 100) : Math.round(v)
})

const confidencePctClass = (pct) => {
  if (pct == null) return 'text-secondary'
  if (pct >= 80) return 'text-success'
  if (pct >= 50) return 'text-warning'
  return 'text-error'
}

const stages = computed(() => {
  if (!stmt.value) return []
  const s = stmt.value
  return [
    {
      key: 'transactions',
      label: 'Transactions',
      icon: 'receipt_long',
      status: s.transactions_status,
      count: s.transactions_count,
      coverage: null,
      confidence: null,
      lowConfidence: null,
    },
    {
      key: 'category',
      label: 'Category',
      icon: 'label',
      status: s.category_status,
      count: null,
      coverage: s.category_coverage,
      confidence: s.category_confidence,
      lowConfidence: s.category_low_confidence_count,
    },
    {
      key: 'channel',
      label: 'Channel',
      icon: 'hub',
      status: s.channel_status,
      count: null,
      coverage: s.channel_coverage,
      confidence: s.channel_confidence,
      lowConfidence: s.channel_low_confidence_count,
    },
    {
      key: 'entity',
      label: 'Entity',
      icon: 'business',
      status: s.entity_status,
      count: null,
      coverage: s.entity_coverage,
      confidence: s.entity_confidence,
      lowConfidence: s.entity_low_confidence_count,
    },
  ]
})

const formatPct = (v) => {
  if (v == null) return null
  const n = v <= 1 ? Math.round(v * 100) : Math.round(v)
  return `${n}%`
}

const isActionable = computed(() =>
  stmt.value?.processing_status === 'COMPLETED' || stmt.value?.processing_status === 'PARTIAL'
)
</script>

<template>
  <MobileContainer>
    <!-- Back nav -->
    <div class="flex items-center gap-2 px-4 pt-4 pb-2">
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-grey text-navy transition-colors hover:bg-surface"
        @click="navigateTo('/dashboard/statements')"
      >
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
      </button>
      <h1 class="text-title-sm font-bold text-navy truncate">Statement Detail</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4 px-4 pb-6 pt-2">
      <div v-for="n in 5" :key="n" class="h-32 animate-pulse rounded-[10px] border border-grey bg-white" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!stmt"
      class="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <span class="material-symbols-outlined mb-4 text-[48px] text-secondary" aria-hidden="true">description</span>
      <p class="text-title-sm font-medium text-navy">Statement not found</p>
      <BaseButton class="mt-6 max-w-xs" type="button" @click="navigateTo('/dashboard/statements')">
        Back to Statements
      </BaseButton>
    </div>

    <!-- Detail content -->
    <div v-else class="space-y-4 px-4 pb-8 pt-2">

      <!-- Account Information -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-headline-md font-bold text-navy truncate">{{ stmt.bank_name }}</h2>
            <p v-if="stmt.account_name" class="text-body-md text-secondary truncate">{{ stmt.account_name }}</p>
          </div>
          <span
            v-if="stmt.confidence_level"
            :class="['shrink-0 rounded-full border px-3 py-1 text-label-caps font-bold uppercase tracking-wide', confidenceClass(stmt.confidence_level)]"
          >
            {{ stmt.confidence_level }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-y-3">
          <div v-if="stmt.account_number">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Account No.</p>
            <p class="text-data-mono font-medium tabular-nums text-navy">{{ stmt.account_number }}</p>
          </div>
          <div v-if="stmt.account_type">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Account Type</p>
            <p class="text-body-sm text-navy capitalize">{{ stmt.account_type }}</p>
          </div>
          <div v-if="stmt.period_start">
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
      </section>

      <!-- Financial Summary -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <h3 class="text-title-sm font-bold text-navy mb-3">Financial Summary</h3>
        <div class="grid grid-cols-2 gap-y-4">
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Opening Balance</p>
            <p class="text-data-mono font-medium tabular-nums text-navy">
              {{ stmt.opening_balance != null ? formatToMoney(stmt.opening_balance) : '—' }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Closing Balance</p>
            <p class="text-data-mono font-medium tabular-nums text-navy">
              {{ stmt.closing_balance != null ? formatToMoney(stmt.closing_balance) : '—' }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Total Deposits</p>
            <p class="text-data-mono font-medium tabular-nums text-success">
              {{ stmt.total_deposits != null ? `+ ${formatToMoney(stmt.total_deposits)}` : '—' }}
            </p>
          </div>
          <div>
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Total Withdrawals</p>
            <p class="text-data-mono font-medium tabular-nums text-primary">
              {{ stmt.total_withdrawals != null ? `– ${formatToMoney(stmt.total_withdrawals)}` : '—' }}
            </p>
          </div>
        </div>

        <div v-if="stmt.exported_file_url" class="mt-4 pt-4 border-t border-grey/30">
          <a
            :href="stmt.exported_file_url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-body-sm font-medium text-primary hover:underline"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
            Download Statement File
          </a>
        </div>
      </section>

      <!-- Parse Quality -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <h3 class="text-title-sm font-bold text-navy mb-3">Parse Quality</h3>

        <div class="flex items-center justify-between mb-3">
          <span class="text-body-sm text-secondary">Parse Confidence</span>
          <span
            v-if="parseConfidencePct != null"
            :class="['text-data-mono font-medium tabular-nums text-[15px]', confidencePctClass(parseConfidencePct)]"
          >
            {{ parseConfidencePct }}%
          </span>
          <span v-else class="text-body-sm text-secondary">—</span>
        </div>

        <div v-if="parseConfidencePct != null" class="mb-4 h-2 w-full overflow-hidden rounded-full bg-grey/20">
          <div
            class="h-full rounded-full transition-all"
            :class="parseConfidencePct >= 80 ? 'bg-success' : parseConfidencePct >= 50 ? 'bg-warning' : 'bg-error'"
            :style="{ width: `${parseConfidencePct}%` }"
          />
        </div>

        <div v-if="stmt.parse_warnings?.length">
          <p class="text-label-caps font-bold uppercase tracking-widest text-secondary mb-2">Warnings</p>
          <ul class="space-y-1.5">
            <li
              v-for="(warn, i) in stmt.parse_warnings"
              :key="i"
              class="flex items-start gap-2 rounded-[6px] border border-warning/20 bg-warning/5 px-3 py-2"
            >
              <span class="material-symbols-outlined shrink-0 text-[16px] text-warning mt-0.5" aria-hidden="true">warning</span>
              <p class="text-body-sm text-navy">{{ warn }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- Processing Health -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-title-sm font-bold text-navy">Processing Health</h3>
          <span
            v-if="stmt.processing_status"
            :class="['rounded-full border px-2.5 py-0.5 text-label-caps font-bold uppercase', processingStatusClass(stmt.processing_status)]"
          >
            {{ processingStatusLabel(stmt.processing_status) }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="stage in stages"
            :key="stage.key"
            class="rounded-[8px] border border-grey/40 p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">{{ stage.icon }}</span>
                <span class="text-body-sm font-semibold text-navy">{{ stage.label }}</span>
              </div>
              <span
                v-if="stage.status"
                :class="['rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', processingStatusClass(stage.status)]"
              >
                {{ processingStatusLabel(stage.status) }}
              </span>
              <span v-else class="text-body-sm text-secondary">—</span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center">
              <div v-if="stage.count != null">
                <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Count</p>
                <p class="text-data-mono font-medium tabular-nums text-navy">{{ stage.count }}</p>
              </div>
              <div v-if="stage.coverage != null">
                <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Coverage</p>
                <p class="text-data-mono font-medium tabular-nums text-navy">{{ formatPct(stage.coverage) }}</p>
              </div>
              <div v-if="stage.confidence != null">
                <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Confidence</p>
                <p
                  class="text-data-mono font-medium tabular-nums"
                  :class="confidencePctClass(stage.confidence <= 1 ? Math.round(stage.confidence * 100) : Math.round(stage.confidence))"
                >
                  {{ formatPct(stage.confidence) }}
                </p>
              </div>
              <div v-if="stage.lowConfidence != null">
                <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Low Conf.</p>
                <p
                  class="text-data-mono font-medium tabular-nums"
                  :class="stage.lowConfidence > 0 ? 'text-warning' : 'text-success'"
                >
                  {{ stage.lowConfidence }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <section class="space-y-3">
        <template v-if="isActionable">
          <BaseButton
            class="w-full !h-12 !text-label-caps !font-bold uppercase tracking-widest"
            type="button"
            @click="navigateTo(`/dashboard/statements/${route.params.id}/dashboard`)"
          >
            <span class="material-symbols-outlined mr-2 text-[18px]" aria-hidden="true">dashboard</span>
            View Dashboard
          </BaseButton>
          <BaseButton
            class="w-full !h-12 !text-label-caps !font-bold uppercase tracking-widest"
            variant="outline"
            type="button"
            @click="navigateTo(`/dashboard/statements/${route.params.id}/transactions`)"
          >
            <span class="material-symbols-outlined mr-2 text-[18px]" aria-hidden="true">receipt_long</span>
            View Transactions
          </BaseButton>
          <BaseButton
            class="w-full !h-12 !text-label-caps !font-bold uppercase tracking-widest"
            variant="outline"
            type="button"
            @click="navigateTo(`/dashboard/statements/${route.params.id}/analysis`)"
          >
            <span class="material-symbols-outlined mr-2 text-[18px]" aria-hidden="true">bar_chart</span>
            Run Monthly Analysis
          </BaseButton>
        </template>

        <BaseButton
          v-if="stmt.processing_status === 'FAILED'"
          class="w-full !h-12 !text-label-caps !font-bold uppercase tracking-widest"
          type="button"
          @click="navigateTo(`/dashboard/statements/upload?reupload=${route.params.id}`)"
        >
          Re-Upload Statement
        </BaseButton>
      </section>
    </div>
  </MobileContainer>
</template>
