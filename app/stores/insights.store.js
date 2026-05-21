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
  const transferPersons = ref([])
  const financialInstitutions = ref([])
  const paymentProcessors = ref([])
  const posTerminalUsage = ref(null)
  const burnRate = ref(null)
  const categoryConfidence = ref(null)
  const monthOverMonth = ref(null)

  const cashflowExcludeCategories = ref([])
  const cashflowExcludeFlags = ref([])
  const cashflowCategoryDraft = ref('')
  const cashflowExclusionFlagOptions = [
    { value: 'is_internal_transfer', label: 'Internal transfers' },
    { value: 'is_transfer', label: 'Transfers' },
    { value: 'is_refund', label: 'Refunds' },
    { value: 'is_reversal', label: 'Reversals' },
    { value: 'is_excluded', label: 'Excluded txns' },
    { value: 'is_stamp_duty', label: 'Stamp duty' },
    { value: 'is_loan_repayment', label: 'Loan repayments' },
    { value: 'is_debt_facility', label: 'Debt facilities' },
  ]

  // ── Analysis data ──────────────────────────────────────────────────────────
  const monthlyAnalysis = ref(null)
  const weeklyAnalysis = ref(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function buildScopeBody() {
    return dashboardScopeStore.buildPayload()
  }

  function buildCashflowBody() {
    const body = buildScopeBody()
    if (cashflowExcludeCategories.value.length) {
      body.exclude_categories = [...cashflowExcludeCategories.value]
    }
    if (cashflowExcludeFlags.value.length) {
      body.exclude_flags = [...cashflowExcludeFlags.value]
    }
    return body
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
    const cashflowBody = buildCashflowBody()
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
        transferPersonsRes,
        financialInstitutionsRes,
        paymentProcessorsRes,
        posTerminalUsageRes,
        burnRes,
        confidenceRes,
        momRes,
      ] = await Promise.allSettled([
        post(endpoints.insights.totalIncome, cashflowBody),
        post(endpoints.insights.totalSpent, cashflowBody),
        post(endpoints.insights.netCashflow, cashflowBody),
        post(endpoints.insights.transactionStats, body),
        post(endpoints.insights.byCategory, { ...body, direction: 'debit' }),
        post(endpoints.insights.byMerchant, { ...body, direction: 'debit', sort_by: 'amount' }),
        post(endpoints.insights.transferPersons, { ...body, sort_by: 'transaction_count' }),
        post(endpoints.insights.financialInstitutions, { ...body, sort_by: 'transaction_count' }),
        post(endpoints.insights.paymentProcessors, { ...body, sort_by: 'transaction_count' }),
        post(endpoints.insights.posTerminalUsage, body),
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
      transferPersons.value = Array.isArray(extractData(transferPersonsRes)) ? extractData(transferPersonsRes) : []
      financialInstitutions.value = Array.isArray(extractData(financialInstitutionsRes)) ? extractData(financialInstitutionsRes) : []
      paymentProcessors.value = Array.isArray(extractData(paymentProcessorsRes)) ? extractData(paymentProcessorsRes) : []
      posTerminalUsage.value = extractData(posTerminalUsageRes)
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

  function normalizeCategory(value) {
    return String(value ?? '').trim().toLowerCase().replaceAll('_', ' ').replaceAll('-', ' ')
  }

  function addCashflowExcludeCategory(value = cashflowCategoryDraft.value) {
    const normalized = normalizeCategory(value)
    if (!normalized || cashflowExcludeCategories.value.includes(normalized)) return
    cashflowExcludeCategories.value.push(normalized)
    cashflowCategoryDraft.value = ''
  }

  function removeCashflowExcludeCategory(value) {
    const normalized = normalizeCategory(value)
    cashflowExcludeCategories.value = cashflowExcludeCategories.value.filter((category) => category !== normalized)
  }

  function toggleCashflowExcludeFlag(flag) {
    if (cashflowExcludeFlags.value.includes(flag)) {
      cashflowExcludeFlags.value = cashflowExcludeFlags.value.filter((item) => item !== flag)
      return
    }
    cashflowExcludeFlags.value.push(flag)
  }

  function clearCashflowExclusions() {
    cashflowExcludeCategories.value = []
    cashflowExcludeFlags.value = []
    cashflowCategoryDraft.value = ''
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
    transferPersons,
    financialInstitutions,
    paymentProcessors,
    posTerminalUsage,
    burnRate,
    categoryConfidence,
    monthOverMonth,
    cashflowExcludeCategories,
    cashflowExcludeFlags,
    cashflowCategoryDraft,
    cashflowExclusionFlagOptions,
    monthlyAnalysis,
    weeklyAnalysis,
    buildScopeBody,
    buildCashflowBody,
    fetchOverview,
    fetchMonthlyAnalysis,
    fetchWeeklyAnalysis,
    setScope,
    setDateRange,
    addCashflowExcludeCategory,
    removeCashflowExcludeCategory,
    toggleCashflowExcludeFlag,
    clearCashflowExclusions,
  }
})
