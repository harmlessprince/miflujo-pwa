---
name: data-table
description: Use the DataTable component in ShopSynch — table headers, custom cell slots, action menus, pagination, loading skeletons, and empty state
context: fork
---

# /data-table

Use `DataTable` (`components/table/DataTable.vue`) for all tabular data views in the dashboard. It handles loading skeletons, empty state, pagination, and an actions dropdown out of the box.

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `tableHeader` | `Array` | `[]` | Column definitions — see format below |
| `tableData` | `Array` | `[]` | Row data objects |
| `loading` | `Boolean` | `true` | Shows skeleton rows while true |
| `hasPagination` | `Boolean` | `true` | Renders pagination bar below table |
| `pagination` | `Object` | `{}` | Pagination metadata — see format below |
| `hasAction` | `Boolean` | `false` | Appends an "Action" column with dropdown |
| `hasShow` | `Boolean` | `false` | Adds "View" item in the action dropdown |
| `hasEdit` | `Boolean` | `false` | Adds "Edit" item in the action dropdown |
| `hasDelete` | `Boolean` | `false` | Adds "Delete" item (with confirm modal) |

## Emits

| Event | Payload | When |
|-------|---------|------|
| `show` | `id` | User clicks View in action menu |
| `edit` | `id` | User clicks Edit in action menu |
| `delete` | `id` | User confirms Delete in confirm modal |
| `fetchPage` | `pageNumber` | User navigates to a different page |
| `changeLimit` | `limit` | User changes rows-per-page |

---

## Table Header Format

Each object in `tableHeader` defines one column:

```javascript
const tableHeader = [
  { title: 'Name',    accessor: 'fullName' },           // plain text
  { title: 'Amount',  accessor: 'amount',  type: 'money' },   // formatted currency
  { title: 'Date',    accessor: 'createdAt', type: 'date' },   // formatted date
  { title: 'Status',  accessor: 'status',  type: 'status' },  // coloured badge
  { title: 'Active',  accessor: 'isActive', type: 'boolean',
    booleanLabels: { true: 'Yes', false: 'No' } },             // boolean → label
]
```

Column types:
- *(none)* — renders `row[accessor]` as plain text, falls back to `"N/A"`
- `'money'` — runs `formatToMoney()`
- `'date'` — runs `formatDate()`
- `'status'` — renders a coloured rounded badge (uses built-in `statusConfig`)
- `'boolean'` — renders true/false as customisable text via `booleanLabels`

---

## Pagination Object Format

Pass the paginated metadata from `getPaginatedData()` (via the store):

```javascript
// Shape expected by the pagination bar
{
  hasPrevious: false,
  hasNext: true,
  from: 1,
  to: 10,
  pageSize: 10,
  totalPages: 5,
  currentPage: 1,
}
```

Stores populate this via `getPaginatedData()` from `utils/helpers.js`. Bind it directly:

```vue
:pagination="store.paginatedData"
```

---

## Basic Usage

```vue
<DataTable
  :table-header="tableHeader"
  :table-data="store.items"
  :pagination="store.paginatedData"
  :loading="store.loading"
  has-action
  has-show
  @show="router.push(`/dashboard/items/${$event}`)"
  @fetch-page="fetchItems"
  @change-limit="changeLimit"
/>
```

---

## Custom Cell Slots

Override any column's rendering with `#cell(<accessor>)`. The slot receives `{ row, value }`:

```vue
<DataTable ...>
  <!-- Two-line cell: primary + secondary text -->
  <template #cell(fullName)="{ row }">
    <div>
      <p class="font-[700] text-[#000]">{{ row.fullName }}</p>
      <p class="text-[1.2rem] text-dashboard_text_color">{{ row.email }}</p>
    </div>
  </template>

  <!-- Custom status badge -->
  <template #cell(status)="{ row }">
    <span
      :class="row.status === 'ACTIVE' ? 'bg-[#B5F9B4] text-[#3CA745]' : 'bg-[#FFBFBF] text-[#FF3131]'"
      class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
    >
      {{ row.status }}
    </span>
  </template>
</DataTable>
```

---

## Extra Action Menu Items

Use the `#more-actions` slot to add items beyond the built-in View / Edit / Delete:

```vue
<DataTable has-action has-show ...>
  <template #more-actions="{ data }">
    <div class="dt-action-item" @click="toggleStatus(data)">
      <span class="material-symbols-outlined">
        {{ data.status ? 'toggle_off' : 'toggle_on' }}
      </span>
      <p>{{ data.status ? 'Deactivate' : 'Activate' }}</p>
    </div>
  </template>
</DataTable>
```

The `dt-action-item` class provides the consistent row layout used across all action menus.

---

## Fetch + Limit Handlers (Page Script Pattern)

```javascript
const limit = ref(10)

async function fetchItems(page = 1) {
  await store.fetchItems({ page, limit: limit.value })
}

async function changeLimit(newLimit) {
  limit.value = newLimit
  await fetchItems(1)
}

onMounted(() => fetchItems())
```

---

## See Also

- [[write-page]] — Composing a full list page with DataTable
- [[write-store]] — Building the Pinia store that feeds tableData and paginatedData
