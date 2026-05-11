<script setup>
import { formatToMoney, formatDate } from '~/utils/helpers.js'

defineProps({
  transaction: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

function confidenceLevel(score) {
  if (score == null) return null
  if (score >= 0.75) return 'HIGH'
  if (score >= 0.50) return 'MEDIUM'
  return 'LOW'
}

function confidenceClass(score) {
  const level = confidenceLevel(score)
  if (level === 'HIGH') return 'bg-green-50 text-green-700'
  if (level === 'MEDIUM') return 'bg-amber-50 text-amber-700'
  if (level === 'LOW') return 'bg-error/10 text-error'
  return ''
}

function directionLabel(t) {
  return t.direction === 'credit' ? 'CREDIT' : 'DEBIT'
}

function formattedAmount(t) {
  return t.direction === 'credit'
    ? `+${formatToMoney(t.amount)}`
    : `−${formatToMoney(t.amount)}`
}
</script>

<template>
  <article
    class="rounded-[12px] border border-grey bg-white p-4 cursor-pointer transition-colors hover:border-navy/30 active:bg-surface"
    @click="$emit('select', transaction)"
  >
    <!-- Direction chip + date -->
    <div class="mb-2.5 flex items-center justify-between gap-2">
      <span
        :class="[
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-caps font-bold',
          transaction.direction === 'credit' ? 'bg-green-50 text-green-700' : 'bg-surface text-navy',
        ]"
      >
        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">
          {{ transaction.direction === 'credit' ? 'arrow_upward' : 'arrow_downward' }}
        </span>
        {{ directionLabel(transaction) }}
      </span>
      <span class="text-label-caps text-secondary">{{ formatDate(transaction.date, 'short') }}</span>
    </div>

    <!-- Description -->
    <p class="mb-2.5 line-clamp-2 text-body-sm text-navy">
      {{ transaction.description || transaction.narration || '—' }}
    </p>

    <!-- Amount + Balance -->
    <div class="mb-3 flex items-end justify-between gap-2">
      <span
        :class="[
          'text-title-sm font-semibold tabular-nums',
          transaction.direction === 'credit' ? 'text-green-700' : 'text-navy',
        ]"
      >
        {{ formattedAmount(transaction) }}
      </span>
      <div class="text-right">
        <div class="text-label-caps text-secondary">Balance</div>
        <div class="text-data-mono font-medium tabular-nums text-navy">
          {{ transaction.balance != null ? formatToMoney(transaction.balance) : '—' }}
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap items-center gap-1.5">
      <span
        v-if="transaction.category"
        class="inline-flex items-center rounded-full border border-grey bg-surface px-2.5 py-0.5 text-label-caps text-navy"
      >
        {{ transaction.category }}
      </span>
      <span
        v-if="confidenceLevel(transaction.category_confidence)"
        :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-label-caps font-bold', confidenceClass(transaction.category_confidence)]"
      >
        {{ confidenceLevel(transaction.category_confidence) }}
      </span>
      <span
        v-if="transaction.channel"
        class="inline-flex items-center rounded-full border border-grey bg-surface px-2.5 py-0.5 text-label-caps text-navy"
      >
        {{ transaction.channel }}
      </span>
      <span
        v-if="transaction.is_recurring || transaction.recurring"
        class="inline-flex items-center gap-0.5 rounded-full bg-navy/5 px-2.5 py-0.5 text-label-caps font-bold text-navy"
      >
        <span class="material-symbols-outlined text-[12px]" aria-hidden="true">repeat</span>
        Recurring
      </span>
      <span
        v-if="transaction.is_abnormal || transaction.abnormal"
        class="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-label-caps font-bold text-amber-700"
      >
        <span class="material-symbols-outlined text-[12px]" aria-hidden="true">warning</span>
        Unusual
      </span>
    </div>

    <!-- Merchant -->
    <div v-if="transaction.merchant_name" class="mt-2 flex items-center gap-1 text-body-sm text-secondary">
      <span class="material-symbols-outlined text-[14px]" aria-hidden="true">store</span>
      {{ transaction.merchant_name }}
    </div>
  </article>
</template>
