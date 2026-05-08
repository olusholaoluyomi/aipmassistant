# /idea — Create a Roadmap Item in UFRF2

You are running the `/idea` command. Use this when a PM wants to create a new idea directly in the Unifonic Internal Roadmap (UFRF2) — without going through the FCB customer asking flow.

Agent used: **po-employee**

---

## Workflow

### Step 1 — Gather Feature Description

Take the description passed after `/idea`. If no description was given, ask:

> "Describe the feature or initiative you want to add to the roadmap."

Generate a proposed **title** (concise, max 10 words, outcome-focused — not a spec title).

---

### Step 2 — Top Feature Check

Ask the PM:

> "Is this a **Top Feature**? (Yes / No)
> Top Features are ideas with significant business impact that will be presented in Product Council or represent a major product outcome."

**If Top Feature = Yes:**
- The "Top Feature" checkbox field (`customfield_14149`) must be set to `1` on creation.
- **PVG is mandatory.** Do not make it optional. Enforce it explicitly.
- Before moving to Step 3, collect all details needed for the PVG:
  - Business problem and impact (quantified where possible)
  - Target user segments and personas
  - Key functionalities to be included
  - Expected business outcomes and success metrics
  - Dependencies and key risks
  - Rough timeline and delivery expectations
  
  Tell the PM:
  > "Since this is a Top Feature, a PVG document is required. Please provide as much detail as possible so I can generate a complete PVG. I'll need: the business problem, target users, key features, success metrics, and any known dependencies or risks."

  Do not proceed to Step 3 until sufficient detail is captured for a quality PVG.

**If Top Feature = No:**
- Top Feature checkbox is left unchecked.
- PVG is optional (asked at the end in Step 5).

---

### Step 3 — Generate Business Description (Mandatory for all ideas)

The description is **mandatory for all ideas** regardless of Top Feature status. It must be written in business language — not technical specs.

> **Note:** All metadata (status, roadmap quarter, PVG link, delivery dates, customer list) goes in dedicated JPD fields — not in the description.

Use the appropriate template based on Top Feature status:

---

#### If Top Feature = No → Template C (Brief)

A short description that gives anyone opening the idea an immediate understanding of what is being built and why. 3–5 sentences maximum.

```markdown
## What we're building
[1–2 sentences. What capability are we adding and what does it unlock?]

## Why
[1–2 sentences. What problem does it solve and who benefits? Include the source if known.]
```

---

#### If Top Feature = Yes → Template C (Full)

**Template C — UFRF2 Idea Description (audience: internal teams)**

> This description is written for internal readers — Sales, CS, Engineering, and Leadership. It answers: what are we building, why it matters commercially, who benefits, and what success looks like. No technical specs — those belong in the PVG.

```markdown
## What we're building
[1–2 sentences. Plain language. What capability are we adding and what does it unlock for our customers?
✅ "A native Adjust connector that streams mobile app events into Unifonic Audience, so customers can build mobile-informed segments and trigger journeys based on real-time app behavior."
❌ "Integrate Adjust API to ingest mobile events into the CDP schema."]

---

## The problem we're solving
[2–3 sentences describing the customer pain. Who is affected, what are they doing today as a workaround, and what is the consequence of not solving it? Write as if briefing a Sales or CS rep before a customer call.]

**Source:** [Customer name / FCB-xxx / Sales input / PM / CPO direction]

---

## Key use cases
| Use case | Who benefits | What changes |
|---|---|---|
| [e.g. Mobile onboarding journey] | [e.g. Retail marketing manager] | [e.g. WhatsApp triggered instantly on app install — no manual setup] |
| [e.g. Re-engagement campaign] | [e.g. CRM team] | [e.g. Segment lapsed app users and reach them via SMS without data exports] |
| [e.g. Cross-channel attribution] | [e.g. Analytics team] | [e.g. See which ad campaign drove the install and the first purchase in one view] |

---

## Value to Unifonic
- **Revenue / commercial:** [Deal blocker removed / upsell opportunity / new segment unlocked]
- **Competitive:** [Which competitors this closes the gap with]
- **Retention:** [Which customer segments this protects or deepens]
- **Strategic fit:** [Which H1 initiative or company pillar this supports — e.g. Agentic Marketing, CCaaS, mobile maturity]

---

## Success metrics
| Metric | Current | Target |
|---|---|---|
| [e.g. Customers with mobile data in CDP] | [e.g. 0] | [e.g. All Adjust-connected customers at GA] |
| [e.g. Mobile-triggered journeys in Flow Studio] | [e.g. Not supported] | [e.g. Available at launch] |

*If targets are not yet defined, note that baselines will be set during discovery.*
```

Present the generated description to the PM and ask for confirmation before proceeding.

---

### Step 4 — Collect Mandatory Fields

Collect all mandatory fields. Present them as a single grouped prompt so the PM can answer in one go. Provide your best guess for each based on the feature description, and ask the PM to confirm or correct.

#### Category (`customfield_11985`) — single-select, mandatory

| Option               | ID      | Products                                                                            |
| -------------------- | ------- | ----------------------------------------------------------------------------------- |
| `Engagement`         | `11529` | Flow Studio, Audience, MCC, Conversational AI, Chatbot, Agent Console, Integrations |
| `Channels`           | `11602` | Business Messaging (CON), SMS, Voice                                                |
| `Product Experience` | `11530` | UC Console, Billing & Charging, Data & Reporting (CI team)                          |
| `AI`                 | `11531` | AI/ML cross-cutting initiatives                                                     |

Use the Category to narrow down likely Product Area options in the next field.

#### Product Area (`customfield_11991`) — multi-select, mandatory

| Product Area Value                    | Squad Key | Category   |
| ------------------------------------- | --------- | ---------- |
| `Multi Channels Campaigns`            | PMRKT     | Engagement |
| `Audience`                            | PMRKT     | Engagement |
| `Flow Studio`                         | JO        | Engagement |
| `Agent Console`                       | CB        | Engagement |
| `Conversational AI`                   | AIS       | Engagement |
| `SMS`                                 | SMS       | Channels   |
| `CCaaS and Agent Console Integration` | CB        | Channels   |
| `WhatsApp` / `Business Messaging`     | CON       | Channels   |
| `Voice`                               | VC        | Channels   |
| `Agentic CX`                          | ACX       | AI         |

Show only the options relevant to the selected Category. If multi-squad (e.g. a cross-cutting feature), allow multiple selections.

For squad key → config file mapping, see the **Squad Resolution Table** in `CLAUDE.md`.

#### Feature Type (`customfield_12030`) — multi-select, mandatory

| Option                | ID      |
| --------------------- | ------- |
| `Feature development` | `11589` |
| `Tech Debt`           | `11590` |

#### Status — mandatory

The item will be created in `discovery` status by default (the initial Polaris workflow state). Ask the PM:

> "Should the status be set to **discovery** (default) or a different stage? Options: discovery, design, building, release."

Always capture this value explicitly and include it in the approval draft.
Note: status is set via workflow transition after creation if not discovery.

#### Project Start (`customfield_11983`) — mandatory

Ask for a month range: e.g. "February 2026" → convert to `{"start":"2026-02-01","end":"2026-02-28"}`.
Use the last day of the month for the end date.

#### Project Initial Delivery Date (`customfield_11984`) — mandatory

Same format as Project Start. Ask for the target delivery month/quarter.

#### Assignee — recommended

Default to the PM running the command. Ask: "Who is the PM owner? (default: you)"

#### Notify Users in Comment — optional

Ask:

> "Anyone to notify on this idea after creation? (names or emails, optional)"

If provided, resolve each person to Atlassian `accountId` before creating the comment.
Do not rely on plain `@name` text in comments for mentions.

---

### Step 5 — Present Full Draft for Approval

Show the complete idea card before creating anything:

```
Title:          [generated title]
Top Feature:    [Yes / No]
Description:    [generated description — full Template C]
Category:       [value]
Product Area:   [value(s)]
Feature Type:   [value]
Status:         [discovery / other]
Project Start:  [month range]
Delivery Date:  [month range]
Assignee:       [PM name]
PVG:            [Mandatory — will be created after item | Optional — to be created later]
```

Ask:

> "Should I create this idea in UFRF2? (approve / edit / cancel)"

Do NOT create anything until the PM explicitly approves.

---

### Step 6 — Create UFRF2 Item

Fetch the UFRF2 issue type metadata to resolve the exact field IDs for "Top Feature" and "PVG Link" if not already known, using `getJiraIssueTypeMetaWithFields` for project `UFRF2` issue type `11536`.

Create the issue via Atlassian MCP:

```json
{
  "project": { "key": "UFRF2" },
  "issuetype": { "id": "11536" },
  "summary": "[title]",
  "description": "[description]",
  "customfield_11985": { "id": "[category_id]" },
  "customfield_11991": [{ "id": "[product_area_id]" }],
  "customfield_12030": [{ "id": "[feature_type_id]" }],
  "customfield_11983": "{\"start\":\"YYYY-MM-DD\",\"end\":\"YYYY-MM-DD\"}",
  "customfield_11984": "{\"start\":\"YYYY-MM-DD\",\"end\":\"YYYY-MM-DD\"}",
  "assignee": { "accountId": "[pm_account_id]" },
  "[top_feature_field_id]": true  // only if Top Feature = Yes
}
```

If the PM requested a status other than discovery, transition the item after creation using the appropriate workflow transition.
If transition is unavailable, keep the current status and report that status update could not be applied.

---

### Step 6b — Add Optional Mention Comment

If notify users were provided in Step 4, add a Jira comment on the new UFRF2 item and mention them using Atlassian account IDs.

Use Atlassian Document Format (ADF) mention nodes (preferred), for example:

```json
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "FYI " },
          { "type": "mention", "attrs": { "id": "ACCOUNT_ID_1", "text": "@Display Name 1" } },
          { "type": "text", "text": " and " },
          { "type": "mention", "attrs": { "id": "ACCOUNT_ID_2", "text": "@Display Name 2" } },
          { "type": "text", "text": " - this idea is created and ready for review." }
        ]
      }
    ]
  }
}
```

Fallback only if ADF mention is unavailable in the MCP wrapper:
- Use Jira wiki mention format in comment text: `[~accountid:ACCOUNT_ID]`
- If accountId cannot be resolved, post a plain comment without mention and explicitly state which names could not be tagged.

---

### Step 6c — Confirm Final Status

After creation (and any transition), report the final status in the completion message:

`UFRF2-xxx created. Final status: [status].`

---

### Step 6d — Link to Delivery Epic or Story

After the UFRF2 item is confirmed created, ask:

> "Is there an existing Epic or Story on the squad board that delivers this idea? If yes, provide the ticket key (e.g. PMRKT-123) and I'll link it now."

**If the PM provides a ticket key:**
1. Verify the ticket exists via Atlassian MCP (`getJiraIssue`).
2. Create the link via `createIssueLink` with **exact direction**:
   ```json
   {
     "type": { "id": "10413" },
     "inwardIssue":  { "key": "[DELIVERY-EPIC-OR-STORY-KEY]" },
     "outwardIssue": { "key": "[UFRF2-xxx]" }
   }
   ```
   - `inwardIssue` = delivery Epic or Story (e.g. `ACX-135`)
   - `outwardIssue` = UFRF2 idea (e.g. `UFRF2-682`)
   - Direction must be exact — reversing inward/outward creates a broken or invisible link.
3. Confirm: `UFRF2-xxx linked to [TICKET-KEY] (is implemented by).`

**If no delivery ticket exists yet:**
- If Top Feature = Yes → skip this prompt (Step 7 will create the Epic via `/doc`).
- If Top Feature = No → tell the PM: "You can link a delivery ticket anytime by running `/idea` on the existing UFRF2 item, or create the Epic now via `/doc UFRF2-xxx`."

Do not block or delay the rest of the flow — this step is best-effort.

---

### Step 7 — Create PVG and Attach to Idea

**IMPORTANT:** Always use the `/doc UFRF2-xxx` PVG mode to generate the PVG. Never create the Confluence page manually — `/doc` uses the official PVG template (Problem Space + Solution Space) and handles Epic creation and Confluence parent page placement under the correct PVG folder (`3782836230`).

After the `/doc` flow completes and the Confluence page is created:
1. Retrieve the Confluence page URL from the `/doc` output.
2. Update the UFRF2 item: set `customfield_12129` ("Product value Guide (PVG)") to the Confluence page URL.
3. Confirm: `PVG created and linked to UFRF2-xxx: [Confluence URL]`

**If Top Feature = Yes (mandatory):**

Run `/doc UFRF2-xxx` PVG mode automatically using the new key. Do not ask — proceed directly.

**If Top Feature = No (optional):**

Ask:

> "Do you want to also create the Epic on the [SQUAD] board and publish a PVG to Confluence now?"

If yes → run `/doc UFRF2-xxx` PVG mode automatically, then attach the Confluence URL as described above.

If no → share the UFRF2 link and confirm they can run `/doc UFRF2-xxx` anytime.

---

## Example Usage

```
/idea Customers want to receive SMS delivery receipts in real time via webhook with retry support
```

```
/idea
Allow marketing managers to create reusable WhatsApp template libraries shared across sub-accounts
```

```
/idea VC
Add support for scheduled outbound IVR campaigns triggered from Flow Studio
```
