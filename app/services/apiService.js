import { logger } from '~/utils/helpers';
import { endpoints } from '~/utils/endpoints.js';

export const useApiService = () => {
    const config = useRuntimeConfig();

    const request = async (method, route, data = null, params = {}, headers = {}, options = {}) => {
        const sendRequest = () => {
            const finalHeaders = { ...headers, ...options.headers };

            if (!(data instanceof FormData)) {
                if (!finalHeaders['Content-Type'] && method !== 'GET') {
                    finalHeaders['Content-Type'] = 'application/json';
                }
            } else {
                delete finalHeaders['Content-Type'];
            }

            const baseURL = config.public.apiBaseUrl;
            logger.log('baseURL', baseURL);

            return $fetch(route, {
                baseURL,
                method,
                credentials: 'include',
                headers: finalHeaders,
                body: method !== 'GET' ? data : undefined,
                params: method === 'GET' ? params : undefined,
                ...options,
            });
        };

        try {
            return await sendRequest();
        } catch (error) {
            const status = error?.response?.status ?? error?.statusCode ?? error?.status;
            const isUnauthorized = status === 401;
            const shouldRefresh = isUnauthorized
                && !options.skipAuthRefresh
                && route !== endpoints.auth.refresh;

            if (shouldRefresh) {
                const authStore = useAuthStore();
                const refreshed = await authStore.refreshSession();

                if (refreshed) {
                    options = {
                        ...options,
                        skipAuthRefresh: true,
                    };
                    return await sendRequest();
                }

                if (!options.skipAuthRedirect) {
                    await authStore.endSessionForReauth();
                }
                return;
            }

            if (isUnauthorized && !options.skipAuthRedirect) {
                const authStore = useAuthStore();
                await authStore.endSessionForReauth();
                return;
            }

            logger.error(`API ${method} Error:`, error);
        }
    };

    return {
        get:    (route, params, options = {})  => request('GET',    route, null, params, {}, options),
        post:   (route, data, options = {})    => request('POST',   route, data,  {},    {}, options),
        put:    (route, data, options = {})    => request('PUT',    route, data,  {},    {}, options),
        patch:  (route, data, options = {})    => request('PATCH',  route, data,  {},    {}, options),
        delete: (route, options = {})          => request('DELETE', route, {},    {},    {}, options),
    };
};
