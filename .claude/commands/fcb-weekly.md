# /fcb-weekly — Customer Askings Weekly Review

You are running the `/fcb-weekly` command for the AI PO Employee.

## What This Command Does

Reviews the Customer Askings board (`FCB`) for the last weekly window, classifies each asking, and prepares PM-ready actions with a handoff to `/idea` for roadmap candidates.

---

## Instructions

1. Resolve the reporting window first.
   - Default timezone: `Asia/Dubai` (UAE).
   - Default window: last Friday 00:00 UAE to this Friday 00:00 UAE.
   - Ask only if PM wants a different window.
2. Ask the PM where to publish the summary:
   - `Confluence page`
   - `Local Markdown file (.md)`
   - If PM does not specify, default to `Local Markdown file (.md)`.
3. Query Jira via Atlassian MCP for `FCB` items created or updated in the window.
4. For each asking, extract at minimum:
   - issue key, summary, customer/account, current status, assignee/owner, updated date
   - linked `UFRF2` item (if any)
5. Classify each item into one recommendation:
   - `Roadmap candidate`
   - `Needs info`
   - `Duplicate likely`
   - `Not now`
6. Add explicit next action per class:
   - `Roadmap candidate`:
     - if no UFRF2 exists: `Run /idea` with a refined feature description
     - if UFRF2 exists but is incomplete: `Run /idea` to refine fields before planning
     - if UFRF2 exists and is ready: `Run /doc UFRF2-xxx`
   - `Needs info`: list missing info + owner + due date
   - `Duplicate likely`: include the likely duplicate key(s)
   - `Not now`: include reason and review date
7. Produce this output:

```markdown
## Customer Askings Weekly Review — [YYYY-MM-DD] (UAE)

### Executive Summary
- New/updated askings reviewed: X
- Roadmap candidates: X
- Needs info: X
- Duplicates likely: X
- Not now: X

### Recommendations
| FCB Key | Customer | Asking | Recommendation | Next Action | Confidence |
|---|---|---|---|---|---|

### Needs Info Queue
| FCB Key | Missing Info | Owner | Due Date |
|---|---|---|---|

### Candidate Handoffs
- [FCB-123] -> `/idea ...`
- [FCB-456] -> `/doc UFRF2-789`
```

8. Present an approval gate before any write action:
   - "Approve publish to [Confluence page / local .md file], edit draft, or cancel?"
9. If PM approves `Confluence page`:
   - publish under space `UPP` with title `Customer Askings Weekly Review - [YYYY-MM-DD]`
   - after publish, optionally post a Jira summary comment on the selected tracking issue and tag PMs using accountId-safe mentions (ADF mention nodes preferred).
10. If PM approves `Local Markdown file (.md)`:
   - write to `outputs/customer-askings-weekly-review-[YYYY-MM-DD].md`
11. Update `.claude/agent-memory/po-employee/MEMORY.md` with:
   - review date, reporting window, output destination, key recommendations, and proposed `/idea` handoffs.

---

## Guardrails

- Do not change Jira statuses automatically.
- Do not create UFRF2 items automatically from this command.
- Keep `/fcb-weekly` focused on review and recommendation; use `/idea` and `/doc` for execution flows.

---

## Example Usage

```
/fcb-weekly
```

Optional custom window:

```
/fcb-weekly 2026-02-20..2026-02-27 Asia/Dubai
```
