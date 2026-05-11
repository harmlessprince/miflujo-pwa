<script setup>
import { useTransactionStore } from '~/stores/transaction.store.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Statement Transactions — MiFlujo' })

const route = useRoute()
const statementId = route.params.id
const transactionStore = useTransactionStore()
</script>

<template>
  <MobileContainer>
    <section class="border-b border-grey bg-white px-4 pb-4 pt-4">
      <div class="mb-3 flex items-center gap-2">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-grey text-navy transition-colors hover:bg-surface"
          @click="navigateTo(`/dashboard/statements/${statementId}`)"
        >
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
        </button>
        <span class="text-label-caps font-bold text-secondary">STATEMENT TRANSACTIONS</span>
      </div>
      <div class="flex items-center justify-between">
        <h1 class="text-headline-md font-semibold text-navy">Transactions</h1>
        <span v-if="transactionStore.total > 0" class="text-label-caps text-secondary">
          {{ transactionStore.total }} total
        </span>
      </div>
    </section>

    <TransactionExplorer
      :fixed-params="{ bank_statement_id: statementId }"
      :back-path="`/dashboard/statements/${statementId}`"
      empty-zero-message="This statement has no transactions yet. It may still be processing."
    />
  </MobileContainer>
</template>
