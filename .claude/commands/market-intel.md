# /market-intel — Competitive Intelligence Digest

Run the Unifonic monthly competitive intelligence digest and save output as a `.docx` file.

---

## What This Command Does

Executes `market_intel_digest.py`, which uses the Anthropic web search tool to scan the past 30 days of competitor activity across 4 layers, then generates a branded Word document.

---

## Layers Covered

| Layer | Competitors |
|---|---|
| CPaaS & Channels | Twilio, Infobip, Sinch, MessageBird, T2 (STC) |
| Agentic Marketing & Campaign Orchestration | Braze, MoEngage, WebEngage, CleverTap, Insider |
| AI Customer Care & CCaaS | Intercom, Zendesk, Genesys, Salesforce Service Cloud, Freshworks |
| MENA & Regional Players | Wati, STC, Zain, Mobily, Taqnyat |
| MENA & Industry Signals | GCC/MENA market signals, regulatory updates, funding rounds |

---

## Prerequisites

1. `ANTHROPIC_API_KEY` must be set in `.env` (gitignored — do not commit)
2. Dependencies installed: `pip3 install -r requirements.txt`

---

## Steps

1. Verify `.env` exists with `ANTHROPIC_API_KEY`
2. Run: `python3 market_intel_digest.py`
3. Confirm output written to `intel/YYYY-MM-DD_HHMM.docx`
4. Report the output path and confirm all 5 layers completed

If the `.env` file is missing, prompt the user for their Anthropic API key and write it to `.env` before running.

If any dependency is missing, run `pip3 install -r requirements.txt` first.

---

## Output

- File: `intel/YYYY-MM-DD_HHMM.docx`
- Format: Branded Word document with Unifonic colors, clickable hyperlinks, competitor headings, and MENA signals section
- Scope: Past 30 days of competitor activity

---

## Frequency

Run monthly. The digest covers a 30-day window so weekly runs would produce duplicate content.
