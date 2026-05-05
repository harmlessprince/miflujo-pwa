<script setup>
defineProps({
  type: {
    type: String,
    default: 'submit',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'outline'].includes(v),
  },
})
</script>

<template>
  <button
      :class="[
        'cursor-pointer w-full rounded-[10px] h-[47px] text-title-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        variant === 'outline'
          ? 'border border-navy text-navy bg-transparent hover:bg-navy/5'
          : 'bg-primary text-white',
      ]"
      :type="type"
      :disabled="disabled">
    <slot></slot>
  </button>
</template>
