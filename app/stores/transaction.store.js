import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'
import { logger } from '~/utils/helpers.js'
import { useApiService } from '~/services/apiService.js'
import { useToastStore } from '~/stores/toast.store.js'

export const useTransactionStore = defineStore('transactionStore', () => {
  const { get, post } = useApiService()
  const toastStore = useToastStore()

  const transactions = ref([])
  const currentTransaction = ref(null)
  const correctionHistory = ref([])
  const loading = ref(false)
  const detailLoading = ref(false)
  const correctionLoading = ref(false)
  const correctionSaving = ref(false)
  const total = ref(0)

  function mapTransaction(item) {
    const deposit = Number(item.deposit ?? 0)
    const withdrawal = Number(item.withdrawal ?? 0)
    return {
      ...item,
      deposit,
      withdrawal,
      direction: item.direction ?? (deposit > 0 ? 'credit' : 'debit'),
      amount: deposit > 0 ? deposit : withdrawal,
      date: item.date ?? item.transaction_date ?? null,
    }
  }

  async function fetchTransactions(params = {}) {
    loading.value = true
    transactions.value = []
    try {
      const response = await get(endpoints.transactions.list, params)
      let items = []
      items = response.data.items ?? response.items ?? []
      transactions.value = items.map(mapTransaction)
      total.value = transactions.value.length
    } catch (err) {
      logger.error('fetchTransactions failed:', err)
      toastStore.error('Could not load transactions. Please try again.')
    } finally {
      loading.value = false
    }
  }

  async function fetchTransaction(id) {
    detailLoading.value = true
    currentTransaction.value = null
    try {
      const response = await get(endpoints.transactions.show(id))
      const raw = response?.data ?? response
      if (raw) currentTransaction.value = mapTransaction(raw)
    } catch (err) {
      logger.error('fetchTransaction failed:', err)
      toastStore.error('Could not load transaction details. Please try again.')
    } finally {
      detailLoading.value = false
    }
  }

  async function fetchCorrections(id) {
    correctionLoading.value = true
    correctionHistory.value = []
    try {
      const response = await get(endpoints.transactions.corrections(id))
      const raw = response?.data ?? response
      correctionHistory.value = Array.isArray(raw) ? raw : []
    } catch (err) {
      logger.error('fetchCorrections failed:', err)
      toastStore.error('Could not load correction history. Please try again.')
    } finally {
      correctionLoading.value = false
    }
  }

  async function submitCorrection(id, payload) {
    correctionSaving.value = true
    try {
      const response = await post(endpoints.transactions.corrections(id), payload)
      const correction = response?.data ?? response
      if (correction) correctionHistory.value = [correction, ...correctionHistory.value]
      await fetchTransaction(id)
      toastStore.success('Correction saved.')
      return { success: true, data: correction }
    } catch (err) {
      logger.error('submitCorrection failed:', err)
      toastStore.error(err?.data?.detail ?? err?.data?.message ?? 'Could not save correction.')
      return { success: false, error: err }
    } finally {
      correctionSaving.value = false
    }
  }

  return {
    transactions,
    currentTransaction,
    correctionHistory,
    loading,
    detailLoading,
    correctionLoading,
    correctionSaving,
    total,
    fetchTransactions,
    fetchTransaction,
    fetchCorrections,
    submitCorrection,
  }
})
