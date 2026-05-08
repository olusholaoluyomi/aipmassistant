# SQUAD_CONFIG.md — SMS Unified Squad

> Generated: 2026-02-25 | Source: Jira project `SMS` (id: 12103) + Confluence spaces `SMA`, `UEP`, `UPP`

---

## Squad Identity


| Field                  | Value                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Squad Name             | SMS Unified                                                                                                                                                                                                        |
| Jira Project Name      | SMS Unified                                                                                                                                                                                                        |
| Jira Project Key       | SMS                                                                                                                                                                                                                |
| Confluence Space Key   | SMA (SMS API) / UEP (Unifonic Engineering Playbook) / UPP (Unifonic Products Playbook)                                                                                                                             |
| Confluence Space Name  | SMS API (primary technical space)                                                                                                                                                                                  |
| Confluence Parent Page | [To be confirmed]                                                                                                                                                                                                  |
| Squad Mission          | Own the full SMS delivery value chain — EL (Exposure Layer), SMSC, ScaleJasmin, Webhook, and AI-driven traffic intelligence — ensuring high-throughput, reliable, and compliant SMS messaging for Unifonic clients |
| Sprint Cadence         | [To be confirmed]                                                                                                                                                                                                  |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                                                                                       |


---

## Team Members


| Name                  | Role                    | Jira / Email                                                |
| --------------------- | ----------------------- | ----------------------------------------------------------- |
| Ahmad Alhajalabdulla  | Engineering Manager     | [aabdalla@unifonic.com](mailto:aabdalla@unifonic.com)       |
|                       |                         |                                                             |
| Nikola Pejic          | Engineering             | [npejic@unifonic.com](mailto:npejic@unifonic.com)           |
| Waleed Hassan         | Engineering             | [whassan@unifonic.com](mailto:whassan@unifonic.com)         |
| Irfan Saric           | Tech Lead               | [isaric@unifonic.com](mailto:isaric@unifonic.com)           |
| Ahmed Abdelmalek      | Engineering (AI / Data) | [aabdelmalek@unifonic.com](mailto:aabdelmalek@unifonic.com) |
| Oday Fraiwan          | Engineering             | [ofraiwan@unifonic.com](mailto:ofraiwan@unifonic.com)       |
| Raja Muhammad Arslan  | Engineering             | [rarslan@unifonic.com](mailto:rarslan@unifonic.com)         |
| Rabia Fatima          | Engineering             | [rfatima@unifonic.com](mailto:rfatima@unifonic.com)         |
|                       |                         | [hna](mailto:hnaveed@unifonic.com)                          |
| Muhammad Tanveer      | Product Owner           | [mtanveer@unifonic.com](mailto:mtanveer@unifonic.com)       |
| David Barajas Alvarez | Product Manager         | [dbarajas@unifonic.com](mailto:dbarajas@unifonic.com)       |


---

## Products Owned


| Product                         | Description                                                                                              | Key Components                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| SMS Gateway                     | High-throughput transactional and campaign SMS delivery platform for Unifonic clients                    | EL (Exposure Layer), SMSC, ScaleJasmin               |
| SMS Webhook                     | DLR (Delivery Receipt) and MO (Mobile Originated) delivery via HTTP webhook to client endpoints          | Webhook dispatcher, Kafka consumer, webhook API      |
| SMS API (v1/v2)                 | REST API for sending single/bulk SMS, OTP, and campaign messages; v2 adds JSON format and URL shortening | EL REST endpoints, UAM (auth), rate limiting         |
| SMS Spike Detector              | AI/ML-based anomaly detection to identify traffic spikes and potential fraud per sender/SID              | SMS Spark Service, Spark ML models, rule-based layer |
| SMS Admin Console               | Internal UI for routing rules, traffic control, failover logic, and fraud configuration (in definition)  | Config Manager, routing engine, SMSC admin           |
| MNP (Mobile Number Portability) | Lookup service to resolve operator for ported numbers before routing                                     | MNP lookup API, Cassandra/Redis cache                |
| Two Way SMS                     | Enables clients to receive customer replies (MO) via short code connectivity and webhook forwarding      | SMSC MO path, webhook forwarding                     |
| SMS Flash Campaigns             | Priority routing lane for time-critical campaigns with premium processing (in definition)                | Priority route/path, EL campaign dispatcher          |


---

## Jira Configuration


| Field                  | Value                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Project Key            | SMS                                                                                                      |
| Project Full Name      | SMS Unified                                                                                              |
| Project ID             | 12103                                                                                                    |
| Active Sprint Board    | [To be confirmed]                                                                                        |
| Issue Types            | Epic, Story, Technical Story, Spike, Request, Bug, Technical Debt, Incident, Retro improvement, Sub-task |
| Priority Scale         | 1-Critical / 2-Major / 3-Major / 4-Medium / 5-Minor                                                      |
| Story Status Flow      | Not Ready → To Do → In Progress → Peer Review → PO Review → Testing → Released to Prod → Done            |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                           |
| Blocked Label          | `blocked`                                                                                                |


---

## Confluence Configuration


| Field                           | Value                                                                     |
| ------------------------------- | ------------------------------------------------------------------------- |
| Primary Technical Space Key     | SMA                                                                       |
| Primary Technical Space Name    | SMS API                                                                   |
| Engineering Playbook Space Key  | UEP                                                                       |
| Engineering Playbook Space Name | Unifonic Engineering Playbook                                             |
| Products Playbook Space Key     | UPP                                                                       |
| Products Playbook Space Name    | Unifonic Products Playbook                                                |
| Testing Strategy Page           | SMS Testing and Verification Development planning — UPP page `3741941931` |
| Troubleshooting Guide Page      | SMS Guide for Troubleshooting — UPP page `3442409596`                     |
| Business Continuity Plan Page   | Business Continuity Plan (BCP) – SMS Services — UPP page `3634987028`     |
| Spike Detector Research Page    | SMS Spike Detector V2 — UEP page `3675652129`                             |
| Daily Release Tracker Page      | SMS - Daily Release - SDET Work — UEP page `3750101004`                   |


---

## Active Initiatives (Current Quarter)


| Initiative                                       | Epic Key | Owner                 | Status      |
| ------------------------------------------------ | -------- | --------------------- | ----------- |
| SMS Testing and Verification Development         | SMS-975  | Irfan Saric           | Definition  |
| SMS Troubleshooting AI Agent                     | SMS-815  | Ahmed Abdelmalek      | Definition  |
| Implementation of Total Cost Calculation in FCDR | SMS-808  | David Barajas Alvarez | In Progress |
| SMS Spike Detector Rollout                       | SMS-767  | Ahmed Abdelmalek      | In Progress |
| EL Expansion for Barq / Absher Traffic           | SMS-672  | David Barajas Alvarez | In Progress |
| SMS API v2 Development                           | SMS-573  | Irfan Saric           | In Progress |
| SMS Webhook Enhancements                         | SMS-587  | Thomas Durrenberger   | In Progress |
| Two Way SMS Feature                              | SMS-586  | Oday Fraiwan          | Definition  |
| SMSC Cleanup - Tech Debt                         | SMS-585  | Oday Fraiwan          | Definition  |
| EL Cleanup - Post Fair Queuing                   | SMS-582  | Irfan Saric           | Definition  |
| SMS Vault Rollout                                | SMS-588  | Thomas Durrenberger   | Definition  |
| SMS Admin Console                                | SMS-589  | Nikola Pejic          | Definition  |
| SMSC Scalability (Platform and API)              | SMS-590  | Thomas Durrenberger   | Definition  |
| SMS Flash Campaigns                              | SMS-591  | Thomas Durrenberger   | Definition  |


---

## Current Sprint Snapshot (as of 2026-02-25)


| Status           | Count  |
| ---------------- | ------ |
| Not Ready        | 18     |
| In Progress      | 12     |
| Peer Review      | 9      |
| Done             | 7      |
| PO Review        | 3      |
| To Do            | 2      |
| Testing          | 2      |
| Released to Prod | 1      |
| **Total**        | **54** |


### Sprint Highlights


| Ticket  | Summary                                                | Assignee             | Status           |
| ------- | ------------------------------------------------------ | -------------------- | ---------------- |
| SMS-975 | SMS Testing and Verification Development               | Irfan Saric          | Not Ready        |
| SMS-973 | Adding SMSC endpoint to MCP server                     | Nikola Pejic         | In Progress      |
| SMS-967 | Incorporate Async Mode in fair queuing                 | Rabia Fatima         | In Progress      |
| SMS-966 | STC Failover Logic Update                              | Nikola Pejic         | Done             |
| SMS-965 | STC EL 3&4 Release Readiness                           | Waleed Hassan        | Released to Prod |
| SMS-961 | Melrose Restart On Bind Update                         | Raja Muhammad Arslan | Peer Review      |
| SMS-916 | Define Timeout & Failure Handling Strategy             | Raja Muhammad Arslan | In Progress      |
| SMS-848 | Update Health End Points for OCI EL in Nextgen         | Waleed Hassan        | In Progress      |
| SMS-839 | Build Rule-Based Filtering Layer (Spike Detection)     | Ahmed Abdelmalek     | Not Ready        |
| SMS-831 | Research / HO on SMS Spark Service                     | Ahmed Abdelmalek     | In Progress      |
| SMS-822 | Fix Data Source Issue - Spike Detector                 | Ahmed Abdelmalek     | In Progress      |
| SMS-816 | FCDR / ECDR duplication in Kibana prod                 | Muhammad Umair       | In Progress      |
| SMS-813 | DLR-FWD Implementation of Updated Cost Logic           | Nikola Pejic         | Peer Review      |
| SMS-804 | Ensure Latency-Sensitive Clients Are Served from Cache | Irfan Saric          | In Progress      |


---

## Key Stakeholders

- Engineering Lead / Tech Lead — Thomas Durrenberger (technical feasibility, architecture decisions)
- QA / SDET Lead — Humayun Naveed (test coverage, release readiness)
- Platform / UC Team — dependency on OCI infrastructure provisioning
- AI Model Team — SMS Spike Detector and SMS Classifier collaboration (Ahmed Abdelmalek)
- Carrier / Operator Partners — STC, Lebara, Barq, Absher (external routing dependencies)
- Customer Support — Webhook reliability and DLR accuracy SLA owner
- TechOps — SMS Admin Console and routing configuration requester

---

## Definition of Ready (Story must have before sprint)

- Clear goal defined
- Acceptance criteria refined and reviewed
- Dependencies on other services or operators identified
- Routing / infrastructure impact assessed
- Risks known and documented
- Test approach noted (unit, integration, SDET automation scope)
- Story points set

---

## Definition of Done

- Code Complete: Feature/bug is fully coded
- Code Review: Peer review complete and approved
- Documentation: Technical runbook or Confluence page updated
- Unit & Integration Tests: Implemented and passing
- Acceptance Testing (Pre-Prod): Deployed to preprod; all acceptance tests pass
- SDET Automation: TestRail cases executed; automated sanity cases committed in CI pipeline
- Load Testing: Performed for throughput-sensitive changes (EL, SMSC, ScaleJasmin)
- Released to Prod: Deployed to production and smoke-tested
- Monitoring: Grafana / Kibana alerts validated in production environment

---

## Squad Vocabulary


| Term           | Meaning                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| EL             | Exposure Layer — the SMS API gateway that applies routing rules, number normalization, and business logic |
| SMSC           | Short Message Service Centre — handles SMPP bind/unbind, submit_sm, delivery receipts with carriers       |
| ScaleJasmin    | High-throughput messaging gateway managing routing decisions, template handling, and provider behavior    |
| DLR            | Delivery Receipt — confirmation event sent by the carrier when a message is delivered (or fails)          |
| MO             | Mobile Originated — inbound SMS reply from an end-user, used in Two Way SMS                               |
| SMPP           | Short Message Peer-to-Peer — binary protocol used for carrier-grade SMS connections                       |
| OTP            | One-Time Password — time-sensitive single-recipient SMS for authentication                                |
| CAM            | Campaign message type in EL — multi-recipient bulk send                                                   |
| FCDR           | Final Call Detail Record — the authoritative billing/cost record per SMS                                  |
| ECDR           | Extended Call Detail Record — extended version of CDR with enriched metadata                              |
| Fair Queuing   | Algorithm ensuring balanced throughput across clients/SIDs without one client starving others             |
| Failover Logic | Automatic rerouting to a backup carrier/route when the primary route degrades or fails                    |
| Spike Detector | AI/ML service that detects anomalous SMS traffic volumes per client or SID                                |
| SID            | Sender ID — the alphanumeric or numeric sender label displayed on an SMS                                  |
| MNP            | Mobile Number Portability — lookup to determine the current operator for a ported phone number            |
| Vault          | HashiCorp Vault — secrets management service being rolled out across SMS components                       |
| Sync App       | Internal service responsible for syncing routing cost and error code data across SMS components           |
| Config Manager | Service that manages dynamic configuration updates (binds, routing, failover rules) across SMSC           |
| UAM            | Unified Auth Manager — authentication/authorization layer for SMS API clients                             |
| RMQ            | RabbitMQ — message broker used within the SMS delivery pipeline                                           |
| STC            | Saudi Telecom Company — major Saudi carrier and primary routing partner                                   |
| Flash Campaign | Priority SMS campaign routed through a dedicated fast-path lane (in definition)                           |
| Two Way SMS    | Feature enabling clients to receive MO replies from end-users via short code + webhook                    |


