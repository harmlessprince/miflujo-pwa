<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <label class="font-medium text-body-md text-navy" :for="name">{{ name }}</label>
</template>
