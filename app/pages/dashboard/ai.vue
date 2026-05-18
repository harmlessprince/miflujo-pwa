<script setup>
import { storeToRefs } from 'pinia'
import { useAiAssistantStore } from '~/stores/aiAssistant.store.js'
import { useAccountStore } from '~/stores/account.store.js'
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { cleanObject, formatToMoney } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'AI Assistant - MiFlujo' })

const assistantStore = useAiAssistantStore()
const accountStore = useAccountStore()
const statementStore = useBankStatementStore()

const { guidedQuestions, guidedLoading, answerLoading, feedbackLoading, currentAnswer, error, feedbackSubmitted } = storeToRefs(assistantStore)
const { accounts } = storeToRefs(accountStore)
const { statements } = storeToRefs(statementStore)

const activeTab = ref('guided')
const selectedQuestion = ref(null)
const selectedAccountId = ref('')
const selectedStatementId = ref('')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const askQuery = ref('')
const askStartDate = ref('')
const askEndDate = ref('')
const periodError = ref('')
const supportingDataOpen = ref(false)

const tabs = [
  { label: 'Guided Questions', value: 'guided' },
  { label: 'Ask a Question', value: 'ask' },
]

const fallbackQuestions = [
  { question_key: 'spending_by_category', key: 'spending_by_category', label: 'Break down my spending by category', question: 'Break down my spending by category', group: 'Spending breakdown' },
  { question_key: 'month_comparison', key: 'month_comparison', label: 'Compare this month to last month', question: 'Compare this month to last month', group: 'Trends and comparison' },
  { question_key: 'spending_trends', key: 'spending_trends', label: 'Show spending trends', question: 'Show spending trends', group: 'Trends and comparison' },
  { question_key: 'reduce_expenses', key: 'reduce_expenses', label: 'Suggest ways to reduce expenses', question: 'Suggest ways to reduce expenses', group: 'Savings suggestions' },
  { question_key: 'unusual_transactions', key: 'unusual_transactions', label: 'Explain unusual transactions', question: 'Explain unusual transactions', group: 'Risk signals' },
  { question_key: 'recurring_payments', key: 'recurring_payments', label: 'Identify recurring payments', question: 'Identify recurring payments', group: 'Risk signals' },
  { question_key: 'balance_change', key: 'balance_change', label: 'Explain why my balance changed', question: 'Explain why my balance changed', group: 'Trends and comparison' },
]

const examples = [
  'How much did I spend on fuel in January?',
  'List transactions above NGN 500,000.',
  'Compare this month to last month.',
  'Find unusual spending spikes.',
]

const groupedGuidedQuestions = computed(() => {
  const source = guidedQuestions.value.length ? guidedQuestions.value : fallbackQuestions
  return source.reduce((groups, question) => {
    const group = question.group || 'Guided questions'
    if (!groups[group]) groups[group] = []
    groups[group].push(question)
    return groups
  }, {})
})

const accountOptions = computed(() => [
  { label: 'All accounts', value: '' },
  ...accounts.value.map((account) => ({
    label: account.display_name ?? account.account_name ?? account.bank_name ?? `Account ${account.id}`,
    value: account.id,
  })),
])

const statementOptions = computed(() => [
  { label: 'No statement selected', value: '' },
  ...statements.value.map((statement) => ({
    label: [
      statement.bank_name,
      statement.account_number,
      statement.period_start && statement.period_end ? `${statement.period_start} to ${statement.period_end}` : '',
    ].filter(Boolean).join(' - ') || `Statement ${statement.id}`,
    value: statement.id,
  })),
])

const selectedMonthParts = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  return { year, month }
})

const confidenceLabel = computed(() => {
  const confidence = currentAnswer.value?.confidence
  if (confidence == null || confidence === '') return 'Unknown'
  if (typeof confidence === 'number') {
    if (confidence <= 1) {
      if (confidence >= 0.75) return 'High'
      if (confidence >= 0.45) return 'Medium'
      return 'Low'
    }
    if (confidence >= 75) return 'High'
    if (confidence >= 45) return 'Medium'
    return 'Low'
  }
  return String(confidence)
})

const confidenceClass = computed(() => {
  const label = confidenceLabel.value.toLowerCase()
  if (label.includes('high')) return 'bg-success/10 text-success'
  if (label.includes('medium')) return 'bg-warning/10 text-warning'
  if (label.includes('low')) return 'bg-error/10 text-error'
  return 'bg-grey/20 text-secondary'
})

const answerSummary = computed(() => {
  const answer = currentAnswer.value
  if (!answer) return ''
  if (answer.summary) return answer.summary
  if (answer.message) return answer.message
  if (answer.raw_result) return 'The assistant returned structured results. View supporting data for details.'
  return 'No concise answer was returned.'
})

const citations = computed(() => {
  const value = currentAnswer.value?.citations
  if (!value) return []
  return Array.isArray(value) ? value : Object.values(value)
})

const warnings = computed(() => {
  const value = currentAnswer.value?.warnings
  if (!value) return []
  return Array.isArray(value) ? value : Object.values(value)
})

const answerStatusLabel = computed(() => {
  const answer = currentAnswer.value
  if (!answer) return ''
  if (answer.needs_clarification) return 'Needs clarification'
  if (answer.status === 'unsupported') return 'Unsupported'
  if (answer.status === 'no_matches') return 'No matches'
  return 'Answer ready'
})

function currentDate() {
  return new Date().toISOString().slice(0, 10)
}

function chooseExample(example) {
  askQuery.value = example
}

function buildScopePayload() {
  return cleanObject({
    account_id: selectedAccountId.value || '',
    bank_statement_id: selectedStatementId.value || '',
    current_date: currentDate(),
  })
}

async function askGuidedQuestion(question) {
  selectedQuestion.value = question.question_key
  supportingDataOpen.value = false

  await assistantStore.answerGuidedQuestion(cleanObject({
    ...buildScopePayload(),
    question_key: question.question_key,
    question: question.question,
    year: selectedMonthParts.value.year,
    month: selectedMonthParts.value.month,
    limit: 5,
  }))
}

async function submitAskQuestion() {
  periodError.value = ''
  if (!askStartDate.value || !askEndDate.value) {
    periodError.value = 'Choose a start and end date before asking.'
    assistantStore.clearAnswer()
    return
  }

  supportingDataOpen.value = false
  await assistantStore.queryInsight(cleanObject({
    ...buildScopePayload(),
    query: askQuery.value.trim(),
    date_range: {
      start: askStartDate.value,
      end: askEndDate.value,
    },
  }))
}

async function sendFeedback(value) {
  await assistantStore.sendFeedback(currentAnswer.value?.attempt_id, value)
}

function displayCitationAmount(citation) {
  const amount = citation.amount ?? citation.value ?? citation.total ?? null
  return amount == null ? '' : formatToMoney(amount)
}

function formatJson(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

watch(activeTab, () => {
  periodError.value = ''
})

onMounted(() => {
  assistantStore.fetchGuidedQuestions()
  accountStore.fetchAccounts()
  statementStore.fetchStatements()
})
</script>

<template>
  <MobileContainer>
    <section class="px-4 pb-3 pt-4">
      <p class="text-label-caps font-bold uppercase text-secondary">Financial assistant</p>
      <h1 class="mt-1 text-headline-md font-semibold text-navy">Ask about your money</h1>
      <p class="mt-2 text-body-sm text-secondary">
        Grounded answers from your statements, transactions, and registered financial tools.
      </p>
    </section>

    <section class="px-4 pb-3">
      <div class="grid grid-cols-2 rounded-[8px] border border-grey bg-white p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="[
            'h-10 rounded-[6px] text-body-sm font-semibold transition-colors',
            activeTab === tab.value ? 'bg-navy text-white' : 'text-secondary hover:text-navy',
          ]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <section class="space-y-3 px-4 pb-4">
      <div class="grid gap-3">
        <SearchableSelectInput
          v-model="selectedAccountId"
          :options="accountOptions"
          label="Account scope"
          placeholder="All accounts"
        />
        <SearchableSelectInput
          v-model="selectedStatementId"
          :options="statementOptions"
          label="Statement scope"
          placeholder="No statement selected"
        />
      </div>
    </section>

    <section v-if="activeTab === 'guided'" class="space-y-4 px-4 pb-5">
      <div class="rounded-[8px] border border-grey bg-white p-4">
        <label for="guided-month" class="block text-body-md font-medium text-navy">Month context</label>
        <input
          id="guided-month"
          v-model="selectedMonth"
          type="month"
          class="mt-2 h-[47px] w-full rounded-[10px] border border-grey bg-white px-4 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
        />
      </div>

      <div v-if="guidedLoading" class="rounded-[8px] border border-grey bg-white p-4 text-body-sm text-secondary">
        Loading guided questions...
      </div>

      <div
        v-for="(questions, group) in groupedGuidedQuestions"
        :key="group"
        class="space-y-2"
      >
        <p class="text-label-caps font-bold uppercase text-secondary">{{ group }}</p>
        <button
          v-for="question in questions"
          :key="question.question_key"
          type="button"
          class="w-full rounded-[8px] border bg-white p-4 text-left transition-colors hover:border-primary"
          :class="selectedQuestion === question.question_key ? 'border-primary' : 'border-grey'"
          :disabled="answerLoading"
          @click="askGuidedQuestion(question)"
        >
          <span class="block text-title-sm font-medium text-navy">{{ question.label }}</span>
          <span v-if="question.description" class="mt-1 block text-body-sm text-secondary">{{ question.description }}</span>
        </button>
      </div>
    </section>

    <section v-else class="space-y-4 px-4 pb-5">
      <div class="rounded-[8px] border border-grey bg-white p-4">
        <label for="ask-query" class="block text-body-md font-medium text-navy">Question</label>
        <textarea
          id="ask-query"
          v-model="askQuery"
          rows="4"
          placeholder="Ask a financial question about a selected period"
          class="mt-2 w-full resize-none rounded-[10px] border border-grey bg-white px-4 py-3 text-body-md text-navy outline-none placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary"
        />
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="example in examples"
            :key="example"
            type="button"
            class="rounded-full border border-grey bg-surface px-3 py-1.5 text-body-sm font-medium text-navy"
            @click="chooseExample(example)"
          >
            {{ example }}
          </button>
        </div>
      </div>

      <div class="rounded-[8px] border bg-white p-4" :class="periodError ? 'border-error' : 'border-grey'">
        <p class="text-body-md font-medium text-navy">Required period</p>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <label class="min-w-0">
            <span class="block text-label-caps font-bold uppercase text-secondary">Start</span>
            <input
              v-model="askStartDate"
              type="date"
              class="mt-2 h-[47px] w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </label>
          <label class="min-w-0">
            <span class="block text-label-caps font-bold uppercase text-secondary">End</span>
            <input
              v-model="askEndDate"
              type="date"
              class="mt-2 h-[47px] w-full rounded-[10px] border border-grey bg-white px-3 text-body-md text-navy outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>
        <p v-if="periodError" class="mt-2 text-body-sm font-medium text-error">{{ periodError }}</p>
      </div>

      <BaseButton
        type="button"
        :disabled="answerLoading || !askQuery.trim()"
        @click="submitAskQuestion"
      >
        Ask Assistant
      </BaseButton>
    </section>

    <section class="px-4 pb-6">
      <div v-if="answerLoading" class="rounded-[8px] border border-grey bg-white p-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined animate-pulse text-[22px] text-primary" aria-hidden="true">smart_toy</span>
          <div>
            <p class="text-title-sm font-medium text-navy">Working through your data</p>
            <p class="text-body-sm text-secondary">Routing the question to the right financial tool.</p>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="rounded-[8px] border border-error bg-white p-4">
        <p class="text-title-sm font-medium text-error">Assistant unavailable</p>
        <p class="mt-1 text-body-sm text-secondary">{{ error }}</p>
      </div>

      <div v-else-if="currentAnswer" class="space-y-3 rounded-[8px] border border-grey bg-white p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-label-caps font-bold uppercase text-secondary">{{ answerStatusLabel }}</p>
            <h2 class="mt-1 text-title-sm font-medium text-navy">Based on your transactions</h2>
          </div>
          <span :class="['shrink-0 rounded-full px-2.5 py-1 text-label-caps font-bold uppercase tabular-nums', confidenceClass]">
            {{ confidenceLabel }}
          </span>
        </div>

        <div
          v-if="currentAnswer.needs_clarification"
          class="rounded-[8px] border border-warning bg-warning/10 p-3 text-body-sm text-navy"
        >
          {{ currentAnswer.message || 'The assistant needs more detail before answering.' }}
          <span v-if="currentAnswer.missing_fields?.length" class="block pt-1 text-data-mono font-medium tabular-nums">
            Missing: {{ currentAnswer.missing_fields.join(', ') }}
          </span>
        </div>

        <p class="whitespace-pre-wrap text-body-md text-navy">{{ answerSummary }}</p>

        <div v-if="warnings.length" class="space-y-2">
          <div
            v-for="warning in warnings"
            :key="String(warning)"
            class="rounded-[8px] border border-warning bg-warning/10 p-3 text-body-sm text-navy"
          >
            {{ typeof warning === 'string' ? warning : warning.message ?? warning.detail ?? formatJson(warning) }}
          </div>
        </div>

        <div v-if="citations.length" class="space-y-2">
          <p class="text-label-caps font-bold uppercase text-secondary">Citations</p>
          <div
            v-for="(citation, index) in citations"
            :key="citation.id ?? index"
            class="rounded-[8px] border border-grey bg-surface p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-body-md font-medium text-navy">
                  {{ citation.description ?? citation.narration ?? citation.merchant ?? 'Transaction' }}
                </p>
                <p class="mt-1 text-body-sm text-secondary">
                  {{ [citation.date ?? citation.transaction_date, citation.merchant, citation.category].filter(Boolean).join(' / ') }}
                </p>
              </div>
              <p v-if="displayCitationAmount(citation)" class="shrink-0 text-data-mono font-medium text-navy tabular-nums">
                {{ displayCitationAmount(citation) }}
              </p>
            </div>
          </div>
        </div>

        <button
          v-if="currentAnswer.raw_result || currentAnswer.data"
          type="button"
          class="flex w-full items-center justify-between rounded-[8px] border border-grey px-3 py-2 text-left text-body-sm font-semibold text-navy"
          @click="supportingDataOpen = !supportingDataOpen"
        >
          View supporting data
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
            {{ supportingDataOpen ? 'expand_less' : 'expand_more' }}
          </span>
        </button>

        <pre
          v-if="supportingDataOpen"
          class="max-h-72 overflow-auto rounded-[8px] bg-navy p-3 text-body-sm text-white"
        >{{ formatJson(currentAnswer.raw_result ?? currentAnswer.data) }}</pre>

        <div v-if="currentAnswer.attempt_id" class="border-t border-grey pt-3">
          <p class="text-label-caps font-bold uppercase text-secondary">Was this useful?</p>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-[8px] border px-3 py-2 text-body-sm font-semibold"
              :class="feedbackSubmitted === 'helpful' ? 'border-success bg-success/10 text-success' : 'border-grey text-navy'"
              :disabled="feedbackLoading"
              @click="sendFeedback('helpful')"
            >
              Helpful
            </button>
            <button
              type="button"
              class="rounded-[8px] border px-3 py-2 text-body-sm font-semibold"
              :class="feedbackSubmitted === 'not_helpful' ? 'border-error bg-error/10 text-error' : 'border-grey text-navy'"
              :disabled="feedbackLoading"
              @click="sendFeedback('not_helpful')"
            >
              Not useful
            </button>
          </div>
        </div>
      </div>
    </section>
  </MobileContainer>
</template>
