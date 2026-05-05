# Rule: Always Check for Existing Form Components

Before using any raw HTML form element (`<input>`, `<select>`, `<textarea>`, `<button>`), check whether a
purpose-built component already exists in `components/`.

## Available Form Components

| Raw element | Use instead | Path |
|---|---|---|
| `<input>` | `AppInput` | `components/AppInput.vue` |
| `<textarea>` | `BaseTextArea` | `components/BaseTextArea.vue` |
| `<select>` | `BaseSelectInput` | `components/BaseSelectInput.vue` |
| Searchable dropdown | `SearchableSelectInput` | `components/SearchableSelectInput.vue` |
| Submit/action button | `BaseButton` or `FormButton` | `components/BaseButton.vue`, `components/Form/FormButton.vue` |
| Form input (with vee-validate) | `FormInput` | `components/Form/FormInput.vue` |

## When a raw element IS acceptable

- Inside a component that is itself a form-primitive abstraction (i.e., you are building a new `AppInput`-level component).
- When the existing component provably cannot satisfy the requirement after checking its props.
- Quick prototype/spike code — leave a `// TODO: replace with AppInput` comment.

## How to apply

1. Read the component's props to confirm it covers the use case.
2. If it does, use it. If not, extend the component rather than reaching for a raw element.
3. When writing a new page or modal that has form fields, list the fields first and map each to a component before writing any markup.
