import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'
import { logger } from '~/utils/helpers.js'
import { useApiService } from '~/services/apiService.js'

export const useAccountStore = defineStore('accountStore', () => {
  const { get } = useApiService()

  const accounts = ref([])
  const loading = ref(false)

  function mapAccount(item) {
    return {
      ...item,
      bank_name: item.bank_name ?? item.bank ?? item.account_name ?? 'Bank Account',
      display_name: [
        item.bank_name ?? item.bank ?? item.account_name,
        item.account_number,
      ].filter(Boolean).join(' – ') || 'Bank Account',
    }
  }

  async function fetchAccounts() {
    if (accounts.value.length) return
    loading.value = true
    try {
      const response = await get(endpoints.accounts.list)
      const raw = response?.data ?? response
      const items = Array.isArray(raw) ? raw : (raw?.items ?? [])
      accounts.value = items.map(mapAccount)
    } catch (err) {
      logger.error('fetchAccounts failed:', err)
    } finally {
      loading.value = false
    }
  }

  return { accounts, loading, fetchAccounts }
})
