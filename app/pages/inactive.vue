<script setup>
import { useAuthStore } from '~/stores/auth.store.js'

definePageMeta({ layout: 'authentication' })
useHead({ title: 'Account Inactive — MiFlujo' })

const authStore = useAuthStore()

async function backToLogin() {
    await authStore.logout()
}

function contactSupport() {
    window.location.href = 'mailto:support@miflujo.com?subject=Account%20Reactivation%20Request'
}
</script>

<template>
    <div class="flex min-h-screen flex-col bg-surface">
        <header class="flex h-20 items-center justify-between border-b border-grey/40 px-6">
            <button
                type="button"
                class="flex items-center gap-x-1 text-body-md font-medium text-navy transition-colors hover:text-primary"
                @click="backToLogin"
            >
                <span class="material-symbols-outlined text-headline-md">arrow_back</span>
                <span>Back</span>
            </button>
            <h1 class="text-headline-md font-semibold text-navy">MiFlujo</h1>
            <span class="material-symbols-outlined text-primary text-headline-md cursor-pointer">help</span>
        </header>

        <main class="flex flex-1 flex-col items-center justify-center px-6 py-10">
            <div class="w-full max-w-sm space-y-6">

                <!-- State icon -->
                <div class="flex justify-center">
                    <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm border border-grey/40">
                        <span class="material-symbols-outlined text-primary" style="font-size: 2.5rem;">no_accounts</span>
                    </div>
                </div>

                <!-- Heading + description -->
                <div class="text-center space-y-3">
                    <h2 class="text-display-lg font-semibold text-navy">Account Inactive</h2>
                    <p class="text-body-md font-normal text-navy/60">
                        Your account is currently inactive. Please contact support to reactivate.
                    </p>
                </div>

                <!-- Actions -->
                <div class="space-y-3">
                    <BaseButton type="button" @click="contactSupport">
                        <span class="flex items-center justify-center gap-x-2">
                            <span class="material-symbols-outlined text-title-sm">support_agent</span>
                            Contact Support
                        </span>
                    </BaseButton>
                    <BaseButton type="button" variant="outline" @click="backToLogin">
                        <span class="flex items-center justify-center gap-x-2">
                            <span class="material-symbols-outlined text-title-sm">arrow_back</span>
                            Back to Login
                        </span>
                    </BaseButton>
                </div>

                <!-- Security note -->
                <div class="flex gap-x-3 rounded-[10px] border border-primary/20 bg-primary/5 px-4 py-4">
                    <span class="material-symbols-outlined mt-0.5 shrink-0 text-primary text-title-sm">info</span>
                    <div class="space-y-1">
                        <p class="text-body-sm font-semibold text-navy">Security Note</p>
                        <p class="text-body-sm font-normal text-navy/70">
                            Accounts may be deactivated due to prolonged inactivity or security maintenance.
                            Reactivation typically takes 2–4 business hours after verification.
                        </p>
                    </div>
                </div>

            </div>
        </main>
    </div>
</template>
