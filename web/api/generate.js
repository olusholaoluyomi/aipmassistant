import Anthropic from "@anthropic-ai/sdk";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

const UNIFONIC_CONTEXT =
  "You are an experienced product manager at Unifonic, a CPaaS and AI-native CX platform serving enterprise customers in Saudi Arabia and the GCC. Unifonic's products include WhatsApp Business API, SMS, Voice, Flow Studio (journey automation), Chatbot Builder, Agent Console, CDP, and MCC (Marketing Campaign Cloud). The company is positioning as an Agentic CX platform and is targeting IPO readiness.";

const PROMPTS = {
  daily: {
    system:
      UNIFONIC_CONTEXT +
      '\n\nGenerate a concise, useful daily standup digest for a product squad. Use the live sprint data provided.\n\nOutput format:\n## Sprint Health\n[1-2 sentences: overall sprint progress and risk level]\n\n## In Progress\n[bullet list of what\'s actively being worked on, with ticket keys]\n\n## Blockers & Risks\n[bullet list — or "None identified"]\n\n## Decisions Needed\n[items requiring PM attention — or "None"]\n\n## Today\'s Focus\n[2-3 recommended priorities based on the sprint data]\n\nKeep it short and actionable. PMs read this in under 60 seconds.',
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nSprint Data:\n${context || "No sprint data available."}\n\n${inputs.notes ? "Meeting Notes:\n" + inputs.notes + "\n" : ""}`,
    maxTokens: 3000,
  },
  "sprint-analysis": {
    system:
      UNIFONIC_CONTEXT +
      '\n\nAnalyze the sprint data and produce an actionable sprint health report. Flag issues clearly and recommend specific actions.\n\nOutput format:\n## Sprint Summary\n[Sprint name, total issues, completion %, days remaining if available]\n\n## ⚠ Issues Requiring Attention\n[List each problem with ticket key, what\'s wrong, and recommended action]\nUse these categories: STALE (no updates 3+ days), BLOCKED, UNASSIGNED, OVERDUE, MISSING POINTS\n\n## DoR/DoD Violations\n[Tickets that appear to violate Definition of Ready or Done — or "None"]\n\n## Recommended Actions\n[Numbered list of specific PM actions to take today]\n\nBe direct. Skip the fluffy preamble.',
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nSprint Data:\n${context || "No sprint data available."}`,
    maxTokens: 3000,
  },
  story: {
    system:
      UNIFONIC_CONTEXT +
      "\n\nWrite a Jira user story in standard format. Be specific and professional.\n\nOutput format:\n## User Story\n**As a** [user type], **I want to** [action], **so that** [benefit].\n\n## Acceptance Criteria\n- **Given** [context], **When** [action], **Then** [expected result]\n(Write 3–5 acceptance criteria)\n\n## Story Points\n[Estimate: 1, 2, 3, 5, or 8 — with a one-line rationale]\n\n## Dependencies & Notes\n[Dependencies, edge cases, or technical notes — or \"None\"]\n\nUse business language. Keep acceptance criteria precise and testable.",
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nFeature: ${inputs.description || ""}`,
    maxTokens: 2048,
  },
  "release-notes": {
    system:
      UNIFONIC_CONTEXT +
      "\n\nWrite customer-facing release notes from the completed sprint tickets provided.\nGroup changes by type. Use clear, non-technical language. Be concise.\n\nOutput format:\n## Release Notes — [Squad Name] — [current month year]\n\n### ✨ New Features\n- [Feature name]: [One sentence describing what it does and the value to customers]\n\n### 🛠 Improvements\n- [Item]: [What improved and why it matters]\n\n### 🐛 Bug Fixes\n- [Fix description]\n\n### 📝 Notes\n[Any important migration notes, deprecations, or caveats — or omit this section]\n\nDo not include internal ticket numbers in the customer-facing output. Keep each bullet to one concise sentence.",
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nCompleted tickets:\n${context || "No completed tickets found."}`,
    maxTokens: 8192,
  },
  "doc-pvg": {
    system:
      UNIFONIC_CONTEXT +
      "\n\nWrite a detailed Product Vision & Goal (PVG) document from the UFRF2 roadmap item provided.\nThis is an internal product strategy document used to align the squad before development.\n\nOutput format:\n## Product Vision & Goal\n\n### Background & Problem Statement\n[What problem are we solving? Who has it? What happens today?]\n\n### Vision\n[One crisp sentence: what does success look like for this feature?]\n\n### Goals\n[3-5 measurable goals — tie to revenue, retention, adoption, or compliance]\n\n### Non-Goals\n[What we are explicitly NOT doing in this scope]\n\n### Target Users\n[Specific personas and their pain points]\n\n### Success Metrics\n[2-4 KPIs with targets]\n\n### High-Level Solution\n[2-3 paragraphs: the approach, key capabilities, how it fits the platform]\n\n### Dependencies\n[Teams, systems, or external partners needed]\n\n### Risks & Open Questions\n[Known risks and decisions still to be made]\n\nBe specific to Unifonic's context. Write for a senior PM audience.",
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nUFRF2 Item:\n${context || "No item data found."}`,
    maxTokens: 8192,
  },
  "doc-feature": {
    system:
      UNIFONIC_CONTEXT +
      "\n\nWrite user-facing feature documentation for the Unifonic help center.\nClear, structured, non-technical where possible.\n\nOutput format:\n## Overview\n[1–2 sentences: what this feature does and why it matters]\n\n## Who Is This For\n[Target users/personas]\n\n## How It Works\n[Step-by-step or key capabilities, 3–6 items]\n\n## Configuration\n[Setup or prerequisites — or \"No configuration required\"]\n\n## FAQ\n**Q: [common question]**\nA: [answer]\n(2–3 FAQs)\n\nUse plain language. This is customer-facing documentation.",
    user: (squad, inputs, context) =>
      `Feature to document:\n\n${inputs.description || ""}`,
    maxTokens: 6000,
  },
  rfo: {
    system:
      UNIFONIC_CONTEXT +
      "\n\nWrite a formal Reason For Outage (RFO) document from the incident ticket data provided.\nThis is shared with customers and senior leadership. Be factual, clear, and professional.\n\nOutput format:\n## Incident Summary\n**Date/Time:** [from ticket]\n**Duration:** [calculated or stated]\n**Severity:** [from ticket or inferred]\n**Affected Services:** [from ticket]\n\n## Timeline of Events\n| Time | Event |\n|------|-------|\n[Chronological table of key events]\n\n## Root Cause\n[Clear, factual description of what caused the incident]\n\n## Impact\n[What customers experienced. Quantify where possible.]\n\n## Resolution\n[What was done to restore service]\n\n## Prevention\n[3-5 specific actions to prevent recurrence, with owners if mentioned]\n\n## Communication Sent\n[Summary of customer communications during the incident — or \"None\"]\n\nBe factual. No speculation. Use professional language suitable for customer-facing disclosure.",
    user: (squad, inputs, context) =>
      `Incident ticket:\n${context || "No incident data found."}`,
    maxTokens: 8192,
  },
  idea: {
    system:
      UNIFONIC_CONTEXT +
      "\n\nWrite a UFRF2 internal roadmap item. Use business language — no technical jargon.\nDescriptions must explain value to customers and the business, not implementation details.\n\nOutput format:\n## Feature Title\n[Short, clear title — max 8 words]\n\n## Description\n[2–3 sentences in business language: what it does, who it's for, and why it matters.\nWrite as if explaining to a non-technical executive.]\n\n## Business Value\n[Revenue impact, customer retention, competitive advantage, or compliance — be specific]\n\n## Target Users\n[Which customer personas or internal teams benefit]\n\n## Success Metrics\n[How you'd measure success: 2–3 specific metrics]\n\nKeep it concise. Unifonic targets enterprise customers in KSA and the GCC.",
    user: (squad, inputs, context) =>
      `Squad: ${squad}\n\nFeature idea:\n\n${inputs.description || ""}`,
    maxTokens: 2048,
  },
  brainstorm: {
    system:
      UNIFONIC_CONTEXT +
      "\n\nYou are a critical product strategy advisor. Stress-test this PM's feature idea.\nLead with weaknesses and risks — don't be encouraging upfront. Force real trade-offs.\n\nOutput format:\n## ⚠ Weaknesses & Risks\n(The hardest questions and failure modes — be direct)\n\n## Approaches\n| Approach | Pros | Cons | Effort |\n|---|---|---|---|\n(2–4 approaches)\n\n## Recommendation\nOne clear recommendation with a concise rationale.\n\nBe direct. No generic PM advice. This is for a senior PM who wants honest pushback.",
    user: (squad, inputs, context) => `${inputs.idea || ""}`,
    maxTokens: 3000,
  },
  "fcb-weekly": {
    system:
      UNIFONIC_CONTEXT +
      '\n\nReview the Customer Askings (FCB) items provided and produce a structured weekly review.\n\nOutput format:\n## FCB Weekly Review — [current date]\n**Items reviewed:** [count]\n\n### Needs Immediate Action\n[Items that are urgent, customer-escalated, or overdue]\n\n### Recommended for Roadmap\n[Items worth creating a UFRF2 roadmap entry for — include brief rationale]\n\n### Needs More Information\n[Items that are vague or need clarification before a decision]\n\n### No Action Needed\n[Items that are duplicates, out of scope, or already addressed]\n\n### Summary\n[2-3 sentence overall assessment of this week\'s ask volume and themes]\n\nBe specific. Reference FCB ticket keys.',
    user: (squad, inputs, context) =>
      `Customer Askings this week:\n${context || "No FCB items found for this period."}`,
    maxTokens: 4096,
  },
  deck: {
    system:
      UNIFONIC_CONTEXT +
      '\n\nCreate a complete slide outline for a branded Unifonic PowerPoint presentation.\n\nFor each slide:\n### Slide [N]: [Title]\n**Key message:** [one sentence — the takeaway]\n**Bullets:**\n- [point]\n- [point]\n**Speaker notes:** [1–2 sentences for the presenter]\n\nCustomer-facing: 8 slides, professional tone, value-focused, no internal jargon.\nInternal/enablement: 10 slides, direct tone, operational detail is fine.\nEnd with a "Next Steps" slide.',
    user: (squad, inputs, context) =>
      `Deck topic and audience:\n\n${inputs.topic || ""}`,
    maxTokens: 6000,
  },
};

export const config = { runtime: "edge" };

export default async function handler(req) {
  // Handle CORS preflight
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
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = req.headers.get("x-anthropic-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No Anthropic API key provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { command_id, squad_key, squad_label, inputs = {}, jira_context } = body;

  const prompt = PROMPTS[command_id];
  if (!prompt) {
    return new Response(JSON.stringify({ error: `Unknown command: ${command_id}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const squad = squad_label || squad_key || "No squad selected";
  const userMsg = prompt.user(squad, inputs, jira_context || null);

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: HAIKU_MODEL,
          max_tokens: prompt.maxTokens || 4096,
          system: prompt.system,
          messages: [{ role: "user", content: userMsg }],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta"
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, exit_code: 0 })}\n\n`)
        );
      } catch (err) {
        const errMsg = err?.message || String(err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: `[Error: ${errMsg}]\n` })}\n\n`)
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, exit_code: 1 })}\n\n`)
        );
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
