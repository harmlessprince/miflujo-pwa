import {defineStore} from "pinia";
import {endpoints} from "~/utils/endpoints.js";
import {useApiService} from "~/services/apiService.js";
import {useToastStore} from "~/stores/toast.store.js";


export const useAuthStore = defineStore("authStore", () => {
    const { get, post } = useApiService();
    const authToken = ref(null);
    const tokenExpiresAt = ref(null);
    const user = ref(null);
    const rememberedUser = ref(null);
    const returnUrl = ref(null);
    const authError = ref('');
    const toastStore = useToastStore();

    function loadRememberedUser() {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem('miflujo_remembered_user')
            if (raw) rememberedUser.value = JSON.parse(raw)
        } catch {
            rememberedUser.value = null
        }
    }

    function saveRememberedUser(nextUser) {
        if (!import.meta.client || !nextUser) return
        const data = {
            first_name: nextUser.first_name,
            profile_picture_url: nextUser.profile_picture_url,
        }
        rememberedUser.value = data
        localStorage.setItem('miflujo_remembered_user', JSON.stringify(data))
    }

    function clearRememberedUser() {
        rememberedUser.value = null
        if (import.meta.client) localStorage.removeItem('miflujo_remembered_user')
    }

    const init = async () => {
        loadSessionFromStorage()
    };

    const setAuthToken = (newToken) => {
        authToken.value = newToken;
    };
    const getAuthToken = () => {
        return authToken.value
    };

    const clearAuthToken = () => {
        authToken.value = null;
        tokenExpiresAt.value = null;
        useCookie('auth_token').value = null;
        useCookie('auth_expires_at').value = null;
    };

    const setAuthUser = (newUser) => {
        user.value = newUser;
        useCookie('auth_user').value = newUser ? JSON.stringify(newUser) : null;
    };

    const clearAuthUser = () => {
        user.value = null;
        useCookie('auth_user').value = null;
    };

    const isTokenExpired = computed(() => {
        if (!authToken.value || !tokenExpiresAt.value) return true;
        return Date.now() >= Number(tokenExpiresAt.value);
    });

    const isAuthenticated = computed(() => Boolean(authToken.value) && !isTokenExpired.value);

    function loadSessionFromStorage() {
        loadRememberedUser();
        const storedToken = useCookie('auth_token');
        const storedExpiry = useCookie('auth_expires_at');
        const storedUser = useCookie('auth_user');

        if (storedToken.value && storedExpiry.value && Date.now() < Number(storedExpiry.value)) {
            authToken.value = storedToken.value;
            tokenExpiresAt.value = Number(storedExpiry.value);

            if (storedUser.value) {
                try {
                    user.value = typeof storedUser.value === 'string'
                        ? JSON.parse(storedUser.value)
                        : storedUser.value;
                } catch {
                    user.value = null;
                }
            }
            return true;
        }

        resetAll();
        return false;
    }

    function persistSession(accessToken, expiresIn, nextUser) {
        const ttlSeconds = Number(expiresIn || 3600);
        const expiresAt = Date.now() + (ttlSeconds * 1000);

        authToken.value = accessToken;
        tokenExpiresAt.value = expiresAt;
        user.value = nextUser;
        saveRememberedUser(nextUser);

        useCookie('auth_token', { maxAge: ttlSeconds, sameSite: 'lax' }).value = accessToken;
        useCookie('auth_expires_at', { maxAge: ttlSeconds, sameSite: 'lax' }).value = String(expiresAt);
        useCookie('auth_user', { maxAge: ttlSeconds, sameSite: 'lax' }).value = JSON.stringify(nextUser);
    }

    const googleLoading = ref(false)
    const refreshLoading = ref(false)

    async function fetchCurrentUser() {
        try {
            const response = await get(endpoints.auth.me)
            const data = response?.data ?? response
            if (data) setAuthUser(data)
        } catch {
            // caller decides how to handle missing profile
        }
    }

    async function refreshSession() {
        if (refreshLoading.value) return false
        refreshLoading.value = true
        try {
            const config = useRuntimeConfig()
            const response = await post(endpoints.auth.refresh, {}, {silent: true,})
            const data = response?.data ?? response
            const accessToken = data?.access_token
            const nextUser = data?.user
            if (!accessToken || !nextUser) return false
            persistSession(accessToken, data?.expires_in, nextUser)
            return true
        } catch {
            resetAll()
            return false
        } finally {
            refreshLoading.value = false
        }
    }

    async function loginWithGoogle(googleCredential) {
        googleLoading.value = true
        authError.value = ''
        try {
            const response = await post(endpoints.auth.google, {
                google_token: googleCredential,
            }, {
                credentials: 'include',
            })

            const data = response?.data ?? response;
            const accessToken = data?.access_token;
            const nextUser = data?.user;

            if (!accessToken || !nextUser) {
                authError.value = 'Google authentication could not be completed. Please try again.';
                return;
            }

            if (nextUser?.is_active === false) {
                persistSession(accessToken, data?.expires_in, nextUser);
                await navigateTo('/inactive');
                return;
            }

            persistSession(accessToken, data?.expires_in, nextUser);
            toastStore.success('Logged in with Google successfully!', '');

            const needsOnboarding = !nextUser?.timezone || !nextUser?.default_currency;
            await navigateTo(returnUrl.value || (needsOnboarding ? '/onboarding' : '/dashboard'));
        } catch (error) {
            authError.value = error?.data?.message || 'Google authentication failed. Check your connection and try again.';
        } finally {
            googleLoading.value = false
        }
    }

    async function loginWithEmailToken(email) {
        if (!import.meta.dev) {
            authError.value = 'Email token login is only available in local development.';
            return false;
        }

        authError.value = '';
        try {
            const response = await post(endpoints.auth.emailToken, { email }, {
                credentials: 'include',
            });

            const data = response?.data ?? response;
            const accessToken = data?.access_token;
            const nextUser = data?.user;

            if (!accessToken || !nextUser) {
                authError.value = 'Testing token could not be generated. Please try again.';
                return false;
            }

            persistSession(accessToken, data?.expires_in, nextUser);
            return true;
        } catch (error) {
            authError.value = error?.data?.message || 'Email token login failed. Check the local API and try again.';
            return false;
        }
    }

    async function logout() {
        clearAuthToken();
        clearAuthUser();
        clearRememberedUser();
        await navigateTo('/');
        toastStore.success('Logged out successfully!', '')
    }

    function resetAll() {
        clearAuthToken();
        clearAuthUser();
        authError.value = '';
    }

    return {
        authToken,
        tokenExpiresAt,
        user,
        rememberedUser,
        returnUrl,
        authError,
        googleLoading,
        isAuthenticated,
        isTokenExpired,
        init,
        loadSessionFromStorage,
        setAuthToken,
        getAuthToken,
        clearAuthToken,
        setAuthUser,
        clearAuthUser,
        loginWithGoogle,
        loginWithEmailToken,
        logout,
        fetchCurrentUser,
        refreshSession,
        refreshLoading,
        returnUrl
    }
});
