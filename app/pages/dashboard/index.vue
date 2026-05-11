<script setup>
import { useAuthStore } from '~/stores/auth.store.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Dashboard — MiFlujo' })

const authStore = useAuthStore()
const activeTab = ref('review')

const tabs = [
  { id: 'review', label: 'REVIEW OVERVIEW' },
  { id: 'track', label: 'TRACK FLOWS' },
  { id: 'assess', label: 'ASSESS I' },
]

const accountInfo = {
  accountName: 'SAVINGS ACCOUNT • 4012 **** 8829',
  bankName: 'Zenith Bank PLC',
  period: 'Oct 1 - Oct 31, 2023',
}

const dataCards = [
  { id: 'opening', label: 'OPENING BALANCE', value: '₦1,240,500.00' },
  { id: 'closing', label: 'CLOSING BALANCE', value: '₦1,892,310.45' },
  { id: 'cashflow', label: 'NET CASHFLOW', value: '+₦651,810.45' },
  { id: 'period', label: 'STATEMENT PERIOD', value: 'October 1, 2023 – October 31, 2023' },
]

const handleUploadClick = () => {
  navigateTo('/dashboard/statements/upload')
}
</script>

<template>
  <MobileContainer>
    <!-- Account Analysis Header -->
    <section class="px-4 py-6 bg-white mb-6">
      <div class="text-label-caps text-navy font-bold mb-2">ACCOUNT ANALYSIS</div>
      <h1 class="text-display-lg text-navy font-semibold mb-1">
        {{ accountInfo.accountName }}
      </h1>
      <p class="text-body-sm text-navy mb-4">
        {{ accountInfo.bankName }} | {{ accountInfo.period }}
      </p>

      <!-- Upload Button - Primary CTA -->
      <BaseButton
        class="flex w-full items-center justify-center gap-2"
        @click="handleUploadClick"
      >
        <span class="material-symbols-outlined text-title-sm" aria-hidden="true">upload_file</span>
        <span>Upload New Statement</span>
      </BaseButton>
    </section>

    <!-- Tabs Navigation -->
    <div class="sticky top-0 z-10 grid grid-cols-3 border-b border-grey bg-white">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'min-w-0 px-1 py-3 text-center text-body-sm font-medium transition-colors',
          activeTab === tab.id
            ? 'text-primary border-b-2 border-primary'
            : 'text-navy border-b-2 border-transparent'
        ]"
        type="button"
        @click="activeTab = tab.id"
      >
        <span class="block truncate">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Financial Data Cards -->
    <section class="px-4 py-6 space-y-4">
      <div class="bg-white border border-grey rounded-lg p-6">
        <div class="text-label-caps text-navy font-bold mb-3">{{ tabs[0].label }}</div>
        <div class="space-y-5">
          <div v-for="card in dataCards" :key="card.id" class="border-t border-grey pt-4 first:border-t-0 first:pt-0">
            <div class="text-label-caps text-navy font-bold mb-2">{{ card.label }}</div>
            <div class="break-words text-data-mono font-medium text-navy tabular-nums">
              {{ card.value }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </MobileContainer>
</template>
