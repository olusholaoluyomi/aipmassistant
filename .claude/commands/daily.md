# /daily — Daily Standup Digest

You are running the `/daily` command for the AI PO Employee.

## What This Command Does

Combines a pasted Copilot meeting summary with live Jira sprint data to produce a structured daily standup digest.

---

## Squad Resolution

Before doing anything else, resolve which squad to run this for:

1. If a squad key was passed as an argument (e.g., `/daily CB`), use it.
2. If no key was given, check `.claude/agent-memory/po-employee/MEMORY.md` for the last active squad.
3. If still unknown, ask: "Which squad is this for? (PMRKT, CON, SMS, VC, JO, CB, AIS, ACX, UCCC, DENG, CI)"

Resolve the config file using the **Squad Resolution Table** in `CLAUDE.md`.

---

## Instructions

1. Read the resolved squad config file to get the Jira project key, Confluence space, and squad context.
2. Read `.claude/agent-memory/po-employee/MEMORY.md` for previous context.
3. If the user has pasted a Copilot meeting summary in this message, parse it. If not, ask: "Please paste the Copilot meeting summary from today's standup, or type 'skip' to generate a digest from Jira only."
4. Query Jira via Atlassian MCP for the active sprint using the project key from the squad config.
5. Pull all tickets in the active sprint with their: status, assignee, priority, last update date, and any `blocked` labels.
6. Cross-reference the meeting summary (if provided) with ticket statuses to surface discrepancies.
7. Produce the daily digest in this format:

```
## Daily Standup Digest — [SQUAD_NAME] — [DATE]

### Sprint Progress
| Ticket | Title | Status | Owner | Story Points | Notes |
|---|---|---|---|---|---|

### Sprint Metrics
- Total tickets: X | Done: X | In Progress: X | To Do: X | Blocked: X
- Story points: X burned / X total

### Decisions Made (from meeting)
- [decision or "None noted"]

### Blockers
| Ticket | Blocker | Owner | Days Blocked |
|---|---|---|---|

### Action Items
| # | Action | Owner | Due |
|---|---|---|---|

### Needs PM Decision
- [item or "None"]
```

8. After generating the digest, ask: "Should I update the sprint notes in Confluence?"
9. If yes, push the digest to the Sprint Reviews section in Confluence (space and parent page from the squad config).
10. Update `.claude/agent-memory/po-employee/MEMORY.md` with the squad key used, any decisions, and blockers surfaced.

---

## Example Usage

```
/daily

[Paste Copilot meeting summary here]
```

or

```
/daily skip
```
(generates digest from Jira data only)
