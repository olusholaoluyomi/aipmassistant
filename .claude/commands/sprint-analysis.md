# /sprint-analysis — Sprint Analysis Report

You are running the `/sprint-analysis` command for the AI PO Employee.

## What This Command Does

Scans the active Jira sprint for stale, blocked, unassigned, or overdue tickets and generates a prioritized sprint analysis report with health score and velocity tracking.

---

## Squad Resolution

Before doing anything else, resolve which squad to run this for:

1. If a squad key was passed as an argument (e.g., `/sprint-analysis CB`), use it.
2. If no key was given, check `.claude/agent-memory/po-employee/MEMORY.md` for the last active squad.
3. If still unknown, ask: "Which squad is this for? (PMRKT, CON, SMS, VC, JO, CB, AIS, ACX, UCCC, DENG, CI)"

Resolve the config file using the **Squad Resolution Table** in `CLAUDE.md`.

---

## Mode Detection

Check if a filter flag was passed:

- **`p0`** — Restrict all analysis to P0 and P1 tickets only. Skip P2/P3 entirely. Prepend `[P0/P1 MODE]` to the report title.
- No flag — Analyze all tickets in the active sprint.

---

## Instructions

1. Read the resolved squad config file to get the Jira project key, team members, and stale ticket threshold.
2. Read `.claude/agent-memory/po-employee/MEMORY.md` for previously noted recurring blockers.
3. Query Jira via Atlassian MCP for all tickets in the active sprint.
4. Calculate sprint velocity:
   - **Total story points** in sprint
   - **Points Done** (status = Done)
   - **% Complete** = Points Done / Total (as percentage)
   - **Days elapsed / Days remaining** in sprint (use sprint start/end dates from Jira)
   - **On track?** — Compare % complete vs % of sprint elapsed. Flag if completion % lags elapsed % by more than 15 points.
5. Identify issues (apply p0 filter if active):
   - **Stale tickets:** Status = "In Progress" with no update beyond threshold (from squad config, default 3 days)
   - **Blocked tickets:** Label = `blocked` or status = "Blocked"
   - **Unassigned tickets:** No assignee in current sprint
   - **Overdue tickets:** Past due date (if set)
   - **In Review too long:** Status = "In Review" for 2+ days with no comment
   - **DoR violations:** Tickets in "Ready for Sprint" or "To Do" missing any of: acceptance criteria, test approach, dependencies, risks, story points
   - **DoD violations:** Tickets moving toward Done without documentation link, test mention, or automation reference in description
6. Compute sprint health score:
   - Start at **Green**
   - Downgrade to **Amber** if: any P0/P1 blocked, velocity lagging, 3+ stale tickets, or 2+ DoR violations
   - Downgrade to **Red** if: P0 blocked 2+ days, velocity lagging by 20%+ with <50% sprint remaining, 5+ stale tickets, or critical DoD violations
7. Generate the report (omit any section where there are zero items):

```
## Sprint Analysis — [SQUAD_NAME] — [DATE]

### Health: [GREEN / AMBER / RED]
[One sentence explaining the health rating]

### Velocity
| Metric | Value |
|---|---|
| Total Points | X |
| Points Done | X |
| % Complete | X% |
| Sprint Progress | Day X of Y (X% elapsed) |
| On Track | Yes / At Risk / Behind |

### Summary
Stale: X | Blocked: X | Unassigned: X | Overdue: X | In Review (stale): X

### Stale Tickets
| Ticket | Title | Assignee | Days Since Update | Status | Recommended Action |
|---|---|---|---|---|---|

### Blocked Tickets
| Ticket | Title | Blocker Description | Owner | Days Blocked | Action Needed |
|---|---|---|---|---|---|

### Unassigned Tickets
| Ticket | Title | Priority | Story Points |
|---|---|---|---|

### Overdue / At Risk
| Ticket | Title | Due Date | Assignee | Days Overdue |
|---|---|---|---|---|

### DoR Violations
| Ticket | Title | Missing Criteria |
|---|---|---|

### DoD Violations
| Ticket | Title | Status | Missing Criteria |
|---|---|---|---|

### Recommended Actions
| Priority | Action | Owner | Channel |
|---|---|---|---|

### Needs PM Decision
- [items requiring PM call or escalation]
```

8. After generating the report, ask: "Should I draft follow-up messages for any of these items?"
9. If yes, draft concise follow-up messages (Teams/Slack format) for each stale or blocked ticket, referencing the ticket number and asking for a status update.
10. Update `.claude/agent-memory/po-employee/MEMORY.md` with any new recurring blocker patterns identified.

---

## Stale Threshold Logic

- Default: 3 days (from squad config)
- P0 tickets: 1 day threshold
- P1 tickets: 2 day threshold
- P2/P3 tickets: 3 day threshold

---

## Example Usage

```
/sprint-analysis
```

```
/sprint-analysis CB
```

```
/sprint-analysis p0
```
(focus only on P0 and P1 items)

```
/sprint-analysis PMRKT p0
```
