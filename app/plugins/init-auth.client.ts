import {useAuthStore} from "~/stores/auth.store";
// import type {H3Event} from 'h3';
// import {getCookie} from 'h3';

export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore()
    const authToken = useCookie('auth_token');

    if (authToken.value) {
        authStore.setAuthToken(authToken.value)
            try {
                await authStore.fetchUserProfile()
                nuxtApp.payload.user = authStore.user;
            } catch (err) {
            console.error('Failed to fetch profile:', err)
            authStore.clearAuthToken()
        }
    }
})
