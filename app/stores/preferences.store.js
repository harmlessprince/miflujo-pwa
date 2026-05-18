import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'
import { logger } from '~/utils/helpers.js'
import { useApiService } from '~/services/apiService.js'
import { useAuthStore } from '~/stores/auth.store.js'
import { useToastStore } from '~/stores/toast.store.js'

export const preferenceOptions = {
  country: [
    { label: 'Nigeria', value: 'NG', note: 'Only Nigeria is supported for local financial context right now.' },
  ],
  preferred_language: [
    { label: 'English', value: 'en', note: 'English is the only supported language for insights right now.' },
  ],
  salary_cycle: [
    { label: 'Weekly', value: 'weekly', note: 'Use when income usually arrives every week.' },
    { label: 'Biweekly', value: 'biweekly', note: 'Use when income usually arrives every two weeks.' },
    { label: 'Monthly', value: 'monthly', note: 'Use when income usually arrives once per month.' },
    { label: 'Irregular', value: 'irregular', note: 'Use when income timing varies or is project-based.' },
  ],
  budgeting_style: [
    { label: 'Strict', value: 'strict', note: 'Prefer firm limits and early warnings.' },
    { label: 'Flexible', value: 'flexible', note: 'Allow some movement between categories.' },
    { label: 'Zero based', value: 'zero_based', note: 'Assign every naira to a purpose each month.' },
    { label: 'Envelope', value: 'envelope', note: 'Group spending into category buckets.' },
    { label: 'None', value: 'none', note: 'Do not tailor insights around a budgeting method.' },
  ],
  alert_sensitivity: [
    { label: 'Low', value: 'low', note: 'Only show stronger anomalies and larger changes.' },
    { label: 'Normal', value: 'normal', note: 'Use the default balance of useful alerts.' },
    { label: 'High', value: 'high', note: 'Show smaller anomalies and earlier warnings.' },
  ],
  insight_tone: [
    { label: 'Direct', value: 'direct', note: 'Keep explanations short and practical.' },
    { label: 'Friendly', value: 'friendly', note: 'Use a warmer everyday tone.' },
    { label: 'Analytical', value: 'analytical', note: 'Prefer numbers, comparisons, and detail.' },
    { label: 'Coaching', value: 'coaching', note: 'Frame insights as next steps and habits.' },
  ],
  privacy_level: [
    { label: 'Standard', value: 'standard', note: 'Use transaction names normally for clearer insights.' },
    { label: 'Restricted', value: 'restricted', note: 'Reduce sensitive details in AI context.' },
    { label: 'Anonymized', value: 'anonymized', note: 'Remove identifying counterparty details where possible.' },
  ],
  personal_business_mode: [
    { label: 'Personal', value: 'personal', note: 'Treat spending as household or individual finances.' },
    { label: 'Business', value: 'business', note: 'Treat activity as business income and expenses.' },
    { label: 'Mixed', value: 'mixed', note: 'Expect both personal and business activity.' },
  ],
  statement_import_behavior: [
    { label: 'Merge new data', value: 'merge', note: 'Add new transactions while keeping existing records.' },
    { label: 'Dedupe only', value: 'dedupe_only', note: 'Skip duplicates and leave existing records untouched.' },
    { label: 'Replace duplicates', value: 'replace_duplicates', note: 'Replace matching imported records with the newer upload.' },
    { label: 'Review duplicates', value: 'review_duplicates', note: 'Pause duplicate matches for manual review.' },
  ],
}

export const preferenceFieldNotes = {
  country: 'Currently supported: Nigeria only.',
  preferred_language: 'Currently supported: English only.',
  financial_month_start_day: 'Choose the day your reporting month should start. Use 1 for calendar months.',
  salary_cycle: 'Helps MiFlujo understand when income should normally appear.',
  salary_day_range: 'Optional window for expected salary payments within a month.',
  budgeting_style: 'Shapes how budget recommendations and warnings are framed.',
  alert_sensitivity: 'Controls how quickly MiFlujo flags unusual spending or cashflow changes.',
  insight_tone: 'Changes the writing style of AI summaries without changing the underlying facts.',
  privacy_level: 'Controls how much identifying transaction detail AI features may use.',
  personal_business_mode: 'Keeps analysis aligned with personal, business, or mixed account use.',
  statement_import_behavior: 'Sets the default behavior when a new upload overlaps with an existing statement.',
}

const SETUP_FIELDS = [
  'salary_cycle',
  'budgeting_style',
  'insight_tone',
  'statement_import_behavior',
]

export const usePreferencesStore = defineStore('preferencesStore', () => {
  const { get, patch } = useApiService()
  const authStore = useAuthStore()
  const toastStore = useToastStore()

  const preferences = ref(null)
  const loading = ref(false)
  const saving = ref(false)

  const reminderStorageKey = computed(() => {
    const id = authStore.user?.id ?? 'anonymous'
    return `miflujo_preferences_remind_at_${id}`
  })

  const incompleteSetupFields = computed(() => {
    if (!preferences.value) return []
    return SETUP_FIELDS.filter((field) => !preferences.value[field])
  })

  const isSetupComplete = computed(() => preferences.value && incompleteSetupFields.value.length === 0)

  const shouldPromptSetup = computed(() => {
    if (!preferences.value || isSetupComplete.value) return false
    if (!import.meta.client) return true

    const remindAt = localStorage.getItem(reminderStorageKey.value)
    if (!remindAt) return true

    return Date.now() >= Number(remindAt)
  })

  async function fetchPreferences({ force = false } = {}) {
    if (preferences.value && !force) return preferences.value
    loading.value = true
    try {
      const response = await get(endpoints.preferences.me)
      preferences.value = response?.data ?? response ?? null
      return preferences.value
    } catch (err) {
      logger.error('fetchPreferences failed:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function savePreferences(payload) {
    saving.value = true
    try {
      const response = await patch(endpoints.preferences.me, payload)
      preferences.value = response?.data ?? response ?? null
      clearReminder()
      toastStore.success('Preferences saved.')
      return { success: true, data: preferences.value }
    } catch (err) {
      logger.error('savePreferences failed:', err)
      toastStore.error(err?.data?.message ?? 'Could not save preferences. Please try again.')
      return { success: false, error: err }
    } finally {
      saving.value = false
    }
  }

  function remindLater(days) {
    if (!import.meta.client) return
    const remindAt = Date.now() + Number(days) * 24 * 60 * 60 * 1000
    localStorage.setItem(reminderStorageKey.value, String(remindAt))
  }

  function clearReminder() {
    if (!import.meta.client) return
    localStorage.removeItem(reminderStorageKey.value)
  }

  return {
    preferences,
    loading,
    saving,
    incompleteSetupFields,
    isSetupComplete,
    shouldPromptSetup,
    fetchPreferences,
    savePreferences,
    remindLater,
    clearReminder,
  }
})
