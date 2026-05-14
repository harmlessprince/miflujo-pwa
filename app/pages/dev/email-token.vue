<script setup>
import { useAuthStore } from '~/stores/auth.store.js'

definePageMeta({ layout: 'authentication' })
useHead({ title: 'Dev Email Token — MiFlujo' })

const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const message = ref('Preparing local test session...')

async function startTestSession() {
  if (!import.meta.dev) {
    message.value = 'Email token login is only available in local development.'
    return
  }

  const email = String(route.query.email || 'realolamilekan@gmail.com')
  loading.value = true
  const success = await authStore.loginWithEmailToken(email)
  loading.value = false

  if (!success) {
    message.value = authStore.authError || 'Could not create a local test session.'
    return
  }

  await navigateTo('/dashboard')
}

onMounted(startTestSession)
</script>

<template>
  <MobileContainer>
    <section class="flex min-h-svh flex-col items-center justify-center bg-white px-6 text-center">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface">
        <span class="material-symbols-outlined text-headline-md text-primary" aria-hidden="true">
          {{ loading ? 'sync' : 'key' }}
        </span>
      </div>
      <h1 class="mb-2 text-headline-md font-semibold text-navy">Local test login</h1>
      <p class="text-body-sm text-secondary">{{ message }}</p>
    </section>
  </MobileContainer>
</template>
