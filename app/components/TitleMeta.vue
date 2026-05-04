<script setup>
import { useHead } from '#imports';

const props = defineProps({
  title: {
    type: String,
    default: 'MiFlujo — Nigerian Financial Intelligence',
  },
});
const fullTitle = computed(() => `${props.title} — MiFlujo`);

useHead({
  title: fullTitle.value,
  meta: [
    { charset: 'UTF-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
    { name: 'description', content: 'Upload your Nigerian bank or wallet statement and instantly understand your income, spending, and financial patterns with AI-powered insights.' },
    { name: 'keywords', content: 'bank statement, Nigerian banking, financial intelligence, spending insights, transaction analysis, miflujo, fintech, AI assistant' },
    { name: 'author', content: 'MiFlujo' },
    { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
  ],
  link: [
    { rel: 'shortcut icon', href: '/favicon.ico' },
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: "180x180", href: '/apple-touch-icon.png' },
    { rel: 'icon', sizes: "32x32", href: '/favicon-32x32.png' },
    { rel: 'icon', sizes: "16x16", href: '/favicon-16x16.png' },
  ]
});
</script>

<template>
  <slot />
</template>
