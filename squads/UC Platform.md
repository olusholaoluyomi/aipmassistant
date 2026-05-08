# SQUAD_CONFIG.md — UC Platform Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name             | UC Platform                                                                                                                           |
| Jira Project Name      | UC Platform                                                                                                                           |
| Jira Project Key       | UCCC                                                                                                                                  |
| Confluence Space Key   | UPP                                                                                                                                   |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                            |
| Confluence Parent Page | Product Experience — ID: [TBD — confirm page ID from UPP > Product Documentation > Product Experience]                               |
| Squad Mission          | Own the Unified Console (UC) platform layer — billing & charging, data & reporting, and core platform infrastructure for all squads. |
| Sprint Cadence         | 10 days                                                                                                                               |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                         |
| GPM                    | Ilma                                                                                                                                  |


---

## Team Members


| Name                  | Role                  | Jira Username / Email                    |
| --------------------- | --------------------- | ---------------------------------------- |
| Nour Eldin Abdelaal     | Product Manager       | nabdelaal@unifonic.com                                   |
| Ilma                  | Group Product Manager | [TBD]                                    |
| Ahmed Asghar Ali      | Dev Ops              | aasghar@unifonic.com                     |
| Filip Wozniak         | Engineer              | fwozniak@unifonic.com                    |
| Shahwana Fathima Umer | QA/SDET              | sfathima@unifonic.com                    |
| Manar Anan            | Engineer Tech Lead    | mgalal@unifonic.com                      |
| Kamil Chyrek          | Front End Engineer              | kchyrek@unifonic.com                     |
| Heba Abd El-Halim     | Engineer              | hhalim@unifonic.com                      |
| Alfarouk Sabry            | Engineer              | asabry@unifonic.com                      |
| Mohamed Sabry         | Engineer              | msabry@unifonic.com                      |


> Note: Roles sourced from Jira assignee data. Confirm seniority and QA/lead roles directly with the squad.

---

## Products Owned


| Product              | Description                                                                                          | Confluence Parent Page ID | Release Notes Page |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------- | ------------------ |
| UC (Unified Console) | Core admin and platform layer for all Unifonic products — account management, roles, and settings    | [TBD]                     | [TBD]              |
| Billing & Charging   | Subscription management, usage-based billing, invoicing, and payment integrations                    | [TBD]                     | [TBD]              |
| Data & Reporting     | Cross-product analytics, dashboards, and reporting infrastructure available to all squads and clients | [TBD]                     | [TBD]              |


---

## Jira Configuration


| Field                  | Value                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Project Key            | UCCC                                                                                                                                    |
| Project Full Name      | UC Platform                                                                                                                             |
| Active Sprint Board    | UC Platform Board                                                                                                                       |
| Issue Types            | Epic, Story, Technical Story, Task, Sub-task, Bug, Spike, Incident, Post-mortem action                                                  |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                                                                                      |
| Story Status Flow      | Backlog → Ready for Sprint → To Do → In Progress → PR Review → Ready for Integ Env Testing → Integ Env Testing → Preprod Testing → Done |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                                                          |
| Blocked Label          | `blocked`                                                                                                                               |


---

## Confluence Configuration


| Field                     | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Space Key                 | UPP                                              |
| Parent Page               | Product Experience — [TBD — confirm page ID]     |
| Release Notes Page        | [TBD]                                            |
| Sprint Review Parent Page | Sprint Reviews                                   |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)

> Not available — sprint data requires live query. Run `/daily UCCC` to get current sprint status.

### Key Stakeholders

- CPO — Strategic alignment
- All squad PMs — UC Console is shared platform infrastructure
- Finance / RevOps — Billing & Charging integrations
- Data team — Reporting infrastructure dependencies
- Engineering Lead — Platform architecture decisions

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


| Term             | Meaning                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| UC               | Unified Console — Unifonic's core admin and platform layer                                        |
| Billing          | Subscription and usage-based billing engine; tracks consumption per account                       |
| Charging         | Real-time charge processing and balance management for prepaid/postpaid accounts                  |
| Data & Reporting | Cross-product analytics layer; provides dashboards and exportable reports to clients and internal |
| MFE              | Micro-Frontend — modular UI architecture used across UC Console                                   |
| OCI              | Oracle Cloud Infrastructure — primary cloud platform for Unifonic                                 |
| IPO Readiness    | Platform compliance and auditability requirements tied to Unifonic's IPO trajectory               |
