<script setup>
import { usePreferencesStore, preferenceFieldNotes, preferenceOptions } from '~/stores/preferences.store.js'
import { useAuthStore } from '~/stores/auth.store.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Preferences — MiFlujo' })

const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()

const form = ref({
  country: 'NG',
  region: '',
  preferred_language: 'en',
  financial_month_start_day: 1,
  salary_cycle: '',
  salary_day_start: '',
  salary_day_end: '',
  budgeting_style: '',
  alert_sensitivity: 'normal',
  insight_tone: '',
  privacy_level: 'standard',
  personal_business_mode: 'personal',
  statement_import_behavior: '',
})

const salaryRangeError = computed(() => {
  const start = Number(form.value.salary_day_start)
  const end = Number(form.value.salary_day_end)
  if (!start || !end) return ''
  return start > end ? 'Start day must be before end day.' : ''
})

function selectedOptionNote(field) {
  const selected = preferenceOptions[field]?.find((option) => option.value === form.value[field])
  return selected?.note ?? ''
}

function hydrateForm(preferences) {
  if (!preferences) return
  form.value = {
    country: preferences.country ?? 'NG',
    region: preferences.region ?? '',
    preferred_language: preferences.preferred_language ?? 'en',
    financial_month_start_day: preferences.financial_month_start_day ?? 1,
    salary_cycle: preferences.salary_cycle ?? '',
    salary_day_start: preferences.salary_day_start ?? '',
    salary_day_end: preferences.salary_day_end ?? '',
    budgeting_style: preferences.budgeting_style ?? '',
    alert_sensitivity: preferences.alert_sensitivity ?? 'normal',
    insight_tone: preferences.insight_tone ?? '',
    privacy_level: preferences.privacy_level ?? 'standard',
    personal_business_mode: preferences.personal_business_mode ?? 'personal',
    statement_import_behavior: preferences.statement_import_behavior ?? '',
  }
}

function nullableNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

function buildPayload() {
  return {
    country: form.value.country,
    region: form.value.region || null,
    preferred_language: form.value.preferred_language,
    financial_month_start_day: Number(form.value.financial_month_start_day || 1),
    salary_cycle: form.value.salary_cycle || null,
    salary_day_start: nullableNumber(form.value.salary_day_start),
    salary_day_end: nullableNumber(form.value.salary_day_end),
    budgeting_style: form.value.budgeting_style || null,
    alert_sensitivity: form.value.alert_sensitivity,
    insight_tone: form.value.insight_tone || null,
    privacy_level: form.value.privacy_level,
    personal_business_mode: form.value.personal_business_mode,
    statement_import_behavior: form.value.statement_import_behavior || null,
  }
}

async function save() {
  if (salaryRangeError.value) return
  const result = await preferencesStore.savePreferences(buildPayload())
  if (result.success) await navigateTo('/dashboard')
}

onMounted(async () => {
  const preferences = await preferencesStore.fetchPreferences({ force: true })
  hydrateForm(preferences)
})
</script>

<template>
  <MobileContainer>
    <section class="border-b border-grey bg-white px-4 py-5">
      <div class="mb-2 flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">tune</span>
        <p class="text-label-caps font-bold uppercase text-secondary">Preferences</p>
      </div>
      <h1 class="text-headline-md font-semibold text-navy">Personalize MiFlujo</h1>
      <p class="mt-1 text-body-sm text-secondary">{{ authStore.user?.email }}</p>
    </section>

    <div v-if="preferencesStore.loading" class="space-y-4 px-4 py-5">
      <div v-for="item in 6" :key="item" class="animate-pulse space-y-2">
        <div class="h-3 w-28 rounded bg-grey/40" />
        <div class="h-[47px] rounded-[10px] bg-grey/20" />
      </div>
    </div>

    <form v-else class="space-y-5 px-4 py-5" @submit.prevent="save">
      <section class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase text-secondary">Local defaults</p>
        <div class="space-y-4">
          <SearchableSelectInput
            v-model="form.country"
            label="Country"
            :options="preferenceOptions.country"
            :hint="preferenceFieldNotes.country"
          />
          <p v-if="selectedOptionNote('country')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('country') }}
          </p>

          <div class="space-y-2">
            <BaseInputLabel name="Region" />
            <BaseInput
              v-model="form.region"
              type="text"
              name="region"
              placeholder="Lagos"
            />
            <p class="text-body-sm text-secondary">
              Optional state or region for more precise local context.
            </p>
          </div>

          <SearchableSelectInput
            v-model="form.preferred_language"
            label="Preferred language"
            :options="preferenceOptions.preferred_language"
            :hint="preferenceFieldNotes.preferred_language"
          />
          <p v-if="selectedOptionNote('preferred_language')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('preferred_language') }}
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <BaseInputLabel name="Timezone" />
              <div class="flex h-[47px] items-center rounded-[10px] border border-grey bg-surface px-4 text-body-md text-navy">
                {{ authStore.user?.timezone || 'Africa/Lagos' }}
              </div>
              <p class="text-body-sm text-secondary">Managed from your auth profile.</p>
            </div>
            <div class="space-y-2">
              <BaseInputLabel name="Currency" />
              <div class="flex h-[47px] items-center rounded-[10px] border border-grey bg-surface px-4 text-body-md text-navy">
                {{ authStore.user?.default_currency || 'NGN' }}
              </div>
              <p class="text-body-sm text-secondary">Currently defaults to NGN.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase text-secondary">Money rhythm</p>
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseInputLabel name="Financial month starts" />
            <BaseInput
              v-model="form.financial_month_start_day"
              type="number"
              name="financial_month_start_day"
              placeholder="1"
            />
            <p class="text-body-sm text-secondary">
              {{ preferenceFieldNotes.financial_month_start_day }}
            </p>
          </div>

          <SearchableSelectInput
            v-model="form.salary_cycle"
            label="Salary cycle"
            :options="preferenceOptions.salary_cycle"
            placeholder="Choose salary cycle..."
            :hint="preferenceFieldNotes.salary_cycle"
          />
          <p v-if="selectedOptionNote('salary_cycle')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('salary_cycle') }}
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <BaseInputLabel name="Salary day from" />
              <BaseInput
                v-model="form.salary_day_start"
                type="number"
                name="salary_day_start"
                placeholder="25"
              />
            </div>
            <div class="space-y-2">
              <BaseInputLabel name="Salary day to" />
              <BaseInput
                v-model="form.salary_day_end"
                type="number"
                name="salary_day_end"
                placeholder="31"
              />
            </div>
          </div>
          <p class="text-body-sm text-secondary">{{ preferenceFieldNotes.salary_day_range }}</p>
          <p v-if="salaryRangeError" class="text-body-sm text-error">{{ salaryRangeError }}</p>
        </div>
      </section>

      <section class="rounded-[10px] border border-grey bg-white p-4">
        <p class="mb-4 text-label-caps font-bold uppercase text-secondary">Insights and privacy</p>
        <div class="space-y-4">
          <SearchableSelectInput
            v-model="form.budgeting_style"
            label="Budgeting style"
            :options="preferenceOptions.budgeting_style"
            placeholder="Choose budgeting style..."
            :hint="preferenceFieldNotes.budgeting_style"
          />
          <p v-if="selectedOptionNote('budgeting_style')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('budgeting_style') }}
          </p>

          <SearchableSelectInput
            v-model="form.alert_sensitivity"
            label="Alert sensitivity"
            :options="preferenceOptions.alert_sensitivity"
            :hint="preferenceFieldNotes.alert_sensitivity"
          />
          <p v-if="selectedOptionNote('alert_sensitivity')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('alert_sensitivity') }}
          </p>

          <SearchableSelectInput
            v-model="form.insight_tone"
            label="Insight tone"
            :options="preferenceOptions.insight_tone"
            placeholder="Choose tone..."
            :hint="preferenceFieldNotes.insight_tone"
          />
          <p v-if="selectedOptionNote('insight_tone')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('insight_tone') }}
          </p>

          <SearchableSelectInput
            v-model="form.privacy_level"
            label="Privacy level"
            :options="preferenceOptions.privacy_level"
            :hint="preferenceFieldNotes.privacy_level"
          />
          <p v-if="selectedOptionNote('privacy_level')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('privacy_level') }}
          </p>

          <SearchableSelectInput
            v-model="form.personal_business_mode"
            label="Account mode"
            :options="preferenceOptions.personal_business_mode"
            :hint="preferenceFieldNotes.personal_business_mode"
          />
          <p v-if="selectedOptionNote('personal_business_mode')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('personal_business_mode') }}
          </p>

          <SearchableSelectInput
            v-model="form.statement_import_behavior"
            label="Statement imports"
            :options="preferenceOptions.statement_import_behavior"
            placeholder="Choose import behavior..."
            :hint="preferenceFieldNotes.statement_import_behavior"
          />
          <p v-if="selectedOptionNote('statement_import_behavior')" class="text-body-sm text-secondary">
            {{ selectedOptionNote('statement_import_behavior') }}
          </p>
        </div>
      </section>

      <div class="sticky bottom-0 -mx-4 border-t border-grey bg-white px-4 py-3">
        <BaseButton
          type="submit"
          :disabled="preferencesStore.saving || Boolean(salaryRangeError)"
        >
          {{ preferencesStore.saving ? 'Saving...' : 'Save Preferences' }}
        </BaseButton>
      </div>
    </form>
  </MobileContainer>
</template>
