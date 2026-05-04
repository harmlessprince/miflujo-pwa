<script setup>
const props = defineProps({
  label: {
    type: String,
    default: 'Submit'
  },
  submittingLabel: {
    type: String,
    default: 'Submitting'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
      class="cursor-pointer w-full rounded-[10px] bg-primary h-[47px] text-title-sm text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      type="submit"
      :disabled="props.disabled || props.isSubmitting"
  >
    <span v-if="props.isSubmitting">
      {{ submittingLabel }}<span class="dot">.</span><span class="dot delay-200">.</span><span class="dot delay-400">.</span>
    </span>
    <span v-else>{{ label }}</span>
  </button>
</template>
