import { logger } from '~/utils/helpers';

export const useApiService = () => {
    const config = useRuntimeConfig();

    const request = async (method, route, data = null, params = {}, headers = {}, options = {}) => {
        try {
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

            return await $fetch(route, {
                baseURL,
                method,
                credentials: 'include',
                headers: finalHeaders,
                body: method !== 'GET' ? data : undefined,
                params: method === 'GET' ? params : undefined,
                ...options,
            });
        } catch (error) {
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
