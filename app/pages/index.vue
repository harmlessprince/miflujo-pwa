<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth.store.js'

definePageMeta({ layout: 'authentication' })
useHead({ title: 'MiFlujo — Financial intelligence for Nigerian bank statements' })

const authStore = useAuthStore()
const route = useRoute()
const logoWithMotoSrc = '/logo-with-moto.png'

const autoEntryMode = ref(false)
const continueLoading = ref(false)

const displayName = computed(() =>
    authStore.rememberedUser?.first_name || authStore.user?.first_name || 'there'
)
const profilePicture = computed(() =>
    authStore.rememberedUser?.profile_picture_url || authStore.user?.profile_picture_url
)

function handleContinue() {
    const config = useRuntimeConfig()
    continueLoading.value = true

    const tryPrompt = () => {
        window.google?.accounts?.id?.initialize({
            client_id: config.public.googleAuth.clientId,
            callback: (response) => {
                authStore.loginWithGoogle(response.credential)
            },
            auto_select: true,
            cancel_on_tap_outside: false,
        })
        window.google?.accounts?.id?.prompt((notification) => {
            if (
                notification.isNotDisplayed?.() ||
                notification.isSkippedMoment?.() ||
                notification.isDismissedMoment?.()
            ) {
                continueLoading.value = false
            }
        })
    }

    if (window.google?.accounts?.id) {
        tryPrompt()
    } else {
        window.addEventListener('nuxt-google-auth:ready', tryPrompt, { once: true })
    }
}

function useDifferentAccount() {
    autoEntryMode.value = false
}

onMounted(async () => {
    authStore.loadSessionFromStorage()

    if (route.query.reauth) {
        authStore.authError = 'Your session expired. Continue with Google to return to your work.'
        return
    }

    if (authStore.isAuthenticated) {
        await navigateTo('/dashboard')
        return
    }

    if (authStore.rememberedUser) {
        autoEntryMode.value = true
    }
})
</script>

<template>
    <div v-if="authStore.googleLoading" class="flex min-h-screen flex-col bg-surface">
        <header class="flex h-20 items-center justify-between border-b border-grey/40 px-6">
            <IconButton icon="arrow_back" label="Back" @click="authStore.googleLoading = false" />
            <h1 class="text-headline-md font-semibold text-navy">Secure Login</h1>
            <span class="material-symbols-outlined text-primary text-display-lg" aria-hidden="true">help</span>
        </header>

        <main class="flex flex-1 flex-col justify-center px-6 py-8">
            <section class="mx-auto w-full max-w-sm rounded-[10px] border border-grey/60 bg-white px-6 py-8 shadow-sm">
                <div class="mb-8 flex justify-center">
                    <img :src="logoWithMotoSrc" alt="MiFlujo" class="h-16 w-auto" />
                </div>

                <div class="mb-8 flex justify-center">
                    <div class="relative rounded-[10px] border-2 border-primary p-2">
                        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[10px] bg-navy/10">
                            <img
                                v-if="profilePicture"
                                :src="profilePicture"
                                alt=""
                                class="h-full w-full object-cover"
                            />
                            <span v-else class="material-symbols-outlined text-primary text-display-lg">account_circle</span>
                        </div>
                        <span class="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-navy text-white">
                            <span class="material-symbols-outlined text-headline-md">check</span>
                        </span>
                    </div>
                </div>

                <div class="text-center">
                    <h2 class="text-display-lg font-semibold text-navy">Welcome back, {{ displayName }}</h2>
                    <p class="mt-3 text-title-sm font-medium text-navy/70">Securing your session...</p>
                </div>

                <div class="mt-8 rounded-[10px] bg-primary/10 px-6 py-8 text-center">
                    <span class="mx-auto block h-14 w-14 animate-spin rounded-full border-4 border-grey/40 border-t-primary" aria-hidden="true"></span>
                    <p class="mt-6 text-title-sm font-semibold text-primary">Auto-signing you in...</p>
                </div>

                <p class="mt-6 rounded-[10px] border border-grey/60 px-4 py-3 text-center text-body-md font-normal text-navy/70">
                    Bank-grade encryption active
                </p>
            </section>
        </main>
    </div>

    <!-- Remembered user / auto-entry card -->
    <div v-else-if="autoEntryMode" class="flex min-h-screen flex-col bg-surface">
        <header class="flex h-20 items-center justify-between border-b border-grey/40 px-6">
            <IconButton icon="arrow_back" label="Back" @click="useDifferentAccount" />
            <h1 class="text-headline-md font-semibold text-navy">Welcome Back</h1>
            <span class="w-9" aria-hidden="true" />
        </header>

        <main class="flex flex-1 flex-col justify-center px-6 py-8">
            <section class="mx-auto w-full max-w-sm rounded-[10px] border border-grey/60 bg-white px-6 py-8 shadow-sm">
                <div class="mb-8 flex justify-center">
                    <img :src="logoWithMotoSrc" alt="MiFlujo" class="h-16 w-auto" />
                </div>

                <div class="mb-8 flex justify-center">
                    <div class="relative rounded-[10px] border-2 border-primary p-2">
                        <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[10px] bg-navy/10">
                            <img
                                v-if="profilePicture"
                                :src="profilePicture"
                                alt=""
                                class="h-full w-full object-cover"
                            />
                            <span v-else class="material-symbols-outlined text-primary text-display-lg">account_circle</span>
                        </div>
                        <span class="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-navy text-white">
                            <span class="material-symbols-outlined text-headline-md">check</span>
                        </span>
                    </div>
                </div>

                <div class="mb-8 text-center">
                    <h2 class="text-display-lg font-semibold text-navy">Welcome back, {{ displayName }}</h2>
                    <p class="mt-3 text-title-sm font-medium text-navy/70">Continue to pick up where you left off.</p>
                </div>

                <BaseButton
                    type="button"
                    :disabled="continueLoading"
                    class="flex items-center justify-center gap-x-3 font-medium"
                    @click="handleContinue"
                >
                    <span
                        v-if="continueLoading"
                        class="block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                    />
                    <span>{{ continueLoading ? 'Securing your session...' : 'Continue' }}</span>
                </BaseButton>

                <button
                    type="button"
                    class="mt-4 w-full text-center text-body-sm font-medium text-navy/60 hover:text-primary transition-colors"
                    @click="useDifferentAccount"
                >
                    Use a different account
                </button>

                <p class="mt-6 rounded-[10px] border border-grey/60 px-4 py-3 text-center text-body-md font-normal text-navy/70">
                    Bank-grade encryption active
                </p>
            </section>
        </main>
    </div>

    <div v-else class="flex min-h-screen flex-col px-6 py-10">

        <!-- Logo -->
        <header class="flex items-center justify-center pt-4">
            <img :src="logoWithMotoSrc" alt="MiFlujo" class="h-16 w-auto" />
        </header>

        <!-- Main content -->
        <main class="flex-1 flex flex-col justify-center gap-y-8 max-w-sm mx-auto w-full">
            <div class="text-center space-y-4">
                <h1 class="text-display-lg font-semibold text-navy">
                    Financial intelligence for Nigerian bank statements.
                </h1>
                <p class="text-body-md font-normal text-secondary">
                    Upload your PDF statements and get instant AI-driven insights,
                    categorization, and fraud detection.
                </p>
            </div>

            <p v-if="authStore.authError" class="rounded-[10px] border border-error bg-white px-4 py-3 text-center text-body-md font-normal text-error">
                {{ authStore.authError }}
            </p>

            <GoogleButton />
        </main>

        <!-- Footer -->
        <footer class="flex flex-col items-center gap-y-3 pb-4">
            <nav class="flex items-center gap-x-6">
                <a href="#" class="text-body-sm font-normal text-navy hover:text-primary transition-colors">
                    Terms of Service
                </a>
                <a href="#" class="text-body-sm font-normal text-navy hover:text-primary transition-colors">
                    Privacy Policy
                </a>
                <a href="#" class="text-body-sm font-normal text-navy hover:text-primary transition-colors">
                    Support
                </a>
            </nav>
            <p class="text-label-caps font-bold uppercase text-secondary tracking-widest">
                &copy; 2024 MiFlujo Technologies
            </p>
        </footer>

    </div>
</template>
