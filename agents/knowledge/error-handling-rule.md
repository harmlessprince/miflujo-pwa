# Rule: Use Stores for User-Facing Errors

Do not throw errors for expected user-facing validation, blocked actions, or business-rule feedback.

## Use the right store

- Use `toastStore.error(...)` for quick attention calls: short messages that tell the user something failed or an action is not allowed.
- Use `errorStore` when the user needs to see the error for longer, or when the message is detailed and may take time to read or understand. These errors should be shown in the UI.

## Vue component API calls

Do not wrap API calls in `try/catch` inside Vue components.

API failures are handled globally by `plugins/fetch-interceptor.client.ts`, which updates `errorStore`, shows toast errors, handles auth redirects, and processes validation/server errors.

## Expected validation flow

For expected UI or business-rule validation:

1. Check the condition before making the API call.
2. Show feedback with `toastStore.error(...)` or `errorStore`.
3. Return early.

Do not use `throw new Error(...)` for these cases.
