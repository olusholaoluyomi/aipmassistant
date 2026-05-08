# /doc — Feature Documentation Generator

You are running the `/doc` command. This command has two modes depending on the input:

- **PVG Mode** — triggered when input is a `UFRF2-xxx` key or URL. Fetches from the Unifonic Roadmap, generates a Product Value Guide (PVG), creates an Epic on the squad board, and publishes to Confluence.
- **Feature Doc Mode** — triggered for all other inputs (squad ticket ID, description, or feature name). Generates user-facing documentation for a squad feature.

Agents used:
- **po-employee** — Jira/Confluence operations, approval gates, memory updates
- **technical-writer** — writing documentation and PVGs using Unifonic standards

---

## Mode Detection (Step 0)

Check the argument passed after `/doc`:

- If it matches `UFRF2-\d+` or contains `unifonic.atlassian.net/browse/UFRF2-` → enter **PVG Mode**
- Otherwise → enter **Feature Doc Mode**

---

## PVG Mode — UFRF2 Roadmap Item → Epic + Confluence PVG

### Step 0 — Fetch UFRF2 Item

1. Extract the UFRF2 key from the argument (e.g., `UFRF2-677`).
2. Fetch the item via Atlassian MCP with `fields=["*all"]`.
3. Extract:
   - `summary` — feature title
   - `description` — existing description (may be sparse)
   - `customfield_11991` — **Product Area** (multi-select array, used to resolve squad)
   - `assignee` — PM owner
   - `issuelinks` — check for existing "Polaris work item link" (to avoid duplicate epics)
   - `status` — current roadmap status

### Step 1 — Squad Resolution from Product Area

Use the Product Area values from `customfield_11991` to resolve the squad. Cross-reference against the **Product Area → Squad Mapping** in `CLAUDE.md`. The Squad Resolution Table in `CLAUDE.md` has the corresponding config file for each key.

If the Product Area maps to a single clear squad, proceed. If ambiguous or missing, ask:
> "I couldn't determine the squad from the Product Area field. Which squad should own this Epic? (PMRKT, CON, SMS, VC, JO, CB, AIS, ACX, UCCC, DENG, CI)"

Read the resolved squad config file.

### Step 2 — Generate PVG Draft (technical-writer)

Pass the UFRF2 context to the **technical-writer agent** with the following instruction:

> "Write a Confluence Product Value Guide (PVG) page for a Unifonic feature. A PVG frames the feature through customer problems and business impact — not technical specs. It tells the story of the customer's pain and how this feature solves it. Use the PVG template below. Be specific and concrete — avoid filler. Base it on the UFRF2 context provided. Fill gaps with reasonable inferences based on Unifonic's CPaaS/AI CX platform context, and flag anything that needs PM input."

**PVG Template:**

```markdown
# 📝 PVG - [Feature Name]

---

### 1. Problem Space (The Why)

#### 🔍 Problem Statement

_What is the customer's challenge?_

[Describe the pain point from the customer's perspective. Who is affected (role, industry, company size), in what context, and what goes wrong today? Use concrete scenarios — reference known customer segments, FCB feedback, or industry patterns. Write in a way that makes a non-technical reader immediately understand the frustration.]

#### 📊 Problem Impact

_How does the problem affect the customer and the business?_

- [Operational impact — e.g., wasted supervisor time, manual workarounds, limits to scale]
- [Customer experience impact — e.g., delays, inconsistency, frustration, churn signals]
- [Business impact — e.g., missed revenue, competitive gap, compliance risk]
- [Unifonic impact — e.g., customer dissatisfaction, churn risk, upsell blocker]

---

### 2. Solution Space (The What)

#### 🎭 Narrative

_Pick one format that best brings the solution to life:_

**Option A — Customer Review Format**
> ⭐️⭐️⭐️⭐️⭐️
> [Write a 3-5 sentence first-person review from the perspective of a customer who just used this feature. Capture the emotional before/after and the specific value they got. Make it feel real and grounded in a realistic Unifonic customer scenario.]

**Option B — Objective Journalist Article Format**
> **[Feature Name]: [Brief Headline]**
>
> [2-3 paragraphs covering: what the feature does, key benefits with specifics, and honest considerations or trade-offs. Write in neutral, factual journalist style.]

**Option C — Press Release Format**
> **Unifonic Launches [Feature Name] to [Customer Outcome]**
>
> **Riyadh, Saudi Arabia – [Date]** — [Announcement paragraph. Key benefits paragraph. Spokesperson quote. Availability statement.]

#### ✨ Solution Summary

_How does your solution address the problem?_

[1-2 sentences describing the core mechanism of the solution — what it does and how it works at a high level.]

Expected outcomes:
- [Metric 1 — e.g., reduce manual review time by 60%]
- [Metric 2 — e.g., improve compliance detection rate by 30%]
- [Metric 3 — e.g., increase supervisor efficiency by 40%]

#### 🖼️ Customer Experience Summary

_Show how the solution will look or feel for the customer:_

[Walk through the end-to-end experience from the customer's point of view. What do they see, click, configure, or receive? Describe the key touchpoints and how the feature changes their day-to-day workflow.]

- **Screenshots/Diagrams:** _[Include 1-3 visuals if available. Otherwise note: To Be Added]_
- **Links to Additional Resources:** _[e.g., UX flows, Figma boards, Story Maps. Otherwise: To Be Added]_
```

### Step 3 — Approval Gate

Present to the PM:
1. The PVG draft
2. The proposed Epic title: `[Customer Asking] [Feature Summary]`
3. The target squad board

Ask:
> "Ready to execute? I will:
> 1. Create an Epic on [SQUAD] board titled '[EPIC TITLE]'
> 2. Link the Epic to UFRF2-xxx as a 'Polaris work item link' (is implemented by)
> 3. Publish this PVG to Confluence under UPP > PVGs > [Squad Name]
> 4. Add the Confluence link as a comment on UFRF2-xxx
>
> Approve, edit, or cancel?"

Do NOT proceed until PM confirms.

### Step 4 — Execute (po-employee)

Run all steps in sequence:

**4a. Create Epic on squad board**
- Project: squad Jira key (from squad config)
- Issue type: Epic
- Summary: `[Customer Asking] [Feature Summary]`
- Description: PVG content (markdown)
- Assignee: PM from UFRF2 item (if resolvable)

**4b. Link Epic to UFRF2**
- Create issue link of type `Polaris work item link` (link type ID: `10413`)
- Relationship: UFRF2-xxx `is implemented by` [NEW-EPIC-KEY]
- This mirrors the existing linking pattern used in UFRF2

**4c. Publish PVG to Confluence**
- Space: `UPP` (Unifonic Products Playbook)
- Parent: The main PVG folder ID is `3782836230`. Search Confluence for a child page/folder under `3782836230` with the squad name as title (e.g., `ancestor = 3782836230 AND title = "[Squad Name]"`). If found, use its ID as parent. If not found, use `3782836230` directly as the parent.
- Title: `PVG - [Feature Summary]`
- Content: PVG markdown from Step 2

**4d. Link Confluence page back**
- Add a comment on UFRF2-xxx: "PVG published: [Confluence page URL] | Epic created: [SQUAD-KEY]"
- Add a comment on the new Epic: "Roadmap item: [UFRF2-xxx link] | PVG: [Confluence page URL]"
- If PM asks to tag people in either comment, use mention-safe tagging:
  - Resolve each person to Atlassian `accountId`
  - Use ADF mention nodes (preferred), fallback `[~accountid:ACCOUNT_ID]`
  - Do not use plain `@name` text for notifying mentions

**4e. Update memory**
- Write to `.claude/agent-memory/po-employee/MEMORY.md`: UFRF2 key, Epic key, Confluence URL, squad, date

---

## Feature Doc Mode — Standard Documentation

### Step 0 — Squad Resolution

1. If a squad key or Jira ticket ID was passed (e.g., `/doc CB` or `/doc CB-123`), infer the squad from it.
2. If no key was given, check `.claude/agent-memory/po-employee/MEMORY.md` for the last active squad.
3. If still unknown, ask: "Which squad is this for? (PMRKT, CON, SMS, VC, JO, CB, AIS, ACX, UCCC, DENG, CI)"

Resolve the config file using the **Squad Resolution Table** in `CLAUDE.md`.

### Step 1 — Gather Context (po-employee)

1. Read the squad config for Confluence space key, squad name, and vocabulary.
2. Read `.claude/agent-memory/po-employee/MEMORY.md` for related feature context.
3. Take the feature name, description, or Jira ticket ID provided after `/doc`.
4. If no input was provided, ask: "Please describe the feature you want to document, or provide a Jira ticket ID."
5. If a Jira ticket ID was given, query via Atlassian MCP and extract: summary, description, acceptance criteria, labels, epic, assignee.
6. If a description was given, use it as-is.
7. Assemble a context package: feature name, what it does, who uses it, acceptance criteria (if available), known edge cases.

### Step 2 — Write Documentation (technical-writer)

First determine the doc type by asking if not obvious from context:
- **Template A** — New feature section inside an existing product page (e.g. adding "Smart Reply" under the Agent Console page)
- **Template B** — New standalone page (e.g. a new product area, admin guide, or integration setup)

Pass the context package to the **technical-writer agent** with the appropriate template below.

---

#### Template A — New Feature Section

Use when adding a feature section to an existing page.

```markdown
## [Feature Name]  🆕 New · v[X.X]

> 📘 **النسخة العربية:** لعرض هذا القسم باللغة العربية [اضغط هنا](#).

[Feature name] does [X] so that [agents / admins / customers] can [outcome].
It works by [brief mechanism — 1 sentence max].

| | |
|---|---|
| **Roles** | [Admin / Supervisor / Agent] |
| **Channels** | [WhatsApp / SMS / Voice / Chat] |

**Prerequisites** *(omit if none)*
- [Dependency 1]
- [Dependency 2]

**How to use [Feature Name]**

1. [Action verb] [where to navigate].
2. [Action verb] [what to click/select]. *(Screenshot)*
3. [Action verb] [field/option].
4. Click **[CTA button]**.

**Configuration options** *(omit if no admin-configurable settings)*

| Setting | Description | Default |
|---|---|---|
| [Setting name] | [What it controls] | [Default value] |

**Related**
- [Related article 1]
- [Related article 2]
```

---

#### Template B — New Standalone Page

Use when creating a net-new page.

```markdown
# [Page Title — plain language, not "Guide to..."]
*Last updated: [Month Year] · Role: [Who this is for]*

> 📘 **النسخة العربية:** لعرض هذه الصفحة باللغة العربية [اضغط هنا](#).

[Feature/topic] lets [audience] do [outcome].
This page covers:
- [Main topic 1]
- [Main topic 2]
- [Main topic 3]

| | |
|---|---|
| **Role required** | [Role] |
| **Channels** | [Channels or N/A] |

**On this page:** *(include for pages with 3+ sections)*
- [Section 1 title](#anchor1)
- [Section 2 title](#anchor2)
- [Section 3 title](#anchor3)

**Before you begin** *(omit for purely informational pages)*
- [Permission or role requirement]
- [Any prior setup step needed]

---

## [Section heading — action phrase] {#anchor1}

[1–2 sentence intro for this section]

1. [Action verb] [where to navigate].
2. [Action verb] [what to click/select]. *(Screenshot)*
3. Click **[CTA button]**.

---

## [Next section] {#anchor2}

[Steps or explanation]

---

## [Entity] Reference {#reference} *(omit if not applicable)*

| [Column 1] | [Column 2] | [Column 3] |
|---|---|---|
| [Row] | [Value] | [Value] |

---

## Troubleshooting {#troubleshooting} *(include for setup/config pages)*

**Q: [Common error or confusion]**
A: [Resolution in 1–2 sentences]

**Q: [Second common issue]**
A: [Resolution]

---

**Next step:** [Logical next action for this user]
**Related:** [Feature 1](#) · [Feature 2](#)
**API:** [Relevant API reference if applicable](#)
```

---

**Callout types — use these instead of plain-text warnings or tips:**
```
> ⚠️ **Warning:** [Irreversible actions, data loss risk, access removal]
> 💡 **Tip:** [Shortcuts, best practices, time-savers]
> 📘 **Note:** [Non-critical but useful clarifications]
> ❌ **Limitation:** [Known constraints or unsupported cases]
```

**Copy rules (both templates):**
- Open with a direct statement of value — never "In this section you will be acquainted with..."
- Every step starts with an action verb: Click, Select, Enter, Navigate
- Screenshots placed after the step where the UI changes — not grouped at the end
- Arabic callout is mandatory on every page/section
- Availability table: omit Plans row until Unifonic plan tiers are defined (Roles + Channels only)

### Step 3 — Review & Push (po-employee)

1. Present the draft to the PM for review.
2. Ask: "Should I push this to Confluence under Product Documentation > [SQUAD_NAME]?"
3. If yes, create the page via Atlassian MCP using the Confluence parent page ID from the squad config.
4. If a Jira ticket was the source, add the Confluence page link as a comment on the ticket.
   - If PM asks to tag people in that comment, apply the same mention-safe rules (`accountId` + ADF mention).
5. Update `.claude/agent-memory/po-employee/MEMORY.md` with the page title, Confluence link, and related Jira ticket.

---

## Example Usage

```
/doc UFRF2-677
```
(PVG mode — creates Epic on squad board + Confluence PVG)

```
/doc https://unifonic.atlassian.net/browse/UFRF2-663
```
(PVG mode — same as above, accepts full URL)

```
/doc PMRKT-142
```
(Feature Doc mode — generates user-facing doc from squad ticket)

```
/doc CB
WhatsApp campaign scheduling
```
(Feature Doc mode — generates doc from description)
