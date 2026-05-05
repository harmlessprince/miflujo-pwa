---
name: capture-learning
description: Capture a learning into the MiFlujo knowledge base when an agent discovers a missing convention, corrects stale documentation, finds a new codebase pattern, or needs to preserve a project-specific rule for future sessions.
---

# /capture-learning

You are capturing a learning into the MiFlujo knowledge base.

Use this only for durable knowledge that would prevent future mistakes. Do not capture one-off debugging details, test failures, or facts already documented accurately.

## Step 1: State the Learning

Write the learning as one specific, actionable sentence.

Good: "Every Pinia store action that mutates data must call `toastStore.success()` or `toastStore.error()` — never surface raw error messages directly in a component."

Bad: "Stores should handle errors."

If the learning is vague, stop and refine it before editing any file.

## Step 2: Route to the Right File

| Learning Type | Target File |
|---|---|
| Critical rule every developer must know | `AGENTS.md` |
| Architecture rule, data flow, API service pattern, layer boundary | `CLAUDE.md` (Architecture section) |
| Design system: colors, typography tokens, component dimensions, error vs primary usage | `agents/knowledge/design-system-rule.md` |
| Form component rules — when to use existing primitives vs raw HTML | `agents/knowledge/form-components-rule.md` |
| Component responsibilities, use-when / don't-use-when rules | `agents/knowledge/form-components-rule.md` (extend) or new `agents/knowledge/component-rules.md` |
| Pinia store conventions, state shape, action patterns | `CLAUDE.md` (Stores section) or new `agents/knowledge/store-patterns.md` |
| Page structure, layouts, middleware, sidebar registration | `CLAUDE.md` (Pages section) or new `agents/knowledge/page-patterns.md` |
| Endpoint registry conventions, parameterized routes | `CLAUDE.md` (Data flow section) |
| Utility helper usage (`formatToMoney`, `logger`, `getPaginatedData`, etc.) | `CLAUDE.md` (Key Utilities section) |
| PWA, auth, or backend API contract rules | `CLAUDE.md` (Backend API Overview section) |
| Procedural steps for writing one component type | `agents/skills/write-<component>/SKILL.md` |
| New subsystem too large for an existing section | New MOC file in `agents/knowledge/` |

Routing hierarchy:

1. `AGENTS.md` for repo-wide must-know standards.
2. `CLAUDE.md` for architecture, data flow, and stack conventions — prefer extending an existing section over creating a new knowledge file.
3. `agents/knowledge/*.md` for deep-dive rules that are too long to live in `CLAUDE.md`.
4. `agents/skills/write-*/SKILL.md` only for procedural workflow steps.

Prefer the narrowest existing file that fits. Do not create a new knowledge file for a single rule that belongs in an existing section.

## Step 3: Check Existing Coverage

Read the target file and search for related terms.

- If already documented accurately, stop.
- If documented incompletely, extend the existing section.
- If documented incorrectly or stale, correct it in place.
- If absent, add a concise entry in the target file's existing style.

Do not duplicate the same knowledge in multiple places.

## Step 4: Write the Update

Match the target file's style exactly:

- Preserve frontmatter.
- Use the same heading levels and table/list style.
- Keep the statement specific to MiFlujo's Nuxt 4 / Vue 3 / TypeScript codebase.
- Include a small Vue/Nuxt example only when it clarifies a behavioral rule.
- Do not reference other projects (ShopSynch, FastAPI, etc.) — examples must apply to this repo.
- Do not modify application code while using this skill.

For changed patterns, update the stale entry instead of adding a contradictory duplicate. If an old pattern remains relevant historically, mark it clearly as deprecated.

## Step 5: Update Indexes When Needed

If you create a new MOC file under `agents/knowledge/`, document its existence in `CLAUDE.md` under the relevant section (or add an entry to an `agents/knowledge/index.md` if one is created).

If you add a new skill or change a skill's description, ensure `CLAUDE.md`'s Agent Skills table is kept in sync.

## Step 6: Verify and Commit

Before finishing:

- Confirm the learning is one specific rule.
- Confirm the target is the narrowest useful file.
- Confirm there is no duplicate coverage.
- Confirm only knowledge or skill files changed for this capture.
- Run a quick text search for stale terms if the learning corrected stale context.

If the user asked for a commit, stage only the knowledge/skill files changed and commit with:

```text
knowledge: <concise description of what was learned>
```

Never include application code changes in a knowledge commit.
