# CLAUDE.md — Unifonic Product Ops Project

This file provides Unifonic-specific context for Claude. Global identity, working style, and output defaults are defined in `~/.claude/CLAUDE.md`.

---

## Project Purpose

AI-powered Product Operations framework for Product Leaders at Unifonic. Automates PM workflows via specialized agents and slash commands integrated with Attlassian Jira and Confluence.

---

## About Unifonic

- **Category:** CPaaS + AI Native CX Platform
- **Markets:** Saudi Arabia & GCC
- **Positioning:** AI-First Customer Experience Platform (evolved from Messaging provider)

### Core Products


| Product                                                     | Description                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| WhatsApp Business, Instagram Direct, Facebook Messenger API | Customer facing APIs and infra (queuing, dispatching, QoS, webhooks) |
| SMS Gateway                                                 | Bulk promotional and transactional SMS, mostly for recipients in KSA |
| Voice Calls                                                 | Inbound/outbound voice, IVR and Text-to-Speech services              |
| Flow Studio                                                 | Journey automation builder                                           |
| Chatbot Builder                                             | Conversational bot creation                                          |
| Agent Console                                               | Human agent live chat interface                                      |
| CDP                                                         | Customer Data Platform                                               |
| MCC                                                         | Marketing Campaign Cloud — audience & campaign orchestration         |


---

## Company Strategic Direction

**Goal:** Transform Unifonic into an Agentic CX Platform.


| Pillar                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| Autonomous Optimization | AI-driven campaign and journey optimization |
| Conversational Commerce | WhatsApp-first buying experiences           |
| Agentic Marketing       | Agents collaborating on marketing workflows |
| Vertical Solutions      | Industry-specific packaged use cases        |


### Active AI Agents Being Built

- Campaign Intent Agent ← first to ship (H1 2026)
- Segment Agent
- Content Generation Agent
- Analytics Agent

---

## H1 2026 Company Initiatives

Unifonic defines company-wide initiatives annually. These are the two active ones for H1 2026:

### 1. Agentic Marketing

**What:** AI-first campaign creation experience on top of MCC. A user describes a marketing goal in natural language (chat interface), and the AI orchestrates the full campaign setup — audience segmentation, content generation, channel selection, scheduling, and campaign naming — without manual configuration.

**How:** Building a set of specialized agents and exposing MCC functionality as MCP tools so agents can act on the platform. The Audience product and AI models are core building blocks — they enrich audience profiles so the Agentic Framework has better context to make smarter decisions.

**Two parallel tracks:**


| Track                        | What                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Agentic Framework            | Scalable agent orchestration layer. Campaign Intent Agent is the first use case. Designed to plug in new use cases as agents are built. |
| AI Models (enrichment layer) | Predictive models that enrich audience profiles, giving agents richer context. Built by the AI Model team in collaboration with PMRKT.  |


**AI Models in development:**


| Model             | Purpose                                                    | H1 Status                |
| ----------------- | ---------------------------------------------------------- | ------------------------ |
| RFM Segmentation  | Classify customers into Champions, At-Risk, Churned, etc.  | **Active — H1 priority** |
| Preferred Channel | Predict best channel per customer                          | Planned                  |
| Best Time to Send | Predict optimal send time per customer                     | Planned                  |
| Product Affinity  | Predict which products a customer is likely to engage with | Planned                  |


**Status:** Campaign Intent Agent is the first agent to ship. MCP tool exposure for MCC is in building. RFM model is in active development.

**Squads involved:** PMRKT, AIS, AI Model team

---

### 2. CCaaS / Voice Platform

**What:** Building a full Contact Center as a Service (CCaaS) offering by adding voice capabilities to the Agent Console and integrating Sestek (an acquired company) into the Unifonic platform.

**Key components:**


| Component                       | Description                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Mediatel                        | Core CCaaS engine. Powers call routing, queuing, and SIP infrastructure.             |
| Sestek RTG                      | Real-Time Voice Agent integration — enables AI-powered voice agents in the platform. |
| Sestek Conversational Analytics | Post-call analytics, transcription, and insight layer.                               |
| Agent Console Voice             | Inbound and outbound voice calls handled directly inside the Agent Console UI.       |
| IVR Integration                 | Flow Studio connects to Mediatel to route inbound calls to the right queue or agent. |


**Goal:** Deliver a complete CCaaS offering — from call routing and IVR to AI voice agents and analytics — fully integrated into the Unifonic platform.

**Squads involved:** VC, CB, JO

---

## Teams


| Squad                      | Jira Key | PM                              | Products                                        |
| -------------------------- | -------- | ------------------------------- | ----------------------------------------------- |
| Campaigns & CDP            | PMRKT    | Kamal Chidirala                 | MCC, Audience, Smart Links (uLink)              |
| Business Messaging         | CON      | Ogechi Wosu                     | WhatsApp, Email, Push                           |
| SMS Unified                | SMS      | David Barajas, Muhammad Tanveer | SMS Gateway, Webhook, API v1/v2, Spike Detector |
| Voice                      | VC       | Kayode Adebowale                | Voice Calls, IVR, CCaaS                         |
| Flow Studio & Integrations | JO       | Olushola Oluyomi                | Flow Studio, Integrations                       |
| Agent Console              | CB       | Berina Halilovic                | Agent Console                                   |
| Conversational AI          | AIS      | Jessica Isah                    | Chatbot Builder                                 |
| Agentic CX                 | ACX      | Jessica Isah                    | Agentic Framework, Campaign Agents, MCP Tools   |
| UC Platform                | UCCC     | Noureldin Abdelaal              | UC Console, Billing & Charging                  |
| Data Engineering           | DENG     | Maged Boutros                   | Data Platform, Reporting APIs                   |
| Customer Insights          | CI       | Maged Boutros                   | Data & Reporting dashboards                     |
| AI Model                   | —        | —                               | AI/ML models                                    |


### Product Org Structure

Squads roll up into four product categories used across UFRF2 and planning:


| Category               | Squads              | Notes                                                                               |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| **Engagement**         | PMRKT, JO, CB, AIS  | Flow Studio, Audience, MCC, Conversational AI, Chatbot, Agent Console, Integrations |
| **Channels**           | CON, SMS, VC        | Business Messaging (WhatsApp), SMS, Voice                                           |
| **Product Experience** | — (CI team)         | UC Console, Billing & Charging, Data & Reporting. GPM: Ilma                         |
| **AI**                 | ACX + AI Model team | Agentic CX Framework, Campaign Agents, MCP Tools, AI/ML models                      |


---

## AI Strategy

Two parallel AI workstreams underpin all product initiatives:

**Agentic Framework** — A scalable orchestration layer that allows specialized agents to collaborate on complex workflows (e.g. campaign creation). Designed to be extensible: new use cases are added by plugging in new agents and MCP tools. The framework gets smarter as AI models enrich the audience data it acts on.

**AI Models (Enrichment Layer)** — Predictive models built by the AI Model team that enrich audience profiles with signals (RFM scores, preferred channel, best send time, product affinity). These models feed the Agentic Framework with better context, improving agent decision-making across all use cases.


| AI Type                       | Use Cases                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| Generative AI                 | WhatsApp template generation, campaign copy, email replies                                 |
| Predictive AI                 | RFM segmentation, churn prediction, preferred channel, best time to send, product affinity |
| Recommendation AI             | Next best audience, cross-sell/upsell, growth recommendations                              |
| Fraud Protection & Moderation | AI/ML for fraud detection, content moderation and flagging                                 |


---

## Business Goals

- IPO readiness.
- Grow GP at 30% CAGR
- Expand vertical solutions.
- Be the Primary AI Native CX platform provider in the Saudi Market.

---

## Vertical Strategy

**Target segment:** Top enterprises and mid-market. Unifonic does not serve small businesses.

### Product Line Definitions


| Product Line            | Products Included                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| **AI CX Marketing**     | MCC, Flow Studio, Audience, AI Marketing Agentic offering (Campaign Intent Agent, Segment Agent, etc.) |
| **AI CX Customer Care** | Chatbot Builder, Agent Console, Sestek (AI voice analytics + RTG)                                      |
| **CPaaS**               | Voice, SMS, WhatsApp, Email, Instagram, Apple Business Messaging                                       |
| **Platform**            | UC (Unified Console) platform, Data & Reporting                                                        |


### Verticals


| Vertical               | Primary Use                                                                                                                                   | Products                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Retail / eCommerce** | AI CX Marketing (campaign orchestration, cart abandonment, conversational commerce) + AI CX Customer Care (post-sale support, order tracking) | MCC, Audience, Flow Studio, Agentic Marketing, Chatbot, Agent Console |
| **Banking & Fintech**  | Heavy voice use cases — IVR, inbound call routing, AI voice agents, outbound collections and notifications                                    | Voice, Agent Console + Voice, Sestek RTG, Flow Studio IVR             |
| **Government**         | AI CX Customer Care (citizen inquiry automation) + AI CX Marketing for bulk notifications and large-scale announcements                       | Chatbot, Agent Console, MCC, SMS, Flow Studio                         |
| **Utilities**          | Customer care automation, outage notifications, service request routing                                                                       | Chatbot, Agent Console, Flow Studio, SMS, Voice                       |


---

## Agents


| Agent                | Model  | Purpose                                                          |
| -------------------- | ------ | ---------------------------------------------------------------- |
| `po-employee`        | Sonnet | Daily digests, user stories, release notes, docs, follow-ups     |
| `technical-writer`   | Sonnet | Customer-facing docs, release notes, enablement briefs, API docs |
| `sprint-prioritizer` | Sonnet | 6-day sprint planning, RICE scoring, scope negotiation           |
| `squad-setup`        | Sonnet | Onboard or refresh a squad config from Jira + Confluence data    |


---

## Commands


| Command                   | Purpose                                                                                                                                                    | Output                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `/daily`                  | Daily standup digest from Copilot + Jira sprint data                                                                                                       | Sprint progress, blockers, decisions, action items     |
| `/story`                  | Convert feature description into a user story and create Jira stories with explicit initial status                                                         | As/I want/So that + acceptance criteria + estimate     |
| `/comment`                | Add a comment to any Jira issue and optionally tag users with valid Jira mentions                                                                          | Comment posted + mention notifications                 |
| `/release-notes`          | Pull Done Jira tickets → write release notes → push to Confluence                                                                                          | Customer-facing release notes                          |
| `/idea`                   | Create a new UFRF2 roadmap item. Checks Top Feature flag (mandatory PVG if yes). Enforces business-language description. Attaches PVG Confluence link to idea after creation. | UFRF2 item created + PVG attached (mandatory if Top Feature) |
| `/fcb-weekly`             | Weekly review of Customer Askings (`FCB`) for new/updated items in UAE window. Classifies asks and recommends next actions.                                | Weekly summary + `/idea` or `/doc` handoff list        |
| `/doc UFRF2-xxx`          | PVG mode: fetch roadmap item → generate PVG → create squad Epic → publish to Confluence                                                                    | PVG page + Epic on squad board + Jira/Confluence links |
| `/doc SQUAD-xxx`          | Feature Doc mode: generate user-facing documentation from squad ticket or description                                                                      | Confluence-ready article                               |
| `/sprint-analysis`        | Scan the active sprint for stale, blocked, unassigned, overdue tickets. Flags DoR/DoD violations and recommends actions.                                   | Sprint analysis report with recommended actions        |
| `/setup-squad`            | Onboard or refresh a squad config from a Jira project key                                                                                                  | Draft squad config → PM approval → files written       |
| `/rfo`                    | Generate RFO from a Jira incident/RCA ticket                                                                                                               | RFO draft → PM approval → Confluence page + Jira link  |
| `/market-intel`           | Run monthly competitive intelligence digest via Anthropic web search across 4 competitor layers + MENA signals                                             | `intel/YYYY-MM-DD_HHMM.docx` — branded Word report     |
| `/market-intel` (focused) | Run `market_intel_focused.py` for AI Marketing + AI Care only, 7-day window. Skips CPaaS, MENA layers.                                                     | `intel/YYYY-MM-DD_HHMM_ai_focus.docx`                  |
| `/brainstorm`             | Challenge a PM's idea by stress-testing business impact (revenue/adoption) and forcing trade-offs. Leads with weaknesses. Chains into `/idea`, `/story`, or `/doc`. | Business case check + approaches table + recommendation |


---

## Comment Tagging Standard (All Commands)

When any command creates or updates Jira content and the PM asks to add a comment with tags:

1. Resolve each person to Atlassian `accountId` (from name or email).
2. Use ADF mention nodes for Jira comments (preferred).
3. Fallback format only if needed: `[~accountid:ACCOUNT_ID]`.
4. Never rely on plain `@name` text for notifying mentions.
5. If user resolution fails, post without mention and explicitly list unresolved names.
6. For stand-alone comment actions, use `/comment ISSUE-123 ...`.

---

## Jira Boards


| Board                     | Key                                   | Purpose                                                                                                                            |
| ------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Customer Askings          | FCB                                   | Captures customer feature requests. When a PM sets status to **Roadmap**, a linked item is auto-created in UFRF2.                  |
| Unifonic Internal Roadmap | UFRF2                                 | Company-wide roadmap visible to all employees. Items are `product_discovery` type (Jira Polaris). One item per feature/initiative. |
| Squad Boards              | PMRKT, CON, SMS, VC, JO, CB, AIS, ACX | Delivery boards per squad. Contain Epics, Stories, and Tasks for sprint execution.                                                 |


### Feature-to-Delivery Flow

**Path A — Customer Asking (from FCB):**

```
FCB (Customer Asking)
  → status: Roadmap
  → UFRF2 item auto-created
  → /doc UFRF2-xxx
  → PVG generated + PM approves
  → Epic created on squad board  (title: "[Customer Asking] Feature Name")
  → Epic linked to UFRF2 via "Polaris work item link" (is implemented by)
  → Confluence PVG page published under UPP > PVGs > [Squad]
  → Links added as comments on both UFRF2 item and Epic
```

**Path B — Internal Initiative (PM-initiated):**

```
/idea [feature description]
  → PM confirms: Category, Product Area, Feature Type, dates
  → UFRF2 item created
  → Optional: chains into /doc UFRF2-xxx → Epic + PVG
```

### UFRF2 Key Fields


| Field                  | Jira Field ID       | Notes                                                                                  |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| Product Area           | `customfield_11991` | Multi-select. Used by `/doc` PRD mode to auto-resolve squad.                           |
| Polaris work item link | link type `10413`   | Used to link UFRF2 items to squad Epics. Relationship: UFRF2 `is implemented by` Epic. |


### Product Area → Squad Mapping


| Product Area Value                    | Squad Key |
| ------------------------------------- | --------- |
| `SMS`                                 | SMS       |
| `Agent Console`                       | CB        |
| `CCaaS and Agent Console Integration` | CB        |
| `Audience`                            | PMRKT     |
| `Multi Channels Campaigns`            | PMRKT     |
| `Conversational AI`                   | AIS       |
| `Agentic CX`                          | ACX       |
| `Flow Studio`                         | JO        |
| `Voice`                               | VC        |
| `WhatsApp` / `Business Messaging`     | CON       |


---

## Squad Resolution Table

All commands use this table to map a squad key to its config file. When a command needs to resolve a squad, it reads this table — do not maintain separate copies in command files.


| Key   | Squad Name                 | Config File                              | Category   |
| ----- | -------------------------- | ---------------------------------------- | ---------- |
| PMRKT | Campaigns & CDP            | `squads/Campaigns and CDP.md`            | Engagement |
| CON   | Business Messaging         | `squads/Business Messaging.md`                          | Channels   |
| SMS   | SMS Unified                | `squads/SMS.md`                          | Channels   |
| VC    | Voice                      | `squads/Voice.md`                        | Channels   |
| JO    | Flow Studio & Integrations | `squads/Flow Studio and Integrations.md` | Engagement |
| CB    | Agent Console              | `squads/Agent Console.md`                | Engagement |
| AIS   | Conversational AI          | `squads/Conversational AI.md`            | Engagement |
| ACX   | Agentic CX                 | `squads/Agentic CX.md`                   | AI                 |
| UCCC  | UC Platform                | `squads/UC Platform.md`                  | Product Experience |
| CI    | Customer Insights          | `squads/Customer Insights.md`            | Product Experience |
| DENG  | Data Engineering           | `squads/Data Engineering.md`             | Product Experience |

> To add a new squad: add one row here and create `squads/[Squad Name].md`. No changes needed to individual command files.

---

## Integrations


| System        | Details                                       |
| ------------- | --------------------------------------------- |
| Jira          | Multi-squad — keys in `squads/*.md`           |
| Confluence    | Space Key: `UPP` — Unifonic Products Playbook |
| Atlassian MCP | Read-write access for all agents and commands |
| Copilot       | Meeting summaries used by `/daily`            |


---

## Key Config Files


| File                      | Purpose                                                                          |
| ------------------------- | -------------------------------------------------------------------------------- |
| `squads/*.md`             | Squads identity, team members, Jira/Confluence keys, sprint cadence, vocabulary  |
| `Teams-update.md`         | Communication style guide for brief team updates (2-4 lines, casual, 1-2 emojis) |
| `.claude/agent-memory/`   | Persistent memory per agent across sessions                                      |
| `market_intel_digest.py`  | Full monthly competitive digest — 4 layers + MENA signals, 30-day window         |
| `market_intel_focused.py` | Focused digest — AI Marketing + AI Care only, 7-day window                       |


---

## Definition of Ready (DoR)

All tickets must satisfy these criteria before entering a sprint:


| #   | Criterion                   |
| --- | --------------------------- |
| 1   | Clear goal defined          |
| 2   | Acceptance criteria refined |
| 3   | Dependencies noted          |
| 4   | Risks known                 |
| 5   | Test approach noted         |
| 6   | Story points set            |


## Definition of Done (DoD)

All tickets must satisfy these criteria before being marked Done:


| #   | Criterion                                                                         |
| --- | --------------------------------------------------------------------------------- |
| 1   | Code Complete: Feature/bug is coded                                               |
| 2   | Code Review: Complete & approved                                                  |
| 3   | Documentation: Technical and user docs updated                                    |
| 4   | Unit & Integration Tests: Implemented and passing                                 |
| 5   | Acceptance Testing (Local): TestRail cases executed locally and passed            |
| 6   | Acceptance Testing (Integration/Pre-Prod): Deployed and all acceptance tests pass |
| 7   | Automated Coverage: API/E2E tests committed and passing in CI pipeline            |
| 8   | Production Verification: Smoke-tested on production                               |


---

## Shared Vocabulary

Unifonic-wide terms used across all squads. Squad-specific terminology lives in each `squads/*.md` file.


| Term        | Meaning                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| WA          | WhatsApp Business API                                                                                                  |
| MCC         | Marketing Campaign Cloud — Unifonic's campaign orchestration product                                                   |
| Flow Studio | Journey automation builder                                                                                             |
| CPaaS       | Communications Platform as a Service                                                                                   |
| CX          | Customer Experience                                                                                                    |
| CCaaS       | Contact Center as a Service — Unifonic's voice + agent offering powered by Mediatel                                    |
| UC          | Unified Console — Unifonic's core admin and platform layer                                                             |
| RFM         | Recency, Frequency, Monetary — segmentation model classifying customers by behavior                                    |
| Sestek      | Acquired company integrated into Unifonic. Provides RTG (Real-Time Voice Agent) and Conversational Analytics for voice |
| Mediatel    | Core CCaaS engine powering call routing, queuing, and SIP infrastructure                                               |
| RTG         | Real-Time Voice Agent (Sestek) — AI-powered voice agent capability                                                     |
| MFE         | Micro-Frontend — modular UI architecture at Unifonic                                                                   |
| OCI         | Oracle Cloud Infrastructure — primary cloud platform                                                                   |


---

## Keywords

`Unifonic` `CPaaS` `AI Native CX` `Agentic Marketing` `Agentic CX` `Flow Studio` `CDP` `MCC` `Campaign Orchestration` `WhatsApp Business API` `AI Marketing Models` `MCP Tools` `RFM Segmentation` `CCaaS` `Sestek` `Mediatel` `Voice AI` `Audience Enrichment` `Vertical Solutions` `GCC` `IPO Readiness`