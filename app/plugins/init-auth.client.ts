import {useAuthStore} from "~/stores/auth.store";

export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore()

    if (!authStore.loadSessionFromStorage()) {
        await authStore.refreshSession()
    }

    if (authStore.isAuthenticated) {
        await authStore.fetchCurrentUser()
    }

    nuxtApp.payload.user = authStore.user;
})
