# SQUAD_CONFIG.md — Agentic CX Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name             | Agentic CX                                                                                                                                                                        |
| Jira Project Name      | Agentic CX                                                                                                                                                                        |
| Jira Project Key       | ACX                                                                                                                                                                               |
| Confluence Space Key   | UPP                                                                                                                                                                               |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                                                        |
| Confluence Parent Page | Agentic AI — ID: [TBD — confirm page ID from UPP > Product Documentation > Agentic AI]                                                                                            |
| Squad Mission          | Build the Agentic CX Platform — the scalable agent orchestration framework and AI agents that power campaign creation, audience enrichment, and marketing automation at Unifonic. |
| Sprint Cadence         | 10 days                                                                                                                                                                           |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                                                      |


---

## Team Members


| Name          | Role            | Jira Username / Email                                 |
| ------------- | --------------- | ----------------------------------------------------- |
| Jessica Isah  | Product Manager | [jisah@unifonic.com](mailto:jisah@unifonic.com)       |
| Sameh Tawfeek | Engineering     | [stawfeek@unifonic.com](mailto:stawfeek@unifonic.com) |
| Muhammad Ijaz | Engineering     | [mijaz@unifonic.com](mailto:mijaz@unifonic.com)       |


> Note: Several epics are currently unassigned. Team membership should be updated once engineering assignments are confirmed.

---

## Products Owned


| Product               | Description                                                                                                                           | Confluence Parent Page ID  | Release Notes Page |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------ |
| Agentic CX Framework  | Scalable agent orchestration layer. Hosts all AI agents and MCP tools. Designed to plug in new use cases without rebuilding the core. | [TBD — Agentic AI page ID] | [TBD]              |
| Campaign Intent Agent | Converts natural language marketing goals into structured, validated campaign briefs (goal, KPIs, audience, channel, brand tone).     | [TBD]                      | [TBD]              |
| MCP Tools (MCC)       | Exposes MCC functionality (campaigns, audiences, segments) as MCP tools consumable by AI agents.                                      | [TBD]                      | [TBD]              |


---

## Jira Configuration


| Field                  | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Project Key            | ACX                                                                |
| Project Full Name      | Agentic CX                                                         |
| Active Sprint Board    | ACX Sprint Board                                                   |
| Issue Types            | Epic, Story, Technical Story, Spike, Bug, Technical Debt, Sub-task |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                 |
| Story Status Flow      | Not Ready → To Do → In Progress → PO Review → Testing → Done       |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                     |
| Blocked Label          | `blocked`                                                          |


---

## Confluence Configuration


| Field                     | Value                                |
| ------------------------- | ------------------------------------ |
| Space Key                 | UPP                                  |
| Parent Page               | Agentic AI — [TBD — confirm page ID] |
| Release Notes Page        | [TBD]                                |
| Sprint Review Parent Page | Sprint Reviews                       |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative                                   | Epic    | Owner        | Status      |
| -------------------------------------------- | ------- | ------------ | ----------- |
| Campaign Intent Agent                        | ACX-129 | Jessica Isah | In Progress |
| Campaign Segment Agent                       | ACX-134 | Jessica Isah | To Do       |
| Campaign Analytics Agent                     | ACX-139 | Jessica Isah | To Do       |
| Campaign Content Generation Agent            | ACX-135 | Jessica Isah | To Do       |
| Brand Tone Governance                        | ACX-114 | Jessica Isah | To Do       |
| Campaign Lifecycle State Management          | ACX-115 | Jessica Isah | To Do       |
| Framework Architecture & Builder V1          | ACX-45  | Unassigned   | To Do       |
| Ecosystem Integration & Data Readiness (MCP) | ACX-62  | Unassigned   | To Do       |
| Multi-Agent Orchestration & Interoperability | ACX-64  | Unassigned   | To Do       |
| Cognitive Capabilities & AI Governance       | ACX-63  | Unassigned   | To Do       |
| Agentic AI Observability                     | ACX-126 | Unassigned   | To Do       |
| Agentic System Evaluation                    | ACX-125 | Unassigned   | To Do       |
| Agentic Platform Demo UI                     | ACX-123 | Unassigned   | To Do       |


### Current Sprint Snapshot

> Not available — sprint data requires live query. Run `/daily ACX` to get current sprint status.

### Key Stakeholders

- CPO — Strategic alignment
- PMRKT squad (Kamal) — MCC integration and audience data contracts
- AI Model team — Enrichment layer (RFM, Preferred Channel, Best Time to Send)
- Engineering Lead — Agentic Framework architecture decisions

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


| Term                     | Meaning                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Agentic Framework        | Scalable orchestration layer that hosts AI agents and routes tasks between them. Core infrastructure of the Agentic CX Platform.   |
| Campaign Intent Agent    | First agent in the framework. Converts natural language into a structured campaign brief with goal, KPIs, audience, and channel.   |
| Segment Agent            | AI agent that builds audience segments from natural language input, using RFM and other model signals.                             |
| Content Generation Agent | AI agent that produces campaign copy (messages, subject lines) based on the campaign brief and brand tone.                         |
| Analytics Agent          | AI agent that interprets campaign performance and generates actionable insights and recommendations.                               |
| Brand Tone               | Governance layer defining tone-of-voice rules applied to all AI-generated content for a given account.                             |
| Campaign Lifecycle       | State machine that tracks a campaign through AI-orchestrated stages: intent → segmentation → content → approval → launch.          |
| MCP Tools                | Model Context Protocol tool interfaces — expose platform capabilities (MCC, Audience, etc.) as callable tools for agents.          |
| MCP                      | Model Context Protocol — standard interface used by AI agents to call platform tools and APIs.                                     |
| RAG                      | Retrieval-Augmented Generation — used by agents to pull relevant context (audience data, past campaigns) before generating output. |
| Observability            | Monitoring of agent behavior, tool calls, latency, and output quality — powered by tools like Langfuse.                            |


