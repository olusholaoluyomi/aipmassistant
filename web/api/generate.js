import Anthropic from "@anthropic-ai/sdk";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const GENERIC_CONTEXT = "You are an experienced product manager. Be specific, professional, and actionable.";

// Instruction-only strings (persona is injected from company_context at request time)
const PROMPTS = {
  daily: {
    instructions: `Generate a concise daily standup digest for a product squad. Use the live sprint data and meeting notes provided.

Output format:
## Daily Standup Digest - [DATE]

### Sprint Progress
| Ticket | Title | Status | Owner | Notes |
|---|---|---|---|---|

### Decisions Made
- [decision]

### Blockers
| Ticket | Blocker | Owner | Days Blocked |
|---|---|---|---|

### Action Items
| Action | Owner | Due |
|---|---|---|

### Needs PM Decision
- [item if any]

Use "None" where a section has no items. Keep notes short and action-oriented.`,
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nSprint Data:\n${context || "No sprint data available."}\n\n${inputs.notes ? "Meeting Notes:\n" + inputs.notes + "\n" : ""}`,
    maxTokens: 3000,
  },

  "sprint-analysis": {
    instructions: `Analyze the sprint data and produce a follow-up report for the PM. Flag stale, blocked, and unassigned work clearly and recommend specific actions.

Output format:
## Follow-up Report - [DATE]

### Stale Tickets (No update in 3+ days)
| Ticket | Title | Assignee | Days Since Update | Status |
|---|---|---|---|---|

### Blocked Tickets
| Ticket | Title | Blocker Description | Owner | Action Needed |
|---|---|---|---|---|

### Unassigned Tickets
| Ticket | Title | Priority | Sprint |
|---|---|---|---|

### Recommended Actions
| Priority | Action | Owner |
|---|---|---|

### Needs PM Decision
- [items requiring PM input]

Use "None" in empty tables or lists. Be direct. Skip the fluffy preamble.`,
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nSprint Data:\n${context || "No sprint data available."}`,
    maxTokens: 3000,
  },

  story: {
    instructions: `Write a Jira Epic with a short list of implementation-ready child User Stories. Be specific and professional. Use business language. Keep acceptance criteria precise and testable.

Output format:
## Epic: [clear Epic title]
**Epic Summary:** [one sentence]

### Business Outcome
[2-3 bullets on value, adoption, revenue, retention, compliance, or operational impact]

### Scope
[3-5 bullets describing what is included]

### Non-Goals
[1-3 bullets, or "None"]

### Acceptance Criteria
[Epic-level acceptance criteria]

## Suggested Stories
### User Story: [Title - Verb + Object + Context]

**As a** [user type]
**I want to** [action]
**So that** [outcome]

#### Acceptance Criteria
- Given [context], when [action], then [result]
- Given [context], when [action], then [result]
- Given [context], when [action], then [result]
- (minimum 3, maximum 5)

#### Definition of Done
- [ ] Code Complete: Feature/bug is coded
- [ ] Code Review: Complete & approved
- [ ] Documentation: Technical and user docs updated
- [ ] Unit & Integration Tests: Implemented and passing
- [ ] Acceptance Testing (Local): TestRail cases executed locally and passed
- [ ] Acceptance Testing (Integration/Pre-Prod): Deployed and all acceptance tests pass
- [ ] Automated Coverage: API/E2E tests committed and passing in CI pipeline
- [ ] Production Verification: Smoke-tested on production

#### Story Points
Estimate: [1/2/3/5/8/13] - Rationale: [brief reason]

#### Dependencies
- [dependency or "None"]

#### Labels
[epic-label], [squad-label]

Repeat for 3-6 small User Stories that can be individually approved and created under the Epic.`,
    user: (squad, inputs) => {
      const acFormat = inputs.ac_format || "gherkin";
      const extras = (inputs.extras || "story_points,dependencies").split(",").map(s => s.trim()).filter(Boolean);
      const acFormats = {
        "gherkin":    "Gherkin format:\n- Given [context], when [action], then [result]",
        "checklist":  "Checklist format:\n- [ ] [acceptance criterion]",
        "test-cases": "Numbered test cases:\n1. [Scenario] -> Expected: [result]",
      };
      const acInstruction = acFormats[acFormat] || acFormats["gherkin"];
      const extrasText = [];
      if (extras.includes("edge_cases"))      extrasText.push("Call out edge cases inside the relevant acceptance criteria.");
      if (extras.includes("story_points"))    extrasText.push("Include Story Points for every User Story.");
      if (extras.includes("dependencies"))    extrasText.push("Include Dependencies for every User Story, or write \"None\".");
      if (extras.includes("technical_notes")) extrasText.push("Add technical notes only when they clarify delivery without turning the story into a technical spec.");
      return `Squad: ${squad}\n\nFeature / initiative: ${inputs.description || ""}\n\nAcceptance criteria style: ${acInstruction}\n\nStory guidance:\n- Suggest 3-6 small User Stories under the Epic.\n- Each User Story should be independently shippable or testable.\n- Keep User Story titles short and action-oriented.\n- Include the full Definition of Done checklist in each User Story.\n${extrasText.map(x => "- " + x).join("\n")}`;
    },
    maxTokens: 5000,
  },

  "release-notes": {
    instructions: `Write customer-facing release notes from the completed tickets provided. Group changes by type. Use clear, non-technical language. Be concise.

Output format:
## Release Notes — [Product / Squad Name] — [current month year]

### ✨ New Features
- [Feature name]: [One sentence describing what it does and the value to customers]

### 🛠 Improvements
- [Item]: [What improved and why it matters]

### 🐛 Bug Fixes
- [Fix description]

### 📝 Notes
[Any important migration notes, deprecations, or caveats — or omit this section]

Do not include internal ticket numbers. Keep each bullet to one concise sentence.`,
    user: (squad, inputs, context) => {
      const period = (inputs.period || "").trim();
      return `Squad: ${squad}\n${period ? `Period: ${period}\n` : ""}
Completed tickets:\n${context || "No completed tickets found."}`;
    },
    maxTokens: 8192,
  },

  "doc-pvg": {
    instructions: `Write a Product Value Guide (PVG). A PVG frames the feature through customer problems and business impact, not technical specs. It tells the story of the customer's pain and how this feature solves it.

Be specific and concrete. Avoid filler. Base it on the UFRF2 or PM-provided feature context. Fill gaps with reasonable inferences based on Unifonic's CPaaS and AI CX platform context, and explicitly flag anything that needs PM input.

Output format:
# PVG - [Feature Name]

---

### 1. Problem Space (The Why)

#### Problem Statement

_What is the customer's challenge?_

[Describe the pain point from the customer's perspective. Who is affected, in what context, and what goes wrong today? Use concrete scenarios. Reference known customer segments, FCB feedback, Unifonic products, or industry patterns when relevant. Write so a non-technical reader immediately understands the frustration.]

#### Problem Impact

_How does the problem affect the customer and the business?_

- [Operational impact, such as wasted supervisor time, manual workarounds, or limits to scale]
- [Customer experience impact, such as delays, inconsistency, frustration, or churn signals]
- [Business impact, such as missed revenue, competitive gap, or compliance risk]
- [Unifonic impact, such as customer dissatisfaction, churn risk, or upsell blocker]

---

### 2. Solution Space (The What)

#### Narrative

_Pick exactly one format that best brings the solution to life. Include only the chosen format in the final PVG._

**Option A - Customer Review Format**
> [Write a 3-5 sentence first-person review from the perspective of a customer who just used this feature. Capture the emotional before/after and the specific value they got. Make it feel real and grounded in a realistic Unifonic customer scenario.]

**Option B - Objective Journalist Article Format**
> **[Feature Name]: [Brief Headline]**
>
> [2-3 paragraphs covering what the feature does, key benefits with specifics, and honest considerations or trade-offs. Write in neutral, factual journalist style.]

**Option C - Press Release Format**
> **Unifonic Launches [Feature Name] to [Customer Outcome]**
>
> **Riyadh, Saudi Arabia - [Date]** - [Announcement paragraph. Key benefits paragraph. Spokesperson quote. Availability statement.]

#### Solution Summary

_How does your solution address the problem?_

[1-2 sentences describing the core mechanism of the solution: what it does and how it works at a high level.]

Expected outcomes:
- [Metric 1, such as reduce manual review time by 60%]
- [Metric 2, such as improve compliance detection rate by 30%]
- [Metric 3, such as increase supervisor efficiency by 40%]

#### Customer Experience Summary

_Show how the solution will look or feel for the customer:_

[Walk through the end-to-end experience from the customer's point of view. What do they see, click, configure, or receive? Describe the key touchpoints and how the feature changes their day-to-day workflow.]

- **Screenshots/Diagrams:** [Include 1-3 visuals if available. Otherwise note: To Be Added]
- **Links to Additional Resources:** [e.g., PRDs, UX flows, Figma boards, Story Maps. Otherwise: To Be Added]

### PM Input Needed

[List only the important assumptions, missing metrics, unclear customers, or decisions that need PM confirmation. If nothing material is missing, write "None identified."]`,
    user: (squad, inputs) =>
      `Squad: ${squad}\n\nUFRF2 / PM-provided feature context:\n${inputs.feature_context || inputs.description || ""}`,
    maxTokens: 8192,
  },
  "doc-feature": {
    instructions: `Write user-facing feature documentation for a help center. Clear, structured, non-technical where possible.

Output format:
## Overview
[1–2 sentences: what this feature does and why it matters]

## Who Is This For
[Target users/personas]

## How It Works
[Step-by-step or key capabilities, 3–6 items]

## Configuration
[Setup or prerequisites — or "No configuration required"]

## FAQ
**Q: [common question]**
A: [answer]
(2–3 FAQs)

Use plain language. This is customer-facing documentation.`,
    user: (squad, inputs) =>
      `Feature to document:\n\n${inputs.description || ""}`,
    maxTokens: 6000,
  },

  rfo: {
    instructions: `Write a formal Reason For Outage (RFO) document from the incident ticket data provided. This is shared with customers and senior leadership. Be factual, clear, and professional.

Output format:
## Incident Summary
**Date/Time:** [from ticket]
**Duration:** [calculated or stated]
**Severity:** [from ticket or inferred]
**Affected Services:** [from ticket]

## Timeline of Events
| Time | Event |
|------|-------|
[Chronological table of key events]

## Root Cause
[Clear, factual description of what caused the incident]

## Impact
[What customers experienced. Quantify where possible.]

## Resolution
[What was done to restore service]

## Prevention
[3-5 specific actions to prevent recurrence, with owners if mentioned]

## Communication Sent
[Summary of customer communications during the incident — or "None"]

Be factual. No speculation.`,
    user: (squad, inputs, context) =>
      `Incident ticket:\n${context || "No incident data found."}`,
    maxTokens: 8192,
  },

  idea: {
    instructions: `Write an internal roadmap item. Use business language — no technical jargon. Descriptions must explain value to customers and the business, not implementation details.

Output format:
## Feature Title
[Short, clear title — max 8 words]

## Description
[2–3 sentences in business language: what it does, who it's for, and why it matters. Write as if explaining to a non-technical executive.]

## Business Value
[Revenue impact, customer retention, competitive advantage, or compliance — be specific]

## Target Users
[Which customer personas or internal teams benefit]

## Success Metrics
[How you'd measure success: 2–3 specific metrics]

Keep it concise.`,
    user: (squad, inputs) =>
      `Squad: ${squad}\n\nFeature idea:\n\n${inputs.description || ""}`,
    maxTokens: 2048,
  },

  brainstorm: {
    instructions: `You are a critical product strategy advisor. Stress-test this PM's feature idea. Lead with weaknesses and risks — don't be encouraging upfront. Force real trade-offs.

Output format:
## ⚠ Weaknesses & Risks
(The hardest questions and failure modes — be direct)

## Approaches
| Approach | Pros | Cons | Effort |
|---|---|---|---|
(2–4 approaches)

## Recommendation
One clear recommendation with a concise rationale.

Be direct. No generic PM advice. This is for a senior PM who wants honest pushback.`,
    user: (squad, inputs) => inputs.idea || "",
    maxTokens: 3000,
  },

  "fcb-weekly": {
    instructions: `Review the Customer Askings items provided and produce a structured weekly review.

Output format:
## Customer Askings Weekly Review — [current date]
**Items reviewed:** [count]

### Needs Immediate Action
[Items that are urgent, customer-escalated, or overdue]

### Recommended for Roadmap
[Items worth creating a roadmap entry for — include brief rationale]

### Needs More Information
[Items that are vague or need clarification before a decision]

### No Action Needed
[Items that are duplicates, out of scope, or already addressed]

### Summary
[2-3 sentence overall assessment of this week's ask volume and themes]

Be specific. Reference ticket keys.`,
    user: (squad, inputs, context) =>
      `Customer Askings this week:\n${context || "No items found for this period."}`,
    maxTokens: 4096,
  },

  "market-intel": {
    instructions: `You are a competitive intelligence analyst. Produce a structured competitive intelligence digest based on the market context provided. Use your knowledge to provide insightful, actionable analysis.

Output format:
## Market Intelligence Digest — [Company] — [current month year]

### Market Overview
[2-3 sentences on the state of this market/category right now]

### Competitor Landscape
[For each key competitor mentioned, provide: positioning, recent moves, strengths, weaknesses]

### Key Trends
[3-5 significant trends shaping the market — with implications for the company]

### Opportunities
[2-3 specific opportunities based on competitive gaps or market dynamics]

### Threats & Risks
[2-3 threats the company should watch closely]

### Recommended Actions
[3-5 specific, actionable recommendations for the product/GTM team]

Be specific and direct. Avoid generic observations.`,
    user: (squad, inputs) => {
      const regionMap = {
        "global": "Global", "north-america": "North America", "mena": "MENA",
        "europe": "Europe", "apac": "Asia Pacific", "latam": "Latin America", "africa": "Africa",
      };
      const focusLabels = {
        "features": "Product & features", "pricing": "Pricing", "gtm": "GTM & marketing",
        "funding": "Funding & M&A", "launches": "Recent launches", "sentiment": "Customer sentiment",
      };
      const region = regionMap[inputs.region] || inputs.region || "Global";
      const focus  = (inputs.focus || "features,gtm").split(",").map(f => focusLabels[f.trim()] || f.trim()).join(", ");
      const competitors = inputs.competitors ? `Key competitors: ${inputs.competitors}` : "Identify the main competitors";
      const period = (inputs.period || "").trim();
      return `Company / Product: ${inputs.company || "Not specified"}
Industry / Category: ${inputs.industry || "Not specified"}
Region / Market: ${region}
${competitors}
Focus areas: ${focus}${period ? `\nPeriod: ${period}` : ""}

Generate a comprehensive competitive intelligence digest for this company.`;
    },
    maxTokens: 6000,
  },

  deck: {
    instructions: `Create a complete slide deck outline based on the specifications provided.

For each slide use this format:
### Slide [N]: [Title]
**Key message:** [one sentence — the single takeaway]
**Content:**
- [bullet point]
- [bullet point]
**Speaker notes:** [1–2 sentences for the presenter]
**Design note:** [brief suggestion for visuals, layout, or emphasis that fits the requested style]

End with a clear "Next Steps" or "Call to Action" slide.`,
    user: (squad, inputs) => {
      const audienceMap = {
        "internal":  "Internal team", "executive": "Executive / leadership",
        "customer":  "Customer-facing", "sales": "Sales pitch", "board": "Board / investors",
      };
      const styleMap = {
        "professional": "Professional & clean — polished, structured, confident",
        "bold":         "Bold & direct — large statements, high contrast, no fluff",
        "minimal":      "Minimal & elegant — lots of white space, refined typography",
        "playful":      "Playful & energetic — dynamic, vibrant, conversational",
        "corporate":    "Corporate & formal — conservative, structured, traditional",
      };
      const toneMap = {
        "confident":      "Confident & clear",
        "conversational": "Conversational & approachable",
        "inspiring":      "Inspiring & visionary",
        "analytical":     "Data-driven & analytical",
      };
      const lengthMap = {
        "short": "5–7 slides", "medium": "8–10 slides", "long": "12–15 slides",
      };
      const audience = audienceMap[inputs.audience] || "General";
      const style    = styleMap[inputs.style]    || styleMap["professional"];
      const tone     = toneMap[inputs.tone]      || toneMap["confident"];
      const length   = lengthMap[inputs.length]  || "8–10 slides";

      return `Topic & objective: ${inputs.topic || ""}

Audience: ${audience}
Visual style: ${style}
Tone: ${tone}
Length: ${length}

Create a complete slide outline for this deck.`;
    },
    maxTokens: 6000,
  },
};

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-anthropic-key",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = req.headers.get("x-anthropic-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No Anthropic API key provided" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try { body = await req.json(); }
  catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const { command_id, squad_key, squad_label, inputs = {}, jira_context, company_context, current_date } = body;

  const prompt = PROMPTS[command_id];
  if (!prompt) {
    return new Response(JSON.stringify({ error: `Unknown command: ${command_id}` }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  // Build system prompt: user's company context + date + command-specific instructions
  const persona   = (company_context || "").trim() || GENERIC_CONTEXT;
  const today     = (current_date || "").trim() || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const systemPrompt = persona + `\n\nToday's date: ${today}` + "\n\n" + prompt.instructions;

  const squad   = squad_label || squad_key || "No squad selected";
  const userMsg = prompt.user(squad, inputs, jira_context || null);

  const client  = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model:      HAIKU_MODEL,
          max_tokens: prompt.maxTokens || 4096,
          system:     systemPrompt,
          messages:   [{ role: "user", content: userMsg }],
        });
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, exit_code: 0 })}\n\n`));
      } catch (err) {
        const msg = err?.message || String(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `[Error: ${msg}]\n` })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, exit_code: 1 })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
