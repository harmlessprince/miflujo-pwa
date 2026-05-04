<script setup>
defineProps({
  type: {
    type: String,
    default: 'submit',
  },
})
</script>

<template>
  <button
      class="cursor-pointer w-full rounded-[10px] bg-primary h-[47px] text-title-sm text-white font-semibold"
      :type="type">
    <slot></slot>
  </button>
</template>
