import {defineStore} from "pinia";
import {endpoints} from "~/utils/endpoints.js";
import {useApiService} from "~/services/apiService.js";
import {useToastStore} from "~/stores/toast.store.js";


export const useAuthStore = defineStore("authStore", () => {
    const { post } = useApiService();
    const authToken = ref(null);
    const user = ref({
        id: null, email: null, fullName: null, address: null, createdAt: null
    });

   
    const returnUrl = ref(null);
    const toastStore = useToastStore();

    const init = async () => {
        await fetchUserProfile()
    };

    const setAuthToken = (newToken) => {
        authToken.value = newToken;
    };
    const getAuthToken = () => {
        return authToken.value
    };

    const clearAuthToken = () => {
        authToken.value = null;
        useCookie('auth_token').value = null;
    };

    const setAuthUser = (newUser) => {
        user.value = newUser;
    };

    const clearAuthUser = () => {
        user.value = null;
    };
   

    const googleLoading = ref(false)

    async function loginWithGoogle(googleCredential) {
        googleLoading.value = true
        try {
            const response = await post(endpoints.auth.google, { credential: googleCredential })
            if (response?.token) {
                useCookie('auth_token').value = response.token
                setAuthToken(response.token)
                if (response.user) setAuthUser(response.user)
                toastStore.success('Logged in with Google successfully!', '')
                await navigateTo('/dashboard')
            }
        } finally {
            googleLoading.value = false
        }
    }

    async function logout() {
        clearAuthToken();
        clearAuthUser();
        await navigateTo('/login');
        toastStore.success('Logged out successfully!', '')
    }

    function resetAll() {
        clearAuthToken();
        clearAuthUser();
    }

    return {
        authToken,
        user,
        googleLoading,
        init,
        setAuthToken,
        getAuthToken,
        clearAuthToken,
        setAuthUser,
        clearAuthUser,
        loginWithGoogle,
        logout,
    }
});