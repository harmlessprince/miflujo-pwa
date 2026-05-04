# MiFlujo Designer Brief

## Product Goal

Design a clean, trustworthy, mobile-first interface for MiFlujo, a financial intelligence app for Nigerian bank and wallet statements.

MiFlujo helps users upload bank statements, extract transactions, review financial activity, understand spending behavior, identify patterns, and ask guided AI questions about their money.

The product should feel like a serious personal/business financial dashboard, not a marketing website.

## Audience

Primary users are Nigerian bank and fintech wallet customers who want to understand their financial activity from bank statements.

The interface should work well for:

- Individuals reviewing personal spending
- Small business owners reviewing cashflow
- Users uploading PDF or Excel statements from Nigerian banks and wallets
- Users who need simple, trustworthy explanations of income, expenses, recurring payments, unusual transactions, and spending patterns

## Supported Institutions

Design the bank/wallet selection experience around these institutions:

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

Use the attached MiFlujo brand palette as the visual foundation.

Primary color:

- MiFlujo Red: `#ED2E23`
- Use for primary actions, active navigation, selected controls, important progress states, and key highlights.

Secondary and neutral colors:

- Deep Navy: `#02163B`
- Light Grey: `#CCCCCC`
- Black: `#000000`
- White / near-white surfaces: `#FFFFFF`

Typography:

- Use AzonSans as the primary font family.
- Use tabular numerals for money, balances, dates, percentages, confidence scores, and KPI values where possible.
- Keep typography compact and readable, especially on mobile.

Visual style:

- Mobile-first
- Calm
- Data-rich
- Trustworthy
- Financially serious
- Clean and easy to scan
- Suitable for Nigerian banking and wallet users

Avoid:

- Decorative gradients
- Overly promotional landing-page layouts
- Oversized marketing-style headings inside dashboards or data pages
- Heavy red usage that makes normal states feel like errors

Use red carefully for action and emphasis. Error states should still be visually distinct from normal primary actions.

## PWA Direction

Design MiFlujo as an installable mobile-first Progressive Web App.

The app should include:

- App icon direction
- Splash/loading state
- Standalone mobile app feel
- Thumb-friendly navigation
- Fast return/re-entry experience
- Clear online, offline, reconnecting, and unavailable states

Important: do not imply that statement upload, statement parsing, AI answers, or dashboard refreshes work offline.

## Core User Journey

1. User opens MiFlujo from the browser or their phone home screen.
2. User authenticates with "Continue with Google".
3. First-time users confirm timezone and currency, then go to upload.
4. Returning users go to dashboard or their most recent statement.
5. User chooses a supported bank or wallet.
6. User uploads a statement file or provides a statement URL.
7. User optionally enters a statement password.
8. MiFlujo processes the statement.
9. User reviews account details, parse quality, warnings, and summary results.
10. User explores the dashboard, transactions, insights, patterns, and AI assistant.

## Navigation

Recommended primary navigation:

- Dashboard
- Upload Statement
- Statements
- Transactions
- Insights
- AI Assistant

Mobile navigation should be thumb-friendly. Bottom navigation is preferred if it works well with the visual direction.

For the MVP, the app can be statement-centric:

- User uploads or selects a statement.
- Most pages operate inside the selected statement/account context.

## Required Screens

### 1. Welcome / Login

Purpose:

- Entry point for new and returning users.
- MiFlujo uses Google authentication only.

Fields and content:

- MiFlujo logo
- MiFlujo name
- Short value proposition
- "Continue with Google" primary action

Do not include:

- Email field
- Password field
- Separate signup link
- Separate login link

States:

- Google authentication loading
- Google authentication failed
- Network error during authentication
- Inactive account
- Returning user auto-entry

### 2. First-Time Onboarding

Purpose:

- Let first-time users confirm basic preferences before upload.

Fields:

- Timezone
- Default currency

Defaults:

- Timezone: Africa/Lagos
- Currency: NGN

Actions:

- Continue
- Skip

### 3. Session Expired Prompt

Purpose:

- Let users re-authenticate without losing their current screen context.

Content:

- Short explanation that the session expired
- "Continue with Google" action
- Cancel or close option where appropriate

### 4. Dashboard / Statement Overview

Purpose:

- Show the financial summary for a selected statement or account.

Primary fields:

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
- Parse confidence
- Data quality

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
- 3-month spending trajectory
- 6-month spending trajectory
- Partial-period projection for incomplete periods

States:

- Empty dashboard before upload
- Loading dashboard
- No insights available
- Low parse confidence
- Offline / reconnecting

### 5. Upload Bank Statement

Purpose:

- Most important first-run workflow.
- Should feel safe, clear, and trustworthy.

Fields:

- Bank or wallet selector
- Statement file upload
- Statement URL
- Statement password

Rules to communicate through design:

- User can upload a file or provide a URL.
- Password is optional unless the statement requires it.
- The password is for the PDF statement, not the user's online banking password.

Upload states:

- Idle
- File selected
- URL entered
- Uploading
- Processing
- Password required
- Invalid statement password
- Upload success
- Upload failure

Password-protected statement handling:

- Keep the selected bank/wallet and uploaded file context visible.
- Show an inline password prompt.
- Label the field "Statement password".
- Add helper text: "Use the password set on this PDF statement, not your online banking password."
- Mask the password by default.
- Include show/hide password control.
- Let the user retry without restarting the upload flow.

Success state should show:

- Account name
- Account number
- Bank or wallet
- Statement period
- Opening balance
- Closing balance
- Total deposits
- Total withdrawals
- Exported file link, if available
- Parse confidence
- Parse warnings, if any

Failure state should show:

- Human-readable error message
- Parse warnings
- Row-level issues, if available
- Retry action

### 6. Bank Statements List

Purpose:

- Let users browse previously processed statements.

Columns / card fields:

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

Actions:

- View dashboard
- View transactions
- Download/export statement file
- Delete statement

Filters:

- Account name
- Account number
- Customer/user profile
- Bank or wallet
- Created date range
- Status

Mobile behavior:

- Use statement cards or a compact list on small screens.
- Desktop can use a denser table.

### 7. Statement Detail Page

Purpose:

- Show one processed statement in more detail.

Sections:

- Account information
- Statement metadata
- Financial summary
- Exported file link
- Processing/parse quality
- Data-quality warnings

Actions:

- View dashboard
- View transactions
- Run monthly analysis

### 8. Transactions Explorer

Purpose:

- Let users inspect and filter extracted transactions.

Columns / transaction card fields:

- Date
- Description
- Direction: debit or credit
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

- Account
- Period: monthly, weekly, custom
- Date range
- Description search
- Semantic search
- Deposit minimum and maximum
- Withdrawal minimum and maximum
- Result limit

States:

- Empty
- Loading
- Search results
- No matching transactions
- Low-confidence category badge
- Abnormal transaction badge
- Recurring payment badge

Mobile behavior:

- Use transaction cards on small screens.
- Desktop can use a table with filters.

### 9. Spending Insights

Purpose:

- Dedicated space for financial insight modules.

Top controls:

- Date range selector
- Account selector
- Statement selector, if useful

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
- 3-month trend summary
- 6-month trend summary
- Partial-period projection
- Validation warnings
- Duplicate exclusions
- Transfer-pair exclusions

Suggested layout:

- Filter bar
- KPI cards
- Charts
- Ranked lists
- Insight callouts
- Data-quality disclosures

### 10. Monthly Analysis

Purpose:

- Give users a detailed month-level view of income, spending, cashflow, patterns, and projections.

Fields and data to visualize:

- Month and year
- Date range
- Period completeness
- Gross income
- Net income
- Gross expenses
- Net expenses
- Net cashflow
- Cashflow status: surplus, deficit, break even
- Savings rate
- Transaction count
- Debit count
- Credit count
- Average debit
- Average credit
- Largest debit
- Largest credit
- Daily burn rate
- Highest spending day
- Lowest spending day
- Day-of-week spending pattern
- Day-of-month spending pattern
- High-activity days
- Weekend spending
- Weekday spending
- Top categories
- Top merchants
- Recurring payments
- Previous month comparison
- 3-month spending trajectory
- 6-month spending trajectory
- Projected income for incomplete periods
- Projected expenses for incomplete periods
- Projected net cashflow for incomplete periods
- Data-quality warnings
- Duplicate transactions excluded
- Internal transfer pairs detected and excluded from net metrics
- Data completeness

UI requirements:

- Show a partial-period alert when the month is incomplete.
- Show projected end-of-period values beside current values for incomplete periods.
- Treat validation warnings, duplicate transactions, and transfer analysis as trust disclosures, not fatal errors.
- Make transfer-pair exclusions visible so users understand why net income/expense can differ from gross income/expense.
- Use trend badges for increase, decrease, stable, increasing, decreasing, and fluctuating.
- Use separate chart treatments for 3-month and 6-month trajectories.

### 11. Weekly Analysis

Purpose:

- Show a week-level version of the financial analysis.
- It should feel like a sibling view to Monthly Analysis.

Fields and data to visualize:

- Week number
- Date range
- Weekly income
- Weekly expenses
- Weekly net cashflow
- Category breakdown
- Top merchants by amount
- Top merchants by frequency
- Transaction stats
- Day-by-day spending pattern
- Weekend spending
- Weekday spending
- Previous week comparison
- Four-week average
- Last 12 weeks summary

UI requirements:

- Let users switch between monthly and weekly analysis from the insights area.
- Highlight incomplete current week with a subtle partial-period notice.
- Use compact trend charts or sparklines for the last-12-weeks summary.

### 12. AI Financial Assistant

Purpose:

- Help users ask guided or open-ended questions about their statement and transactions.
- This should feel like a grounded financial assistant, not a general chatbot.

Modes:

- Guided Questions
- Ask a Question

Guided question examples:

- Break down my spending by category
- Compare this month to last month
- Show spending trends
- Suggest ways to reduce expenses
- Explain unusual transactions
- Identify recurring payments
- Explain why my balance changed

Guided question groups:

- Spending breakdown
- Trends and comparison
- Risk signals
- Savings suggestions

Open-ended question examples:

- "How much did I spend on fuel in January?"
- "List transactions above NGN 500,000."
- "Compare this month to last month."
- "Find unusual spending spikes."

Fields and controls:

- Segmented control or tabs for the two modes
- Guided question chips or cards
- Free-form question input
- Required period selector for open-ended questions
- Date range selector
- Month selector
- Compare-period selector, if useful
- Optional account selector
- Optional statement selector
- Response panel
- Supporting data / citations area
- Confidence badge: high, medium, low
- Warnings and data-quality notices
- Expandable "view supporting data" section

Important behavior:

- Open-ended questions must require a visible period selection.
- Do not silently default open-ended questions to all time.
- If the user asks without selecting a period, show a clarification state asking them to choose a date range or month.
- Keep the typed question in place when clarification is needed.
- Do not brand this feature as GPT-specific. Use "AI assistant" or "financial assistant".

AI answer panel:

- Show concise answer first.
- Include source label such as "Based on your transactions."
- Show confidence near the answer.
- Show warnings when the answer has low data quality, weak matching, missing categories, missing dates, or no matching transactions.
- Show citation cards beneath the answer when available.

Citation card fields:

- Date
- Description
- Amount
- Merchant
- Category

Assistant states:

- Loading
- Answer ready
- Needs clarification
- Missing period/date range
- Unsupported question
- No matching transactions
- Weak semantic match
- Low data confidence
- Network/offline unavailable

### 13. Pattern Detection / Risk Signals

Purpose:

- Surface financial patterns that deserve user attention.

Fields:

- Recurring payments
- Unusual transactions
- Spending spikes
- Balance change explanation
- Abnormal transaction indicators
- Recurring confidence
- Abnormal score
- Abnormal reason

This can live inside the dashboard, insights area, or as a dedicated risk/pattern section.

## Important States To Design

- Welcome / unauthenticated
- Google authentication loading
- First-time onboarding
- Returning user auto-entry
- Session expired
- Inactive account
- Authentication failed
- Network error during login
- Empty dashboard before upload
- PWA install prompt
- Installed app entry state
- Offline
- Reconnecting
- Upload in progress
- Statement processing
- Password required
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
- Low-confidence AI answer
- Low-confidence transaction classification
- Delete confirmation

## Key Labels And Formatting

Use NGN currency formatting throughout.

Examples:

- NGN 250,000.00
- Income
- Expense
- Net Cashflow
- Savings Rate
- Burn Rate
- Category Confidence
- Recurring Payment
- Unusual Transaction
- Spending Spike
- Low Confidence
- Statement Period
- Opening Balance
- Closing Balance

## Component Variants Needed

Design reusable component variants for:

- KPI cards
- Transaction cards
- Statement cards
- Filter bars
- Date range controls
- Account selectors
- Statement selectors
- Bank/wallet selector
- File upload area
- Password prompt
- Loading states
- Empty states
- Alert messages
- Warning messages
- Error messages
- Success messages
- Tables
- Mobile transaction cards
- Charts
- Modals
- Confirmation dialogs
- Confidence badges
- Recurring badges
- Abnormal transaction badges
- Trend badges
- Data-quality disclosures
- AI answer cards
- Citation cards
- Expandable supporting-data panels

Trend badge variants:

- Increase
- Decrease
- Stable
- Increasing
- Decreasing
- Fluctuating

Data-quality disclosure variants:

- Validation warnings
- Duplicate transactions excluded
- Internal transfer pairs excluded
- Low parse confidence
- Incomplete period projection

AI answer variants:

- Guided answer
- Open-ended answer
- Missing-period clarification
- Unsupported question
- Weak semantic match
- Low-confidence answer
- No matching transactions
- Citations available
- Warnings available
- Supporting data expanded

## Designer Deliverables

Please provide:

1. Welcome/login screen with Google CTA
2. First-time onboarding screen
3. Session expiry prompt
4. Mobile dashboard
5. Desktop dashboard
6. Upload flow
7. Statement list
8. Statement detail page
9. Transaction explorer
10. Spending insights page
11. Monthly analysis page
12. Weekly analysis page
13. AI assistant interface
14. Empty/loading/error states
15. PWA install/offline/returning-user states
16. Component variants for badges, KPI cards, filters, charts, tables, modals, and alert messages
17. Trend badge variants
18. Data-quality disclosure variants
19. AI assistant answer variants

## Final Design Notes

- Prioritize statement analysis, transaction review, spending intelligence, and financial decision support.
- Avoid eligibility, loan qualification, approval, or underwriting language.
- Keep the app practical and dashboard-like.
- Design mobile first, then expand naturally for desktop.
- Do not show technical implementation details in the UI. Keep the experience focused on human-readable financial information, controls, states, and explanations.
