---
name: implement-design
description: Implement frontend designs with strict adherence to brand guidelines, design fidelity, and architectural principles
---

# Implement Design Skill

You are implementing a design into code while adhering to MiFlujo's Global Design Guidelines. Follow the step-by-step process below to ensure your implementation is consistent with our brand and UX principles.

You are acting as a Senior Frontend Engineer. Your task is to implement the following design request while strictly adhering to our **Global Design Guidelines**. Treat these rules as hard technical constraints:

### 1. Design Fidelity & Assets

- **Color Implementation:** Use strictly defined brand variables: in 'tailwind.config.ts'. Do not use default framework colors or 'vibrant' shades unless they match these hex codes exactly.
- **Typography:** Use Azo-Sans as the primary font and Roboto as secondary. Use a modular scale for spacing and font sizes to ensure a clean, mathematical hierarchy.
- **Design Tokens:** Map all colors to Tailwind configuration tokens (`text-primary`, `bg-navy`, `text-error`, etc.).

### 2. The 'Utility-First' Code Filter

- **Component Purge:** Do not generate code for decorative icons, 'coming soon' placeholders, or generic greeting text. If an element does not facilitate a user action or clarify a value proposition, exclude it from the DOM.
- **UX Logic:** Ensure all interactive elements have clear `:hover` and `:focus` states, but keep animations subtle and purposeful (e.g., a simple opacity transition rather than a bounce).
- **No Raw HTML Elements:** Never use raw `<input>`, `<select>`, `<textarea>`, or `<button>` elements. For form-primitive selection specifically, see `form-components-rule.md` and `component-rules.md`.

### 3. Architectural Requirements

- **Simplicity Over Complexity:** Build the interface for 'extreme UX'—minimize the number of clicks required to reach the core objective. Use a flat component structure where possible.
- **Responsive Integrity:** The design must remain straightforward and functional on all screen sizes without losing the brand's 'clean' identity.
- **API Integration:** All data fetching must go through `useApiService()` composable. Never call `$fetch` or `useFetch` directly.
- **State Management:** Use Pinia stores for shared state following the Setup API pattern.

### 4. Quality Checklist

Before providing the code, verify:

1. Are there any 'fluff' elements? (If yes, remove).
2. Is the copy direct and value-driven? (If no, rewrite).
3. Does the layout prioritize the primary user goal?
4. Are all form elements using established primitives?
5. Are all colors mapped to design tokens?
6. Does the component structure remain flat and simple?

## Pro-Tips for Implementation

### Define the Stack

When building for MiFlujo, always note: *"Build this using **Nuxt 4** and **Tailwind CSS**, ensuring all brand colors are mapped to Tailwind configuration tokens defined in `tailwind.config.ts`."*

### Specify Layout Patterns

If you prefer a specific look, use: *"Use a 'Refined Minimalist' layout—think Linear or Stripe's dashboard style—where borders are subtle and the content is the hero."*

### The "One Action" Rule

Apply this principle: *"Every view you generate should have exactly one primary 'Call to Action' (CTA). All other elements must support that CTA."*

### Brand Colors Reference

- **Primary:** `#ED2E23` (MiFlujo Red) - Use for primary CTAs, highlights
- **Secondary/Navy:** `#02163B` (Deep Navy) - Use for text, secondary elements
- **Accent:** `#CCCCCC` (Light Grey) - Use for borders, dividers, backgrounds
- **Error:** `#DC2626` (Red) - Use for validation errors and error states
- **Surface:** `#FCFCFC` (Off-white) - Use for app background

### Form Components Reference

| Use case | Component |
|---|---|
| Text input | `AppInput` |
| Textarea | `BaseTextArea` |
| Select/dropdown | `BaseSelectInput` |
| Searchable dropdown | `SearchableSelectInput` |
| Button/submit | `BaseButton` or `Form/FormButton` |
| vee-validate field | `Form/FormInput` |
| Data table | `DataTable` |

### Typography Scale Reference

Use named typography classes instead of arbitrary sizes:

- `text-display-lg` - Large display heading
- `text-headline-md` - Medium headline
- `text-title-sm` - Small title
- `text-body-md` - Medium body text
- `text-body-sm` - Small body text
- `text-data-mono` - Monospace for financial data (use `font-medium tabular-nums`)
- `text-label-caps` - Uppercase label text

### API & State Pattern

```js
// Always use useApiService() for API calls
const { get, post } = useApiService()
const response = await get(endpoints.bankStatements.list)

// Use Pinia stores for shared state
export const useBankStatementStore = defineStore('bankStatementStore', () => {
  const { get } = useApiService()
  const statements = ref([])
  
  async function fetchStatements() {
    const response = await get(endpoints.bankStatements.list)
    if (response?.data) statements.value = response.data
  }
  
  return { statements, fetchStatements }
})
```

## When to Use This Skill

Use this skill when:

- Implementing a new page or feature from a design mockup
- Building a dashboard view, form, or data table
- Creating reusable UI patterns that must align with brand guidelines
- Updating existing components to match design specifications

## When NOT to Use This Skill

- For debugging existing code (use codebase exploration tools)
- For refactoring without a design specification
- For general coding questions unrelated to UI implementation

## Key Constraints

🚫 **Never:**
- Use raw HTML form elements
- Hardcode URLs—use `endpoints` object from `utils/endpoints.js`
- Call API endpoints directly from components—use `useApiService()`
- Use arbitrary colors outside the brand palette
- Create decorative-only elements
- Use `console.log`—use `logger` from `utils/helpers.js`

✅ **Always:**
- Map colors to Tailwind tokens
- Use established form primitives
- Apply the "One Action" rule to each view
- Keep the component tree flat
- Follow the modular scale for spacing/sizing
- Document primary CTA per view

