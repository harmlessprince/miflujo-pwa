<script setup>
import { useTransactionStore } from '~/stores/transaction.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const store = useTransactionStore()
const {
  currentTransaction: txn,
  detailLoading: loading,
  correctionHistory,
  correctionLoading,
  correctionSaving,
} = storeToRefs(store)

useHead({ title: computed(() => 'Transaction Detail - MiFlujo') })

const textCorrectionFields = [
  { label: 'Category', value: 'category' },
  { label: 'Personal Category', value: 'user_category' },
  { label: 'Channel', value: 'channel' },
  { label: 'Merchant', value: 'merchant' },
  { label: 'Person', value: 'person' },
  { label: 'Financial Institution', value: 'financial_institution' },
  { label: 'Payment Processor', value: 'payment_processor' },
]

const modeOptions = [
  { label: 'Personal', value: 'personal' },
  { label: 'Business', value: 'business' },
  { label: 'Mixed', value: 'mixed' },
]

const labelCorrectionFields = [
  { label: 'Hidden', value: 'is_hidden' },
  { label: 'Excluded from analysis', value: 'is_excluded' },
  { label: 'Transfer', value: 'is_transfer' },
  { label: 'Internal transfer', value: 'is_internal_transfer' },
  { label: 'Salary', value: 'is_salary' },
  { label: 'Refund', value: 'is_refund' },
  { label: 'Reversal', value: 'is_reversal' },
  { label: 'Subscription', value: 'is_subscription' },
  { label: 'Cash withdrawal', value: 'is_cash_withdrawal' },
  { label: 'Loan repayment', value: 'is_loan_repayment' },
  { label: 'Debt facility', value: 'is_debt_facility' },
  { label: 'Gambling', value: 'is_gambling' },
  { label: 'Fraud review', value: 'fraud_review_flag' },
]

const correctionFieldOptions = [
  ...textCorrectionFields,
  { label: 'Personal / Business Mode', value: 'personal_business_mode' },
  ...labelCorrectionFields,
]

const booleanFieldNames = labelCorrectionFields.map((field) => field.value)
const correctionField = ref('category')
const correctedValue = ref('')
const correctionReason = ref('')
const applyToSimilar = ref(false)

const selectedCorrectionField = computed(() =>
  correctionFieldOptions.find((field) => field.value === correctionField.value)
)

const currentCorrectionValue = computed(() => {
  if (!txn.value) return null
  const aliases = {
    merchant: ['merchant'],
    person: ['person'],
    financial_institution: ['financial_institution'],
    payment_processor: ['payment_processor'],
    user_category: ['user_category', 'category'],
  }
  const keys = aliases[correctionField.value] ?? [correctionField.value]
  return keys.map((key) => txn.value?.[key]).find((value) => value !== undefined && value !== null && value !== '')
})

const isBooleanCorrection = computed(() => booleanFieldNames.includes(correctionField.value))
const isModeCorrection = computed(() => correctionField.value === 'personal_business_mode')

watch(correctionField, () => {
  if (isBooleanCorrection.value) {
    correctedValue.value = currentCorrectionValue.value === true ? 'true' : 'false'
  } else {
    correctedValue.value = currentCorrectionValue.value != null ? String(currentCorrectionValue.value) : ''
  }
})

watch(txn, () => {
  if (!correctedValue.value && currentCorrectionValue.value != null) {
    correctedValue.value = String(currentCorrectionValue.value)
  }
})

onMounted(async () => {
  await store.fetchTransaction(route.params.id)
  await store.fetchCorrections(route.params.id)
})

function confidenceLevel(score) {
  if (score == null) return null
  if (score >= 0.75) return 'HIGH'
  if (score >= 0.50) return 'MEDIUM'
  return 'LOW'
}

const confidenceLevelClass = (score) => {
  const level = confidenceLevel(score)
  if (level === 'HIGH') return 'bg-green-50 text-green-700 border-green-200'
  if (level === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (level === 'LOW') return 'bg-error/10 text-error border-error/20'
  return 'bg-grey/10 text-secondary border-grey/20'
}

const amountClass = computed(() =>
  txn.value?.direction === 'credit' ? 'text-green-700' : 'text-navy'
)

const formattedAmount = computed(() => {
  if (!txn.value) return '—'
  return txn.value.direction === 'credit'
    ? `+${formatToMoney(txn.value.amount)}`
    : `−${formatToMoney(txn.value.amount)}`
})

function correctionValueForPayload() {
  if (isBooleanCorrection.value) return correctedValue.value === 'true'
  return correctedValue.value.trim()
}

async function saveCorrection() {
  if (!correctedValue.value && !isBooleanCorrection.value) return

  const result = await store.submitCorrection(route.params.id, {
    field_name: correctionField.value,
    corrected_value: correctionValueForPayload(),
    correction_source: 'user',
    correction_reason: correctionReason.value.trim() || null,
    apply_to_similar: applyToSimilar.value,
    correction_scope: applyToSimilar.value ? 'account' : 'user',
  })

  if (result.success) {
    correctionReason.value = ''
    applyToSimilar.value = false
    await store.fetchCorrections(route.params.id)
  }
}

function formatCorrectionValue(value) {
  if (Array.isArray(value)) return value.join(', ')
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (value == null || value === '') return 'N/A'
  return String(value)
}

function fieldLabel(fieldName) {
  return correctionFieldOptions.find((field) => field.value === fieldName)?.label ?? fieldName
}

const entityRows = computed(() => [
  {
    label: 'Merchant',
    icon: 'store',
    value: txn.value?.canonical_merchant || txn.value?.merchant,
    confidence: txn.value?.merchant_confidence,
  },
  {
    label: 'Person',
    icon: 'person',
    value: txn.value?.person,
    confidence: txn.value?.person_confidence,
  },
  {
    label: 'Financial Institution',
    icon: 'account_balance',
    value: txn.value?.financial_institution,
    confidence: txn.value?.financial_institution_confidence,
  },
  {
    label: 'Payment Processor',
    icon: 'payments',
    value: txn.value?.payment_processor,
    confidence: txn.value?.payment_processor_confidence,
  },
].filter((item) => item.value))
</script>

<template>
  <MobileContainer>
    <!-- Back nav -->
    <div class="flex items-center gap-2 px-4 pb-2 pt-4">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-grey text-navy transition-colors hover:bg-surface"
        @click="router.go(-1)"
      >
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
      </button>
      <h1 class="truncate text-title-sm font-bold text-navy">Transaction Detail</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4 px-4 pb-6 pt-2">
      <div v-for="n in 4" :key="n" class="h-32 animate-pulse rounded-[10px] border border-grey bg-white" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!txn"
      class="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <span class="material-symbols-outlined mb-4 text-[48px] text-secondary" aria-hidden="true">receipt_long</span>
      <p class="text-title-sm font-medium text-navy">Transaction not found</p>
      <BaseButton class="mt-6 max-w-xs" type="button" @click="router.go(-1)">
        Go Back
      </BaseButton>
    </div>

    <!-- Detail -->
    <div v-else class="space-y-4 px-4 pb-8 pt-2">

      <!-- Amount hero -->
      <section class="rounded-[10px] border border-grey bg-white p-5 text-center">
        <div class="mb-1 text-label-caps font-bold text-secondary">
          {{ txn.direction === 'credit' ? 'CREDIT' : 'DEBIT' }}
        </div>
        <div :class="['text-display-lg font-bold tabular-nums', amountClass]">
          {{ formattedAmount }}
        </div>
        <div class="mt-1 text-body-sm text-secondary">{{ formatDate(txn.date, 'full') }}</div>
      </section>

      <!-- Description -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-1 text-label-caps font-bold uppercase tracking-widest text-secondary">Description</p>
        <p class="text-body-md text-navy">{{ txn.description || txn.narration || '—' }}</p>
      </section>

      <!-- Balances -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <h3 class="mb-3 text-title-sm font-bold text-navy">Balance</h3>
        <div class="grid grid-cols-2 gap-y-3">
          <div v-if="txn.deposit > 0">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Deposit</p>
            <p class="text-data-mono font-medium tabular-nums text-green-700">
              + {{ formatToMoney(txn.deposit) }}
            </p>
          </div>
          <div v-if="txn.withdrawal > 0">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Withdrawal</p>
            <p class="text-data-mono font-medium tabular-nums text-primary">
              − {{ formatToMoney(txn.withdrawal) }}
            </p>
          </div>
          <div v-if="txn.balance != null">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Closing Balance</p>
            <p class="text-data-mono font-medium tabular-nums text-navy">
              {{ formatToMoney(txn.balance) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Classification -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <h3 class="mb-3 text-title-sm font-bold text-navy">Classification</h3>
        <div class="space-y-3">
          <div v-if="txn.category" class="flex items-center justify-between">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Category</p>
            <div class="flex items-center gap-2">
              <span class="rounded-full border border-grey bg-surface px-2.5 py-0.5 text-label-caps text-navy">
                {{ txn.category }}
              </span>
              <span
                v-if="confidenceLevel(txn.category_confidence)"
                :class="['rounded-full border px-2.5 py-0.5 text-label-caps font-bold', confidenceLevelClass(txn.category_confidence)]"
              >
                {{ confidenceLevel(txn.category_confidence) }}
              </span>
            </div>
          </div>

          <div v-if="txn.channel" class="flex items-center justify-between">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Channel</p>
            <span class="rounded-full border border-grey bg-surface px-2.5 py-0.5 text-label-caps text-navy">
              {{ txn.channel }}
            </span>
          </div>

          <div v-if="entityRows.length" class="border-t border-grey/30 pt-3">
            <p class="mb-2 text-label-caps font-bold uppercase tracking-widest text-secondary">Entities</p>
            <div class="space-y-2">
              <div
                v-for="entity in entityRows"
                :key="entity.label"
                class="flex items-center justify-between gap-3"
              >
                <div class="flex min-w-0 items-center gap-1.5 text-body-sm text-navy">
                  <span class="material-symbols-outlined shrink-0 text-[16px] text-secondary" aria-hidden="true">{{ entity.icon }}</span>
                  <span class="truncate">{{ entity.value }}</span>
                </div>
                <span
                  v-if="confidenceLevel(entity.confidence)"
                  :class="['shrink-0 rounded-full border px-2 py-0.5 text-label-caps font-bold', confidenceLevelClass(entity.confidence)]"
                >
                  {{ entity.label }}
                </span>
                <span v-else class="shrink-0 text-label-caps text-secondary">{{ entity.label }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="txn.is_recurring || txn.recurring"
            class="flex items-center justify-between"
          >
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Recurring</p>
            <span class="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-0.5 text-label-caps font-bold text-navy">
              <span class="material-symbols-outlined text-[12px]" aria-hidden="true">repeat</span>
              Yes
            </span>
          </div>

          <div
            v-if="txn.is_abnormal || txn.abnormal"
            class="flex items-center justify-between"
          >
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Unusual</p>
            <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-label-caps font-bold text-amber-700">
              <span class="material-symbols-outlined text-[12px]" aria-hidden="true">warning</span>
              Flagged
            </span>
          </div>
        </div>
      </section>

      <!-- Corrections -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 class="text-title-sm font-bold text-navy">Correct this transaction</h3>
            <p class="mt-1 text-body-sm text-secondary">
              Update labels the system got wrong. MiFlujo uses corrections to improve future statements.
            </p>
          </div>
          <span class="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">edit_note</span>
        </div>

        <div class="space-y-3">
          <SearchableSelectInput
            v-model="correctionField"
            :options="correctionFieldOptions"
            label="Field"
            placeholder="Choose field"
          />

          <div class="rounded-[8px] border border-grey bg-surface p-3">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Current value</p>
            <p class="mt-1 text-body-sm font-medium text-navy">
              {{ formatCorrectionValue(currentCorrectionValue) }}
            </p>
          </div>

          <SearchableSelectInput
            v-if="isBooleanCorrection"
            v-model="correctedValue"
            :options="[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]"
            label="Correct value"
          />

          <SearchableSelectInput
            v-else-if="isModeCorrection"
            v-model="correctedValue"
            :options="modeOptions"
            label="Correct value"
            placeholder="Choose mode"
          />

          <label v-else class="block">
            <span class="block text-body-md font-medium text-navy">Correct value</span>
            <input
              v-model="correctedValue"
              type="text"
              class="mt-2 h-[47px] w-full rounded-[10px] border border-grey bg-white px-4 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
              :placeholder="`Enter ${selectedCorrectionField?.label?.toLowerCase() ?? 'value'}`"
            />
          </label>

          <label class="block">
            <span class="block text-body-md font-medium text-navy">Reason</span>
            <textarea
              v-model="correctionReason"
              rows="3"
              class="mt-2 w-full resize-none rounded-[10px] border border-grey bg-white px-4 py-3 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
              placeholder="Optional note"
            />
          </label>

          <label class="flex items-start gap-3 rounded-[8px] border border-grey bg-surface p-3">
            <input
              v-model="applyToSimilar"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-grey text-primary focus:ring-primary"
            />
            <span>
              <span class="block text-body-sm font-semibold text-navy">Apply to similar future matches</span>
              <span class="block text-body-sm text-secondary">Store this as a personal account-level learning signal.</span>
            </span>
          </label>

          <BaseButton
            type="button"
            :disabled="correctionSaving || (!correctedValue && !isBooleanCorrection)"
            @click="saveCorrection"
          >
            {{ correctionSaving ? 'Saving...' : 'Save Correction' }}
          </BaseButton>
        </div>
      </section>

      <!-- Correction history -->
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-title-sm font-bold text-navy">Correction History</h3>
          <span class="rounded-full bg-surface px-2.5 py-1 text-label-caps font-bold text-secondary">
            {{ correctionHistory.length }}
          </span>
        </div>

        <div v-if="correctionLoading" class="space-y-2">
          <div v-for="n in 2" :key="n" class="h-20 animate-pulse rounded-[8px] bg-surface" />
        </div>

        <p v-else-if="!correctionHistory.length" class="text-body-sm text-secondary">
          No corrections have been recorded for this transaction.
        </p>

        <div v-else class="space-y-3">
          <article
            v-for="correction in correctionHistory"
            :key="correction.id"
            class="rounded-[8px] border border-grey bg-surface p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-body-sm font-semibold text-navy">
                  {{ fieldLabel(correction.field_name) }}
                </p>
                <p class="mt-1 text-body-sm text-secondary">
                  {{ formatCorrectionValue(correction.original_value) }} to
                  <span class="font-semibold text-navy">{{ formatCorrectionValue(correction.corrected_value) }}</span>
                </p>
              </div>
              <p class="shrink-0 text-label-caps font-bold uppercase text-secondary">
                {{ formatDate(correction.created_at, 'short') }}
              </p>
            </div>
            <p v-if="correction.correction_reason" class="mt-2 text-body-sm text-secondary">
              {{ correction.correction_reason }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-if="correction.apply_to_similar"
                class="rounded-full bg-navy/5 px-2.5 py-1 text-label-caps font-bold uppercase text-navy"
              >
                Similar matches
              </span>
              <span class="rounded-full bg-white px-2.5 py-1 text-label-caps font-bold uppercase text-secondary">
                {{ correction.correction_scope }}
              </span>
            </div>
          </article>
        </div>
      </section>

      <!-- Bank Statement context -->
      <section
        v-if="txn.bank_statement"
        class="rounded-[10px] border border-grey bg-white p-4"
      >
        <h3 class="mb-3 text-title-sm font-bold text-navy">Bank Statement</h3>
        <div class="grid grid-cols-2 gap-y-3">
          <div v-if="txn.bank_statement.bank_name || txn.bank_statement.bank_choice_label">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Bank</p>
            <p class="text-body-sm text-navy">
              {{ txn.bank_statement.bank_name ?? txn.bank_statement.bank_choice_label }}
            </p>
          </div>
          <div v-if="txn.bank_statement.account_name">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Account Name</p>
            <p class="text-body-sm text-navy truncate">{{ txn.bank_statement.account_name }}</p>
          </div>
          <div v-if="txn.bank_statement.account_number">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Account No.</p>
            <p class="text-data-mono font-medium tabular-nums text-navy">
              {{ txn.bank_statement.account_number }}
            </p>
          </div>
          <div v-if="txn.bank_statement.start_date">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Period</p>
            <p class="text-data-mono font-medium tabular-nums text-navy text-[11px]">
              {{ formatDate(txn.bank_statement.start_date, 'short') }} –
              {{ formatDate(txn.bank_statement.end_date, 'short') }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="mt-4 flex w-full items-center justify-between rounded-[8px] border border-grey/50 bg-surface px-3 py-2.5 text-body-sm font-medium text-navy transition-colors hover:border-navy/30"
          @click="navigateTo(`/dashboard/statements/${txn.bank_statement.id}`)"
        >
          View Full Statement
          <span class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">chevron_right</span>
        </button>
      </section>
    </div>
  </MobileContainer>
</template>
