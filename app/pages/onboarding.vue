<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth.store.js'

definePageMeta({ layout: 'authentication' })
useHead({ title: 'Confirm preferences — MiFlujo' })

const authStore = useAuthStore()
const timezone = ref(authStore.user?.timezone || 'Africa/Lagos')
const currency = ref(authStore.user?.default_currency || 'NGN')

const timezoneOptions = [
    { label: 'Africa/Lagos', value: 'Africa/Lagos' },
    { label: 'Africa/Accra', value: 'Africa/Accra' },
    { label: 'Europe/London', value: 'Europe/London' },
]

const currencyOptions = [
    { label: 'Nigerian Naira (NGN)', value: 'NGN' },
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'British Pound (GBP)', value: 'GBP' },
]

async function continueToUpload() {
    authStore.setAuthUser({
        ...(authStore.user || {}),
        timezone: timezone.value,
        default_currency: currency.value,
    })
    await navigateTo('/dashboard')
}
</script>

<template>
    <main class="flex min-h-screen flex-col justify-center px-6 py-10">
        <section class="mx-auto w-full max-w-sm rounded-[10px] border border-grey/60 bg-white px-6 py-8 shadow-sm">
            <div class="mb-8 text-center">
                <img src="/logo-with-moto.png" alt="MiFlujo" class="mx-auto h-16 w-auto" />
                <h1 class="mt-6 text-display-lg font-semibold text-navy">Confirm your defaults</h1>
                <p class="mt-3 text-body-md font-normal text-navy/70">
                    These settings help MiFlujo format your statement insights correctly.
                </p>
            </div>

            <div class="space-y-5">
                <SearchableSelectInput
                    v-model="timezone"
                    label="Timezone"
                    :options="timezoneOptions"
                />

                <SearchableSelectInput
                    v-model="currency"
                    label="Default currency"
                    :options="currencyOptions"
                />
            </div>

            <div class="mt-8 space-y-4">
                <BaseButton type="button" @click="continueToUpload">Continue</BaseButton>
                <NuxtLink to="/dashboard" class="block text-center text-title-sm font-medium text-navy">
                    Skip for now
                </NuxtLink>
            </div>
        </section>
    </main>
</template>
