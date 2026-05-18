import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'
import { logger } from '~/utils/helpers.js'
import { useApiService } from '~/services/apiService.js'
import { useToastStore } from '~/stores/toast.store.js'

export const useAiAssistantStore = defineStore('aiAssistantStore', () => {
  const { get, post } = useApiService()
  const toastStore = useToastStore()

  const guidedQuestions = ref([])
  const guidedLoading = ref(false)
  const answerLoading = ref(false)
  const feedbackLoading = ref(false)
  const currentAnswer = ref(null)
  const currentMode = ref('guided')
  const error = ref(null)
  const feedbackSubmitted = ref(null)

  function normalizeGuidedQuestion(item) {
    const key = item.question_key ?? item.key ?? item.id ?? item.slug
    const label = item.label ?? item.title ?? item.question ?? item.name ?? key

    return {
      ...item,
      key,
      question_key: key,
      question: item.question ?? label,
      label,
      description: item.description ?? item.prompt ?? '',
      group: item.group ?? item.category ?? item.purpose ?? inferQuestionGroup(key),
    }
  }

  function inferQuestionGroup(key = '') {
    if (['spending_by_category'].includes(key)) return 'Spending breakdown'
    if (['month_comparison', 'spending_trends', 'balance_change'].includes(key)) return 'Trends and comparison'
    if (['unusual_transactions', 'recurring_payments'].includes(key)) return 'Risk signals'
    if (['reduce_expenses'].includes(key)) return 'Savings suggestions'
    return 'Guided questions'
  }

  function normalizeAnswer(response) {
    const root = response?.data ?? response ?? {}
    const data = root.data ?? root.result ?? root
    const attemptId = root.attempt_id ?? root.ai_attempt_id ?? root.id ?? data?.attempt_id ?? data?.ai_attempt_id ?? null
    const status = root.status ?? data?.status ?? (data?.needs_clarification ? 'needs_clarification' : 'answered')
    const needsClarification = Boolean(
      data?.needs_clarification ||
      root.needs_clarification ||
      status === 'needs_clarification',
    )

    return {
      status,
      attempt_id: attemptId,
      summary: data?.summary ?? root.summary ?? root.answer ?? data?.answer ?? root.message ?? data?.message ?? '',
      confidence: data?.confidence ?? root.confidence ?? null,
      warnings: data?.warnings ?? root.warnings ?? [],
      citations: data?.citations ?? data?.supporting_transactions ?? root.citations ?? [],
      raw_result: data?.raw_result ?? root.raw_result ?? data?.result ?? null,
      tool: data?.tool ?? root.tool ?? data?.selected_tool ?? root.selected_tool ?? null,
      needs_clarification: needsClarification,
      missing_fields: data?.missing_fields ?? root.missing_fields ?? [],
      message: root.message ?? data?.message ?? '',
      data,
    }
  }

  async function fetchGuidedQuestions() {
    guidedLoading.value = true
    error.value = null

    try {
      const response = await get(endpoints.questions.guided)
      const raw = response?.data ?? response
      const items = Array.isArray(raw) ? raw : (raw?.items ?? raw?.questions ?? [])
      guidedQuestions.value = items.map(normalizeGuidedQuestion)
    } catch (err) {
      logger.error('fetchGuidedQuestions failed:', err)
      error.value = err?.data?.message ?? err?.data?.detail ?? 'Could not load guided questions.'
      toastStore.error('Could not load guided questions.')
    } finally {
      guidedLoading.value = false
    }
  }

  async function answerGuidedQuestion(payload) {
    answerLoading.value = true
    error.value = null
    feedbackSubmitted.value = null
    currentMode.value = 'guided'

    try {
      const response = await post(endpoints.questions.answer, payload)
      currentAnswer.value = normalizeAnswer(response)
      return { success: true, data: currentAnswer.value }
    } catch (err) {
      logger.error('answerGuidedQuestion failed:', err)
      error.value = err?.data?.message ?? err?.data?.detail ?? 'Could not answer that question.'
      toastStore.error('Could not answer that question.')
      return { success: false, error: err }
    } finally {
      answerLoading.value = false
    }
  }

  async function queryInsight(payload) {
    answerLoading.value = true
    error.value = null
    feedbackSubmitted.value = null
    currentMode.value = 'ask'

    try {
      const response = await post(endpoints.questions.query, payload)
      currentAnswer.value = normalizeAnswer(response)
      return { success: true, data: currentAnswer.value }
    } catch (err) {
      logger.error('queryInsight failed:', err)
      error.value = err?.data?.message ?? err?.data?.detail ?? 'Could not answer that question.'
      toastStore.error('Could not answer that question.')
      return { success: false, error: err }
    } finally {
      answerLoading.value = false
    }
  }

  async function sendFeedback(attemptId, value) {
    if (!attemptId) return { success: false }

    feedbackLoading.value = true

    try {
      await post(endpoints.aiAttempts.feedback(attemptId), { feedback: value })
      feedbackSubmitted.value = value
      toastStore.success('Feedback saved.')
      return { success: true }
    } catch (err) {
      logger.error('sendFeedback failed:', err)
      toastStore.error('Could not save feedback.')
      return { success: false, error: err }
    } finally {
      feedbackLoading.value = false
    }
  }

  function clearAnswer() {
    currentAnswer.value = null
    error.value = null
    feedbackSubmitted.value = null
  }

  return {
    guidedQuestions,
    guidedLoading,
    answerLoading,
    feedbackLoading,
    currentAnswer,
    currentMode,
    error,
    feedbackSubmitted,
    fetchGuidedQuestions,
    answerGuidedQuestion,
    queryInsight,
    sendFeedback,
    clearAnswer,
  }
})
