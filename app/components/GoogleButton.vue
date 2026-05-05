<script setup>
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store.js'

const authStore = useAuthStore()
const hiddenBtnRef = ref(null)
const awaitingGoogleResponse = ref(false)
const { credential, renderButton } = useGoogleAuth()
const isDisabled = computed(() => authStore.googleLoading || awaitingGoogleResponse.value)

function renderHiddenButton() {
    if (hiddenBtnRef.value) {
        renderButton(hiddenBtnRef.value, { theme: 'outline', size: 'large' })
    }
}

onMounted(() => {
    renderHiddenButton()
    window.addEventListener('nuxt-google-auth:ready', renderHiddenButton)
})

onBeforeUnmount(() => {
    window.removeEventListener('nuxt-google-auth:ready', renderHiddenButton)
})

watch(credential, (googleCredential) => {
    if (googleCredential) {
        awaitingGoogleResponse.value = false
        authStore.loginWithGoogle(googleCredential)
    }
})

function handleClick() {
    if (isDisabled.value) return
    awaitingGoogleResponse.value = true
    window.google?.accounts?.id?.prompt((notification) => {
        if (
            notification.isNotDisplayed?.()
            || notification.isSkippedMoment?.()
            || notification.isDismissedMoment?.()
        ) {
            awaitingGoogleResponse.value = false
        }
    })
}
</script>

<template>
    <ClientOnly>
        <!-- Offscreen render initialises GIS and handles credential callback -->
        <div ref="hiddenBtnRef" class="sr-only" aria-hidden="true" />

        <BaseButton
            type="button"
            :disabled="isDisabled"
            @click="handleClick"
            class="flex items-center justify-center gap-x-3 font-medium"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{{ isDisabled ? 'Securing your session...' : 'Continue with Google' }}</span>
        </BaseButton>
    </ClientOnly>
</template>
