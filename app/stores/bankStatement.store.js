import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'
import { logger } from '~/utils/helpers.js'
import { useApiService } from '~/services/apiService.js'
import { useToastStore } from '~/stores/toast.store.js'

export const useBankStatementStore = defineStore('bankStatementStore', () => {
  const { get, post, delete: deleteRequest } = useApiService()
  const toastStore = useToastStore()

  const statements = ref([])
  const currentStatement = ref(null)
  const pagination = ref({ total: 0, page: 1, size: 50, pages: 1, hasNext: false, hasPrevious: false })
  const choices = ref([])
  const loading = ref(false)
  const detailLoading = ref(false)
  const uploadResult = ref(null)
  const uploadError = ref(null)

  function mapStatement(item) {
    return {
      ...item,
      bank_name: item.bank_choice_label ?? item.account_name,
      period_start: item.start_date,
      period_end: item.end_date,
      total_deposits: item.total_deposit,
      total_withdrawals: item.total_withdrawal,
      processing_status: item.processing_status ?? (item.closing_balance != null ? 'COMPLETED' : 'PENDING'),
    }
  }

  async function fetchStatements(params = {}) {
    loading.value = true
    try {
      const response = await get(endpoints.bankStatements.list, params)
      if (response?.data) {
        statements.value = response.data?.items?.map(mapStatement)
        pagination.value = {
        total: response.total,
          page: response.page,
          size: response.size,
          pages: response.pages,
          hasNext: response.page < response.pages,
          hasPrevious: response.page > 1,
        }
      }
    } catch (err) {
      logger.error('fetchStatements failed:', err)
      toastStore.error('Could not load statements. Please try again.')
    } finally {
      loading.value = false
    }
  }

  async function fetchStatement(id) {
    detailLoading.value = true
    currentStatement.value = null
    try {
      const response = await get(endpoints.bankStatements.detail(id))
      if (response?.data ?? response) {
        currentStatement.value = mapStatement(response?.data ?? response)
      }
    } catch (err) {
      logger.error('fetchStatement failed:', err)
      toastStore.error('Could not load statement details. Please try again.')
    } finally {
      detailLoading.value = false
    }
  }

  async function deleteStatement(id) {
    try {
      await deleteRequest(endpoints.bankStatements.delete(id))
      statements.value = statements.value.filter((s) => s.id !== id)
      toastStore.success('Statement deleted.')
      return { success: true }
    } catch (err) {
      logger.error('deleteStatement failed:', err)
      toastStore.error('Could not delete statement. Please try again.')
      return { success: false }
    }
  }

  async function fetchChoices() {
    try {
      const response = await get(endpoints.bankStatements.choices)
      if (response?.data) choices.value = response.data
    } catch (err) {
      logger.error('fetchChoices failed:', err)
    }
  }

  async function uploadStatement(formData) {
    loading.value = true
    uploadResult.value = null
    uploadError.value = null
    try {
      const response = await post(endpoints.bankStatements.create, formData)
      if (response?.data) {
        uploadResult.value = {
          ...response.data,
          parse_confidence: (response.parse?.confidence ?? 0) * 100,
          parse_warnings: response.parse?.warnings ?? [],
          source_type: response.parse?.source_type ?? null,
        }
        return { success: true, data: uploadResult.value }
      }
      return { success: false, error: null }
    } catch (err) {
      logger.error('uploadStatement failed:', err)
      uploadError.value = err
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  return {
    statements,
    currentStatement,
    pagination,
    choices,
    loading,
    detailLoading,
    uploadResult,
    uploadError,
    fetchStatements,
    fetchStatement,
    deleteStatement,
    fetchChoices,
    uploadStatement,
  }
})
