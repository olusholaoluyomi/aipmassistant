# Technical Writer Agent Memory

This file is auto-loaded into the agent's system prompt. Keep it under 200 lines.

## Patterns & Preferences

- Rafa wants release notes grouped by theme (not by ticket), with no ticket keys in customer-facing output
- Infrastructure/AWS work should be framed as reliability and performance improvements — never as internal ops or migration
- Cancelled bugs: list under Known Issues as "under investigation" if customer-visible, omit if purely internal
- MCP/AI integration tickets should be framed as platform foundations for future features, not shipped capabilities

## Release Note Conventions

- Structure: What's New (by theme) → Platform Improvements → AI & Integrations → Who Is Affected (table) → Known Issues (table) → Coming Next (table)
- "Coming Next" section replaces "Notes & Limitations" for sprint-based release notes — maps In Progress / Ready for Sprint tickets to next release
- Use second-person, present tense throughout ("You can now...", "You will notice...")
- Avoid: ticket IDs, internal system names (Tracardi, uLink, Grafana, Kafka), AWS, MFE, BE/FE, DR/HA as raw acronyms
- "MCC" is always spelled out as "Marketing Campaign Cloud" on first reference per release note
- Beta features should be labeled "(Beta)" inline and include a "no action required" callout

## Documentation Standards

- Audience impact table: always include column headers Audience | Impact
- Known Issues table: always include Area | Issue | Status columns
- Coming Next table: always include Feature | Description columns
- Output saved to: /Users/rortiz/Desktop/Claude/outputs/
