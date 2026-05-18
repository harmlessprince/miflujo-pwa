import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'
import { logger } from '~/utils/helpers.js'
import { useApiService } from '~/services/apiService.js'
import { useToastStore } from '~/stores/toast.store.js'
import { useDashboardScopeStore } from '~/stores/dashboardScope.store.js'
import dayjs from 'dayjs'

export const useInsightsStore = defineStore('insightsStore', () => {
  const { get, post } = useApiService()
  const toastStore = useToastStore()
  const dashboardScopeStore = useDashboardScopeStore()

  // ── Scope & date range compatibility ───────────────────────────────────────
  const scopeType = computed(() => {
    if (dashboardScopeStore.mode.includes('statement')) return 'statement'
    if (dashboardScopeStore.mode.includes('account')) return 'account'
    return 'all'
  })
  const scopeStatementId = computed(() => dashboardScopeStore.bank_statement_id)
  const scopeAccountId = computed(() => dashboardScopeStore.account_id)
  const startDate = computed({
    get: () => dashboardScopeStore.start_date,
    set: (value) => { dashboardScopeStore.start_date = value },
  })
  const endDate = computed({
    get: () => dashboardScopeStore.end_date,
    set: (value) => { dashboardScopeStore.end_date = value },
  })

  // ── Loading flags ──────────────────────────────────────────────────────────
  const loading = ref(false)
  const monthlyLoading = ref(false)
  const weeklyLoading = ref(false)
  const overviewError = ref('')

  // ── Overview module data ───────────────────────────────────────────────────
  const totalIncome = ref(null)
  const totalSpent = ref(null)
  const netCashflow = ref(null)
  const transactionStats = ref(null)
  const byCategory = ref([])
  const byMerchant = ref([])
  const burnRate = ref(null)
  const categoryConfidence = ref(null)
  const monthOverMonth = ref(null)

  // ── Analysis data ──────────────────────────────────────────────────────────
  const monthlyAnalysis = ref(null)
  const weeklyAnalysis = ref(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function buildScopeBody() {
    return dashboardScopeStore.buildPayload()
  }

  function extractData(result) {
    if (result.status !== 'fulfilled') return null
    const v = result.value
    return v?.data ?? v?.response ?? null
  }

  // ── Overview fetch (all modules in parallel) ───────────────────────────────
  async function fetchOverview() {
    loading.value = true
    overviewError.value = ''
    const body = buildScopeBody()
    const scopeOnly = { ...body }
    delete scopeOnly.start_date
    delete scopeOnly.end_date

    const ref_date = dashboardScopeStore.end_date || dayjs().format('YYYY-MM-DD')
    const momBody = {
      year: dayjs(ref_date).year(),
      month: dayjs(ref_date).month() + 1,
      ...scopeOnly,
    }

    try {
      const [
        incomeRes,
        spentRes,
        cashflowRes,
        statsRes,
        categoryRes,
        merchantRes,
        burnRes,
        confidenceRes,
        momRes,
      ] = await Promise.allSettled([
        post(endpoints.insights.totalIncome, body),
        post(endpoints.insights.totalSpent, body),
        post(endpoints.insights.netCashflow, body),
        post(endpoints.insights.transactionStats, body),
        post(endpoints.insights.byCategory, { ...body, direction: 'debit' }),
        post(endpoints.insights.byMerchant, { ...body, direction: 'debit', sort_by: 'amount' }),
        post(endpoints.insights.burnRate, body),
        post(endpoints.insights.categoryConfidence, body),
        post(endpoints.insights.monthOverMonth, momBody),
      ])

      totalIncome.value = extractData(incomeRes)
      totalSpent.value = extractData(spentRes)
      netCashflow.value = extractData(cashflowRes)
      transactionStats.value = extractData(statsRes)

      const catData = extractData(categoryRes)
      byCategory.value = Array.isArray(catData?.categories)
        ? catData.categories
        : Array.isArray(catData)
          ? catData
          : []

      const merchData = extractData(merchantRes)
      byMerchant.value = Array.isArray(merchData?.by_amount)
        ? merchData.by_amount
        : Array.isArray(merchData)
          ? merchData
          : []

      burnRate.value = extractData(burnRes)
      categoryConfidence.value = extractData(confidenceRes)
      monthOverMonth.value = extractData(momRes)
    } catch (err) {
      logger.error('fetchOverview failed:', err)
      overviewError.value = err?.data?.message ?? 'Could not load dashboard insights.'
    } finally {
      loading.value = false
    }
  }

  // ── Monthly analysis ───────────────────────────────────────────────────────
  async function fetchMonthlyAnalysis(statementId) {
    monthlyLoading.value = true
    monthlyAnalysis.value = null
    try {
      const response = await get(endpoints.insights.monthAnalysis(statementId))
      if (response?.data) monthlyAnalysis.value = response.data
    } catch (err) {
      logger.error('fetchMonthlyAnalysis failed:', err)
      toastStore.error('Could not load monthly analysis.')
    } finally {
      monthlyLoading.value = false
    }
  }

  // ── Weekly analysis ────────────────────────────────────────────────────────
  async function fetchWeeklyAnalysis(params) {
    weeklyLoading.value = true
    weeklyAnalysis.value = null
    try {
      const response = await post(endpoints.insights.weekAnalysis, params)
      if (response?.data) weeklyAnalysis.value = response.data
    } catch (err) {
      logger.error('fetchWeeklyAnalysis failed:', err)
      toastStore.error('Could not load weekly analysis.')
    } finally {
      weeklyLoading.value = false
    }
  }

  // ── Scope & date setters ───────────────────────────────────────────────────
  function setScope(type, id = null) {
    dashboardScopeStore.setLegacyScope(type, id)
  }

  function setDateRange(start, end) {
    dashboardScopeStore.setDateRange(start, end)
  }

  return {
    scopeType,
    scopeStatementId,
    scopeAccountId,
    startDate,
    endDate,
    loading,
    monthlyLoading,
    weeklyLoading,
    overviewError,
    totalIncome,
    totalSpent,
    netCashflow,
    transactionStats,
    byCategory,
    byMerchant,
    burnRate,
    categoryConfidence,
    monthOverMonth,
    monthlyAnalysis,
    weeklyAnalysis,
    buildScopeBody,
    fetchOverview,
    fetchMonthlyAnalysis,
    fetchWeeklyAnalysis,
    setScope,
    setDateRange,
  }
})
