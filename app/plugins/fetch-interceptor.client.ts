import {useErrorStore} from "~/stores/error.store";
import {useAuthStore} from "~/stores/auth.store";
import {useToastStore} from "~/stores/toast.store";
import {logger} from "~/utils/helpers";


export default defineNuxtPlugin((_nuxtApp) => {
    logger.log('✅ fetch-interceptor plugin loaded');
    const authStore = useAuthStore();
    const errorStore = useErrorStore();
    const toastStore = useToastStore();
    const config = useRuntimeConfig();
    // Extend the $fetch options globally



    globalThis.$fetch = $fetch.create({
        onRequest({options}) {
            errorStore.resetErrors()
            if (!config.public.debugMode) {
                logger.log('[fetch] request:', options.method, options.baseURL);
            }
            const token = authStore.getAuthToken();
            if (token) {
                options.headers.set("Authorization", `Bearer ${token}`);
            }
        },

        onResponse({response, options}) {
            // Optionally handle global success logging
            const status = response?.status;
            const type = response?.type;
            const data = response._data;
            if (data?.id === 'dev' && type === 'basic') {
                return
            }

            const isSilent = (options as any).silent;

            const error = data?.error ?? 'error';
            let message = data?.message ?? 'Error, please try again later';

            // If silent, suppress toasts and specific redirects (except 401)
            if (isSilent && status >= 400 && status !== 401) {
                logger.error(`[Silent API Error] ${status} ${options.method} ${response.url}:`, data);
                return data;
            }

            switch (status) {
                case 200:
                case 201:
                    break;
                case 400:
                    errorStore.setErrorMessage(data.message)
                    toastStore.error(data?.message ?? 'Bad request, please try again later', error)
                    break;
                case 401:
                    authStore.clearAuthToken()
                    authStore.clearAuthUser()
                    toastStore.error(message, "Unauthenticated")
                    navigateTo("/login")
                    break;
                case 403:
                    toastStore.error(message, "Unauthorized")
                    navigateTo("/unauthorized");
                    break;
                case 404:
                    errorStore.setErrorMessage(message)
                    toastStore.error(message, "Not Found")
                    break;
                case 422:
                    message = data?.message ?? "Validation failed."
                    errorStore.setErrorMessage(message)
                    errorStore.setValidationErrors(data?.errors)
                    toastStore.error(message, "invalid data")
                    break;
                case 500:
                    errorStore.setErrorMessage(data.message)
                    errorStore.setServerError(true)
                    toastStore.error('Seems like it is an issue from our end', 'There was a problem.')
                    break;
                default:
                    if (status >= 400) {
                        toastStore.error('Seems like it is an issue from our end', 'There was a problem.')
                    }
            }

            const nextStepValue: string | undefined = data?.nextStep;
            const errorCodeValue: string | undefined = data?.errorCode;

            if (nextStepValue || errorCodeValue) {
                if (errorCodeValue) errorStore.setErrorCode(errorCodeValue);
                if (nextStepValue) errorStore.setNextStep(nextStepValue);

                let emailFromRequest: string | null = null;
                try {
                    const body: unknown = options?.body;
                    if (body && typeof body === 'string') {
                        emailFromRequest = (JSON.parse(body) as Record<string, unknown>)?.email as string ?? null;
                    } else if (body && typeof body === 'object') {
                        emailFromRequest = (body as Record<string, unknown>)?.email as string ?? null;
                    }
                } catch { /* not JSON, ignore */ }

                switch (nextStepValue) {
                    case 'REINITIATE_EMAIL_VERIFICATION': {
                        // Local page (verify-email/index.vue) reacts via errorStore.nextStep.
                        break;
                    }
                    case 'REQUEST_PASSWORD_RESET': {
                        const email = emailFromRequest || authStore?.forgotPasswordTokenEmail;
                        const query = email ? `?email=${encodeURIComponent(email)}` : '';
                        navigateTo(`/forgot-password${query}`);
                        break;
                    }
                    case 'LOGIN': {
                        if (status !== 401) {
                            authStore.clearAuthToken();
                            authStore.clearAuthUser();
                            navigateTo('/login');
                        }
                        break;
                    }
                    case 'VERIFY_PHONE':
                        break;
                    default:
                        break;
                }
            }

            return data;
        },

        onRequestError(error) {
            logger.error("Request error", error);
            toastStore.error("Check your internet connection or try again later", "Request failed");
            errorStore.setErrorMessage("Network error");
            return Promise.reject(error);
        }
    });
});
