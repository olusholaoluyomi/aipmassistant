# SQUAD_CONFIG.md — Flow Studio & Integrations Squad

---

## Squad Identity


| Field                                 | Value                                                                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name                            | Flow Studio & Integrations                                                                                                                               |
| Jira Project Name                     | Product Integrations                                                                                                                                     |
| Jira Project Key                      | JO                                                                                                                                                      |
| Confluence Space Key                  | UPP                                                                                                                                                      |
| Confluence Space Name                 | Unifonic Products Playbook                                                                                                                               |
| Confluence Parent Page — Flow Studio  | Flow Studio — ID: 896631191                                                                                                                              |
| Confluence Parent Page — Integrations | Integrations — ID: 1996423573                                                                                                                            |
| Squad Mission                         | Enable and scale journey automation and third-party integrations by building and maintaining Flow Studio's connector ecosystem and orchestration engine. |
| Sprint Cadence                        | 10 days                                                                                                                                                  |
| Story Point Scale                     | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                             |


---

## Team Members


| Name              | Role                                  | Jira Username / Email                                       |
| ----------------- | ------------------------------------- | ----------------------------------------------------------- |
| Olushola Oluyomi  | Product Manager                       | [ooluyomi@unifonic.com](mailto:ooluyomi@unifonic.com)                                       |
| Hayk Manasyan     | Engineering                           | [hmanasyan@unifonic.com](mailto:hmanasyan@unifonic.com)     |
| Nikola Stanojevic | Engineering                           | [nstanojevic@unifonic.com](mailto:nstanojevic@unifonic.com) |
| Asif Rehman       | Engineering Tech Lead                 | [arehman@unifonic.com](mailto:arehman@unifonic.com)         |
| Ahmed Mansour     | Frontend Engineering                  | [amansour@unifonic.com](mailto:amansour@unifonic.com)       |
| Muneeb Ur Rahman  | Engineering (Infrastructure / DevOps) | [murrahman@unifonic.com](mailto:murrahman@unifonic.com)     |
| Sumayya Shahzad   | Engineering (QA / Automation)         | [sshahzad@unifonic.com](mailto:sshahzad@unifonic.com)       |


---

## Products Owned


| Product      | Description                                                                                      | Confluence Parent Page ID |
| ------------ | ------------------------------------------------------------------------------------------------ | ------------------------- |
| Flow Studio  | Visual journey automation builder — flows, triggers, widgets, templates, and analytics           | 896631191                 |
| Integrations | Third-party connector platform — CRM, e-commerce, marketing tool integrations via API and events | 1996423573                |


---

## Jira Configuration


| Field                  | Value                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Project Key            | JO                                                                                    |
| Project Full Name      | Product Integrations                                                                  |
| Active Sprint Board    | JO Sprint Board                                                                       |
| Issue Types            | Story, Technical Story, Technical Debt, Bug, Spike, Request                           |
| Epic Labels            | [NOT FOUND — update manually]                                                         |
| Active Labels          | Production_Review_Actions                                                             |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                                    |
| Story Status Flow      | Not Ready → In Progress → Peer Review → Testing → PO Review → Released to Prod → Done |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                        |
| Blocked Label          | `blocked`                                                                             |


---

## Confluence Configuration


| Field                            | Value                                           |
| -------------------------------- | ----------------------------------------------- |
| Space Key                        | UPP                                             |
| Flow Studio Parent Page          | Flow Studio — `896631191`                       |
| Flow Studio Release Notes Page   | Flow Studio Release notes — `1949532251`        |
| Flow Studio Release Notes 2025   | Flow Studio Release Notes 2025 — `2889842690`   |
| Flow Studio Product Requirements | Product Requirements Flow studio — `1164148755` |
| Flow Studio Incidents & Issues   | FS Incidents & Issues — `2836725960`            |
| Integrations Parent Page         | Integrations — `1996423573`                     |
| Integrations Release Notes 2025  | Integrations Release Notes 2025 — `2877718559`  |
| Integrations Release Notes 2026  | Integrations Release Notes 2026 — `3678044228`  |
| Integrations Custom Connectors   | Custom Integrations — `2093777252`              |
| Integrations PRD                 | PRD Integrations Framework — `2353725763`       |
| Sprint Review Parent Page        | Sprint Reviews                                  |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative                                                   | Key Issues         | Owner                      | Status               |
| ------------------------------------------------------------ | ------------------ | -------------------------- | -------------------- |
| OCI Cloud Migration — Integrations                           | JO-3033, JO-3034 | Muneeb Ur Rahman           | In Progress          |
| Web SDK Onboarding                                           | JO-3109, JO-3110 | Ahmed Mansour, Asif Rehman | In Progress          |
| TikTok CAPI Implementation                                   | JO-3025           | Ahmed Mansour              | Peer Review          |
| Playwright E2E Test Migration                                | JO-3017, JO-3016 | Sumayya Shahzad            | In Progress          |
| Flow Execution Scalability (Active vs Historical separation) | JO-3040           | Hayk Manasyan              | In Progress          |
| Salla Integration Enhancements                               | JO-3123, JO-3029 | Nikola Stanojevic          | PO Review / Released |


### Current Sprint Snapshot


| Status           | Count |
| ---------------- | ----- |
| Not Ready        | 2     |
| In Progress      | 10    |
| Peer Review      | 5     |
| Testing          | 4     |
| PO Review        | 5     |
| Released to Prod | 6     |
| Done             | 2     |


### Key Stakeholders

- CPO — Strategic alignment
- Engineering Lead — Technical feasibility sign-off
- Customer Success — Adoption feedback
- Sales — GTM readiness

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


| Term                      | Meaning                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Flow Studio               | Visual journey automation builder for creating multi-step messaging and logic flows     |
| Integrations              | Platform for connecting external systems (CRM, e-commerce, marketing tools) to Unifonic |
| Connector                 | Pre-built integration between an external app and Flow Studio or Integrations platform  |
| CAPI                      | Conversion API — server-side event tracking for Meta and TikTok ad attribution          |
| Web SDK                   | JavaScript SDK for capturing and routing web events into Flow Studio workflows          |
| DLR                       | Delivery Receipt — sent back to integration partners after message delivery outcome     |
| Salla                     | Saudi e-commerce platform; primary commerce connector for Flow Studio triggers/actions  |
| Execution Log             | Record of a single flow instance run — used for audit, debugging, and replay            |
| Production_Review_Actions | Jira label for issues raised from production monitoring and SRE review                  |
| Kafka                     | Event streaming backbone used for high-volume integration event routing                 |
| OCI                       | Oracle Cloud Infrastructure — target cloud platform for ongoing service migrations      |
| Flow Builder              | Drag-and-drop visual canvas for constructing automation flows in Flow Studio            |


