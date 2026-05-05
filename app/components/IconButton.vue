<script setup>
defineProps({
    icon: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'button',
    },
})
</script>

<template>
    <button
        :type="type"
        class="inline-flex items-center justify-center text-primary transition-colors hover:text-navy"
        :aria-label="label"
    >
        <span class="material-symbols-outlined text-display-lg" aria-hidden="true">{{ icon }}</span>
    </button>
</template>
