# SQUAD_CONFIG.md — Data Engineering Squad

---

## Squad Identity


| Field                  | Value                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Squad Name             | Data Engineering                                                                                                         |
| Jira Project Name      | Data Engineering                                                                                                         |
| Jira Project Key       | DENG                                                                                                                     |
| Confluence Space Key   | UPP                                                                                                                      |
| Confluence Space Name  | Unifonic Products Playbook                                                                                               |
| Confluence Parent Page | Data & Reporting — ID: [TBD — confirm page ID from UPP > Product Documentation > Data & Reporting]                      |
| Squad Mission          | Own the data platform infrastructure — pipelines, warehousing, reporting APIs, and data quality — that powers analytics, AI models, and product insights across Unifonic. |
| Sprint Cadence         | 10 days                                                                                                                  |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                             |


---

## Team Members


| Name                    | Role            | Jira Username / Email          |
| ----------------------- | --------------- | ------------------------------ |
| Maged Boutros      | Product Manager | [mboutros@unifonic.com]        |
| Ilma               | GPM             | [ihepic@unifonic.com]          |
| Talha Shafique          | Data Engineer        | tshafique@unifonic.com         |
| Mennatallah Abdelwahab  | Database Engineer        | mabdelwahab@unifonic.com       |
| Muhammad Waqas Dilawar  | Staff Engineer        | mwaqas@unifonic.com            |
| Awais Irshad Ali        | Data Engineer        | aali@unifonic.com              |
| Dino Dusek              | Data Engineering Manager        | ddusek@unifonic.com            |
| Bilal Ahmad             | Engineering Engineer        | bahmad@unifonic.com            |
| Muhammad Rehan     | QA/SDET        | mrehan@unifonic.com            |
| Benjamin Ibrulj    | Data Engineer        | bibrulj@unifonic.com           |


> Note: Roles sourced from Jira assignee data. Confirm seniority, lead, and QA roles directly with the squad.

---

## Products Owned


| Product             | Description                                                                                                   | Confluence Parent Page ID                                | Release Notes Page |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------ |
| Data Platform       | Core data infrastructure — ingestion pipelines, data warehouse, ETL/ELT processes, and data governance.       | [TBD — Data & Reporting page ID]                         | [TBD]              |
| Reporting APIs      | Internal and external APIs that expose aggregated data to the UC Console, product dashboards, and AI models.  | [TBD]                                                    | [TBD]              |
| Data & Reporting UC | Reporting and analytics surfaces within the Unified Console — campaign analytics, delivery reports, dashboards. | [TBD]                                                   | [TBD]              |


---

## Jira Configuration


| Field                  | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Project Key            | DENG                                                               |
| Project Full Name      | Data Engineering                                                   |
| Active Sprint Board    | Data Engineering Sprint Board                                      |
| Issue Types            | Epic, Story, Technical Story, Spike, Bug, Technical Debt, Sub-task |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                 |
| Story Status Flow      | Backlog → Ready for Sprint → To Do → In Progress → PR Review → Ready for Integ Env Testing → Integ Env Testing → Preprod Testing → Done |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                     |
| Blocked Label          | `blocked`                                                          |


---

## Confluence Configuration


| Field                     | Value                                        |
| ------------------------- | -------------------------------------------- |
| Space Key                 | UPP                                          |
| Parent Page               | Data & Reporting — [TBD — confirm page ID]   |
| Release Notes Page        | [TBD]                                        |
| Sprint Review Parent Page | Sprint Reviews                               |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)

> Not available — sprint data requires live query. Run `/daily DENG` to get current sprint status.

### Key Stakeholders

- CPO — Strategic alignment
- AI Model team — Data pipeline dependencies for RFM, Preferred Channel, and Best Time to Send models
- PMRKT squad — Audience/CDP data contracts and Tracardi event data
- ACX squad — Enrichment data consumed by Agentic Framework
- Engineering Leads — Data schema and API contracts

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


| Term           | Meaning                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| ETL/ELT        | Extract, Transform, Load / Extract, Load, Transform — data pipeline patterns used for ingestion and processing  |
| Data Warehouse | Centralized repository for structured, processed data used for analytics and reporting                           |
| Pipeline       | Automated data flow from source systems (Jira, platform events, channel APIs) through transformation to storage |
| Reporting API  | Internal API layer that exposes aggregated metrics and dimensions to UC Console and product dashboards           |
| OCI            | Oracle Cloud Infrastructure — primary cloud platform hosting Unifonic's data infrastructure                      |
| Data Quality   | Processes and checks that ensure accuracy, completeness, and consistency of data across the platform             |
| Schema         | Structural definition of a data model — used to align data contracts between squads and the AI Model team       |
