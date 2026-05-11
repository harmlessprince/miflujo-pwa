# Rule: Nuxt Page Conventions in MiFlujo

Deep-dive rules for creating pages. The basics are in `CLAUDE.md` — this file
covers the full required boilerplate, layout selection, sidebar registration,
and dynamic-route patterns.

---

## Required boilerplate on every page

Every page file must include both `definePageMeta()` and `useHead()`. Neither
is optional.

```vue
<script setup>
definePageMeta({ layout: 'dashboard' })   // or 'auth' — see layout rules below

useHead({ title: 'Transactions — MiFlujo' })
</script>
```

SEO title format: `'<Page Name> — MiFlujo'` (em dash, not hyphen).

---

## Layout selection

| Layout | When to use |
|---|---|
| `dashboard` | Every authenticated app screen (statements, insights, transactions, etc.) |
| `auth` | Pre-login screens only (landing/login page) |

There is no `default` layout in active use. Do not omit the `layout` key — Nuxt
will fall back to `default.vue`, which may not exist.

---

## Middleware

Both middleware files use the `.global.js` suffix:

- `app/middleware/auth.global.js` — redirects unauthenticated users to login
- `app/middleware/guest.global.js` — redirects authenticated users to the dashboard

**Global middleware runs automatically on every route.** Do not reference them in
`definePageMeta` — Nuxt treats the `middleware` array as named (non-global) middleware
only, and will throw `"Unknown route middleware: 'auth'"` at runtime if you do.

```js
// ✅ correct — no middleware key needed
definePageMeta({ layout: 'dashboard' })

// ❌ wrong — throws "Unknown route middleware: 'auth'"
definePageMeta({ layout: 'dashboard', middleware: ['auth'] })
```

---

## Sidebar registration (dashboard pages only)

Every page that uses the `dashboard` layout must have an entry in the
`dashboardSidebarMenu` array in `layouts/dashboard.vue`. Omitting this makes
the page unreachable from the UI.

Entry shape:

```js
{
  key: 'transactions',              // kebab-case, unique across the menu
  name: 'Transactions',             // human-readable label shown in sidebar
  icon: 'receipt_long',             // Material Symbols icon name (inactive state)
  activeIcon: 'receipt_long',       // Material Symbols icon name (active state)
  pathName: 'transactions',         // Nuxt route name — matches the file path
  comingSoon: false,                // true renders a "Coming soon" badge instead of a link
}
```

Add new entries at the end of the array unless a different position is contextually
correct (e.g., a sub-feature logically follows its parent).

---

## Data fetching pattern

Initialize stores and trigger fetch actions in `onMounted`, not at the top level
of `<script setup>`. This prevents SSR/hydration mismatches in the PWA.

```vue
<script setup>
import { useTransactionStore } from '~/stores/transaction.store.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Transactions — MiFlujo' })

const transactionStore = useTransactionStore()

onMounted(async () => {
  await transactionStore.fetchTransactions()
})
</script>
```

---

## Dynamic routes

For routes like `/statements/[id]`, read the param with `useRoute()` and pass it
to the store action:

```vue
<script setup>
const route = useRoute()
const store = useBankStatementStore()

onMounted(async () => {
  await store.fetchStatement(route.params.id)
})
</script>
```

Never access `route.params` outside a lifecycle hook or watcher — the value is
not reactive if accessed synchronously during setup in all Nuxt 4 contexts.

---

## Page file location

This project uses the Nuxt 4 `app/` source directory. All pages, components,
layouts, middleware, stores, and utilities live **inside `app/`**:

```
app/
  pages/
    index.vue              → route: /
    statements/
      index.vue            → route: /statements
      [id]/
        dashboard.vue      → route: /statements/:id/dashboard
        transactions.vue   → route: /statements/:id/transactions
    upload/
      index.vue            → route: /upload
  middleware/
    auth.global.js
    guest.global.js
  layouts/
    dashboard.vue
    auth.vue
```
