---
name: write-page
description: Create a new Nuxt page in the MiFlujo PWA
context: fork
---

# /write-page

You are creating a new route/page in the MiFlujo Nuxt 4 application. Pages compose components and connect them to Pinia stores. All files live under `app/` (Nuxt 4 app directory).

## Checklist

- [ ] Create file in `app/pages/<path>/<name>.vue`
- [ ] Use `definePageMeta()` to specify layout and middleware
- [ ] Set the page title with `useHead({ title: 'Page Name — MiFlujo' })`
- [ ] Wrap dashboard page content in `<MobileContainer>`
- [ ] Compose the page using domain-specific components
- [ ] Initialize stores in `onMounted` if needed
- [ ] Use `useRoute()` for route params; use `navigateTo()` for navigation
- [ ] Register new dashboard pages in `dashboardSidebarMenu` inside `app/layouts/dashboard.vue`

## Layouts

| Layout | File | When to use |
|---|---|---|
| `dashboard` | `app/layouts/dashboard.vue` | Authenticated app pages with bottom nav and sidebar |
| `authentication` | `app/layouts/authentication.vue` | Auth flows, onboarding, and standalone screens (no nav) |

## Middleware

| Middleware | Effect |
|---|---|
| `auth` | Redirects to `/` if unauthenticated |
| `guest` | Redirects to `/dashboard` if already logged in |

## Code Template

### Dashboard page

```vue
<script setup>
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { logger } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard', middleware: ['auth'] })
useHead({ title: 'Statements — MiFlujo' })

const statementStore = useBankStatementStore()
const route = useRoute()

onMounted(async () => {
    await statementStore.fetchStatements()
})
</script>

<template>
    <MobileContainer>
        <section class="px-4 py-6">
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <h1 class="text-display-lg font-semibold text-navy">Statements</h1>
                    <p class="mt-1 text-body-sm font-normal text-navy/60">Your uploaded bank statements</p>
                </div>
                <BaseButton type="button" class="w-auto px-4" @click="navigateTo('/upload')">
                    <span class="flex items-center gap-x-2">
                        <span class="material-symbols-outlined text-title-sm">upload</span>
                        Upload
                    </span>
                </BaseButton>
            </div>

            <div v-if="statementStore.loading" class="flex justify-center py-20">
                <span class="block h-8 w-8 animate-spin rounded-full border-4 border-grey/40 border-t-primary" aria-hidden="true" />
            </div>

            <div v-else class="space-y-4">
                <!-- page content -->
            </div>
        </section>
    </MobileContainer>
</template>
```

### Authentication / standalone page

```vue
<script setup>
definePageMeta({ layout: 'authentication' })
useHead({ title: 'Page Title — MiFlujo' })
</script>

<template>
    <main class="flex min-h-screen flex-col justify-center px-6 py-10">
        <section class="mx-auto w-full max-w-sm rounded-[10px] border border-grey/60 bg-white px-6 py-8 shadow-sm">
            <!-- page content -->
        </section>
    </main>
</template>
```

## Design Tokens

Always use these — never raw Tailwind colors like `text-slate-*` or `text-gray-*`:

| Token | Tailwind class | Use for |
|---|---|---|
| MiFlujo Red | `text-primary` / `bg-primary` | Primary CTAs, highlights |
| Deep Navy | `text-navy` / `bg-navy` | Headings, body text |
| Navy muted | `text-navy/60` | Secondary / descriptive text |
| Light Grey | `text-grey` / `border-grey` | Borders, dividers |
| App background | `bg-surface` | Page backgrounds |
| Error | `text-error` / `border-error` | Validation errors only |

## Typography Scale

Use named classes — never `text-sm`, `text-xs`, or arbitrary sizes:

| Class | Use for |
|---|---|
| `text-display-lg font-semibold` | Page headings (h1) |
| `text-headline-md font-semibold` | Section headings (h2) |
| `text-title-sm font-medium` | Card titles, labels |
| `text-body-md font-normal` | Body copy |
| `text-body-sm font-normal` | Secondary / helper text |
| `text-label-caps font-bold` | Uppercase section labels |
| `text-data-mono font-medium tabular-nums` | All financial values (₦ amounts, dates) |

## Loading State

No `<Spinner>` component exists. Use inline spinner markup:

```html
<span class="block h-8 w-8 animate-spin rounded-full border-4 border-grey/40 border-t-primary" aria-hidden="true" />
```

## BaseButton Props

| Prop | Values | Default |
|---|---|---|
| `variant` | `'primary'` \| `'outline'` | `'primary'` |
| `type` | `'button'` \| `'submit'` | `'submit'` |
| `disabled` | `Boolean` | `false` |

Use `variant="outline"` for secondary/destructive actions. The button is always full-width by default — add `class="w-auto px-4"` to constrain width.

## Icons

Always use Google Material Symbols Outlined:

```html
<span class="material-symbols-outlined">icon_name</span>
```

## Key Rules

- Never call `$fetch` or `useFetch` directly — all API calls go through `useApiService()` inside a Pinia store
- Never use `console.log` — use `logger` from `~/utils/helpers.js`
- Never use raw `<input>`, `<select>`, `<textarea>`, or `<button>` for form elements — use `AppInput`, `BaseSelectInput`, `SearchableSelectInput`, `BaseButton`, or `Form/FormInput`
- Currency values must always use `formatToMoney(value)` from `~/utils/helpers.js` — output: `₦1,234.56`

## See Also

- [[write-component]] — Components used on pages
- [[write-store]] — Pinia stores that power pages
- [[integrate-api]] — Wiring backend endpoints into a store
- [[implement-design]] — Implementing a full design mockup into a page
