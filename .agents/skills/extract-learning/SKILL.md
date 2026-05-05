---
name: extract-learnings
description: Analyze the current conversation for friction and capture learnings into the MiFlujo knowledge base
---

# /extract-learnings

You are analyzing the current conversation for knowledge gaps. The user has invoked
this because they noticed friction — corrections, missing context, or wrong assumptions
that the agent should not have made.

## Step 1: Scan the Conversation for Friction

Review the full conversation history. Identify friction points — moments where the
user had to correct the agent or provide context the agent should have known.

**Strong signals (high-confidence learning):**
- User says "no", "not that", "wrong", "I meant", "actually"
- User corrects code that violated a MiFlujo design system or architecture rule
- User explains a domain rule or pattern the agent didn't follow (e.g., "use `formatToMoney`, not a raw template string")
- User provides context about how a store, service, or composable works
- Agent reached for a raw HTML element instead of an existing form primitive
- Agent used an arbitrary color/size instead of a design token

**Weak signals (investigate further):**
- Agent asks a question whose answer is in `CLAUDE.md` or a knowledge file
- Agent makes an assumption that turns out wrong
- Multiple back-and-forth turns on the same topic

**Not friction (ignore):**
- User correcting their own prompt (typo, changed requirements)
- User adding new requirements mid-conversation (scope change, not knowledge gap)
- Debugging an external API or third-party service
- User asking the agent to try a different approach (preference, not error)

If no friction is found, tell the user and stop.

## Step 2: Extract Learnings

For each friction point, extract a learning only if ALL of these are true:

1. **Generalizable** — would help any future session, not just this one
2. **Specific** — can be stated as a single, concrete rule
3. **Actionable** — an agent reading this rule would change its behavior
4. **Novel** — not already covered by `CLAUDE.md`, a knowledge file, or an existing skill

**Reject if any of these are true:**
- The root cause was failing to follow an existing skill's instructions (not a knowledge gap)
- The learning would be caught by running the code or checking the browser (execution issue)
- The learning restates what a knowledge file already documents accurately
- Removing one upstream mistake would eliminate the friction entirely

State each learning as a single sentence. Maximum 3 learnings per invocation.
Prioritize by impact.

## Step 3: Present Learnings to User for Routing

Before writing anything, show the user what you found. For each learning, propose
the most specific target file — use the routing table from `agents/skills/capture-learning/SKILL.md`,
defaulting to the narrowest scope that fits.

```
Friction points detected: N

Learning 1: [one-sentence rule]
  Friction: [what went wrong in the conversation]
  Root cause: [knowledge gap | execution failure | missing convention]
  Already documented?: [yes/no — where, if yes]
  Proposed target: [specific file path]
  Why this file: [one-line justification for the routing choice]

Learning 2: ...
```

Ask the user to confirm, redirect, or reject each learning. Wait for their response
before writing anything. The user knows which agents need which knowledge — trust
their routing judgment over the routing table when they override.

## Step 4: Capture Each Approved Learning

Read the capture-learning skill at `agents/skills/capture-learning/SKILL.md`.

For each approved learning, follow the capture-learning workflow:
1. Articulate the learning as a single specific rule (Step 1)
2. Route to the right file using the routing table (Step 2)
3. Check for existing coverage — skip if already documented (Step 3)
4. Write the update matching the target file's style (Step 4)
5. Register in index or `CLAUDE.md` if a new knowledge file was created (Step 5)

The capture-learning skill is the single source of truth for how learnings are
written. Follow it exactly.

## Step 5: Commit

After all updates, stage only the knowledge/skill files changed and commit:
- Message format: `knowledge: <concise description of what was learned>`
- Only include knowledge files in the commit — never application code files

## Constraints

- Do NOT extract learnings from the user correcting their own prompt
- Do NOT extract ephemeral details (specific variable names, one-off debugging steps)
- Do NOT modify application code — only knowledge and skill files
- If uncertain whether something is a real learning, skip it
- Always confirm with the user before writing (Step 3)
