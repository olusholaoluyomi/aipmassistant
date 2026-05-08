# /setup-squad — Squad Configuration Generator & Refresher

You are running the `/setup-squad` command.

## What This Command Does

Automatically builds or refreshes a squad configuration file by querying Jira and Confluence.

- **New squad** → requires Jira project key + Confluence parent page URL → generates full draft → PM approves → files written
- **Existing squad** → requires Jira project key only → re-queries live data → shows only what changed as a diff → PM approves → files updated

Nothing is written until the PM explicitly approves.

---

## Instructions

1. Parse the command arguments:
   - **Arg 1** — Jira project key (e.g., `FLOW`)
   - **Arg 2** — Confluence parent page URL or ID (e.g., `https://unifonic.atlassian.net/wiki/spaces/UPP/pages/123456789/Flow+Studio`) — required for new squads only

2. Check if a squad config for this key already exists in `squads/*.md`:
   - **Existing config found → Refresh mode** — only the Jira key is needed. Confirm: "Found existing config for **[KEY]** — running refresh and checking for changes..."
   - **No config found → New Squad mode** — both inputs required. If the Confluence URL was not provided, ask for it before proceeding.

3. Hand off to the **squad-setup agent** to run the full workflow.

---

## Usage

### New Squad (both inputs required)
```
/setup-squad FLOW https://unifonic.atlassian.net/wiki/spaces/UPP/pages/123456789/Flow+Studio
```
Queries Jira + Confluence → builds full draft → presents for approval → writes `squads/Flow Studio.md`

You can also provide just the page ID if you know it:
```
/setup-squad FLOW 123456789
```

### Refresh Existing Squad (Jira key only)
```
/setup-squad PMRKT
```
Confluence page ID is read from the existing config file — no need to provide it again.

```
/setup-squad VC
```

---

## What the Diff Shows (Refresh mode)

```
## Refresh Summary — Campaigns & CDP — 2026-02-25

### Team Members
+ Added:   John Doe | Engineering | jdoe@unifonic.com
- Removed: Jane Smith | Engineering | jsmith@unifonic.com

### Active Initiatives
+ Added:   PMRKT-63 | New feature | Kamal Chidirala | To Do
- Removed: PMRKT-29 | Audience Release | Ahmad Alkhatib | Done

### Current Sprint Snapshot
  In Progress: 9 → 11
  Done: 1 → 3

### No changes detected in:
- Squad Identity, Products Owned, Jira Configuration, Confluence Configuration
```

If nothing changed:
```
No changes detected. Config is already up to date.
```

---

## What Gets Written (only after approval)

### New Squad
| File | Change |
|---|---|
| `squads/[Squad Name].md` | Created with full config |
| `CLAUDE.md` | One row added to **Squad Resolution Table** + Teams table + Product Org Structure category row updated |
| `README.md` | Squad added to Squads Configured table |
| `.claude/agents/po-employee.md` | Squad config path added to reference list |
| `.claude/agents/technical-writer.md` | Squad subsection added to Squad Products Reference |
| `.claude/commands/idea.md` | New row added to Product Area → Squad mapping table (for UFRF2 field context) |

> All commands (`/daily`, `/story`, `/sprint-analysis`, `/release-notes`, `/doc`) resolve squads from the **Squad Resolution Table** in `CLAUDE.md` — no changes needed to those command files for new squads.

### Refresh
| File | Change |
|---|---|
| `squads/[Squad Name].md` | Only changed sections updated |
| `CLAUDE.md` | Teams table row updated if PM or products changed; Product Org Structure updated if category changes |
| `README.md` | Squads Configured row updated if PM or products changed |
| `.claude/agents/technical-writer.md` | Squad subsection updated if products or Confluence IDs changed |

---

## Sections Never Auto-Updated

`DoR`, `DoD`, and `Squad Vocabulary` are never overwritten automatically — they require an explicit edit request.
