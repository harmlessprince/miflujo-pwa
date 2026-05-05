# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

MiFlujo is a mobile-first PWA for Nigerian financial intelligence. Users upload bank statements (PDF or URL), the backend extracts and classifies transactions via AI, and the app surfaces spending insights, dashboards, and an AI financial assistant. Authentication is Google OAuth only — no email/password flow exists.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run generate   # static site generation
npm run preview    # preview production build locally
```

No lint or test scripts are configured yet.

## Architecture

**Stack**: Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS · Pinia · vee-validate · vue-final-modal · @vite-pwa/nuxt · nuxt-google-auth

Nuxt 4 uses the `app/` directory — the root component is `app/app.vue`. Pages, components, layouts, stores, and middleware live at the project root (not inside `app/`).

### Data flow

```
utils/endpoints.js   →   stores/<name>.store.js   →   components / pages
(URL registry)           (Pinia, useApiService)        (consume store state)
```

All API calls go through `useApiService()` (a composable to be built in `services/apiService.js`). Never call `$fetch` or `useFetch` directly from a component or page. Parameterized endpoints use either string replacement (`.replace(':id', id)`) or function form:

```js
// utils/endpoints.js
export const endpoints = {
  auth: {
    google: '/auth/google',
  },
  bankStatements: {
    list:      '/bank-statements',
    create:    '/bank-statements',
    detail:    (id) => `/bank-statements/${id}`,
    dashboard: (id) => `/bank-statements/${id}/dashboard-summary`,
    choices:   '/bank-statement-choices',
  },
  transactions: {
    list: '/bank-statements/transactions',
  },
  insights: {
    monthAnalysis: (id) => `/compute-month-analysis/${id}`,
    weekAnalysis:  '/compute-week-analysis',
    totalIncome:   '/calculate-total-income',
    totalSpent:    '/calculate-total-spent',
    netCashflow:   '/calculate-net-cashflow',
    // ...other insight endpoints
  },
  questions: {
    guided: '/questions/guided',
    answer: '/questions/answer',
    query:  '/query-insight',
  },
}
```

### Stores (Pinia Setup API)

All stores live in `stores/<domain>.store.js` and use the Setup API:

```js
import { defineStore } from 'pinia'
import { endpoints } from '~/utils/endpoints.js'

export const useBankStatementStore = defineStore('bankStatementStore', () => {
  const { get, post } = useApiService()
  const toastStore = useToastStore()

  const statements = ref([])
  const loading = ref(false)

  async function fetchStatements(params = {}) {
    loading.value = true
    try {
      const response = await get(endpoints.bankStatements.list, params)
      if (response?.data) statements.value = response.data
    } finally {
      loading.value = false
    }
  }

  return { statements, loading, fetchStatements }
})
```

Use `toastStore.success()` / `toastStore.error()` for user feedback after mutations. Use `getPaginatedData()` from `utils/helpers.js` to shape pagination metadata for `DataTable`.

### Pages

Every page uses `definePageMeta()` for layout and middleware and `useHead()` for SEO:

```vue
<script setup>
definePageMeta({ layout: 'dashboard', middleware: ['auth'] })
useHead({ title: 'Dashboard — MiFlujo' })
</script>
```

Available layouts: `dashboard` (main app with navigation), `auth` (centered, no nav). Middleware: `auth` (redirect to login if unauthenticated), `guest` (redirect to dashboard if already logged in).

Every new dashboard page must be registered in the `dashboardSidebarMenu` array inside `layouts/dashboard.vue`. Each entry shape:
```js
{ key, name, icon, activeIcon, pathName, comingSoon }
```
Icons come from Material Symbols (`material-symbols-outlined`).

### Components

Reusable base components live in `components/`. Domain-specific components are grouped into subfolders (e.g., `components/Dashboard/`, `components/Form/`).

**Always use the existing form primitives — never raw HTML form elements:**

| Use case | Component |
|---|---|
| Text input | `AppInput` |
| Textarea | `BaseTextArea` |
| Select | `BaseSelectInput` |
| Searchable dropdown | `SearchableSelectInput` |
| Button / submit | `BaseButton` or `Form/FormButton` |
| vee-validate field | `Form/FormInput` |

For tabular data use `DataTable` (`components/table/DataTable.vue`) — it handles loading skeletons, empty state, pagination, and action menus out of the box.

All components use `<script setup>` with explicit `defineProps()` and `defineEmits()`.

- **Icons**: Always use Google Material Symbols Outlined (`<span class="material-symbols-outlined">icon_name</span>`). Do not use inline SVGs or Lucide icons except where already established.

## Design System

Brand tokens are in CSS custom properties (`assets/css/main.css`) and Tailwind (`tailwind.config.ts`):

| Token | Value | Tailwind class |
|---|---|---|
| MiFlujo Red (primary) | `#ED2E23` | `text-primary` / `bg-primary` |
| Deep Navy | `#02163B` | `text-navy` / `bg-navy` |
| Light Grey | `#CCCCCC` | `text-grey` / `border-grey` |
| App background | `#FCFCFC` | `bg-surface` |

Typography: Azo-Sans is the primary font (already loaded in `fonts.css` and set as `font-sans` in Tailwind). A named typography scale is defined in `tailwind.config.ts` — use `text-display-lg`, `text-headline-md`, `text-title-sm`, `text-body-md`, `text-body-sm`, `text-data-mono`, and `text-label-caps` instead of raw `text-sm` / `text-xs` / arbitrary sizes. For all financial values — balances, amounts, dates, confidence scores — use `text-data-mono font-medium tabular-nums`.

An `error` color (`#DC2626`) is available as `text-error` / `border-error` — use it for validation and error states so they are visually distinct from `bg-primary` CTAs.

Red (`bg-primary`) is reserved for primary actions (upload, process, save, confirm). Charts must not rely on red alone — pair with Deep Navy and greys.

Currency formatting: always use `formatToMoney(value)` from `utils/helpers.js` which produces `₦1,234.56` format.

See `agents/knowledge/design-system-rule.md` for the full token reference, typography scale usage guide, and component dimensions.

## Key Utilities

All in `utils/`:

- `endpoints.js` — centralized API route registry (add new routes here)
- `helpers.js` — `formatToMoney`, `formatDate`, `getPaginatedData`, `cleanObject`, `debounce`, `logger`, `handleFileUpload`
- `dictionaries.js` — shared enum arrays (payment gateways, order/payment statuses, notification types)
- `permissions.js` — frozen permissions constants (`permissions.CAN_READ_ORDER`, etc.)

`logger` from `helpers.js` suppresses output in production — always use it instead of `console.log`.

## Agent Skills

This repo ships skill definitions in `agents/skills/` for use with AI coding agents. Invoke them when the task matches:

| Skill | When to use |
|---|---|
| `write-component` | Creating a new Vue component |
| `write-page` | Creating a new Nuxt page/route |
| `write-store` | Creating a new Pinia store |
| `integrate-api` | Wiring a new backend endpoint |
| `data-table` | Adding a paginated table view |
| `searchable-select-input` | Using the searchable dropdown component |

Knowledge docs in `agents/knowledge/` contain deep-dive rules:

| Doc | Covers |
|---|---|
| `form-components-rule.md` | When to use existing form components vs raw HTML elements |
| `design-system-rule.md` | Color tokens, typography scale, interactive dimensions, error vs primary usage |
| `logo-usage-rule.md` | Which logo asset to use by page/layout; never use bare text or icon-only logo replacements unless explicitly requested |

## Backend API Overview

The backend is a separate service. All endpoints are prefixed without a version segment (e.g., `/auth/google`, `/bank-statements`). The access token from `POST /auth/google` must be sent as `Authorization: Bearer <token>` on every subsequent request. Token TTL is `expires_in` seconds — track expiry client-side and prompt re-authentication gracefully rather than forcing a hard logout.

Supported banks: Zenith, UBA, Access, FBN/First Bank, GTB, FCMB, Fidelity, Sterling, Opay, Palmpay, Kuda. The bank selector is populated from `GET /bank-statement-choices`.

Statement upload returns structured error codes for recoverable states — `bank_statement_password_required` and `bank_statement_invalid_password` must never be treated as terminal failures. Keep the uploaded file in session and show an inline password prompt.
