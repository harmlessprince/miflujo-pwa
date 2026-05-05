# Rule: Vue Component Conventions in MiFlujo

Deep-dive rules for creating and composing Vue components. For form-primitive
selection specifically, see `form-components-rule.md`.

---

## Folder structure

| Component type | Location |
|---|---|
| Base / reusable UI (inputs, buttons, modals, drawers) | `components/` (root) |
| Domain-specific (tied to a feature) | `components/<Domain>/` (e.g., `components/Dashboard/`) |
| Form primitives and vee-validate wrappers | `components/Form/` |
| Table and data-display components | `components/table/` |

Use PascalCase for file names: `StatementCard.vue`, not `statement-card.vue`.

---

## Required script shape

Every component uses `<script setup>` with explicit `defineProps()` and `defineEmits()`.
Never use the Options API.

```vue
<script setup>
const props = defineProps({
  statement: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'delete'])
</script>
```

Always declare a `default` for optional props. Never use props without declaring them.

---

## When to create a new component vs extend an existing one

Create a new component when:
- The UI block is reused in two or more pages or features.
- The block has its own local state that shouldn't live in a store.
- Extracting it makes the parent template meaningfully shorter.

Extend an existing component (add props/slots) when:
- The new variant is clearly a specialization of the existing one.
- The existing component covers 80%+ of the new requirement.

Do NOT create a new component just to wrap a single design-system element with
one extra class — use Tailwind utility classes in the parent template instead.

---

## Tabular / list data: always use `DataTable`

For any view that renders a paginated list of records, use `DataTable`
(`components/table/DataTable.vue`). It provides:
- Loading skeleton rows
- Empty-state slot
- Pagination controls driven by metadata from `getPaginatedData()`
- Action menus per row

Do not build a custom table loop when `DataTable` covers the requirement.

---

## Icons

Use Material Symbols exclusively: `<span class="material-symbols-outlined">icon_name</span>`.
Do not import SVG icons inline or use a different icon library.

---

## Slots

Prefer named slots over deeply nested prop drilling when a component needs to
accept arbitrary child content in multiple regions.

```vue
<!-- in the component template -->
<slot name="header" />
<slot />          <!-- default slot for body content -->
<slot name="footer" />
```

---

## Style rules inside components

- Use Tailwind utility classes only — no `<style>` blocks unless a third-party
  library forces it.
- Never use `scoped` CSS that conflicts with design tokens.
- All color, spacing, and typography must use MiFlujo tokens (see
  `agents/knowledge/design-system-rule.md`).

---

## Do not access stores directly in base components

Base components in `components/` must be pure (props in, events out). They should
not import or call Pinia stores. Domain components in `components/<Domain>/` may
call stores but should do so sparingly — prefer receiving data via props from the
parent page.
