# /slavic-mode — PM Response Compression

Parse `$ARGUMENTS`:

- `off` → disable all compression; resume normal verbosity; confirm: "Slavic mode: off."
- `on` or no argument → activate `light` mode
- `light` → activate light mode
- `jira` → activate jira mode
- `wiki` → activate wiki mode
- `full` → activate full mode

Announce the active mode in one line and stay in it for the rest of this session:

| Mode | What's compressed |
|------|-------------------|
| light | Conversational responses only |
| jira | Conversational responses + Jira artifacts |
| wiki | Conversational responses + Confluence artifacts |
| full | Conversational responses + Jira + Confluence artifacts |

---

## Compression Rules

### Always active (light · jira · wiki · full)

**Response style**
- No preamble. No "Sure!", "Great!", "Of course!", "I'll help you with...". Start with the output.
- No trailing offers ("Let me know if you need anything else", "Feel free to ask").
- Don't restate the command or narrate what you're about to do.
- One sentence max per bullet. Two nesting levels max.
- Abbreviations in use: WIP = In Progress, ✓ = Done, ✗ = Blocked, AC = Acceptance Criteria, SP = Story Points, DoD = Definition of Done, DoR = Definition of Ready.

**Tables**
- Drop columns that are empty for every row.
- Truncate ticket summaries to 6 words max.
- Merge "Status" + "Notes" into one column if Notes only annotates Status.

**Digests — `/daily`, `/followup`**
- Sprint table: Key | Title | Status | Owner (drop all other columns unless blocked/escalation info would be lost).
- Decisions: one-line bullets, no context prose.
- Action items: `[OWNER] — [action] by [date]`.
- Section header "Needs PM Decision" → "Decide:".
- Section header "Recommended Actions" → "Actions:".

**Stories — `/story`**
- Keep As / I want / So that format intact — it's required for Jira.
- AC: condense each criterion to one line: `[context] → [action] → [result]`.
- DoD checklist: keep all 8 items, shorten each label to ≤5 words.
- "Story Points / Estimate" → "SP:".
- "Dependencies" → "Deps:".

**Roadmap + docs — `/idea`, `/doc`, `/rfo`**
- Drop intro/overview paragraph. Start directly with structured content.
- Section headers stay. Body text max 2 sentences per section.
- Background/context sections: 3 bullets max.

**Release notes — `/release-notes`**
- Drop narrative intro. Lead with the categorized bullet list.
- Category headers stay (Feature, Enhancement, Bug Fix, Infrastructure).
- Each item: one line — ticket key + what changed for the user.

**Market intel — `/market-intel`**
- Competitor entries: 2 bullets max each.
- Skip "No significant updates" entries entirely.
- MENA signals: combine into a single section if ≤3 items.

---

### Jira artifact compression — jira mode · full mode

Apply to all content written to Jira (issue descriptions, comments, AC fields, story bodies):

- AC lines: `G: [context] / W: [action] / T: [result]` — one line per criterion.
- Story description: 2 sentences max.
- Epic description: 1 sentence + bullet list of outcomes.
- Comments: bullets only, no pleasantries, no "Hi team".
- Labels and priorities: no explanatory prose attached.
- UFRF2 items: summary ≤10 words, description ≤3 bullets.

---

### Confluence artifact compression — wiki mode · full mode

Apply to all content written to Confluence pages:

- No "This document describes..." or "This page covers..." intros.
- No "Overview" section — merge its content into the first substantive section.
- Release note pages: bullet list first, no narrative preamble.
- PVG pages: Background max 3 bullets, Problem Statement max 2 sentences.
- Section intros removed — start each section with content, not a sentence describing the section.
- Tables of contents kept if the page has 5+ sections.

---

## Auto-clarity exceptions

Never compress in these situations regardless of mode:

- Before any write to Jira or Confluence — present the full draft for PM review first.
- When the PM signals confusion or repeats a question — switch to normal prose until clarified.
- RFO documents — always full format (incident details must not be abbreviated).
- `/rfo` command output — never compressed regardless of mode.

Resume compression after the exception resolves.

---

## Mode summary table

| Mode | Conversation | Jira artifacts | Confluence artifacts |
|------|:---:|:---:|:---:|
| off | — | — | — |
| light | ✓ | — | — |
| jira | ✓ | ✓ | — |
| wiki | ✓ | — | ✓ |
| full | ✓ | ✓ | ✓ |
