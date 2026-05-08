# SQUAD_CONFIG.md — Agent Console Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name             | Agent Console                                                                                                                                        |
| Jira Project Name      | Chatbot                                                                                                                                              |
| Jira Project Key       | CB                                                                                                                                                   |
| Confluence Space Key   | UPP                                                                                                                                                  |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                           |
| Confluence Parent Page | Contact Center (Agent Console) — ID: 3101163521                                                                                                      |
| Squad Mission          | Build and maintain the Agent Console — empowering human agents with an AI-assisted live chat interface for efficient, high-quality customer support. |
| Sprint Cadence         | 10 days                                                                                                                                              |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                         |


---

## Team Members


| Name                      | Role                                  | Jira Username / Email                                         |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Berina Halilovic          | Product Manager                       | [bhalilovic@unifonic.com](mailto:bhalilovic@unifonic.com)     |
| Sergei Baldin             | Tech Lead                             | [sbaldin@unifonic.com](mailto:sbaldin@unifonic.com)           |
| Muhammad Mohsin           | Backend Engineering                   | [mmohsin@unifonic.com](mailto:mmohsin@unifonic.com)           |
| Nermin Karpandžić         | Backend Engineering                   | [nkarpandzic@unifonic.com](mailto:nkarpandzic@unifonic.com)   |
| Muhammad Usman            | Backend Engineering                   | [musman@unifonic.com](mailto:musman@unifonic.com)             |
| karim Abdelkareem         | Backend Engineering                   | [kabdelkareem@unifonic.com](mailto:kabdelkareem@unifonic.com) |
| Mohamed Adel              | Frontend Engineering                  | [mabdelnaby@unifonic.com](mailto:mabdelnaby@unifonic.com)     |
| Ebrahiem ElDosoky Mujahid | Frontend Engineering                  | [emohamed@unifonic.com](mailto:emohamed@unifonic.com)         |
| Adel Salim                | Engineering (QA / Automation)         | [adsalim@unifonic.com](mailto:adsalim@unifonic.com)           |
| Tayyab Liaqat             | Engineering (Infrastructure / DevOps) | [tliaqat@unifonic.com](mailto:tliaqat@unifonic.com)           |


---

## Products Owned


| Product       | Description                                                                                          | Confluence Parent Page ID |
| ------------- | ---------------------------------------------------------------------------------------------------- | ------------------------- |
| Agent Console | Human agent live chat interface — conversation routing, voice queue, CSAT, working hours, mobile app | 3101163521                |


---

## Jira Configuration


| Field                  | Value                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Project Key            | CB                                                                                                       |
| Project Full Name      | Chatbot                                                                                                  |
| Active Sprint Board    | CB Sprint Board                                                                                          |
| Issue Types            | Epic, Story, Technical Story, Spike, Bug, Technical Debt, Request, Incident, Sub-task, Retro improvement |
| Epic Labels            | [NOT FOUND — update manually]                                                                            |
| Active Labels          | Automation, voice_backend, Production_Review_Actions, Backend, feedbackCentralizationSheet               |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                                                       |
| Story Status Flow      | Not Ready → To Do → In Progress → Peer Review → Testing → Done                                           |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                           |
| Blocked Label          | `blocked`                                                                                                |


---

## Confluence Configuration


| Field                     | Value                                         |
| ------------------------- | --------------------------------------------- |
| Space Key                 | UPP                                           |
| Parent Page               | Contact Center (Agent Console) — `3101163521` |
| Mobile App Section        | Mobile App — `3101163536`                     |
| PVG Agent Chat Closure    | PVG Agent Chat Closure Process — `3109978113` |
| PVG Smart CSAT            | PVG Smart CSAT — `3110010881`                 |
| Sprint Review Parent Page | Sprint Reviews                                |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative                                       | Key Issues                | Owner                                             | Status      |
| ------------------------------------------------ | ------------------------- | ------------------------------------------------- | ----------- |
| AWS Migration — Chatbot & Agent Console services | CB-3557 to CB-3578        | Tayyab Liaqat                                     | Not Ready   |
| Push Notification Service (Mobile App)           | CB-3583, CB-3584, CB-3582 | Muhammad Mohsin                                   | In Progress |
| Voice Queue Settings                             | CB-3371, CB-3587, CB-3373 | Mohamed Adel / Muhammad Usman / Nermin Karpandžić | In Progress |
| Working Hours Schema Migration                   | CB-3544, CB-2406          | Sergei Baldin                                     | In Progress |
| Playwright E2E Automation                        | CB-3592, CB-3593, CB-3523 | Adel Salim                                        | In Progress |
| CoPilot AI Integration                           | CB-3585, CB-3591          | Ebrahiem ElDosoky Mujahid / Nermin Karpandžić     | Testing     |


### Current Sprint Snapshot


| Status      | Count |
| ----------- | ----- |
| Not Ready   | 25    |
| To Do       | 1     |
| In Progress | 7     |
| Peer Review | 3     |
| Testing     | 5     |
| Done        | 9     |


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


| Term           | Meaning                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------- |
| Agent Console  | Live chat interface for human agents to handle and manage customer conversations            |
| Chatbot        | AI-powered conversational bot builder — creates automated flows for customer interactions   |
| CoPilot        | AI assistant embedded in Agent Console to support agents with suggested replies and context |
| Human Handover | Transfer of a chatbot conversation to a live human agent based on rules or triggers         |
| Working Hours  | Configurable agent availability schedules used for routing, handover, and queue management  |
| CSAT           | Customer Satisfaction score — collected post-conversation via Smart CSAT feature            |
| PVG            | Product Validation Guide — internal Confluence document for feature review and sign-off     |
| Voice Queue    | CCaaS-linked queue configuration for routing voice calls to agents in Agent Console         |
| Mixpanel       | Product analytics platform tracking user interactions in Chatbot and Agent Console frontend |
| Debezium       | Change Data Capture tool used in the chatbot microservices stack for DB event streaming     |
| Automation     | Playwright-based E2E test automation — label used on all QA automation tickets              |
| MinIO          | Object storage used for media files — being replaced by OCI buckets                         |


