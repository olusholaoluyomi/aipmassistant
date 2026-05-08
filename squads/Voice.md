# SQUAD_CONFIG.md — Voice Squad

---

## Squad Identity


| Field                  | Value                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Squad Name             | Voice                                                                                                                                                                                |
| Jira Project Name      | Product Voice                                                                                                                                                                        |
| Jira Project Key       | VC                                                                                                                                                                                   |
| Confluence Space Key   | UPP                                                                                                                                                                                  |
| Confluence Space Name  | Unifonic Products Playbook                                                                                                                                                           |
| Confluence Parent Page | Voice — ID: 712114516                                                                                                                                                                |
| Squad Mission          | Own voice call initiation, orchestration, and supporting voice services (IVR, CCaaS, gateways, dialer) on top of VoIP technology that drive customer engagement for Unifonic clients |
| Sprint Cadence         | 10 days                                                                                                                                                                              |
| Story Point Scale      | Fibonacci: 1, 2, 3, 5, 8, 13                                                                                                                                                         |


---

## Team Members


| Name                    | Role                                    | Jira Username / Email                                     |
| ----------------------- | --------------------------------------- | --------------------------------------------------------- |
|                         |                                         |                                                           |
| Khizar Iqbal            | Engineering (Voice Dialer / Backend)    | [kiqbal@unifonic.com](mailto:kiqbal@unifonic.com)         |
| Kayode Adebowale        | Senior Product Manager                  | [kadebowale@unifonic.com](mailto:kadebowale@unifonic.com) |
| Ahmad Alhajalabdulla    | Engineering Manager                     | [aabdalla@unifonic.com](mailto:aabdalla@unifonic.com)     |
| Sultan Ahmed            | Engineering                             | [suahmed@unifonic.com](mailto:suahmed@unifonic.com)       |
| Muhammad Umair Chaudhry | Engineering (Gateways / Infrastructure) | [mchaudhry@unifonic.com](mailto:mchaudhry@unifonic.com)   |
| Muhammad Faheem         | Engineering                             | [mfaheem@unifonic.com](mailto:mfaheem@unifonic.com)       |
|                         |                                         |                                                           |
|                         |                                         |                                                           |


---

## Products Owned


| Product     | Description                                                   | Confluence Folder ID |
| ----------- | ------------------------------------------------------------- | -------------------- |
| Voice Calls | Inbound/outbound voice calls, IVR, TTS, CCaaS traffic routing | 712114516            |


---

## Jira Configuration


| Field                  | Value                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Project Key            | VC                                                                                                       |
| Project Full Name      | Product Voice                                                                                            |
| Active Sprint Board    | Voice Scrum                                                                                              |
| Issue Types            | Epic, Story, Technical Story, Technical Debt, Spike, Bug, Request, Incident, Sub-task, Retro improvement |
| Epic Labels            | `voice`, `ivr`, `dialer`, `ccaas`, `gateway`, `api`                                                      |
| Priority Scale         | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)                                                       |
| Story Status Flow      | Not Ready → To Do → In Progress → Peer Review → PO Review → Done                                         |
| Stale Ticket Threshold | 3+ days without update in "In Progress" status                                                           |
| Blocked Label          | `blocked`                                                                                                |


---

## Confluence Configuration


| Field                     | Value               |
| ------------------------- | ------------------- |
| Space Key                 | UPP                 |
| Parent Page               | Voice — `712114516` |
| Feature Doc Parent Page   | Voice (under UPP)   |
| Release Notes Parent Page | Voice (under UPP)   |
| Sprint Review Parent Page | Voice (under UPP)   |


---

## Squad Priorities & Context

### Active Initiatives (Current Quarter)


| Initiative                                             | Key Issues | Owner                   | Status      |
| ------------------------------------------------------ | ---------- | ----------------------- | ----------- |
| Voice Dialer migration to Java 25                      | VC-2996    | Khizar Iqbal            | In Progress |
| Voice IVR Flow Automation (E2E)                        | VC-3538    | Kayode Adebowale        | PO Review   |
| Voice API Enhancements — CCaaS Traffic via Flow Studio | VC-3408    | Sultan Ahmed            | In Progress |
| New voice gateway — Zain Cloud Jeddah (Phase 3)        | VC-3470    | Muhammad Umair Chaudhry | To Do       |
| Add voice gateways in Prometheus                       | VC-3486    | Muhammad Faheem         | To Do       |
| Voice API tests — attach to repo with CI notifications | VC-3504    | Muhammad Danish Jamil   | In Progress |
| Voice UI tests — attach to repo with CI notifications  | VC-3570    | Muhammad Danish Jamil   | Not Ready   |
| Fix completedAt in voice calls via dialer              | VC-3361    | Khizar Iqbal            | Peer Review |
| Configurable timeout for fetching flow from dialer     | VC-3571    | Khizar Iqbal            | Peer Review |


### Current Sprint Snapshot


| Status      | Count |
| ----------- | ----- |
| In Progress | 10    |
| Not Ready   | 10    |
| PO Review   | 5     |
| To Do       | 3     |
| Peer Review | 2     |
| Done        | 1     |


### Key Stakeholders

- CPO — Strategic alignment
- Engineering Lead — Technical feasibility sign-off
- CCaaS / Platform team — Cross-squad dependency on Flow Studio routing
- Customer Success — Gateway and IVR adoption feedback
- Sales — GTM readiness for new gateway regions

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


| Term        | Meaning                                                            |
| ----------- | ------------------------------------------------------------------ |
| IVR         | Interactive Voice Response — automated phone menu system           |
| CCaaS       | Contact Center as a Service — cloud-based contact center routing   |
| Dialer      | Voice dialer service handling outbound call initiation             |
| TTS         | Text-to-Speech — AI-generated voice for IVR prompts                |
| Gateway     | SIP gateway connecting VoIP infrastructure to telecom carriers     |
| Direct SIP  | SIP calls routed directly without the Unifonic proxy layer         |
| CDR         | Call Detail Record — log of call metadata (duration, status, etc.) |
| Flow Studio | Journey automation builder — used for IVR flow configuration       |
| Peer Review | Code review between engineers before PO sign-off                   |
| PO Review   | Product Owner review gate before marking a ticket Done             |


## Cloning Instructions

To use this template for a different squad:

1. Copy this entire project directory to a new folder
2. Edit `SQUAD_CONFIG.md` — replace all values in the table above
3. Replace team members with the target squad's members
4. Update Active Initiatives with that squad's current priorities
5. Update Squad Vocabulary with squad-specific terms
6. Run `/daily` to verify Jira MCP connection works with the new project key

