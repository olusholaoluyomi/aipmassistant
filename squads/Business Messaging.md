# SQUAD_CONFIG.md — Business Messaging Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Squad Name             | Business Messaging                                                                                                                                                                   |
| Jira Project Name      | Business Messaging (CON)                                                                                                                                                             |
| Jira Project Key       | CON                                                                                                                                                                                  |
| Confluence Space Key   | UPP                                                                                                                                                                                  |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                                                           |
| Confluence Parent Page | Business Messaging Portfolio — ID: 3051159617                                                                                                                                        |
| Squad Mission          | Own the Business Messaging Portfolio — WhatsApp, Email, and Push channels — delivering reliable, scalable messaging infrastructure and new channel capabilities for Unifonic clients |
| Sprint Cadence         | [To be confirmed]                                                                                                                                                                    |
| Story Point Scale      | [To be confirmed]                                                                                                                                                                    |


---

## Team Members


| Name                  | Role                              | Jira Email                                            |
| --------------------- | --------------------------------- | ----------------------------------------------------- |
| Ogechi Wosu           | Product Manager (Epic Owner / PM) | [owosu@unifonic.com](mailto:owosu@unifonic.com)       |
| Martina Kamel         | Engineering / QA                  | [mkamel@unifonic.com](mailto:mkamel@unifonic.com)     |
| Shehzad Ahmad Hashmi  | Engineering                       | [sahashmi@unifonic.com](mailto:sahashmi@unifonic.com) |
| Raffey Nasser         | Engineering                       | [nraffey@unifonic.com](mailto:nraffey@unifonic.com)   |
| Muhammad Asim Irshad  | Tech Lead                         |                                                       |
| Mohammad Ahmed Asif   | Engineering                       | [masif@unifonic.com](mailto:masif@unifonic.com)       |
| Muhammad Umair Razzaq | Engineering                       | [murazzaq@unifonic.com](mailto:murazzaq@unifonic.com) |
| Ali Elsayed           | Engineering                       | [abadr@unifonic.com](mailto:abadr@unifonic.com)       |
|                       |                                   |                                                       |
| Ahmad Alhajalabdulla  | Engineering Manager               | [aabdalla@unifonic.com](mailto:aabdalla@unifonic.com) |


---

## Products Owned


| Product  | Description                                                                                         | Confluence Folder ID |
| -------- | --------------------------------------------------------------------------------------------------- | -------------------- |
| WhatsApp | WhatsApp Business API — messaging, templates, webhooks, group API, embedded signup, WA PoC          | 3051126879           |
| Email    | Email as a Channel — transactional and campaign email via Sendclean, IP pool management, onboarding | 3051487268           |
| Push     | Push Notifications — push channel, push plus, local E2E encrypted push, silent notifications        | 3051126876           |


---

## Jira Configuration


| Field                  | Value                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Key            | CON                                                                                                                                                         |
| Project Full Name      | Product Conversations                                                                                                                                       |
| Project Category       | Product                                                                                                                                                     |
| Active Sprint Board    | [To be confirmed]                                                                                                                                           |
| Issue Types            | Epic, Story, Technical Story, Spike, Bug, Technical Debt, Request, Incident, Sub-task, Retro improvement                                                    |
| Priority Scale         | 1 - Blocker / 2 - Critical / 3 - Major / 4 - Medium / 5 - Minor                                                                                             |
| Story Status Flow      | To Do → In Progress → Peer Review → Testing → PO Review → Done                                                                                              |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                                                                              |
| Blocked Label          | `blocked`                                                                                                                                                   |
| Channel Prefixes       | `{WA}` = WhatsApp, `{Email}` = Email, `{TikTok}` = TikTok, `{AI}` = AI/MCP, `[OCI HA]` = OCI High Availability, `{WA_IO}` / `{WA_OCI}` = WA infra migration |


---

## Confluence Configuration


| Field                    | Value                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Space Key                | UPP                                                                                                                     |
| Space Name               | Unifonic Products Playbook                                                                                              |
| Parent Folder            | Business Messaging Portfolio — `3051159617`                                                                             |
| WhatsApp Folder          | WhatsApp — `3051126879`                                                                                                 |
| Email Folder             | Email — `3051487268`                                                                                                    |
| Push Folder              | Push — `3051126876`                                                                                                     |
| Key Doc Pages (Email)    | User Manual: Email Campaign, User Manual: Email APIs, Business Case: Transactional Email, Business Case: Email Campaign |
| Key Doc Pages (Push)     | Product Architecture: Push and Push Plus, Business Case: Push as a channel, Local E2E Encrypted Push notification       |
| Key Doc Pages (WhatsApp) | [To be confirmed — no pages found directly under WhatsApp folder]                                                       |


---

## Active Initiatives


| Epic Key | Title                                          | Owner       | Status      |
| -------- | ---------------------------------------------- | ----------- | ----------- |
| CON-5763 | OCI HA project V1                              | Ogechi Wosu | In Progress |
| CON-5761 | AI MCP POC                                     | Ogechi Wosu | In Progress |
| CON-5739 | AWS to OCI IO (Infrastructure migration)       | Ogechi Wosu | In Progress |
| CON-5735 | TikTok QA Addendums                            | Ogechi Wosu | In Progress |
| CON-5632 | WA Group API                                   | Ogechi Wosu | In Progress |
| CON-5737 | Twitter as a Channel                           | Ogechi Wosu | Definition  |
| CON-5736 | QA Automation Tests                            | Ogechi Wosu | Definition  |
| CON-5639 | Embedded Signup V3 to V4                       | Ogechi Wosu | Definition  |
| CON-5637 | Business ID Claiming (Instead of Phone Number) | Ogechi Wosu | Definition  |
| CON-5633 | Sending of Events to Audience (Email)          | Ogechi Wosu | Definition  |
| CON-5631 | Support Regeneration of Public ID and Secret   | Ogechi Wosu | Definition  |
| CON-5630 | WA Message Types V2                            | Ogechi Wosu | Definition  |
| CON-5508 | Allow Email Templates                          | Ogechi Wosu | Definition  |
| CON-5507 | Email Batching                                 | Ogechi Wosu | Definition  |
| CON-5762 | Attempt Count PLV                              | Ogechi Wosu | Done        |
| CON-5641 | WA Pacing Webhooks (Template and Business)     | Ogechi Wosu | Done        |
| CON-5636 | Cgrates V2                                     | Ogechi Wosu | Done        |
| CON-5506 | Allow Deeplink with WhatsApp                   | Ogechi Wosu | Done        |
| CON-5505 | Add Campaign ID to Webhook                     | Ogechi Wosu | Done        |
| CON-5504 | Media File Upload without Publicly Hosted URLs | Ogechi Wosu | Done        |


---

## Current Sprint Snapshot (as of 2026-02-25)

### Status Breakdown


| Status      | Count  |
| ----------- | ------ |
| In Progress | 11     |
| Testing     | 6      |
| PO Review   | 4      |
| To Do       | 4      |
| Peer Review | 3      |
| Done        | 2      |
| **Total**   | **30** |


### Highlighted Tickets


| Key      | Type            | Summary                                                            | Assignee                | Priority     | Status      |
| -------- | --------------- | ------------------------------------------------------------------ | ----------------------- | ------------ | ----------- |
| CON-5714 | Technical Story | [OCI HA] Prod email software check + QA testing                    | Martina Kamel           | 2 - Critical | PO Review   |
| CON-5765 | Technical Story | {WA} Integrate the Management service with LaunchDarkly            | Raffey Nasser           | 2 - Critical | Testing     |
| CON-5758 | Technical Story | {TikTok_FE} Send Flags based on Optin option — allow to proceed    | Muhammad Umair Razzaq   | 2 - Critical | Testing     |
| CON-5759 | Technical Story | {TikTok} Send Flags based on Optin option — backend                | Raffey Nasser           | 2 - Critical | In Progress |
| CON-5747 | Technical Story | {AI} Setup local MCP Java server for Conversations + endpoints     | Shehzad Ahmad Hashmi    | 3 - Major    | In Progress |
| CON-5781 | Sub-task        | Conversation MCP Server Endpoints                                  | Shehzad Ahmad Hashmi    | 4 - Medium   | In Progress |
| CON-5752 | Story           | {X_FE} Twitter as A Channel (frontend)                             | Ali Elsayed             | 4 - Medium   | To Do       |
| CON-5685 | Technical Story | {WA_IO} Migrating finance conversation service from old Kubernetes | Muhammad Huzaifa Shahid | 4 - Medium   | In Progress |
| CON-5713 | Technical Story | [OCI HA] Preprod email software check + QA testing                 | Martina Kamel           | 4 - Medium   | In Progress |
| CON-5749 | Request         | {Email} Support Onboarding                                         | Martina Kamel           | 4 - Medium   | In Progress |


---

## Key Stakeholders

- Product Manager — Ogechi Wosu (epic owner, sprint reporter)
- Engineering Lead — [To be confirmed]
- CPO — Strategic alignment
- Customer Success — Channel adoption feedback
- Sales — GTM readiness for new channels (TikTok, Twitter, Email)
- Infrastructure / Platform Team — OCI migration dependency

---

## Definition of Ready

A story must have the following before entering a sprint:

- Clear goal defined
- Acceptance criteria refined
- Dependencies noted
- Risks known
- Test approach noted
- Story points set

---

## Definition of Done

- Code Complete: Feature/bug is coded
- Code Review: Complete and approved (Peer Review passed)
- Documentation: Technical and user docs updated
- Unit & Integration Tests: Implemented and passing
- Acceptance Testing (Local): Test cases executed locally and passed
- Acceptance Testing (Testing / Preprod): Deployed and all acceptance tests pass
- Automated Coverage: API/E2E tests committed and passing in CI pipeline
- PO Review: PO has reviewed and accepted the ticket
- Production Verification: Smoke-tested on production

---

## Squad Vocabulary


| Term             | Meaning                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| WA               | WhatsApp Business API                                                                  |
| WA_IO            | WhatsApp input/output services — older Kubernetes-hosted infrastructure being migrated |
| WA_OCI           | WhatsApp services hosted on Oracle Cloud Infrastructure (migration target)             |
| OCI HA           | Oracle Cloud Infrastructure High Availability project                                  |
| OCI              | Oracle Cloud Infrastructure — cloud platform target for infrastructure migration       |
| AWS              | Amazon Web Services — legacy cloud hosting being migrated away from                    |
| MCP              | Model Context Protocol — AI tool integration layer (used in AI MCP POC epic)           |
| Embedded Signup  | WhatsApp embedded signup flow — V3 to V4 upgrade in progress                           |
| LaunchDarkly     | Feature flag management service                                                        |
| Cgrates          | Billing/rating engine used in conversation infrastructure                              |
| Pacing Webhook   | Mechanism to throttle/control message delivery rate and trigger webhook notifications  |
| Optin / Consent  | User opt-in flag for channels like TikTok — determines message send eligibility        |
| Typing Indicator | WA PoC feature — shows "typing..." status in WhatsApp conversations                    |
| PLV              | [To be confirmed — used in Attempt Count PLV epic]                                     |
| TikTok           | TikTok as a messaging channel — new channel being integrated into Unifonic platform    |
| X / Twitter      | Twitter/X as a new messaging channel — in Definition/development                       |
| IP Pool          | Email infrastructure concept — pool of IP addresses used for email delivery            |
| Sendclean        | Email delivery partner / white-label email platform used for Email as a Channel        |
| RabbitMQ         | Message broker being evaluated for WA OCI migration (push model / virtual threads POC) |
| Broker           | Message broker used in email integration infrastructure                                |


