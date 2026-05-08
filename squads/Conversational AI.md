# SQUAD_CONFIG.md — Conversational AI Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name             | Conversational AI                                                                                                                                          |
| Jira Project Name      | Conversation AI                                                                                                                                            |
| Jira Project Key       | AIS                                                                                                                                                        |
| Confluence Space Key   | UPP                                                                                                                                                        |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                                 |
| Confluence Parent Page | Chatbot — ID: 1917845596                                                                                                                                   |
| Squad Mission          | Build and maintain the Chatbot Builder — enabling businesses to create AI-powered conversational bots with knowledge bases, personas, and automated flows. |
| Sprint Cadence         | 10 days                                                                                                                                                    |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                               |


---

## Team Members


| Name                   | Role                                  | Jira Username / Email                                     |
| ---------------------- | ------------------------------------- | --------------------------------------------------------- |
| Jessica Isah           | Product Manager                       | [jisah@unifonic.com](mailto:jisah@unifonic.com)           |
| Muhammad Faisal Yaseen | QA/SDET Engineering                   | [mfaisal@unifonic.com](mailto:mfaisal@unifonic.com)       |
| Mahmoud Mehisen        | Engineering                           | [mmehisen@unifonic.com](mailto:mmehisen@unifonic.com)     |
| Mohamed Elsayed Gad    | Frontend Engineering                  | [mgad@unifonic.com](mailto:mgad@unifonic.com)             |
| Emin Yuce              | Engineering                           | [eyuce@unifonic.com](mailto:eyuce@unifonic.com)           |
| Mahmoud Elbarbari      | AI / ML Engineering                   | [melbarbari@unifonic.com](mailto:melbarbari@unifonic.com) |
| Tayyab Liaqat          | Engineering (Infrastructure / DevOps) | [tliaqat@unifonic.com](mailto:tliaqat@unifonic.com)       |
| Aya Salama             | Engineering                           | [asalama@unifonic.com](mailto:asalama@unifonic.com)       |
| Nader Elagrody         | Engineering Tech Lead                 | [nelagrody@unifonic.com](mailto:nelagrody@unifonic.com)   |


---

## Products Owned


| Product         | Description                                                                                                    | Confluence Parent Page ID | Release Notes Page |
| --------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------ |
| Chatbot Builder | AI-powered conversational bot creation — flow builder, knowledge base, personas, widgets, and intent detection | 1917845596                | 1947697577         |


---

## Jira Configuration


| Field                  | Value                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Project Key            | AIS                                                                                                      |
| Project Full Name      | Conversation AI                                                                                          |
| Active Sprint Board    | AIS Sprint Board                                                                                         |
| Issue Types            | Epic, Story, Technical Story, Spike, Bug, Technical Debt, Request, Incident, Sub-task, Retro improvement |
| Active Labels          | [Update manually from active sprint labels]                                                              |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                                                       |
| Story Status Flow      | Not Ready → To Do → In Progress → PO Review → Testing → Done                                             |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                           |
| Blocked Label          | `blocked`                                                                                                |


---

## Confluence Configuration


| Field                     | Value                                  |
| ------------------------- | -------------------------------------- |
| Space Key                 | UPP                                    |
| Parent Page               | Chatbot — `1917845596`                 |
| Release Notes Page        | Release Notes — `1947697577`           |
| Requirements Page         | Chatbot Requirements — `1918074881`    |
| Functional Requirements   | Functional Requirements — `1921581253` |
| Ideation Page             | Ideation — `1917976577`                |
| Sprint Review Parent Page | Sprint Reviews                         |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative                       | Key Issues | Owner                  | Status      |
| -------------------------------- | ---------- | ---------------------- | ----------- |
| Website Knowledge Base Ingestion | —          | Emin Yuce              | In Progress |
| Knowledge Base Overview Page     | —          | Mohamed Elsayed Gad    | In Progress |
| Langfuse LLM Observability       | —          | Mahmoud Elbarbari      | In Progress |
| Intent Detection Improvements    | —          | Emin Yuce              | In Progress |
| Custom Summarizer                | —          | Pawel Furman           | In Progress |
| Automation Test Framework        | —          | Muhammad Faisal Yaseen | In Progress |


### Current Sprint Snapshot


| Status      | Count |
| ----------- | ----- |
| Not Ready   | 16    |
| To Do       | 1     |
| In Progress | 9     |
| PO Review   | 1     |
| Testing     | 3     |
| Done        | 6     |


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


| Term             | Meaning                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Chatbot Builder  | AI-powered bot creation tool — builds conversational flows, connects to knowledge bases, uses personas |
| Knowledge Base   | Document repository ingested and indexed for chatbot retrieval-augmented generation (RAG) responses    |
| Persona          | Configurable bot identity and tone profile applied to chatbot conversations                            |
| Intent Detection | ML model classifying user input into defined intents to trigger correct chatbot responses              |
| Langfuse         | LLM observability platform — tracks prompts, responses, latency, and quality metrics for AI features   |
| Flow Builder     | Visual conversation flow editor within Chatbot Builder for creating branching dialog trees             |
| Widget           | Embeddable chatbot UI component deployed on customer websites or apps                                  |
| Human Handover   | Transfer of a chatbot conversation to a live human agent based on rules or triggers                    |
| Automation       | Playwright-based E2E test automation — label used on all QA automation tickets                         |
| RAG              | Retrieval-Augmented Generation — knowledge base lookup pattern used in Chatbot Builder AI responses    |


