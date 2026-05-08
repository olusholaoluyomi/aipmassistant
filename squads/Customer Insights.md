# SQUAD_CONFIG.md — Customer Insights Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name             | Customer Insights                                                                                                                                       |
| Jira Project Name      | Customer Insights                                                                                                                                       |
| Jira Project Key       | CI                                                                                                                                                      |
| Confluence Space Key   | UPP                                                                                                                                                     |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                              |
| Confluence Parent Page | Product Experience — ID: [TBD — confirm page ID from UPP > Product Documentation > Product Experience]                                                 |
| Squad Mission          | Own the data, reporting, and analytics layer of the Unifonic platform — giving customers and internal teams actionable visibility into platform usage and business outcomes. |
| Sprint Cadence         | 10 days                                                                                                                                                 |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                            |


---

## Team Members


| Name               | Role            | Jira Username / Email          |
| ------------------ | --------------- | ------------------------------ |
| Maged Boutros      | Product Manager | [mboutros@unifonic.com]        |
| Ilma               | GPM             | [ihepic@unifonic.com]          |
| Bilal Ahmad        | Engineer Manager| bahmad@unifonic.com            |
| Mahmoud Younes     | Engineer        | myounes@unifonic.com           |
| Muhammad Rehan     | QA/SDET        | mrehan@unifonic.com            |
| Pawel Furman       | Engineer Front End | pfurman@unifonic.com           |
| Manar Abu Alsoud   | Engineer        | melsayed@unifonic.com          |


> Note: Roles sourced from Jira assignee data. Confirm seniority, lead, and QA roles directly with the squad.

---

## Products Owned


| Product            | Description                                                                                      | Confluence Parent Page ID | Release Notes Page |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------- | ------------------ |
| UC Console         | Unified Console — core admin and platform management interface for Unifonic customers and admins | [TBD]                     | [TBD]              |
| Billing & Charging | Invoicing, usage metering, and charging management across all Unifonic products                  | [TBD]                     | [TBD]              |
| Data & Reporting   | Platform-wide analytics dashboards, usage reports, and data exports for customers and operators  | [TBD]                     | [TBD]              |


---

## Jira Configuration


| Field                  | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Project Key            | CI                                                                 |
| Project Full Name      | Customer Insights                                                  |
| Active Sprint Board    | CI Sprint Board                                                    |
| Issue Types            | Epic, Story, Technical Story, Spike, Bug, Technical Debt, Sub-task |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                 |
| Story Status Flow      | Not Ready → To Do → In Progress → PO Review → Testing → Done       |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                     |
| Blocked Label          | `blocked`                                                          |


---

## Confluence Configuration


| Field                     | Value                                                   |
| ------------------------- | ------------------------------------------------------- |
| Space Key                 | UPP                                                     |
| Parent Page               | Product Experience — [TBD — confirm page ID]            |
| Release Notes Page        | [TBD]                                                   |
| Sprint Review Parent Page | Sprint Reviews                                          |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative | Epic | Owner | Status |
| ---------- | ---- | ----- | ------ |
| [TBD — populate after first sprint query via `/daily CI`] | — | — | — |


### Current Sprint Snapshot

> Not available — sprint data requires live query. Run `/daily CI` to get current sprint status.

### Key Stakeholders

- CPO — Strategic alignment
- Ilma (GPM) — Product Experience category ownership
- Engineering Lead — Technical feasibility sign-off
- Customer Success — Adoption feedback and reporting requests
- Finance — Billing accuracy and invoicing requirements

### Definition of Ready (Story must have before sprint)

- Clear goal defined
- Acceptance criteria refined
- Dependencies noted
- Risks known
- Test approach noted
- Story points set

### Definition of Done

- Code Complete: Feature/bug is coded
- Code Review: Complete & approved
- Documentation: Technical and user docs updated
- Unit & Integration Tests: Implemented and passing
- Acceptance Testing (Local): TestRail cases executed locally and passed
- Acceptance Testing (Integration/Pre-Prod): Deployed and all acceptance tests pass
- Automated Coverage: API/E2E tests committed and passing in CI pipeline
- Production Verification: Smoke-tested on production

---

## Squad Vocabulary


| Term             | Meaning                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| UC               | Unified Console — Unifonic's core admin and platform layer used by customers and internal teams           |
| Billing          | Invoicing and usage metering module — tracks channel consumption and generates customer invoices           |
| Charging         | Real-time credit deduction and balance management for prepaid and postpaid accounts                        |
| Data & Reporting | Analytics and reporting layer — dashboards, usage exports, and scheduled reports for customers             |
| MFE              | Micro-Frontend — modular UI architecture used to compose the UC Console from independently deployed units |
| OCI              | Oracle Cloud Infrastructure — primary cloud platform hosting Unifonic services                            |
| IPO Readiness    | Internal compliance and auditability standard applied to billing, data, and platform features              |
