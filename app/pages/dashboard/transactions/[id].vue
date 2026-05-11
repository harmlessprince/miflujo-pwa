<script setup>
import { useTransactionStore } from '~/stores/transaction.store.js'
import { formatToMoney, formatDate } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const store = useTransactionStore()
const { currentTransaction: txn, detailLoading: loading } = storeToRefs(store)

useHead({ title: computed(() => 'Transaction Detail — MiFlujo') })

onMounted(() => store.fetchTransaction(route.params.id))

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

          <div v-if="txn.merchant_name" class="flex items-center justify-between">
            <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Merchant</p>
            <div class="flex items-center gap-1.5 text-body-sm text-navy">
              <span class="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">store</span>
              {{ txn.merchant_name }}
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
