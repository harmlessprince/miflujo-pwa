# Frontend Integration: Transaction and Analytics Scopes

This document explains how the frontend should request transactions and analytics by account, bank statement, selected accounts, selected bank statements, or all uploaded statements.

## Core Scope Model

The backend supports one shared scope vocabulary:

| Field | Type | Meaning |
|---|---:|---|
| `account_id` | `number` | Scope to one bank account and all statements uploaded for that account. |
| `account_ids` | `number[]` | Scope to selected bank accounts. |
| `bank_statement_id` | `number` | Scope to one uploaded bank statement. |
| `bank_statement_ids` | `number[]` | Scope to selected uploaded bank statements. |

Validation rules:

- Do not send both `account_id` and `account_ids`.
- Do not send both `bank_statement_id` and `bank_statement_ids`.
- If no account or statement scope is sent, the backend scopes to all transactions for the authenticated user.
- All endpoints derive `user_id` from the authenticated request, not from frontend payloads.

Recommended frontend selection model:

```ts
type AnalyticsScope =
  | { type: "all" }
  | { type: "account"; account_id: number }
  | { type: "accounts"; account_ids: number[] }
  | { type: "bank_statement"; bank_statement_id: number }
  | { type: "bank_statements"; bank_statement_ids: number[] };
```

## Auth and Response Shape

Send the same auth token used by the rest of MiFlujo:

```http
Authorization: Bearer <access_token>
```

Most analytics endpoints return:

```json
{
  "data": {},
  "message": "Success message",
  "status": "success"
}
```

Some legacy endpoints use `"response"` instead of `"data"` for the payload. The frontend should read the endpoint-specific examples below.

## Transaction Listing

### List All User Transactions

```http
GET /bank-statements/transactions
```

### List Transactions for One Account

```http
GET /bank-statements/transactions?account_id=12
```

### List Transactions for Selected Accounts

Use repeated query params:

```http
GET /bank-statements/transactions?account_ids=12&account_ids=15
```

### List Transactions for One Uploaded Statement

```http
GET /bank-statements/transactions?bank_statement_id=44
```

### List Transactions for Selected Uploaded Statements

```http
GET /bank-statements/transactions?bank_statement_ids=44&bank_statement_ids=45
```

### Optional Transaction Filters

These can be combined with any valid scope:

| Query Param | Meaning |
|---|---|
| `start_date` | Start date, `YYYY-MM-DD`. |
| `end_date` | End date, `YYYY-MM-DD`. |
| `period` | Period mode, defaults to `MONTHLY`. |
| `description` | Semantic transaction search text. |
| `limit` | Semantic search limit. |
| `min_deposit`, `max_deposit` | Credit amount filters. |
| `min_withdrawal`, `max_withdrawal` | Debit amount filters. |

Example:

```http
GET /bank-statements/transactions?account_ids=12&account_ids=15&start_date=2026-01-01&end_date=2026-01-31
```

## Single Statement Dashboard

Use this when opening a specific uploaded statement detail page.

```http
GET /bank-statements/{bank_statement_id}/dashboard-summary
```

Optional historical comparison scope:

```http
GET /bank-statements/44/dashboard-summary?account_ids=12&account_ids=15
```

This endpoint summarizes only the statement identified by the path param, and can use `account_ids` for historical pattern comparison.

## Deterministic Analytics Endpoints

These POST endpoints accept the shared scope fields in the JSON body.

Common body shape:

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "account_ids": [12, 15]
}
```

For a single statement:

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "bank_statement_id": 44
}
```

For selected statements:

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "bank_statement_ids": [44, 45]
}
```

### Available Analytics

| Endpoint | Purpose | Payload Key |
|---|---|---|
| `POST /calculate-total-income` | Total credits/income. | `response` |
| `POST /calculate-total-spent` | Total debits/spending. | `response` |
| `POST /calculate-net-cashflow` | Income, expenses, net cashflow, savings rate. | `data` |
| `POST /calculate-transaction-stats` | Counts, averages, extremes, daily rates. | `data` |
| `POST /analyze-transaction-by-category` | Spending or income grouped by category. | `data` |
| `POST /analyze-transaction-by-merchant` | Spending or income grouped by merchant. | `data` |
| `POST /analyze-transaction-by-daily-patterns` | Day-of-week spending patterns. | `data` |
| `POST /calculate-burn-rate` | Burn rate and projections. | `data` |
| `POST /category-confidence` | Category confidence breakdown. | `data` |
| `POST /month-over-month-comparison` | Current month vs previous month. | `data` |

### Category Analysis Example

```http
POST /analyze-transaction-by-category
Content-Type: application/json
```

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "direction": "debit",
  "account_ids": [12, 15]
}
```

### Merchant Analysis Example

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "direction": "debit",
  "sort_by": "amount",
  "bank_statement_ids": [44, 45]
}
```

### Month-over-Month Example

This endpoint uses `year` and `month` instead of `start_date`.

```http
POST /month-over-month-comparison
Content-Type: application/json
```

```json
{
  "year": 2026,
  "month": 1,
  "account_ids": [12, 15]
}
```

### Category Confidence Example

```http
POST /category-confidence
Content-Type: application/json
```

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "bank_statement_ids": [44, 45]
}
```

## Weekly Analysis

`POST /compute-week-analysis` accepts `reference_date` and the shared scope fields.

```json
{
  "reference_date": "2026-01-14",
  "account_ids": [12, 15]
}
```

Example for selected statements:

```json
{
  "reference_date": "2026-01-14",
  "bank_statement_ids": [44, 45]
}
```

## AI / Guided Analytics

Guided questions accept `account_id`, `account_ids`, and single statement scope through `bank_statement_id`.

```http
POST /questions/answer
Content-Type: application/json
```

```json
{
  "question_key": "spending_by_category",
  "account_ids": [12, 15],
  "year": 2026,
  "month": 1,
  "limit": 5
}
```

Statement-specific guided example:

```json
{
  "question_key": "unusual_transactions",
  "bank_statement_id": 44,
  "limit": 5
}
```

Natural-language route preview supports the full shared scope:

```http
POST /query/route
Content-Type: application/json
```

```json
{
  "question": "Show my biggest food transactions in January",
  "account_ids": [12, 15],
  "current_date": "2026-01-31"
}
```

## UI Implementation Guidance

1. Let the user choose exactly one scope mode: all, one account, selected accounts, one statement, or selected statements.
2. Convert the selected mode into the matching request fields.
3. Do not send empty arrays; omit the field when nothing is selected.
4. Use repeated query params for arrays on `GET /bank-statements/transactions`.
5. Use JSON arrays for arrays on POST analytics endpoints.
6. Show `400` validation errors directly enough for debugging, especially conflict errors such as “Use either account_id or account_ids, not both.”

## Scope-to-Endpoint Matrix

| User Goal | Transactions Endpoint | Analytics Endpoint Body |
|---|---|---|
| All uploaded statements | No scope params. | No scope fields. |
| One account across all statements | `?account_id=12` | `{ "account_id": 12 }` |
| Selected accounts | `?account_ids=12&account_ids=15` | `{ "account_ids": [12, 15] }` |
| One uploaded statement | `?bank_statement_id=44` | `{ "bank_statement_id": 44 }` |
| Selected uploaded statements | `?bank_statement_ids=44&bank_statement_ids=45` | `{ "bank_statement_ids": [44, 45] }` |

