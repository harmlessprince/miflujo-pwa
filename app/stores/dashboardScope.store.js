import { defineStore } from 'pinia'
import dayjs from 'dayjs'

const DEFAULT_SCOPE = {
  mode: 'all',
  account_id: null,
  account_ids: [],
  bank_statement_id: null,
  bank_statement_ids: [],
  start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
}

const MODE_GROUPS = {
  all: 'all',
  single_account: 'account',
  multi_account: 'account',
  single_statement: 'statement',
  multi_statement: 'statement',
}

const MODE_LABELS = {
  all: 'All accounts',
  single_account: 'Single account',
  multi_account: 'Multiple accounts',
  single_statement: 'Single statement',
  multi_statement: 'Multiple statements',
}

const MODE_DESCRIPTIONS = {
  all: 'Across all uploaded financial data.',
  single_account: 'One account and its statements.',
  multi_account: 'Combined view of selected accounts.',
  single_statement: 'One uploaded statement.',
  multi_statement: 'Multiple statements under one account.',
}

function uniqueValues(values) {
  return [...new Set((values ?? []).filter(Boolean))]
}

function cleanPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return value !== null && value !== undefined && value !== ''
    })
  )
}

export const useDashboardScopeStore = defineStore('dashboardScopeStore', () => {
  const mode = ref(DEFAULT_SCOPE.mode)
  const account_id = ref(DEFAULT_SCOPE.account_id)
  const account_ids = ref([...DEFAULT_SCOPE.account_ids])
  const bank_statement_id = ref(DEFAULT_SCOPE.bank_statement_id)
  const bank_statement_ids = ref([...DEFAULT_SCOPE.bank_statement_ids])
  const start_date = ref(DEFAULT_SCOPE.start_date)
  const end_date = ref(DEFAULT_SCOPE.end_date)

  const scope = computed(() => ({
    mode: mode.value,
    account_id: account_id.value,
    account_ids: [...account_ids.value],
    bank_statement_id: bank_statement_id.value,
    bank_statement_ids: [...bank_statement_ids.value],
    start_date: start_date.value,
    end_date: end_date.value,
  }))

  const scopeGroup = computed(() => MODE_GROUPS[mode.value] ?? 'all')

  const isAllScope = computed(() => mode.value === 'all')
  const isAccountScope = computed(() => scopeGroup.value === 'account')
  const isStatementScope = computed(() => scopeGroup.value === 'statement')
  const modeLabel = computed(() => MODE_LABELS[mode.value] ?? MODE_LABELS.all)
  const modeDescription = computed(() => MODE_DESCRIPTIONS[mode.value] ?? MODE_DESCRIPTIONS.all)

  const hasRequiredSelection = computed(() => {
    if (mode.value === 'single_account') return Boolean(account_id.value)
    if (mode.value === 'multi_account') return account_ids.value.length > 0
    if (mode.value === 'single_statement') return Boolean(bank_statement_id.value)
    if (mode.value === 'multi_statement') return bank_statement_ids.value.length > 0 && Boolean(account_id.value)
    return true
  })

  const validationMessage = computed(() => {
    if (mode.value === 'single_account' && !account_id.value) return 'Choose an account to apply this scope.'
    if (mode.value === 'multi_account' && account_ids.value.length === 0) return 'Choose at least one account to apply this scope.'
    if (mode.value === 'single_statement') {
      if (!account_id.value) return 'Choose an account before selecting a statement.'
      if (!bank_statement_id.value) return 'Choose a statement to apply this scope.'
    }
    if (mode.value === 'multi_statement') {
      if (!account_id.value) return 'Choose an account before selecting statements.'
      if (bank_statement_ids.value.length === 0) return 'Choose at least one statement to apply this scope.'
    }
    return ''
  })

  const payload = computed(() => buildPayload())

  const payloadRows = computed(() =>
    Object.entries(payload.value).map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value.join(', ') : value,
    }))
  )

  function setMode(nextMode) {
    mode.value = nextMode

    if (nextMode === 'all') {
      account_id.value = null
      account_ids.value = []
      bank_statement_id.value = null
      bank_statement_ids.value = []
      return
    }

    if (nextMode === 'single_account') {
      account_ids.value = []
      bank_statement_id.value = null
      bank_statement_ids.value = []
      return
    }

    if (nextMode === 'multi_account') {
      account_id.value = null
      bank_statement_id.value = null
      bank_statement_ids.value = []
      return
    }

    if (nextMode === 'single_statement') {
      account_ids.value = []
      bank_statement_ids.value = []
      return
    }

    if (nextMode === 'multi_statement') {
      account_ids.value = []
      bank_statement_id.value = null
    }
  }

  function setSingleAccount(id) {
    mode.value = 'single_account'
    account_id.value = id || null
    account_ids.value = []
    bank_statement_id.value = null
    bank_statement_ids.value = []
  }

  function setMultiAccounts(ids) {
    mode.value = 'multi_account'
    account_id.value = null
    account_ids.value = uniqueValues(ids)
    bank_statement_id.value = null
    bank_statement_ids.value = []
  }

  function setSingleStatement(statementId, accountId = null) {
    mode.value = 'single_statement'
    account_id.value = accountId || null
    account_ids.value = []
    bank_statement_id.value = statementId || null
    bank_statement_ids.value = []
  }

  function setMultiStatements(statementIds, accountId) {
    mode.value = 'multi_statement'
    account_id.value = accountId || null
    account_ids.value = []
    bank_statement_id.value = null
    bank_statement_ids.value = uniqueValues(statementIds)
  }

  function setDateRange(start, end) {
    start_date.value = start || null
    end_date.value = end || null
  }

  function resetScope() {
    mode.value = DEFAULT_SCOPE.mode
    account_id.value = DEFAULT_SCOPE.account_id
    account_ids.value = [...DEFAULT_SCOPE.account_ids]
    bank_statement_id.value = DEFAULT_SCOPE.bank_statement_id
    bank_statement_ids.value = [...DEFAULT_SCOPE.bank_statement_ids]
    start_date.value = DEFAULT_SCOPE.start_date
    end_date.value = DEFAULT_SCOPE.end_date
  }

  function buildPayload(options = {}) {
    const { includeDates = true, includeStatementAccount = false } = options
    const payload = {}

    if (includeDates) {
      payload.start_date = start_date.value
      payload.end_date = end_date.value
    }

    if (mode.value === 'single_account') {
      payload.account_id = account_id.value
    }

    if (mode.value === 'multi_account') {
      payload.account_ids = [...account_ids.value]
    }

    if (mode.value === 'single_statement') {
      payload.bank_statement_id = bank_statement_id.value
      if (includeStatementAccount) payload.account_id = account_id.value
    }

    if (mode.value === 'multi_statement') {
      payload.bank_statement_ids = [...bank_statement_ids.value]
      if (includeStatementAccount) payload.account_id = account_id.value
    }

    return cleanPayload(payload)
  }

  function buildScopeOnlyPayload(options = {}) {
    return buildPayload({ ...options, includeDates: false })
  }

  function setLegacyScope(type, id = null) {
    if (type === 'statement') {
      setSingleStatement(id)
      return
    }
    if (type === 'account') {
      setSingleAccount(id)
      return
    }
    setMode('all')
  }

  return {
    mode,
    account_id,
    account_ids,
    bank_statement_id,
    bank_statement_ids,
    start_date,
    end_date,
    scope,
    scopeGroup,
    isAllScope,
    isAccountScope,
    isStatementScope,
    modeLabel,
    modeDescription,
    hasRequiredSelection,
    validationMessage,
    payload,
    payloadRows,
    setMode,
    setSingleAccount,
    setMultiAccounts,
    setSingleStatement,
    setMultiStatements,
    setDateRange,
    resetScope,
    buildPayload,
    buildScopeOnlyPayload,
    setLegacyScope,
  }
})
