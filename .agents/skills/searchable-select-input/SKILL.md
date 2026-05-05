---
name: searchable-select-input
description: Use the SearchableSelectInput component in ShopSynch — searchable dropdown with v-model, options formatting, error/hint display, and clear button
context: fork
---

# /searchable-select-input

Use `SearchableSelectInput` (`components/SearchableSelectInput.vue`) whenever you need a single-value select with search. It replaces plain `<select>` elements across the dashboard.

## Props

| Prop | Type | Required | Default | Notes |
|------|------|----------|---------|-------|
| `modelValue` | `string \| number` | Yes | — | v-model target |
| `options` | `{ label: string, value: string \| number }[]` | Yes | — | Array of label/value pairs |
| `label` | `string` | No | — | Field label rendered above the input |
| `placeholder` | `string` | No | `'Select an option'` | Shown when nothing is selected |
| `searchPlaceholder` | `string` | No | `'Search...'` | Search input placeholder |
| `error` | `string` | No | — | Red error text below; shown in place of hint |
| `hint` | `string` | No | — | Muted hint text below (only when no error) |
| `prefix` | `string` | No | — | Prefix text rendered inside the button on the left |
| `inputClass` | `string` | No | `''` | Extra CSS classes on the trigger button |
| `disabled` | `boolean` | No | `false` | Disables interaction and greys out |

Emits `update:modelValue` with the selected `value` (or `''` when cleared).

---

## Options Format

Options must be `{ label: string, value: string | number }`. Always map from store data in a computed:

```javascript
// Basic store list → options
const categoryOptions = computed(() =>
  categoryStore.categories.map((c) => ({ label: c.name, value: c.id }))
)

// Hide internal codes — show only the human label, keep code as value
const templateOptions = computed(() =>
  templates.value.map((t) => ({ label: t.label, value: t.code }))
)
```

Never expose internal codes or IDs as labels. The `label` is what the user reads; `value` is what gets bound to the model.

---

## Basic Usage

```vue
<SearchableSelectInput
  v-model="form.categoryId"
  label="Category"
  :options="categoryOptions"
  placeholder="Select a category"
  :error="errorStore.validationErrors?.categoryId"
/>
```

## Optional Field with Hint

```vue
<SearchableSelectInput
  v-model="form.parentId"
  label="Parent Category"
  :options="parentOptions"
  placeholder="Select parent (optional)"
  hint="Leave blank to create a top-level category."
/>
```

## Disabled State

```vue
<SearchableSelectInput
  v-model="form.linkedId"
  label="Linked Category"
  :options="systemOptions"
  :disabled="isEditing"
  placeholder="Select a pre-defined category"
/>
```

## Template Auto-fill Pattern

When selecting a template should pre-fill another field, bind the model and use a `watch`:

```javascript
const form = ref({ templateCode: '', message: '' })

watch(
  () => form.value.templateCode,
  (code, prevCode) => {
    const prev = templates.value.find((t) => t.code === prevCode)
    const current = templates.value.find((t) => t.code === code)
    if (!current) return
    // Only overwrite if field is empty or still holds the previous template value
    if (!form.value.message || form.value.message === prev?.message) {
      form.value.message = current.message
    }
  }
)
```

```vue
<SearchableSelectInput
  v-model="form.templateCode"
  label="Quick Templates"
  :options="templateOptions"
  placeholder="Search and select a template to auto-fill the note…"
  hint="Optional — selecting a template pre-fills the message below."
/>
<textarea v-model="form.message" ... />
```

---

## Validation Error from errorStore

```javascript
import { useErrorStore } from '~/stores/error.store.js'
const errorStore = useErrorStore()
```

```vue
<SearchableSelectInput
  v-model="form.bankCode"
  label="Bank"
  :options="bankOptions"
  placeholder="Select a bank"
  :error="errorStore.validationErrors?.bankCode"
/>
```

---

## See Also

- [[write-component]] — Creating new Vue components
- [[write-page]] — Composing components into pages
- [[write-store]] — Connecting to Pinia state
