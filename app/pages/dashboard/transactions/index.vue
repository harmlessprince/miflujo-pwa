<script setup>
import { useTransactionStore } from '~/stores/transaction.store.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Transactions — MiFlujo' })

const transactionStore = useTransactionStore()
</script>

<template>
  <MobileContainer>
    <section class="border-b border-grey bg-white px-4 pb-4 pt-6">
      <div class="mb-1 text-label-caps font-bold text-navy">TRANSACTION HISTORY</div>
      <div class="flex items-center justify-between">
        <h1 class="text-headline-md font-semibold text-navy">Transactions</h1>
        <span v-if="transactionStore.total > 0" class="text-label-caps text-secondary">
          {{ transactionStore.total }} total
        </span>
      </div>
    </section>

    <TransactionExplorer
      :show-upload-cta="true"
      empty-zero-message="Upload a bank statement to start reviewing your transactions."
    />
  </MobileContainer>
</template>
