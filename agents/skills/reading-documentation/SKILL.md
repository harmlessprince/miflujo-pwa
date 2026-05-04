---
name: reading-documentation
description: Understand the ShopSynch Nuxt frontend project structure and standards
context: fork
---

# /reading-documentation

You are navigating the ShopSynch merchant dashboard project to understand its structure, patterns, and available tools.

## Checklist

- [ ] Start by reading `CLAUDE.md` in the project root for overall architecture and commands.
- [ ] Check `agents/knowledge/` for deep-dive documentation on specific systems.
- [ ] Review `utils/endpoints.js` to see all available API routes.
- [ ] Examine `tailwind.config.js` for the design system (colors, typography).
- [ ] Read `package.json` to understand dependencies and scripts.

## Key Resources

### 1. `CLAUDE.md`
The source of truth for project standards, build commands, and technical decisions. MUST be read first by any new agent.

### 2. `agents/knowledge/`
MOC (Map of Context) files that describe high-level systems:
- `component.md`: Frontend component hierarchy and purpose.
- `state-management.md`: How Pinia stores are structured and used.
- `api-integration.md`: Detailed guide on `useApiService` and fetch patterns.
- `design-system.md`: Tailwind configuration and visual tokens.


### 3. `CODEX.md` / `GEMINI.md`
Project-specific rules and context for different AI models.

### 4. API Documentation**:
  - Consulting internal API documentation at `/Users/harmlessprince/webprojects/shopsync/shopsynch_internall_docs/AllInOne.md`.
  - Reviewing `utils/endpoints.js` for a quick reference to all API routes and their purposes.

## How to Navigate

### Finding a Store
All stores are in `stores/` and follow the `<name>.store.js` naming convention.

### Finding a Component
Reusable UI components are in `components/`. Domain-specific components are grouped in subfolders (e.g., `components/Dashboard/`, `components/Form/`).

### Finding a Page
Nuxt pages are in `pages/`. The folder structure directly maps to the URL structure.

## Integration Example

"I need to understand how the login flow works":
1.  Check `pages/login.vue` for the form UI.
2.  Check `stores/auth.store.js` for the and `login` action.
3.  Check `utils/endpoints.js` for the `login` route.

## See Also
- [[write-store]] — Creating new state logic
- [[write-component]] — Creating new UI bits
