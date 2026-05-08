# /release-notes — Release Notes Generator

You are running the `/release-notes` command. This command orchestrates two agents:
- **po-employee** — pulls sprint data from Jira and pushes approved content to Confluence
- **technical-writer** — writes the release notes using Unifonic tone, templates, and terminology standards

---

## Workflow

### Step 0 — Squad Resolution

Before doing anything else, resolve which squad to run this for:

1. If a squad key was passed as an argument (e.g., `/release-notes CB`), use it.
2. If no key was given, check `.claude/agent-memory/po-employee/MEMORY.md` for the last active squad.
3. If still unknown, ask: "Which squad is this for? (PMRKT, CON, SMS, VC, JO, CB, AIS, ACX, UCCC, DENG, CI)"

Resolve the config file using the **Squad Resolution Table** in `CLAUDE.md`.

---

### Step 1 — Pull Jira Data (po-employee)

1. Read the resolved squad config file for the Jira project key, Confluence space, squad name, and sprint cadence.
2. Read `.claude/agent-memory/po-employee/MEMORY.md` for sprint context.
3. Query Jira via Atlassian MCP for all tickets in the most recently completed sprint with status = Done.
4. Also pull any tickets labeled `release-candidate` in the current active sprint.
5. For each ticket collect: summary, issue type, description, labels, linked epic.
6. Organize tickets into categories: Feature, Enhancement, Bug Fix, Infrastructure.
7. Also pull the top 2–3 highest-priority items from the backlog or current sprint as "Coming Next."

### Step 2 — Write Release Notes (technical-writer)

Pass the categorized ticket data to the **technical-writer agent** with this instruction:

> "Write customer-facing release notes for the [SQUAD_NAME] squad using the Unifonic release note template. Data: [paste categorized ticket list]. Apply full tone, terminology, and formatting standards. Audience: end users and Customer Success."

The technical-writer agent will produce the release notes using its full template and writing standards, including: What's New, Why It Matters, Who Is Affected, Known Issues, Coming Next.

### Step 3 — Review & Push (po-employee)

1. Present the draft to the PM for review.
2. Ask: "Should I push this to Confluence under Release Notes > [SQUAD_NAME]?"
3. If yes, create or update the Confluence page via Atlassian MCP using the Release Notes page ID from the squad config.
4. Update `.claude/agent-memory/po-employee/MEMORY.md` with the Confluence page link and sprint number.

---

## Example Usage

```
/release-notes
```

```
/release-notes sprint 14
```
(target a specific sprint by name or number)
