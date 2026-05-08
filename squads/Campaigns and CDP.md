# SQUAD_CONFIG.md — Campaigns & CDP Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Squad Name             | Campaigns & CDP                                                                                                                                                        |
| Jira Project Name      | Personalized Marketing (MCC)                                                                                                                                           |
| Jira Project Key       | PMRKT                                                                                                                                                                  |
| Confluence Space Key   | UPP                                                                                                                                                                    |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                                             |
| Confluence Parent Page | Personalised Marketing (MCC+Audience+Smart Link) — ID: 1658781843                                                                                                      |
| Squad Mission          | Own MCC campaign orchestration, Audience segmentation (CDP), and Smart Links (uLink) — the 3 products that drive personalised customer engagement for Unifonic clients |
| Sprint Cadence         | 10 days                                                                                                                                                                |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                                           |


---

## Team Members


| Name                   | Role                                      | Jira Username / Email                                     |
| ---------------------- | ----------------------------------------- | --------------------------------------------------------- |
| Kamal Chidirala        | Senior Product Manager                    | [kchidirala@unifonic.com](mailto:kchidirala@unifonic.com) |
| Ahmad Alkhatib         | Engineering Tech Lead                     | [aalkhatib@unifonic.com](mailto:aalkhatib@unifonic.com)   |
| Talha Iqbal            | Engineering (Infrastructure / DevOps)     | [tiqbal@unifonic.com](mailto:tiqbal@unifonic.com)         |
| Mohamed Samir          | Engineering                               | [msamir@unifonic.com](mailto:msamir@unifonic.com)         |
| Ivan Nikolić           | Engineering                               | [inikolic@unifonic.com](mailto:inikolic@unifonic.com)     |
| Maciej Ziaja           | Frontend Engineering                      | [mziaja@unifonic.com](mailto:mziaja@unifonic.com)         |
| Aleksandar Nikolic     | Engineering                               | [anikolic@unifonic.com](mailto:anikolic@unifonic.com)     |
| Ugur Acikgoz           | Engineering Director Marketing Automation | [uacikgoz@unifonic.com](mailto:uacikgoz@unifonic.com)     |
| Muhammad Wariss Sheikh | Engineering SDET/QA                       | [msheikh@unifonic.com](mailto:msheikh@unifonic.com)       |


---

## Products Owned


| Product                      | Description                                                                                              | Channels / Sub-products                          | Confluence Folder ID |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------- |
| MCC (Multi-Channel Campaign) | Campaign orchestration platform — create, schedule, and send campaigns across channels                   | WhatsApp, SMS, Email, Voice                      | 3215032371           |
| Audience                     | CDP-powered audience segmentation and targeting — RFM scoring, filter rules, event tracking via Tracardi | Audience 1.0 (stable), Audience 2.0 (active dev) | 3214934093           |
| Smart Links (uLink)          | URL shortener and click-tracking service with dynamic deep links and UTM support                         | —                                                | 3741778011           |


---

## Jira Configuration


| Field                  | Value                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Project Key            | PMRKT                                                                                                                                   |
| Project Full Name      | Personalized Marketing (MCC)                                                                                                            |
| Active Sprint Board    | Campaigns & CDP Board                                                                                                                   |
| Issue Types            | Epic, Story, Technical Story, Task, Sub-task, Bug, Spike, Incident, Post-mortem action, Test automation                                 |
| Epic Labels            | `mcc`, `audience`, `ulink`, `rfm`, `email`, `sms`, `whatsapp`, `analytics`                                                              |
| Active Labels          | `Production_Review_Actions`, `audience-filter-service`, `PP_Verified`                                                                   |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                                                                                      |
| Story Status Flow      | Backlog → Ready for Sprint → To Do → In Progress → PR Review → Ready for Integ Env Testing → Integ Env Testing → Preprod Testing → Done |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                                                          |
| Blocked Label          | `blocked`                                                                                                                               |


---

## Confluence Configuration


| Field                               | Value                                                           |
| ----------------------------------- | --------------------------------------------------------------- |
| Space Key                           | UPP                                                             |
| Parent Page                         | Personalised Marketing (MCC+Audience+Smart Link) — `1658781843` |
| MCC Release Notes Page              | Release Notes MCC — `1978106483` (Year 2026: `3659759620`)      |
| Audience Release Notes Page         | Audience 2.0 / Release Notes 2026 — `3681550358`                |
| MCC Feature Definitions Page        | Feature Definitions — `2217541866`                              |
| Audience Feature Definition Page    | Audience 2.0 / Feature Definition — `3641212948`                |
| Smart Links Feature Definition Page | Feature Definition - Smart Links — `3741941838`                 |
| Sprint Review Parent Page           | Sprint Reviews                                                  |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative                                     | Key Issues | Owner              | Status                      |
| ---------------------------------------------- | ---------- | ------------------ | --------------------------- |
| AWS Migration — MCC Tracardi Backend           | PMRKT-40   | Talha Iqbal        | In Progress                 |
| AWS Migration — uLink Frontend                 | PMRKT-33   | Talha Iqbal        | Ready for Integ Env Testing |
| AWS Migration — uLink Backend                  | PMRKT-39   | Talha Iqbal        | Ready for Integ Env Testing |
| RFM segmentation — MFE coexistence spike       | PMRKT-3    | Maciej Ziaja       | Ready for Sprint            |
| RFM Handover                                   | PMRKT-59   | Ivan Nikolić       | To Do                       |
| uLink Release                                  | PMRKT-41   | Aleksandar Nikolic | Preprod Testing             |
| LaunchDarkly SDK for campaign management       | PMRKT-60   | Ivan Nikolić       | In Progress                 |
| MCC MFE — Email content step                   | PMRKT-35   | Maciej Ziaja       | In Progress                 |
| Tracardi upgrade to v1.1.20                    | PMRKT-6    | Talha Iqbal        | Ready for Integ Env Testing |
| Tracardi payload validation for AI team        | PMRKT-12   | Ahmad Alkhatib     | PR Review                   |
| Audience event execution from Flow not in logs | PMRKT-62   | Kamal Chidirala    | To Do                       |
| Audience segment rules mapping fix             | PMRKT-16   | Mohamed Samir      | To Do                       |
| FS & Email Campaign 500 error                  | PMRKT-58   | Talha Iqbal        | In Progress                 |


### Current Sprint Snapshot (as of 2026-02-25)


| Status                      | Count |
| --------------------------- | ----- |
| Ready for Sprint            | 16    |
| To Do                       | 9     |
| In Progress                 | 9     |
| Integ Env Testing           | 6     |
| Ready for Integ Env Testing | 3     |
| PR Review                   | 1     |
| Preprod Testing             | 1     |
| Done                        | 1     |
| Cancelled                   | 4     |


### Key Stakeholders

- CPO — Strategic alignment
- Engineering Lead — Technical feasibility sign-off
- Customer Success — Adoption feedback
- Sales — GTM readiness
- AI Model Team — Tracardi payload validation (Mohammad Hammad)

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


| Term                    | Meaning                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| MCC                     | Marketing Campaign Cloud — campaign orchestration layer                      |
| CDP                     | Customer Data Platform — audience segmentation and profile management        |
| RFM                     | Recency, Frequency, Monetary segmentation model                              |
| Flow Studio             | Journey automation builder                                                   |
| Trusted Circles         | Data sharing initiative across enterprise clients                            |
| WA                      | WhatsApp Business API                                                        |
| Broadcast               | One-way mass message campaign                                                |
| Conversational Campaign | Two-way interactive campaign via WhatsApp                                    |
| uLink                   | URL shortener and tracking service (Smart Links product)                     |
| MFE                     | Micro Frontend — modular frontend architecture used for audience/campaign UI |
| Tracardi                | CDP event tracking engine used for audience segmentation                     |
| LaunchDarkly            | Feature flag management service                                              |
| PP_Verified             | Preprod verified — label indicating issue was tested in preprod              |


## Cloning Instructions

To use this template for a different squad:

1. Copy this entire project directory to a new folder
2. Edit `SQUAD_CONFIG.md` — replace all values in the table above
3. Replace team members with the target squad's members
4. Update Active Initiatives with that squad's current priorities
5. Update Squad Vocabulary with squad-specific terms
6. Run `/daily` to verify Jira MCP connection works with the new project key

