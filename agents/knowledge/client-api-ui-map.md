# Client API and UI Integration Map

This file maps the cleaned backend API surface to frontend work. Use it as the
handoff for building each UI slice one thread at a time.

Source of truth:
- Backend spec: `../MiFlujo-backend/openapi.json`
- Frontend registry: `app/utils/endpoints.js`

## Not Integrated in Production UI

These routes are intentionally not exposed as normal production UI:

| Endpoint | Reason |
|---|---|
| `POST /auth/email-token` | Local/test auth helper only. It may be registered in `app/utils/endpoints.js` for hidden dev tooling, but must not appear in production navigation or login UX. |
| `GET /` | Health/demo root endpoint. |
| Removed analyzer debug routes | `/predict-category`, `/search/vector`, `/query/route`, `/predict-batch`, and `/test-insight` are no longer in OpenAPI. |

## Local Browser Testing Login

Use the email-token helper when the in-app browser needs an authenticated local
session for manual UI testing.

- Start the backend with `APP_ENV=local` or `APP_ENV=test`; the backend returns
  404 for `POST /auth/email-token` outside those environments.
- Start the PWA against the local backend, usually with
  `NUXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- Open `/dev/email-token?email=realolamilekan@gmail.com` in local development.
  The hidden dev page calls `POST /auth/email-token`, persists the returned
  access token using the same cookie shape as Google auth, and redirects to
  `/dashboard`.
- Do not link `/dev/email-token` from production UI. It is only a browser-test
  convenience for local development.

## Current Core Surfaces

| UI area | Registry keys | Existing UI status | Next work |
|---|---|---|---|
| Google auth/session | `auth.google`, `auth.me`, `auth.refresh` | Exists | Keep as-is unless auth UX changes. |
| Accounts | `accounts.list` | Used for analytics filters | Add richer account selector where needed. |
| Statements list/upload/detail/delete | `bankStatements.list`, `create`, `detail`, `delete`, `choices` | Exists | Finish protected-PDF password retry. |
| Statement dashboard summary | `bankStatements.dashboard(id)` | Endpoint registered, page missing | Build `/dashboard/statements/[id]/dashboard`. |
| Statement summary report | `bankStatements.summaryReport(id)` | Missing UI | Add download/report action on statement detail. |
| Transactions list/detail | `transactions.list`, `show(id)` | Exists | Fix filter param names and pagination metadata. |
| Analytics overview | `insights.*` | Mostly exists | Add daily pattern module and polish empty/loading/error states. |
| Monthly/weekly analysis | `insights.monthAnalysis(id)`, `weekAnalysis` | Exists | Fix broken statement detail navigation to monthly analysis. |

## Dashboard Scope Model

Dashboard should be built as one shared shell with explicit scope modes, not as
unrelated pages. The mode determines which selectors appear, which payload fields
are sent, and which dashboard modules are shown.

Normalize every dashboard view into one scope object:

```js
{
  mode: 'all' | 'single_account' | 'multi_account' | 'single_statement' | 'multi_statement',
  account_id: null,
  account_ids: [],
  bank_statement_id: null,
  bank_statement_ids: [],
  start_date: null,
  end_date: null,
}
```

Rules:
- Never send both `account_id` and `account_ids`.
- Never send both `bank_statement_id` and `bank_statement_ids`.
- Multiple bank statements must be selected under one account. Do not initially
  support arbitrary multi-statement dashboards across unrelated accounts.
- Keep `account_id` in UI state for multi-statement selection so the statement
  picker can be constrained to that account, even if the API payload only sends
  `bank_statement_ids`.

| Mode | User intent | Selectors | API payload shape | Primary UI modules |
|---|---|---|---|---|
| `all` | See full financial picture across all accounts | Date range | `start_date`, `end_date` | Portfolio cashflow, income/spend totals, trends, alerts, top categories/merchants |
| `single_account` | Inspect one account and all statements under it | Account selector, date range, optional statement picker | `account_id`, date range | Account-level cashflow, statement list, recurring items, trends, alerts |
| `multi_account` | Compare or combine selected accounts | Multi-account selector, date range | `account_ids`, date range | Cross-account totals, comparison cards, category/merchant breakdown |
| `single_statement` | Inspect one uploaded statement | Locked statement context, optional compare account IDs | `bank_statement_id`; optional `account_ids` only for comparison endpoints that accept it | Statement summary, parse quality, transaction totals, category/channel/entity health |
| `multi_statement` | Compare multiple statements within one account | Account selector first, then multi-statement selector, date range optional | `bank_statement_ids` | Period-over-period statement comparison, balance changes, spending trends |

Recommended dashboard UI:
- Top-level segmented control: `All`, `Account`, `Statements`.
- Under `Account`, allow single or multiple account mode.
- Under `Statements`, require account selection before showing statement choices;
  then allow single or multiple statement mode.
- Dashboard widgets should read from the normalized scope rather than each page
  inventing its own filter state.

Implementation pieces:
- Store: `app/stores/dashboardScope.store.js`.
- Selector component: `app/components/Dashboard/DashboardScopeSelector.vue`.
- Dashboard shell/page: either `/dashboard` or `/dashboard/overview`.
- Statement-specific page can reuse the same widgets but initialize scope from
  `route.params.id` with `mode: 'single_statement'`.

Build order:
1. Create `dashboardScope.store.js` and payload builders.
2. Build `DashboardScopeSelector.vue`.
3. Refactor analytics/dashboard calls to consume normalized scope.
4. Build `single_statement` dashboard using `bankStatements.dashboard(id)`.
5. Expand to `single_account`.
6. Add `multi_statement` constrained by account.
7. Add `all` and `multi_account` modes.

## New Product/UI Work

Build these in order.

### 1. Preferences

Registry:
- `preferences.me`

UI needed:
- Settings/profile preferences screen.
- Fields for currency, timezone, financial month start, salary cycle, salary day range, budgeting style, alert sensitivity, insight tone, privacy level, and personal/business mode.
- Store: `app/stores/preferences.store.js`.
- Page: likely `/dashboard/settings` or `/dashboard/preferences`.
- Use existing form primitives and `BaseButton`.

### 2. Dashboard Scope Foundation

Registry:
- `accounts.list`
- `bankStatements.list`
- `bankStatements.dashboard(id)`
- `insights.*`

UI needed:
- `dashboardScope.store.js`.
- `DashboardScopeSelector.vue`.
- Shared dashboard payload builder that maps scope modes to request bodies.
- Initial shell with mode switcher and empty/loading/error states.
- Start with `single_statement`, then add account and multi-selection modes.

### 3. Statement Dashboard Summary

Registry:
- `bankStatements.dashboard(id)`

UI needed:
- `/dashboard/statements/[id]/dashboard`
- KPI cards for balance, income, spend, cashflow, and transaction totals.
- Historical/account comparison area if `account_ids` are selected.
- Entry point already exists from statement detail; keep that route and build the page.

### 4. Summary Report Download

Registry:
- `bankStatements.summaryReport(id)`

UI needed:
- Add a report download action to statement detail.
- Show loading state while downloading.
- Treat response as a text/report file, not JSON dashboard data.

### 5. AI Assistant

Registry:
- `questions.guided`
- `questions.answer`
- `questions.query`
- `aiAttempts.feedback(id)`

UI needed:
- `/dashboard/ai`
- Tabs or segmented control: Guided Questions and Ask a Question.
- Guided question cards from `GET /questions/guided`.
- Free-form question input using `POST /query-insight`.
- Required period selector for free-form questions.
- Optional account/statement selectors.
- Answer panel with summary, confidence, warnings, citations/supporting data.
- Clarification state using `data.needs_clarification` and `data.missing_fields`.
- Feedback controls for AI answers using `aiAttempts.feedback(id)` when an attempt id is available.

Do not use `/query/route`; it was a route-preview/debug surface and is removed.

### 6. AI Attempts Review

Registry:
- `aiAttempts.list`
- `aiAttempts.summary`

UI needed:
- Optional AI history/review screen or drawer.
- Filters for status, entrypoint, selected tool, date range.
- Summary cards for recent misses and unsupported/clarification counts.
- This is lower priority than the main assistant.

### 7. Transaction Corrections and Labels

Registry:
- `transactions.corrections(id)`
- `transactions.reviewQueues`
- `transactions.applyLabelRules`
- `transactions.reviewLabel(id, labelKey)`

UI needed:
- On transaction detail, add correction action for category/channel/merchant/person-like fields.
- Show correction history.
- Label review queue page or section for confirming/dismissing suggested labels.
- Apply rules action should be admin-like or clearly scoped; do not run silently.

### 8. Product Actions

Registry:
- `actions.budgets.*`
- `actions.goals.*`
- `actions.alertRules.*`
- `actions.alerts.*`
- `actions.insightInteractions`
- `actions.summary`

UI needed:
- Product Actions hub, probably `/dashboard/actions`.
- Budget list/create/edit.
- Goal list/create/edit.
- Alert rule list/create/edit.
- Alert inbox with status update controls.
- Summary view for active budgets/goals/alerts and recent insight interactions.
- Record insight interactions from AI/analytics cards when users save, dismiss, or act on recommendations.

## Registry Coverage

`app/utils/endpoints.js` now covers all non-debug client-facing API groups:

- `auth`
- `preferences`
- `accounts`
- `bankStatements`
- `transactions`
- `insights`
- `questions`
- `aiAttempts`
- `actions`

Before building each slice, create or update the matching Pinia store first, then
compose pages/components from store state. Keep API calls out of Vue pages and
components.
