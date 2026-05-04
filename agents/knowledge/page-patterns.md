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
definePageMeta({
  layout: 'dashboard',       // or 'auth' — see layout rules below
  middleware: ['auth'],      // or ['guest'] — see middleware rules below
})

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

## Middleware selection

| Middleware | Effect |
|---|---|
| `auth` | Redirects to login if user is not authenticated — use on all dashboard pages |
| `guest` | Redirects to dashboard if user is already logged in — use on the auth/login page only |

Both middleware keys are passed as an array: `middleware: ['auth']`.

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

definePageMeta({ layout: 'dashboard', middleware: ['auth'] })
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

Pages live in `pages/` at the project root — not inside `app/`. The Nuxt 4
`app/` directory contains only `app.vue` and framework-level entry points.

```
pages/
  index.vue           → route: /
  statements/
    index.vue         → route: /statements
    [id].vue          → route: /statements/:id
  transactions.vue    → route: /transactions
```
