# /rfo — Reason For Outage Generator

You are running the `/rfo` command for the AI PO Employee.

## What This Command Does

Pulls data from a Jira incident or RCA ticket, drafts a structured RFO (Reason For Outage) document using the Unifonic RFO template, presents it for PM review, then publishes to Confluence and links back to the Jira ticket on approval.

---

## Instructions

### Step 1 — Get the Ticket ID

Extract the Jira ticket ID from the command argument (e.g., `/rfo PMRKT-51` → ticket is `PMRKT-51`).

If no ticket ID was provided, ask:
> "Please provide the Jira incident or RCA ticket ID (e.g., `/rfo PMRKT-51`)"

---

### Step 2 — Fetch Jira Ticket Data

Query the ticket via Atlassian MCP (`getJiraIssue`). Extract:

| Field | Source |
|---|---|
| Incident title | `summary` |
| Incident date | `created` or `customfield` if set |
| Outage type | Labels or description — map to: `Partial Outage` / `Major Outage` / `Unplanned Maintenance` / `Vendor or Third-Party Service Failure` |
| What happened | First paragraph of `description` or section titled "Summary" / "What happened" |
| Root cause | Section titled "Root cause" / "Root Cause Analysis" in description |
| Resolution | Section titled "Resolution" / "Fix" in description |
| Corrective actions | Section titled "Corrective actions" / "Action items" / "Follow-up" in description |
| Affected product | Infer from project key or labels (`mcc`, `audience`, `ulink`, `voice`) |
| Reporter | `reporter.displayName` |
| Assignee | `assignee.displayName` |

If any field cannot be extracted from the ticket, leave it as `[PLEASE FILL IN]` in the draft — do not guess.

---

### Step 3 — Determine Confluence Target

Based on the project key and affected product, select the correct RFO parent page:

| Project / Product | Confluence Parent Page ID |
|---|---|
| PMRKT — MCC | MCC RFOs — `2811428942` |
| PMRKT — Audience | Audience RFOs — `3447685164` |
| PMRKT — uLink / Smart Links | Issues & Incidents (MCC) — `2217607288` |
| CON — WhatsApp / Email / Push | Business Messaging parent — `3051159617` |
| SMS — SMS Gateway / API | SMS Unified parent — read from `squads/SMS.md` |
| VC — Voice | Voice parent page — `712114516` |
| JO — Flow Studio / Integrations | Flow Studio parent — `896631191` |
| CB — Agent Console | Agent Console parent — `3101163521` |
| AIS — Chatbot Builder | Chatbot parent — `1917845596` |
| Unknown | Ask PM: "Where should this RFO be published in Confluence?" |

---

### Step 4 — Draft the RFO

Generate the document using this exact format:

```
# Incident Report For [TITLE]

**Date:** [INCIDENT DATE]

---

## General Information

| Field | Value |
|---|---|
| Incident Date | [DATE] |
| Outage Type | [Partial Outage / Major Outage / Unplanned Maintenance / Vendor or Third-Party Service Failure] |
| Affected Product | [MCC / Audience / Smart Links / Voice] |

---

## What Happened

[Clear, customer-facing description of what the incident was and who was impacted.
Written in plain language — no internal jargon.]

---

## Root Cause

[Technical explanation of what caused the incident.
Be specific — avoid vague statements like "system issue".]

---

## Resolution

[What was done to restore service.
Include timeline if available: when detected, when resolved.]

---

## Corrective Actions

[What are the corrective actions taken based on the RCA. If there is no info in the RCA just mention. No information found in RCA and mention this to the PM]

---

## Customer Assurance

[this is an example on what to put in this section something like: We sincerely apologize for the inconvenience caused. Unifonic remains committed to the highest standards of reliability and transparency. Our teams are actively implementing preventive measures]

---
---
```

---

### Step 5 — Present Draft for Review

Show the full RFO draft. Then ask:

> "Please review this RFO for **[TICKET-ID] — [TITLE]**.
>
> Any fields marked `[PLEASE FILL IN]` need your input before publishing.
>
> - **Approve** — I'll publish to Confluence and link back to the Jira ticket
> - **Edit [section]** — Tell me what to change and I'll update the draft
> - **Discard** — Cancel without publishing"

---

### Step 6 — On Approval, Publish

Only after explicit PM approval and all `[PLEASE FILL IN]` fields are resolved:

1. **Create Confluence page** via Atlassian MCP:
   - Title: `RFO — [TITLE] — [DATE]`
   - Parent: the page ID from Step 3
   - Body: the approved RFO content (Markdown format)
   - Space: `UPP`

2. **Link back to Jira ticket** — add a comment to the Jira ticket:
   ```
   RFO published: [Confluence page URL]
   ```
   - If PM asks to tag people in this comment, use mention-safe tagging:
     - Resolve users to Atlassian `accountId`
     - Use ADF mention nodes (preferred), fallback `[~accountid:ACCOUNT_ID]`
     - Never rely on plain `@name` text for notifying mentions

3. **Remind the PM:**
   > "RFO published to Confluence. Reminder:
   > - Share with Product Director for review
   > - Export as Word/PDF and upload to SharePoint: Incident Management folder
   > - Link in the Customer Support ticket if applicable"

---

### Step 7 — On Edit Request

Update only the requested section. Re-show the updated draft. Do not publish until the PM approves the final version.

---

## Outage Type Mapping

Use these rules to infer the outage type from ticket labels or description keywords:

| Signal | Outage Type |
|---|---|
| `partial-outage`, degraded, some users affected | Partial Outage |
| `major-outage`, full down, all users affected, P0 | Major Outage |
| `maintenance`, planned, migration, upgrade | Unplanned Maintenance |
| `vendor`, third-party, SendGrid, Twilio, AWS, OCI | Vendor or Third-Party Service Failure |
| Cannot determine | `[PLEASE FILL IN]` |

---

## Writing Standards

- All sections written in **plain English** — customer-facing tone
- **What Happened** and **Resolution**: past tense, factual, no blame
- **Root Cause**: specific and technical — avoid "human error" without elaboration
- **Corrective Actions**: must be actionable with a named owner — never vague
- No internal ticket IDs or Jira URLs in customer-visible sections (except the header)
- Run a mental grammar check — the template note recommends Grammarly before sharing
