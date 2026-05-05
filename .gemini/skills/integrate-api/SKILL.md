---
name: integrate-api
description: Integrate a new backend API endpoint into the ShopSynch Nuxt application
context: fork
---

# /integrate-api

You are connecting a new backend API endpoint to the frontend. This involves updating the endpoint registry and consuming it in a store or service.

## Checklist

- [ ] Add the new route to `utils/endpoints.js`
- [ ] Use restful naming conventions (e.g., `products`, `archiveProduct`)
- [ ] Support dynamic parameters using `:id` or a function for complex templates
- [ ] Implement the call in a Pinia store action using `useApiService()`
- [ ] Map parameters correctly (body vs. query params)

## Code Template

### 1. Update `utils/endpoints.js`
```javascript
export const endpoints = {
    // ...
    orders: {
        list: "/v1/orders",
        detail: "/v1/orders/:id",
        track: (orderId) => `/v1/orders/${orderId}/track`
    }
}
```

### 2. Implement in Store (`stores/orders.store.js`)
```javascript
const { get, post } = useApiService();

async function trackOrder(orderId) {
    // For function endpoints
    const route = endpoints.orders.track(orderId);
    return await get(route);
}

async function getOrderDetail(id) {
    // For parameterized strings, useApiService/nuxt-fetch handles simple replacements 
    // or you can manually substitute if needed. 
    // Standard pattern is replacing :id:
    const route = endpoints.orders.detail.replace(':id', id);
    return await get(route);
}
```

## Key Patterns

### Base URL and Modes
`useApiService` automatically handles switching between `live` and `test` environments based on `switchModeStore.currentMode`. You don't need to specify the base URL manually.

### Request Options
You can pass Nuxt `$fetch` options (like `headers`, `retry`, `timeout`) as the third argument to `get/post/patch`:
```javascript
await post(endpoints.login, body, { forceMode: 'live' });
```

## Integration Example

Integrating a "Resend Invitation" endpoint:
1.  **Endpoints**: Add `resendInvitation: "/v1/invitations/:id/resend"` to `utils/endpoints.js`.
2.  **Store**: Create `resendInvitation(id)` action in `team.store.js`.
3.  **UI**: Add a button in `TeamMemberList.vue` that calls the store action.

## See Also
- [[write-store]] — Where most API calls live
- [[write-component]] — Triggering API calls via UI
