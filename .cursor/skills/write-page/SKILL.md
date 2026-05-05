---
name: write-page
description: Create a new Nuxt page in the ShopSynch merchant dashboard
context: fork
---

# /write-page

You are creating a new route/page in the Nuxt application. Pages compose components and connect them to Pinia stores.

## Checklist

- [ ] Create file in `pages/<path>/<name>.vue`
- [ ] Use `definePageMeta()` to specify layout, middleware, or auth requirements
- [ ] Implement SEO using `useHead()` or `useSeoMeta()`
- [ ] Compose the page using domain-specific components
- [ ] Inject and initialize stores in `onMounted` if needed
- [ ] Use `useRoute()` and `useRouter()` for navigation and parameters
- [ ] Add a sidebar entry for the new page in `layouts/dashboard.vue` (`dashboardSidebarMenu` array)

## Code Template

```vue
<script setup>
import { useProductStore } from "~/stores/products.store.js";

// Page Metadata
definePageMeta({
    layout: 'dashboard',
    middleware: ['auth']
});

// SEO
useHead({
    title: 'Product Catalog - ShopSynch',
    meta: [
        { name: 'description', content: 'Manage your product inventory and sales.' }
    ]
});

const productStore = useProductStore();
const route = useRoute();

onMounted(async () => {
    await productStore.fetchProducts();
});
</script>

<template>
    <div class="px-6 py-8">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Products</h1>
                <p class="text-slate-500 mt-1">Manage your store inventory</p>
            </div>
            <BaseButton color="primary" @click="navigateTo('/products/create')">
                Add Product
            </BaseButton>
        </div>

        <div v-if="productStore.loading" class="flex justify-center py-20">
            <Spinner />
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard 
                v-for="product in productStore.products" 
                :key="product.id" 
                :product="product" 
            />
        </div>
    </div>
</template>
```

## Key Patterns

### Layouts
Standard layouts are in `layouts/`. Common choices:
- `dashboard`: Main merchant portal with sidebar.
- `auth`: Centered forms for login/registration.
- `default`: Minimal layout.

### Middleware
Common middleware:
- `auth`: Redirects to login if unauthenticated.
- `guest`: Redirects to dashboard if already logged in.

## Sidebar Registration

Every new dashboard page must be added to the `dashboardSidebarMenu` array in `layouts/dashboard.vue`. Each entry shape:

```js
{
  key: "unique-key",        // kebab-case, unique across menu
  name: "Display Name",     // human-readable label shown in sidebar
  icon: "material_icon",    // Material Symbols icon name (string) or path to SVG ("/icons/foo.svg")
  activeIcon: "material_icon", // icon shown when route is active
  pathName: "dashboard-route-name", // Nuxt route name matching definePageMeta name
  comingSoon: false,        // set true to render a "Coming soon" badge instead of a link
}
```

Pick a relevant Material Symbols icon name. Add the entry at the end of the array unless a different position makes more sense contextually.

## Integration Example

"Create a detailed view for an order":
1.  **File**: `pages/orders/[id].vue`.
2.  **Params**: Use `route.params.id`.
3.  **Store**: Call `ordersStore.fetchOrder(route.params.id)` on mount.
4.  **Layout**: Use `dashboard`.
5.  **Sidebar**: Add entry to `dashboardSidebarMenu` in `layouts/dashboard.vue`.

## See Also
- [[write-component]] — Components used on pages
- [[write-store]] — Data source for pages
