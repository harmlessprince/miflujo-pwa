# AGENTS.md — MiFlujo Must-Know Rules

Critical guard-rails for every agent working in this repo. These rules override
common defaults. Read this before touching any file.

---

## 1. API calls go through `useApiService()` — always

Never call `$fetch` or `useFetch` directly from a component or page.
All network requests must go through the `useApiService()` composable in
`services/apiService.js`. This composable handles auth headers, token expiry,
and error normalization.

```js
// ✅ correct
const { get, post } = useApiService()
const response = await get(endpoints.bankStatements.list)

// ❌ wrong
const response = await $fetch('/bank-statements')
```

## 2. Form elements must use existing primitives

Never write a raw `<input>`, `<select>`, `<textarea>`, or `<button>` in a page or
domain component. Always use the purpose-built primitives. See
`agents/knowledge/form-components-rule.md` for the full mapping.

## 3. Design tokens only — no raw colors or arbitrary sizes

Never use `slate-*`, `gray-*`, `rose-*`, or arbitrary hex values in Tailwind classes.
Map every color to a MiFlujo token (`text-navy`, `bg-primary`, `text-error`, etc.).
Use the named typography scale (`text-body-md`, `text-headline-md`, etc.) instead of
`text-sm` or `text-xs`. See `agents/knowledge/design-system-rule.md`.

## 4. Use `logger`, never `console.log`

`logger` from `utils/helpers.js` suppresses output in production. Using `console.log`
directly leaks debug output to end users.

```js
import { logger } from '~/utils/helpers.js'
logger.log('debug info')   // suppressed in production
```

## 5. Auth is Google OAuth only

There is no email/password registration or login flow. Do not create password fields,
forgot-password pages, or email-verification logic. Authentication entry point is
`POST /auth/google` and the session is managed by `nuxt-google-auth`.

## 6. Every authenticated request needs a Bearer token

The access token returned by `POST /auth/google` must be sent as
`Authorization: Bearer <token>` on every subsequent API call. Token expiry is tracked
client-side using `expires_in` — prompt re-authentication gracefully; do not force a
hard logout.

## 7. Statement upload password errors are recoverable

`bank_statement_password_required` and `bank_statement_invalid_password` are not
terminal failures. When the backend returns either code, keep the uploaded file in
session and render an inline password prompt. Never redirect to an error page or
clear the file on these codes.

## 8. Currency always uses `formatToMoney()`

All Naira amounts shown in the UI must be formatted with `formatToMoney(value)` from
`utils/helpers.js`. This produces the canonical `₦1,234.56` format. Never format
currency inline with `toLocaleString` or template literals.

## 9. All new endpoints go in `utils/endpoints.js`

Never hardcode a URL string in a store or component. Add every new route to the
`endpoints` object in `utils/endpoints.js`, using a function form for parameterized
routes.

```js
// function form for parameterized routes
detail: (id) => `/bank-statements/${id}`,
```

## 10. Every dashboard page needs a sidebar entry

Any new page that uses the `dashboard` layout must be registered in the
`dashboardSidebarMenu` array in `layouts/dashboard.vue`. Omitting this makes the
page unreachable from the UI. See `agents/knowledge/page-patterns.md` for the
entry shape.
