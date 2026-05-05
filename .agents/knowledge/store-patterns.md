# Rule: Pinia Store Conventions in MiFlujo

Deep-dive rules for writing and composing Pinia stores. The basics (file location,
Setup API template) are in `CLAUDE.md` — this file covers edge cases and patterns
that require more explanation.

---

## Always use the Setup API

Never use the Options API (`defineStore('id', { state, actions, getters })`).
Every store uses the function form:

```js
export const useExampleStore = defineStore('exampleStore', () => {
  // state, actions, computed
  return { /* explicit exports */ }
})
```

---

## One `loading` ref per async action (not one global loading flag)

Each action that makes a network call owns its own `loading` ref so that unrelated
parts of the UI can show loading state independently.

```js
const statementsLoading = ref(false)
const dashboardLoading = ref(false)

async function fetchStatements() {
  statementsLoading.value = true
  try { /* ... */ } finally { statementsLoading.value = false }
}

async function fetchDashboard(id) {
  dashboardLoading.value = true
  try { /* ... */ } finally { dashboardLoading.value = false }
}
```

A single `loading` ref is acceptable only if the store exposes a single async
action.

---

## `toastStore` for all mutation feedback

After any action that creates, updates, or deletes data, call `toastStore.success()`
on success or `toastStore.error()` on failure. Never surface raw error objects or
`alert()` calls from a store. Read-only fetch actions (GET) do not need a success
toast — only mutations do.

```js
const toastStore = useToastStore()

async function deleteStatement(id) {
  const response = await remove(endpoints.bankStatements.detail(id))
  if (response) {
    toastStore.success('Statement deleted')
    await fetchStatements()
  }
}
```

---

## Pagination: always use `getPaginatedData()`

When an endpoint returns paginated results, pass the raw response through
`getPaginatedData()` from `utils/helpers.js` before storing it. This shapes the
metadata into the format `DataTable` expects.

```js
import { getPaginatedData } from '~/utils/helpers.js'

const pagination = ref({})

async function fetchStatements(params = {}) {
  const response = await get(endpoints.bankStatements.list, params)
  if (response) {
    statements.value = response.data
    pagination.value = getPaginatedData(response)
  }
}
```

---

## Explicit `return` — export everything the component needs

The `return` statement at the end of the store must list every ref, computed, and
action that any component or page will access. Do not rely on implicit auto-import
of store internals.

---

## Store-to-store composition

To use another store inside a store, call it inside the setup function — not at
the module top level. Pinia requires the store to be called within an active Pinia
context.

```js
export const useInsightStore = defineStore('insightStore', () => {
  const bankStatementStore = useBankStatementStore()  // ✅ inside setup
  // ...
})
```

---

## Do not call `useApiService()` outside a store

`useApiService()` must only be called inside a Pinia store (or a composable). Never
call it directly in a component or page — components consume store state and trigger
store actions instead.

---

## Endpoint calls use `endpoints` object, never hardcoded strings

```js
// ✅ correct
const response = await get(endpoints.bankStatements.list, params)

// ❌ wrong
const response = await get('/bank-statements', params)
```
