<script setup lang="ts">
import { ref, computed } from 'vue'

interface Country {
  name: string
  code: string
  flag: string
}

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  maxlength?: number
  inputClass?: string
  readonly?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter phone number',
  inputClass: '',
  readonly: false
})

const emit = defineEmits(['update:modelValue', 'update:countryCode'])

const countries: Country[] = [
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  { name: 'Tanzania', code: '+255', flag: '🇹🇿' },
  { name: 'Uganda', code: '+256', flag: '🇺🇬' },
  { name: 'Senegal', code: '+221', flag: '🇸🇳' },
  { name: 'Ivory Coast', code: '+225', flag: '🇨🇮' },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
]

const selectedCountry = ref<Country>(countries[0]!) // Nigeria default
const isDropdownOpen = ref(false)
const searchQuery = ref('')

const filteredCountries = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return countries
  return countries.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.includes(q)
  )
})

function selectCountry(country: Country) {
  selectedCountry.value = country
  isDropdownOpen.value = false
  searchQuery.value = ''
  emit('update:countryCode', country.code)
}

function toggleDropdown() {
  if (props.readonly) return
  isDropdownOpen.value = !isDropdownOpen.value
  if (!isDropdownOpen.value) searchQuery.value = ''
}

function closeDropdown() {
  isDropdownOpen.value = false
  searchQuery.value = ''
}

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  let numeric = input.value.replace(/\D/g, '')
  numeric = numeric.replace(/^0/, '')
  input.value = numeric
  emit('update:modelValue', numeric)
}

function handleKeydown(event: KeyboardEvent) {
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'Home', 'End'
  ]
  const isDigit = /^\d$/.test(event.key)
  const isAllowed = allowedKeys.includes(event.key)
  const isCtrlCmd = event.ctrlKey || event.metaKey

  if (!isDigit && !isAllowed && !isCtrlCmd) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="w-full" v-click-outside="closeDropdown">
    <label v-if="label" class="block text-body-md font-medium text-navy mb-2">
      {{ label }}
    </label>

    <div class="relative flex">
      <!-- Country Code Trigger -->
      <button
        type="button"
        @click="toggleDropdown"
        class="flex items-center gap-1.5 h-[47px] px-3 rounded-l-[10px] border border-r-0 border-grey bg-surface hover:bg-grey/10 transition-colors text-body-md font-medium text-navy whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary"
        :class="[
          error ? 'border-error' : '',
          readonly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        ]"
      >
        <span class="text-base leading-none">{{ selectedCountry.flag }}</span>
        <span>{{ selectedCountry.code }}</span>
        <svg
          class="w-3.5 h-3.5 text-secondary transition-transform duration-200"
          :class="isDropdownOpen ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Phone Number Input -->
      <input
        :value="modelValue"
        @input="handleInput"
        @keydown="handleKeydown"
        type="tel"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :name="name"
        :readonly="readonly"
        class="w-full h-[47px] rounded-r-[10px] border border-grey bg-white px-4 text-body-md text-navy placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        :class="[
          error ? 'border-error focus:ring-error' : '',
          inputClass
        ]"
      />

      <!-- Dropdown -->
      <div
        v-if="isDropdownOpen"
        class="absolute top-[calc(100%+6px)] left-0 z-50 w-72 bg-white rounded-[10px] border border-grey shadow-lg overflow-hidden"
      >
        <!-- Search -->
        <div class="p-2 border-b border-grey/30">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search country..."
            class="w-full h-9 px-3 rounded-lg bg-surface border border-grey text-body-md text-navy placeholder:text-secondary outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            @click.stop
          />
        </div>

        <!-- Country List -->
        <ul class="max-h-52 overflow-y-auto py-1">
          <li v-if="filteredCountries.length === 0" class="px-4 py-3 text-body-md text-secondary text-center">
            No countries found
          </li>
          <li
            v-for="country in filteredCountries"
            :key="country.name"
            @click="selectCountry(country)"
            class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface transition-colors text-body-md"
            :class="selectedCountry.name === country.name ? 'bg-primary/5 text-primary font-semibold' : 'text-navy'"
          >
            <span class="text-base">{{ country.flag }}</span>
            <span class="flex-1">{{ country.name }}</span>
            <span class="text-secondary font-medium">{{ country.code }}</span>
          </li>
        </ul>
      </div>
    </div>

    <p v-if="error" class="text-body-sm text-error mt-1.5 font-medium">{{ error }}</p>
    <p v-else-if="hint" class="text-label-caps text-secondary mt-2 uppercase font-bold tracking-widest">{{ hint }}</p>
  </div>
</template>
