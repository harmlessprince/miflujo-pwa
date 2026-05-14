<script setup>
import { useDashboardScopeStore } from '~/stores/dashboardScope.store.js'
import { useAccountStore } from '~/stores/account.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { formatDate } from '~/utils/helpers.js'

const emit = defineEmits(['apply'])

const scopeStore = useDashboardScopeStore()
const accountStore = useAccountStore()
const statementStore = useBankStatementStore()

const { mode, account_id, account_ids, bank_statement_id, bank_statement_ids } = storeToRefs(scopeStore)

const scopeTabs = [
  { value: 'all', label: 'All', icon: 'dashboard' },
  { value: 'account', label: 'Account', icon: 'account_balance_wallet' },
  { value: 'statement', label: 'Statements', icon: 'description' },
]

const activeTab = computed({
  get() {
    if (mode.value.includes('account')) return 'account'
    if (mode.value.includes('statement')) return 'statement'
    return 'all'
  },
  set(value) {
    if (value === 'account') scopeStore.setMode('single_account')
    else if (value === 'statement') scopeStore.setMode('single_statement')
    else scopeStore.setMode('all')
  },
})

const accountOptions = computed(() =>
  accountStore.accounts.map((account) => ({
    value: account.id,
    label: account.display_name,
  }))
)

const selectedStatementAccountId = computed({
  get: () => account_id.value || '',
  set: (value) => {
    account_id.value = value || null
    bank_statement_id.value = null
    bank_statement_ids.value = []
  },
})

const visibleStatements = computed(() => {
  if (!account_id.value) return statementStore.statements
  return statementStore.statements.filter((statement) => String(statement.account_id) === String(account_id.value))
})

const statementOptions = computed(() =>
  visibleStatements.value.map((statement) => ({
    value: statement.id,
    label: [
      statement.bank_name ?? statement.account_name ?? 'Statement',
      statement.account_number,
      `${formatDate(statement.period_start, 'short')} to ${formatDate(statement.period_end, 'short')}`,
    ].filter(Boolean).join(' · '),
  }))
)

const selectedAccountLabel = computed(() => {
  const account = accountStore.accounts.find((item) => item.id === account_id.value)
  return account?.display_name ?? 'Choose account'
})

function toggleAccount(accountId) {
  const next = account_ids.value.includes(accountId)
    ? account_ids.value.filter((id) => id !== accountId)
    : [...account_ids.value, accountId]
  scopeStore.setMultiAccounts(next)
}

function toggleStatement(statementId) {
  const next = bank_statement_ids.value.includes(statementId)
    ? bank_statement_ids.value.filter((id) => id !== statementId)
    : [...bank_statement_ids.value, statementId]
  scopeStore.setMultiStatements(next, account_id.value)
}

function setAccountMode(nextMode) {
  if (nextMode === 'single_account') {
    scopeStore.setSingleAccount(account_id.value || account_ids.value[0] || null)
    return
  }
  scopeStore.setMultiAccounts(account_id.value ? [account_id.value] : account_ids.value)
}

function setStatementMode(nextMode) {
  if (nextMode === 'single_statement') {
    scopeStore.setSingleStatement(bank_statement_id.value || bank_statement_ids.value[0] || null, account_id.value)
    return
  }
  scopeStore.setMultiStatements(bank_statement_id.value ? [bank_statement_id.value] : bank_statement_ids.value, account_id.value)
}

function applyScope() {
  emit('apply', scopeStore.scope)
}

onMounted(() => {
  accountStore.fetchAccounts()
  statementStore.fetchStatements()
})
</script>

<template>
  <section class="border-b border-grey bg-white px-4 pb-4 pt-5">
    <div class="mb-4">
      <p class="mb-2 text-label-caps font-bold uppercase tracking-widest text-secondary">Dashboard scope</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="tab in scopeTabs"
          :key="tab.value"
          type="button"
          :class="[
            'flex min-w-0 flex-col items-center gap-1 rounded-[8px] border px-2 py-2.5 text-body-sm font-medium transition-colors',
            activeTab === tab.value
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-grey bg-white text-navy hover:border-navy',
          ]"
          @click="activeTab = tab.value"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{ tab.icon }}</span>
          <span class="w-full truncate">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'all'" class="rounded-[8px] border border-grey/60 bg-surface px-3 py-3">
      <p class="text-body-sm text-navy">Showing the full financial picture across all accounts and uploaded statements.</p>
    </div>

    <div v-else-if="activeTab === 'account'" class="space-y-4">
      <div class="grid grid-cols-2 gap-2 rounded-[8px] bg-surface p-1">
        <button
          type="button"
          :class="[
            'rounded-[7px] py-2 text-body-sm font-medium transition-colors',
            mode === 'single_account' ? 'bg-white text-primary shadow-sm' : 'text-navy',
          ]"
          @click="setAccountMode('single_account')"
        >
          Single
        </button>
        <button
          type="button"
          :class="[
            'rounded-[7px] py-2 text-body-sm font-medium transition-colors',
            mode === 'multi_account' ? 'bg-white text-primary shadow-sm' : 'text-navy',
          ]"
          @click="setAccountMode('multi_account')"
        >
          Multiple
        </button>
      </div>

      <SearchableSelectInput
        v-if="mode === 'single_account'"
        v-model="account_id"
        :options="accountOptions"
        placeholder="Choose an account..."
        search-placeholder="Search account..."
      />

      <div v-else class="space-y-2">
        <button
          v-for="account in accountStore.accounts"
          :key="account.id"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-left transition-colors',
            account_ids.includes(account.id)
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-grey bg-white text-navy',
          ]"
          @click="toggleAccount(account.id)"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
            {{ account_ids.includes(account.id) ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <span class="min-w-0 flex-1 truncate text-body-sm font-medium">{{ account.display_name }}</span>
        </button>
      </div>
    </div>

    <div v-else class="space-y-4">
      <SearchableSelectInput
        v-model="selectedStatementAccountId"
        :options="accountOptions"
        placeholder="Choose account first..."
        search-placeholder="Search account..."
      />

      <div class="grid grid-cols-2 gap-2 rounded-[8px] bg-surface p-1">
        <button
          type="button"
          :class="[
            'rounded-[7px] py-2 text-body-sm font-medium transition-colors',
            mode === 'single_statement' ? 'bg-white text-primary shadow-sm' : 'text-navy',
          ]"
          @click="setStatementMode('single_statement')"
        >
          Single
        </button>
        <button
          type="button"
          :class="[
            'rounded-[7px] py-2 text-body-sm font-medium transition-colors',
            mode === 'multi_statement' ? 'bg-white text-primary shadow-sm' : 'text-navy',
          ]"
          :disabled="!account_id"
          @click="setStatementMode('multi_statement')"
        >
          Multiple
        </button>
      </div>

      <SearchableSelectInput
        v-if="mode === 'single_statement'"
        v-model="bank_statement_id"
        :options="statementOptions"
        placeholder="Choose a statement..."
        search-placeholder="Search statement..."
        :disabled="!account_id"
      />

      <div v-else class="space-y-2">
        <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">
          {{ selectedAccountLabel }}
        </p>
        <button
          v-for="statement in visibleStatements"
          :key="statement.id"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-left transition-colors',
            bank_statement_ids.includes(statement.id)
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-grey bg-white text-navy',
          ]"
          :disabled="!account_id"
          @click="toggleStatement(statement.id)"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
            {{ bank_statement_ids.includes(statement.id) ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-body-sm font-medium">{{ statement.bank_name ?? statement.account_name ?? 'Statement' }}</span>
            <span class="block truncate text-label-caps text-secondary">
              {{ formatDate(statement.period_start, 'short') }} - {{ formatDate(statement.period_end, 'short') }}
            </span>
          </span>
        </button>
        <p v-if="account_id && !visibleStatements.length" class="rounded-[8px] border border-grey bg-surface px-3 py-3 text-body-sm text-secondary">
          No statements found for this account.
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2">
      <label>
        <span class="mb-1 block text-label-caps font-bold text-navy">FROM</span>
        <input
          v-model="scopeStore.start_date"
          type="date"
          class="h-11 w-full rounded-[8px] border border-grey bg-white px-3 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        />
      </label>
      <label>
        <span class="mb-1 block text-label-caps font-bold text-navy">TO</span>
        <input
          v-model="scopeStore.end_date"
          type="date"
          :min="scopeStore.start_date || undefined"
          class="h-11 w-full rounded-[8px] border border-grey bg-white px-3 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        />
      </label>
    </div>

    <BaseButton
      class="mt-4 !h-11"
      type="button"
      :disabled="!scopeStore.hasRequiredSelection"
      @click="applyScope"
    >
      Apply Scope
    </BaseButton>
  </section>
</template>
