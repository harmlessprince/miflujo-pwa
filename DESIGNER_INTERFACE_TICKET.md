# Designer Ticket: MiFlujo Financial Intelligence Interface

## Goal

Design a clean, trustworthy interface for MiFlujo, a financial intelligence application that helps users upload bank statements, extract transactions, understand spending behavior, identify financial patterns, and ask guided AI questions about their money.

The interface should present MiFlujo as a personal/business financial intelligence and statement analysis tool.

The product should be designed as a mobile-first Progressive Web App (PWA). Most users should be able to upload statements, review results, and inspect key insights comfortably from a phone. Desktop should expand the same experience for denser tables, charts, exports, and deeper analysis, but mobile is the baseline.

## Product Context

MiFlujo processes Nigerian bank statement files, extracts account and transaction data, classifies transactions using AI, identifies spending patterns, and presents actionable financial insights.

Supported institutions currently include:

- Zenith
- UBA
- Access
- FBN / First Bank
- GTB
- FCMB
- Fidelity
- Sterling
- Opay
- Palmpay
- Kuda

## Brand Direction

Use the attached brand palette as the visual foundation.

Primary color:

- MiFlujo Red: `#ED2E23`
- RGB: `237 46 38`
- Use as the primary action color, active navigation state, key highlights, important progress states, and selected controls.

Secondary and neutral colors:

- Deep Navy: `#02163B`
  - RGB: `2 22 59`
  - Use for primary text, headers, dark surfaces, charts, and financial-data emphasis.
- Light Grey: `#CCCCCC`
  - RGB: `204 204 204`
  - Use for borders, dividers, disabled states, subtle chart gridlines, and quiet secondary UI.
- Black: `#000000`
  - RGB: `0 0 0`
  - Use sparingly for high-contrast text only where Deep Navy is not enough.
- White / near-white surface: `#FFFFFF`
  - Palette image notes RGB `252 252 252`; use this as the main app background direction, with pure white reserved for elevated surfaces if needed.

Typography:

- Use AzonSans as the primary font family across the app.
- Use tabular numerals for balances, transaction amounts, dates, confidence scores, and KPI values if available in the font.
- Keep typography compact and readable on mobile; avoid oversized marketing-style headings inside dashboard, table, upload, and insight surfaces.

Visual style:

- Mobile-first, calm, data-rich, and trustworthy.
- Avoid decorative gradients and overly promotional compositions.
- Use the red carefully so the app does not feel like an error state. Pair it with Deep Navy, white/near-white surfaces, and restrained grey borders.
- Reserve red-filled buttons for primary actions like upload, process, retry, continue, save, or confirm.
- Use red outlines, text, or alert treatments for recoverable states such as invalid statement password, but make sure error states are clearly distinguishable from normal primary actions.
- Charts should not rely on red alone. Use Deep Navy, greys, and additional accessible chart colors if needed for comparison.

## PWA / Mobile-First Requirements

Design MiFlujo as an installable PWA with mobile as the first-class experience.

PWA expectations:

- Installable app shell with app icon, splash/loading state, and standalone display behavior.
- Mobile-safe navigation that works well in one hand.
- Fast return experience for users reopening the app from their home screen.
- Clear online/offline states. The UI may cache the shell and recent views, but statement upload, parsing, AI answers, and dashboard refreshes should clearly require network access.
- Avoid implying that statement parsing works offline unless that capability is explicitly built.

Mobile-first interaction principles:

- Upload should be the most prominent first-run action.
- The dashboard should show a compact financial summary first, then allow drill-down into charts, transactions, and AI insights.
- Use bottom navigation or another thumb-friendly mobile navigation pattern for primary areas.
- Keep tables responsive by switching to transaction cards or horizontally scrollable data grids on small screens.
- Preserve uploaded file context during recoverable errors, especially password-required and invalid-password states.
- Desktop layouts should enhance density and comparison, not introduce a different product model.

## Core User Journey

1. User opens the PWA from browser or home screen.
2. New or returning user taps "Continue with Google" to authenticate. First-time users are created automatically; returning users are logged in. No separate signup flow exists.
3. First-time user is directed to the upload flow. Returning user with existing statements lands on the dashboard.
4. User selects a supported bank or wallet.
5. User uploads a bank statement file from their device, email/downloads, or provides a statement URL.
6. User optionally enters a statement password.
7. System processes the statement.
8. User sees a processing result with parse confidence, warnings, and extracted account details.
9. User lands on a dashboard showing income, expenses, net cashflow, transactions, spending categories, merchants, patterns, and suggestions.
10. User can explore transactions, filter/search, view insights, and ask guided AI financial questions.

## Required Screens

### 0. Signup / Login

Design a welcome and authentication screen. This is the entry point for all new and returning users. MiFlujo uses Google OAuth as its sole authentication method — there is no separate signup or login flow. The "Continue with Google" action handles both cases in one call.

Endpoint:

```http
POST /auth/google
```

Request shape:

```json
{
  "google_token": "...",
  "first_name": "Tobi",
  "last_name": "Adeyemi",
  "timezone": "Africa/Lagos",
  "default_currency": "NGN",
  "profile_picture_url": "https://..."
}
```

Only `google_token` is required. The remaining fields are optional and sourced from the Google profile if not provided by the client.

Response shape:

```json
{
  "status": "success",
  "message": "Google authentication successful",
  "data": {
    "access_token": "...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "Tobi",
      "last_name": "Adeyemi",
      "profile_picture_url": "...",
      "timezone": "Africa/Lagos",
      "default_currency": "NGN",
      "email_verified_at": "2026-01-01T00:00:00",
      "last_login_at": "2026-05-02T10:00:00",
      "is_active": true
    }
  }
}
```

Screens to design:

**Welcome / landing screen**

- MiFlujo logo and name.
- Short value proposition: one or two lines explaining what MiFlujo does.
- "Continue with Google" as the sole primary action. No email/password fields. No separate signup link.
- Consistent with the brand palette: Deep Navy for text and headers, MiFlujo Red for the primary CTA button.

**Authentication loading state**

- Brief loading indicator while the Google OAuth flow completes and the backend verifies the token.
- Should feel fast. Do not show raw token data.

**First-time user onboarding (conditional)**

- Triggered only when the response user has no `timezone` or `default_currency` set beyond the defaults.
- One short screen: confirm or select timezone and default currency.
- Timezone pre-filled to Africa/Lagos; currency pre-filled to NGN. User can change either.
- A "Skip" option is acceptable. After this step, redirect to the upload flow.

**Returning user re-entry**

- If a valid access token exists in secure local storage, skip the login screen entirely and go to the dashboard or the last viewed statement.
- On token expiry mid-session, show a non-disruptive re-authentication prompt rather than a hard logout. The user should be able to re-authenticate without losing their current view context.

Error states:

- **Google auth failed**: invalid or expired Google token — inline error with a retry CTA.
- **Inactive account**: `is_active` is false — message indicating the account is inactive, with a support contact or email.
- **Network error during auth**: connection failed — retry option, no loss of state.

UX notes:

- Do not split signup from login. The backend creates new users automatically on first auth and logs in returning users. The UI only needs one entry point.
- After successful auth, first-time users go to the upload flow; returning users with existing statements go to the dashboard.
- Attach the `access_token` as a `Bearer` token in the `Authorization` header for every subsequent API request.
- The token has a finite TTL (`expires_in` seconds). Track expiry client-side and prompt re-authentication gracefully before the token is used on an expired request.
- Never display or log the raw Google token or access token in the UI.

### 1. Dashboard / Statement Overview

Design a financial dashboard for a selected bank statement.

Primary data:

- Statement period
- Account name
- Account number
- Bank or wallet name
- Opening balance
- Closing balance
- Total deposits
- Total withdrawals
- Net cashflow
- Transaction count
- Parse confidence / data quality

Main cards:

- Total Income
- Total Expense
- Net Cashflow
- Transaction Count
- Category Confidence
- Recurring Payments
- Unusual Transactions
- Data Quality / Validation Warnings
- Duplicate Transactions Excluded
- Internal Transfer Pairs Detected

Visualizations:

- Monthly income vs expense
- Weekly income vs expense
- Daily cashflow trend
- Top spending categories
- Top merchants
- Spending spikes
- Recurring payments
- Unusual transactions
- 3-month and 6-month spending trajectory
- Partial-period projection, when the current period is incomplete

Endpoint:

```http
GET /bank-statements/{bank_statement_id}/dashboard-summary
```

Optional query params:

```text
user_id
account_ids
```

### 2. Upload Bank Statement

Design a mobile-first upload flow that feels trustworthy and clear. This is the most important first-run workflow in the PWA.

Fields:

- Bank selector
- User ID field or hidden app-level user context
- File upload input
- Optional statement URL input
- Optional password input
- Submit button

Upload behavior:

- User must provide either a file or a URL, not both.
- Show upload progress/loading state.
- Show processing state after upload.
- Show success or failure response.
- If the uploaded statement is password-protected, the backend returns a structured failure and the UI should prompt the user for the statement password without making them restart the whole upload flow.

Success state should show:

- Account name
- Account number
- Bank or wallet
- Statement period
- Opening balance
- Closing balance
- Total deposits
- Total withdrawals
- Exported Excel file link if available
- Parse confidence
- Parse warnings, if any

Failure state should show:

- Human-readable error message
- Error code
- Parse warnings
- Row-level errors, if returned
- Option to retry

Password-protected statement handling:

- Treat `bank_statement_password_required` as a recoverable upload state, not a terminal failure.
- Show an inline password prompt near the uploaded file summary.
- Keep the selected bank, file or URL, and user context intact.
- Primary action should be "Continue processing" or "Unlock and process".
- Supporting copy: "This statement is password-protected. Enter the statement password to continue."
- Do not imply the user's banking password is needed. Label the field "Statement password" and optionally add helper text: "Use the password set on this PDF statement, not your online banking password."
- Treat `bank_statement_invalid_password` as an inline validation error on the password field.
- Invalid password copy: "That password did not unlock the statement. Check it and try again."
- Allow retrying the password without re-uploading the file when the file is still available in the client session.
- Keep the password field masked by default, with a show/hide control.
- Do not display or persist the password after processing.

Backend failure response examples:

```json
{
  "status": "failed",
  "message": "This bank statement is password-protected. Please provide the statement password and try again.",
  "error_code": "bank_statement_password_required",
  "source_type": "pdf_encrypted",
  "confidence": 0.0,
  "warnings": ["This PDF is password-protected and requires a password before it can be parsed."],
  "row_errors": [],
  "parse": {
    "source_type": "pdf_encrypted",
    "confidence": 0.0,
    "warnings": ["This PDF is password-protected and requires a password before it can be parsed."],
    "row_errors": []
  }
}
```

```json
{
  "status": "failed",
  "message": "The bank statement password is incorrect. Please confirm the password and try again.",
  "error_code": "bank_statement_invalid_password",
  "source_type": "pdf_encrypted",
  "confidence": 0.0,
  "warnings": ["This PDF is password-protected and could not be opened with the supplied password."],
  "row_errors": [],
  "parse": {
    "source_type": "pdf_encrypted",
    "confidence": 0.0,
    "warnings": ["This PDF is password-protected and could not be opened with the supplied password."],
    "row_errors": []
  }
}
```

Endpoints:

```http
GET /bank-statement-choices
POST /bank-statements
```

Upload form fields:

```text
bank_statement_choice
user_id
bank_statement_pdf
bank_statement_pdf_url
password
```

### 3. Bank Statements List

Design a list/table of processed statements.

Columns:

- Bank or wallet
- Account name
- Account number
- Period
- Opening balance
- Closing balance
- Total deposits
- Total withdrawals
- Date uploaded
- Status
- Actions

Actions:

- View dashboard
- View transactions
- Download/export statement file
- Delete statement

Filters:

- Account name
- Account number
- Customer/user ID
- Bank or wallet
- Created date range
- Status, even if marked coming soon

Endpoint:

```http
GET /bank-statements
```

Query params:

```text
account_number
account_name
customer_id
status
bank_statement_choice
from_date
to_date
```

### 4. Statement Detail Page

Design a detail page for one processed statement.

Sections:

- Account information
- Statement metadata
- Financial summary
- Exported Excel link
- Processing/parse quality
- CTA to view dashboard
- CTA to view transactions
- CTA to run monthly analysis

Endpoint:

```http
GET /bank-statements/{bank_statement_id}
```

### 5. Transactions Explorer

Design a transaction table with rich filtering.

Columns:

- Date
- Description
- Direction: debit/credit
- Amount
- Deposit
- Withdrawal
- Balance
- Bank or wallet
- Category
- Category confidence
- Channel
- Channel confidence
- Merchant
- Merchant confidence
- Recurring flag
- Frequency
- Abnormal flag
- Abnormal reason

Filters:

- User ID
- Account ID
- Period: monthly, weekly, custom
- Date range
- Description / semantic search
- Deposit min/max
- Withdrawal min/max
- Limit

States:

- Empty state
- Loading state
- Search result state
- Low-confidence category badge
- Abnormal transaction badge
- Recurring payment badge

Endpoint:

```http
GET /bank-statements/transactions
```

Query params:

```text
period
account_id
user_id
limit
max_deposit
min_deposit
max_withdrawal
min_withdrawal
description
start_date
end_date
```

### 6. Spending Insights Page

Design a page dedicated to financial insight modules.

Modules:

- Total income
- Total spent
- Net cashflow
- Transaction stats
- Spending by category
- Spending by merchant
- Daily spending patterns
- Burn rate
- Category confidence
- Month-over-month comparison
- Week-over-week comparison
- 3-month and 6-month trend summaries
- Partial-period projection
- Validation warnings, duplicate exclusions, and transfer-pair exclusions

Suggested layout:

- Date/account filter bar at top
- KPI cards
- Charts
- Ranked lists
- Insight callouts

Endpoints:

```http
POST /calculate-total-income
POST /calculate-total-spent
POST /calculate-net-cashflow
POST /calculate-transaction-stats
POST /analyze-transaction-by-category
POST /analyze-transaction-by-merchant
POST /analyze-transaction-by-daily-patterns
POST /calculate-burn-rate
POST /category-confidence
POST /month-over-month-comparison
POST /compute-week-analysis
```

Common request fields:

```json
{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "account_id": 1,
  "user_id": 1
}
```

### 7. Monthly Analysis Page

Design a monthly financial analysis view.

Data to visualize:

- Gross income
- Net income
- Gross expenses
- Net expenses
- Net cashflow
- Cashflow status: surplus, deficit, break even
- Savings rate
- Transaction count
- Debit/credit count
- Average debit/credit
- Largest debit/credit
- Daily burn rate
- Highest spending day
- Lowest spending day
- Day-of-week spending pattern
- Day-of-month spending pattern
- High-activity days
- Weekend vs weekday spending
- Top categories
- Top merchants
- Recurring payments
- Previous month comparison
- 3-month spending trajectory
- 6-month spending trajectory
- Partial-period projected income, projected expenses, and projected net cashflow
- Data-quality warnings
- Duplicate transactions excluded from analysis
- Internal transfer pairs detected and excluded from net metrics
- Data completeness

Endpoint:

```http
GET /compute-month-analysis/{bank_statement_id}
```

Response shape to design around:

```json
{
  "status": "success",
  "message": "Monthly analysis computed successfully",
  "data": {
    "period": {
      "type": "MONTHLY",
      "month": "November",
      "year": 2025,
      "start_date": "2025-11-01",
      "end_date": "2025-11-30",
      "is_complete": true,
      "days_in_period": 30,
      "disclaimer": null
    },
    "cashflow": {
      "gross_income": 500000,
      "net_income": 500000,
      "gross_expenses": 380000,
      "net_expenses": 380000,
      "net_cashflow": 120000,
      "cashflow_status": "SURPLUS",
      "savings_rate": 24.0,
      "projection": {
        "is_partial": false,
        "days_elapsed": 30,
        "projected_income": 500000,
        "projected_expenses": 380000,
        "projected_net_cashflow": 120000,
        "disclaimer": null
      }
    },
    "spending_by_category": {
      "categories": [
        {
          "rank": 1,
          "name": "Food",
          "total": 85000,
          "amount": 85000,
          "percentage": 22.4,
          "transaction_count": 45
        }
      ],
      "top_5": ["Food", "Transport", "Bills", "Entertainment", "Shopping"]
    },
    "top_merchants": {
      "by_amount": [
        {
          "merchant": "Jumia",
          "total": 45000,
          "frequency": 8,
          "average_per_transaction": 5625,
          "category": "Shopping"
        }
      ],
      "by_frequency": []
    },
    "transactions": {
      "total_count": 127,
      "debit_count": 98,
      "credit_count": 29,
      "average_debit": 3878,
      "average_credit": 17241,
      "largest_debit": { "amount": 50000 },
      "largest_credit": { "amount": 200000 },
      "daily_average_count": 4.2
    },
    "patterns": {
      "by_day_of_week": [],
      "by_day_of_month": [],
      "highest_spending_day": "Friday",
      "lowest_spending_day": "Sunday",
      "daily_burn_rate": 12667,
      "high_activity_days": [5, 15],
      "weekend_vs_weekday": {
        "weekday_spending": 45000,
        "weekend_spending": 18000
      }
    },
    "recurring_payments": {
      "detected_subscriptions": [
        {
          "merchant": "Netflix",
          "category": "Entertainment",
          "frequency": "MONTHLY",
          "average_amount": 2900,
          "last_charge": "2025-11-15",
          "next_expected": "2025-12-15",
          "months_detected": 3
        }
      ],
      "total_monthly_recurring": 28500,
      "percentage_of_expenses": 7.5
    },
    "comparison": {
      "previous_month": {
        "expenses": 420000,
        "absolute_change": -40000,
        "percentage_change": -9.52,
        "trend": "DECREASE",
        "trend_direction": "DECREASE"
      },
      "three_month_average": 416667,
      "six_month_average": 410000,
      "trend_direction": "DECREASING",
      "multi_period_trends": {
        "three_month": {
          "period": "3_months",
          "months": [],
          "average_monthly_spending": 416667,
          "highest_month": null,
          "lowest_month": null,
          "trend_direction": "DECREASING",
          "trend_strength": "MODERATE"
        },
        "six_month": {}
      }
    },
    "data_quality": {
      "transaction_count_analyzed": 127,
      "excluded_transaction_count": 4,
      "data_completeness_percentage": 96.9,
      "validation_warnings": [],
      "duplicate_transactions": [],
      "transfer_analysis": {
        "transfer_pairs": [],
        "transfer_pair_count": 0,
        "excluded_from_net_metrics": 0
      }
    }
  }
}
```

UI requirements:

- Show a partial-period alert when `period.disclaimer` or `cashflow.projection.disclaimer` is present.
- Show projected end-of-period values beside current values for incomplete periods.
- Treat `validation_warnings`, `duplicate_transactions`, and `transfer_analysis` as data-quality disclosures, not fatal errors.
- Make transfer-pair exclusions visible so users understand why net income/expense differs from gross income/expense.
- Use trend badges for `INCREASE`, `DECREASE`, `STABLE`, `INCREASING`, `DECREASING`, and `FLUCTUATING`.
- Use separate chart treatments for 3-month and 6-month trajectories.

### 7B. Weekly Analysis Page

Design a weekly financial analysis view using the same visual language as monthly analysis, but optimized for Monday-to-Sunday ISO weeks.

Data to visualize:

- Week number and date range
- Weekly income, expenses, and net cashflow
- Category breakdown
- Top merchants by amount
- Top merchants by frequency
- Transaction stats
- Day-by-day spending pattern
- Weekend vs weekday spending
- Previous week comparison
- Four-week average
- Last 12 weeks summary

Endpoint:

```http
POST /compute-week-analysis
```

Request shape:

```json
{
  "reference_date": "2025-11-26",
  "account_id": 1
}
```

Response shape to design around:

```json
{
  "status": "success",
  "message": "Weekly analysis computed successfully",
  "data": {
    "period": {
      "type": "WEEKLY",
      "week_number": 48,
      "year": 2025,
      "start_date": "2025-11-24",
      "end_date": "2025-11-30",
      "is_complete": true,
      "days_in_period": 7
    },
    "cashflow": {},
    "spending_by_category": {
      "categories": [],
      "top_5": []
    },
    "top_merchants": {
      "by_amount": [],
      "by_frequency": []
    },
    "transactions": {},
    "patterns": {
      "by_day_of_week": [],
      "highest_spending_day": "Friday",
      "lowest_spending_day": "Sunday",
      "weekend_vs_weekday": {}
    },
    "comparison": {
      "previous_week": {
        "expenses": 89000,
        "absolute_change": -12000,
        "percentage_change": -11.9,
        "trend": "DECREASE"
      },
      "four_week_average": 95000,
      "last_12_weeks": []
    }
  }
}
```

UI requirements:

- Weekly and monthly analysis should feel like sibling views, not separate products.
- Allow the user to switch between monthly and weekly analysis from the same insights area.
- Highlight incomplete current week with a subtle partial-period notice.
- Use the last-12-weeks summary for compact trend charts or sparklines.

### 8. AI Financial Assistant

Design an AI financial assistant that supports two distinct modes:

1. **Guided questions** — curated chips/cards returned by `GET /questions/guided` and answered through `POST /questions/answer`.
2. **Ask a question** — free-form natural-language financial questions answered through `POST /query-insight`.

Keep these modes visually related, but make their behavior clear. Guided questions are predictable, curated shortcuts. Free-form questions are for open-ended financial queries that may need routing, clarification, or an unsupported-question response.

Open-ended questions must be period-scoped. The user should select a date range, month, or comparable period before submitting an open-ended question. Do not silently default to "all time" or hide the period choice. If the user submits an open-ended question without a period, show a clarification state asking them to choose a date range.

Do not design this as a general-purpose chatbot that can answer anything. The assistant should feel like a grounded financial insight tool for the user's statement and transaction data.

Trust model:

- AI answers do not come from generated SQL.
- AI answers should not imply the model invents facts or performs unbounded reasoning.
- The backend routes questions to registered financial tools over SQL, Qdrant candidate matching, and deterministic services.
- Qdrant is used only for semantic matching, such as finding fuel-like or subscription-like transactions.
- Final totals, counts, date filters, account scope, and comparisons come from SQL/tool results.
- Open-ended AI questions require a selected period so broad questions do not scan all historical transactions by accident.
- UI copy should say "AI assistant" or "financial assistant"; do not brand the feature as GPT-specific.

Guided questions available:

- Break down my spending by category
- Compare this month to last month
- Show spending trends
- Suggest ways to reduce expenses
- Explain unusual transactions
- Identify recurring payments
- Explain why my balance changed

Guided question key mapping:

| Label | `question_key` |
|---|---|
| Break down my spending by category | `spending_by_category` |
| Compare this month to last month | `month_comparison` |
| Show spending trends | `spending_trends` |
| Suggest ways to reduce expenses | `reduce_expenses` |
| Explain unusual transactions | `unusual_transactions` |
| Identify recurring payments | `recurring_payments` |
| Explain why my balance changed | `balance_change` |

Required UI:

- Segmented control or tabs for Guided Questions and Ask a Question
- Guided question chips/cards grouped by purpose:
  - Spending breakdown
  - Trends and comparison
  - Risk signals
  - Savings suggestions
- Free-form question input for open-ended questions
- Required period selector for open-ended questions, such as date range, month, or compare-period controls
- Suggested examples for open-ended questions:
  - "How much did I spend on fuel in January?"
  - "List transactions above NGN 500,000."
  - "Compare this month to last month."
  - "Find unusual spending spikes."
- Optional account selector
- Optional statement selector
- Optional date/month selector
- Response panel
- Supporting data/citations area
- Warnings/data-quality notices
- Confidence badge: high, medium, low
- Expandable "view supporting data" or raw structured result area for auditability
- Loading state while answering

AI response panel:

- Show the concise answer or summary first.
- Include a plain-language source label, such as "Based on your transactions."
- Show confidence near the answer, not hidden in metadata.
- Show warning banners or notices when the answer has low data quality, weak semantic matching, missing categories, missing dates, or no matching transactions.
- Show citation cards beneath the answer with date, description, amount, merchant, and category when available.
- Let users expand supporting structured data for auditability and debugging, but do not make raw JSON the default reading experience.

Scope controls:

- Account and statement scope should be controlled by selectors, not free-form text fields.
- `user_id` must not appear as an editable UI field. The authenticated user context is handled by the app.
- Use either a single-account selector or a multi-account selector at a time. Do not allow the user to submit both `account_id` and `account_ids` from the same UI state.
- Date/month controls should make the selected period visible in the answer context.
- Open-ended questions require a selected period. Guided questions may derive their period from a selected statement, current month, selected month, or guided question defaults.
- Account selection remains optional. If no account is selected, the query may apply to all authenticated user accounts for the selected period.
- The UI should not offer an "All time" open-ended AI query unless the backend policy is explicitly changed later.

Assistant states to design:

- Loading/routing
- Answer ready
- Needs clarification
- Missing period/date range
- Unsupported question
- No matching transactions
- Weak semantic match
- Low data confidence
- Network/offline unavailable

Endpoints:

```http
GET /questions/guided
POST /questions/answer
POST /query-insight
POST /query/route
```

Endpoint guidance:

- Use `GET /questions/guided` to render guided options.
- Use `POST /questions/answer` for guided question answers.
- Use `POST /query-insight` for free-form user questions.
- Treat `POST /query/route` as optional/internal/debug support for routing previews. It is not the primary user-facing assistant experience.

Guided answer request shape:

```json
{
  "question_key": "spending_by_category",
  "question": "Break down my spending by category",
  "bank_statement_id": 1,
  "account_id": 1,
  "account_ids": [1],
  "current_date": "YYYY-MM-DD",
  "year": 2026,
  "month": 5,
  "limit": 5
}
```

Open-ended question request shape:

```json
{
  "current_date": "YYYY-MM-DD",
  "account_id": 1,
  "date_range": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "query": "How much did I spend on fuel in January?"
}
```

Open-ended period clarification example:

```json
{
  "status": "needs_clarification",
  "message": "Please choose a date range for this question.",
  "missing_fields": ["date_range"]
}
```

Answer response expectations:

- Guided and open-ended answers should render the same answer components where possible.
- Response data may include `summary`, `raw_result`, `tool`, `confidence`, `warnings`, `data`, and `citations`.
- If `summary` exists, render it as the main answer. If not, render the deterministic answer text or tool result in a concise human-readable form.
- Always preserve access to citations/supporting transactions when returned.
- Warnings should be visible enough for trust, but not styled as fatal errors unless the answer cannot be produced.
- Missing-period clarification should keep the user's typed question in place and focus the date range/month selector so the user can retry without retyping.

### 9. Pattern Detection / Risk Signals

This can be part of the dashboard or a dedicated insights section.

Show:

- Recurring payments
- Unusual transactions
- Spending spikes
- Balance change explanation
- Abnormal transaction indicators
- Recurring confidence
- Abnormal score/reason

Data appears in:

```http
GET /bank-statements/{bank_statement_id}/dashboard-summary
POST /questions/answer
```

## Navigation Structure

Recommended primary navigation:

- Dashboard
- Upload Statement
- Statements
- Transactions
- Insights
- AI Assistant

For MVP, the app can be statement-centric:

- User uploads or selects a statement.
- Most pages operate inside the selected statement/account context.

## UX Requirements

The interface should feel:

- Trustworthy
- Financially serious
- Clean and data-rich
- Easy to scan
- Suitable for Nigerian banking and wallet users
- Less like a marketing site, more like an operational financial dashboard

Important states to design:

- Welcome / landing screen (unauthenticated)
- Google auth loading state
- First-time user onboarding (timezone / currency confirmation)
- Returning user auto-login (token still valid)
- Session expired — mid-session re-authentication prompt
- Inactive account error
- Google auth failure / network error during login
- Empty dashboard before upload
- PWA install prompt / installed app entry state
- Offline / reconnecting state
- Upload in progress
- Parsing/processing
- Password required for uploaded statement
- Invalid statement password
- Upload success
- Upload failure
- Low parse confidence
- No transactions found
- No insights available
- AI answer loading
- AI answer needs clarification
- AI answer missing required period/date range
- Unsupported AI question
- Weak semantic match
- Low-confidence AI answer or classification
- Delete confirmation

## Key Data Labels

Use NGN currency formatting throughout.

Examples:

```text
NGN 250,000.00
Income
Expense
Net Cashflow
Savings Rate
Burn Rate
Category Confidence
Recurring Payment
Unusual Transaction
Spending Spike
Low Confidence
Statement Period
Opening Balance
Closing Balance
```

## Designer Deliverables

Please provide:

1. Welcome / login screen with Google auth CTA.
2. First-time onboarding screen (timezone and currency selection).
3. Session expiry re-authentication prompt (modal or overlay).
4. Mobile-first PWA dashboard design.
5. Desktop expanded dashboard design.
6. Upload flow.
7. Statement list/table.
8. Statement detail page.
9. Transaction explorer.
10. Spending insights page.
11. Monthly analysis page with projections, trends, recurring payments, and data-quality disclosures.
12. Weekly analysis page with week-over-week and last-12-week trend views.
13. AI assistant interface.
14. Empty/loading/error states (including auth error states).
15. PWA install/offline/returning-user states.
16. Component variants for badges, KPI cards, filters, charts, tables, modals, and alert messages.
17. Trend badge variants for increase, decrease, stable, increasing, decreasing, and fluctuating states.
18. Data-quality disclosure variants for validation warnings, duplicate exclusions, and transfer-pair exclusions.
19. AI assistant answer variants for guided answers, open-ended answers, missing-period clarification prompts, unsupported questions, weak semantic matches, low-confidence answers, citations, warnings, and expandable supporting data.

## Notes For Designer

The backend already supports the core data and insight APIs. The design should assume the frontend will consume these endpoints directly.

Avoid eligibility, qualification, or approval-oriented language from the previous product direction. The app should prioritize statement analysis, transaction review, spending intelligence, and financial decision support.
