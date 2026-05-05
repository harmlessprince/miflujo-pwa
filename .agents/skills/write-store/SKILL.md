---
name: write-store
description: Create a Pinia store in the ShopSynch Nuxt application
context: fork
---

# /write-store

You are creating a Pinia store to maintain state and handle API interactions in the ShopSynch merchant dashboard.

## Checklist

- [ ] Create file in `stores/<domain>.store.js`
- [ ] Use `defineStore("storeName", () => { ... })` (Setup API)
- [ ] Inject `useApiService()` for network requests
- [ ] Define reactive state using `ref()` or `reactive()`
- [ ] Define actions as standard functions
- [ ] Use `toastStore` for user feedback on success/error
- [ ] Return all state and actions at the end of the store

## Code Template

```javascript
import { defineStore } from "pinia";
import { endpoints } from "~/utils/endpoints.js";
import { useApiService } from "~/services/apiService.js";
import { useToastStore } from "~/stores/toast.store.js";

export const useProductStore = defineStore("productStore", () => {
    const { get, post, patch, delete: remove } = useApiService();
    const toastStore = useToastStore();
    
    // State
    const products = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // Actions
    async function fetchProducts(params = {}) {
        loading.value = true;
        try {
            const response = await get(endpoints.allProducts, params);
            if (response?.data) {
                products.value = response.data;
                total.value = response.meta?.total || response.data.length;
            }
        } finally {
            loading.value = false;
        }
    }

    async function createProduct(payload) {
        const response = await post(endpoints.createProduct, payload);
        if (response) {
            toastStore.success('Product created successfully');
            await fetchProducts();
            return response;
        }
    }

    return {
        products,
        loading,
        total,
        fetchProducts,
        createProduct
    };
});
```

## Key Patterns

### Global Loading State
Use a `loading` ref per action or a global loader store if the action blocks the entire UI.

### Success/Error Handling
The `apiService` handles basic error logging, but you should use `toastStore` to inform the user:
```javascript
toastStore.success('Action successful', 'Optional Detail');
toastStore.error('Failed to perform action', error.message);
```

## Integration Example

Using the store in a component:

```javascript
const productStore = useProductStore();
onMounted(() => {
    productStore.fetchProducts();
});
```

## See Also
- [[integrate-api]] — Defining new endpoints
- [[write-component]] — Consuming stores in UI
