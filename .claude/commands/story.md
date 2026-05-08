# /story — User Story Generator

You are running the `/story` command for the AI PO Employee.

## What This Command Does

Generates properly formatted user stories with acceptance criteria from a feature description. Before generating, validates that the story is appropriately scoped, linked to an epic, and includes Mixpanel tracking where relevant. Optionally pushes approved stories to Jira.

---

## Squad Resolution

Before doing anything else, resolve which squad to run this for:

1. If a squad key was passed as an argument (e.g., `/story CB Allow agents to...`), use it.
2. If no key was given, check `.claude/agent-memory/po-employee/MEMORY.md` for the last active squad.
3. If still unknown, ask: "Which squad is this for? (PMRKT, CON, SMS, VC, JO, CB, AIS, ACX, UCCC, DENG, CI)"

Resolve the config file using the **Squad Resolution Table** in `CLAUDE.md`.

---

## Pre-Generation Checks

Before writing any story, run these checks in order. Surface all issues at once — do not ask one question at a time.

### 1. Necessity Check
Ask: does this actually need a user story right now?

- If the description is a spike, investigation, or research task — recommend creating a **Task** instead of a Story, and ask the PM to confirm.
- If the description is a vague initiative with no clear acceptance criteria possible — push back and ask the PM to sharpen the scope before proceeding.
- If the description duplicates a likely existing story — flag it and ask the PM to confirm it's not already tracked.

### 2. Size Check
Assess scope against these thresholds:

| Signal | Recommendation |
|---|---|
| Estimated 13+ story points | Recommend splitting into multiple stories |
| Covers more than one user type or flow | Recommend splitting |
| Requires more than 5 acceptance criteria to fully define | Recommend converting to an **Epic** and breaking into child stories |
| Spans multiple squads or systems | Recommend an Epic with cross-squad stories |

If the story is too large, **stop and tell the PM before generating.** Propose how to split it or offer to create an Epic instead. Do not generate an oversized story silently.

### 3. Epic Link Check
Before generating, ask: "Which Epic should this story be linked to? Provide the Epic ticket key (e.g. PMRKT-123) or tell me if one doesn't exist yet."

- If the PM provides an Epic key — look it up via Atlassian MCP to confirm it exists and is on the right board. Link the story to it on creation.
- If no Epic exists — ask: "Should I create an Epic for this first? If yes, give me a title and I'll create it before the story."
- Do not create the story without an Epic link unless the PM explicitly says to skip it.

### 4. Mixpanel Tracking Check
Assess whether the story introduces or modifies a user-facing feature, flow, or action that should be measured for adoption or usage.

Flag as **requires Mixpanel tracking** if the story involves:
- A new UI element, button, or screen
- A new user action or workflow step
- A new feature toggle or setting
- A flow the business cares about measuring (campaign creation, segment creation, chatbot interactions, etc.)

If tracking is required, add a **Mixpanel Events** section to the story (see output format).

---

## Instructions

1. Read the resolved squad config file to get squad context, Jira project key, story point scale, and vocabulary.
2. Read `.claude/agent-memory/po-employee/MEMORY.md` for previous context.
3. Take the feature description provided after `/story`.
4. If no description was provided, ask: "Please describe the feature or requirement you want to turn into a user story."
5. Run all **Pre-Generation Checks**. Surface all issues at once before proceeding.
6. Determine if the description covers one story or multiple — if multiple, split them.
7. For each story, generate using this exact format:

```
## User Story: [Title — Verb + Object + Context]

**As a** [user type]
**I want to** [action]
**So that** [outcome]

### Acceptance Criteria
- Given [context], when [action], then [result]
- Given [context], when [action], then [result]
- Given [context], when [action], then [result]
(minimum 3, maximum 5)

### Mixpanel Events
(include only if tracking is required — omit section otherwise)
| Event Name | Trigger | Properties |
|---|---|---|
| [event_name] | [what user action fires this] | [key properties to capture] |

### Definition of Done
- [ ] Code Complete: Feature/bug is coded
- [ ] Code Review: Complete & approved
- [ ] Documentation: Technical and user docs updated
- [ ] Unit & Integration Tests: Implemented and passing
- [ ] Acceptance Testing (Local): TestRail cases executed locally and passed
- [ ] Acceptance Testing (Integration/Pre-Prod): Deployed and all acceptance tests pass
- [ ] Automated Coverage: API/E2E tests committed and passing in CI pipeline
- [ ] Mixpanel events verified firing in staging (if applicable)
- [ ] Production Verification: Smoke-tested on production

### Story Points
Estimate: [1/2/3/5/8/13] — Rationale: [brief reason]

### Dependencies
- [dependency or "None"]

### Labels
[epic-label], [squad-label]
```

8. After generating stories, ask: "Should I push these to Jira as new tickets in the [SQUAD_NAME] backlog?"
9. If yes, ask which initial status should be used for new stories (default: `To Do`).
   - Example prompt: "What status should I set on creation? (default: To Do)"
   - If PM provides one status, apply it to all created stories unless they specify per-story statuses.
10. Create each story as a Jira issue via Atlassian MCP:
    - Issue type: Story
    - Project: from the squad config
    - Summary: story title
    - Description: full story text (Markdown)
    - Labels: from story
    - Story points: from estimate
    - Epic link: from the Epic key confirmed in Pre-Generation Check #3
11. If no Epic existed and PM agreed to create one — create the Epic first, then link stories to it.
12. If requested status is not the default initial workflow status, transition each created story to that status after creation.
    - If transition is unavailable, keep the current status and report which tickets could not be moved.
13. After creation, ask: "Do you want me to add a comment on any of these stories and tag people?"
    - If yes, run the same mention-safe workflow defined in `/comment`:
      - Resolve users to Atlassian `accountId`
      - Use ADF mention nodes (preferred) or `[~accountid:ACCOUNT_ID]` fallback
      - Never rely on plain `@name` text for notifying mentions
14. Report the created ticket IDs, Epic link, final statuses (and comment IDs if added) back to the PM.
15. Update `.claude/agent-memory/po-employee/MEMORY.md` with ticket numbers and titles.

---

## Output Standards

- User type must be specific (e.g., "marketing manager", "enterprise admin", "end customer") — never "user"
- Acceptance criteria must use Given/When/Then format
- Story titles must start with a verb (e.g., "Schedule", "View", "Filter", "Export")
- Story points must align with the scale in the squad config
- Flag any ambiguity in a "Needs PM Decision" section before generating
- Initial Jira status must be explicitly confirmed with PM (default `To Do`)
- If comment tagging is requested, mentions must use `accountId`-based Jira mention format
- Every story pushed to Jira must have an Epic link — no exceptions unless PM explicitly overrides

---

## Example Usage

```
/story Allow marketing managers to schedule WhatsApp campaigns in advance with timezone-aware delivery
```

```
/story
The CDP should support RFM segmentation so that our clients can target their highest-value customers automatically
```
