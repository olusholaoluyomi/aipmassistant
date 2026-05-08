import os
import sys
import json
import shutil
import subprocess
from pathlib import Path
from flask import (
    Flask, render_template, request, Response,
    stream_with_context, session, jsonify, send_from_directory, abort
)
from dotenv import load_dotenv
import anthropic

def _load_env():
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ[k.strip()] = v.strip()

_load_env()

app = Flask(__name__)
app.secret_key = os.urandom(24)

PROJECT_ROOT = Path(__file__).parent

# ---------------------------------------------------------------------------
# Anthropic client (Haiku for generation)
# ---------------------------------------------------------------------------

HAIKU_MODEL = "claude-haiku-4-5-20251001"

def make_anthropic_client():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        return None
    try:
        return anthropic.Anthropic(api_key=key)
    except Exception:
        return None

anthropic_client = make_anthropic_client()

# ---------------------------------------------------------------------------
# Locate claude CLI
# ---------------------------------------------------------------------------

def find_claude():
    for name in ("claude", "claude.cmd", "claude.exe"):
        found = shutil.which(name)
        if found:
            return found
    candidates = [
        os.path.expandvars(r"%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe"),
        os.path.expandvars(r"%APPDATA%\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe"),
        os.path.expandvars(r"%APPDATA%\npm\claude.cmd"),
        os.path.expandvars(r"%APPDATA%\npm\claude"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\claude\claude.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Claude\resources\app\bin\claude"),
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return None

CLAUDE_BIN = os.environ.get("CLAUDE_BIN") or find_claude()

def is_cmd_file(path):
    return path and path.lower().endswith(".cmd")

# ---------------------------------------------------------------------------
# Command routing: which commands use Haiku vs Claude CLI
# ---------------------------------------------------------------------------

# These commands generate content locally with Haiku, then optionally push
GENERATION_COMMANDS = {"story", "brainstorm", "doc-feature", "idea", "deck"}

# These commands have a push action after editing (brainstorm is analysis-only)
PUSH_COMMANDS = {"story", "doc-feature", "idea", "deck"}

PUSH_LABELS = {
    "story":       "Create Jira Story",
    "doc-feature": "Publish to Confluence",
    "idea":        "Create Roadmap Item",
    "deck":        "Build PowerPoint",
}

# ---------------------------------------------------------------------------
# Squads & Commands
# ---------------------------------------------------------------------------

SQUADS = [
    {"key": "PMRKT", "name": "Campaigns & CDP"},
    {"key": "CON",   "name": "Business Messaging"},
    {"key": "SMS",   "name": "SMS Unified"},
    {"key": "VC",    "name": "Voice"},
    {"key": "JO",    "name": "Flow Studio & Integrations"},
    {"key": "CB",    "name": "Agent Console"},
    {"key": "AIS",   "name": "Conversational AI"},
    {"key": "ACX",   "name": "Agentic CX"},
    {"key": "UCCC",  "name": "UC Platform"},
    {"key": "CI",    "name": "Customer Insights"},
    {"key": "DENG",  "name": "Data Engineering"},
]

COMMANDS = [
    # ── Daily Ops ────────────────────────────────────────────────────────────
    {
        "id": "daily", "name": "Daily Standup", "category": "Daily Ops",
        "mode": "cli", "slug": "/daily", "needs_squad": True,
        "description": "Sprint digest from Jira + Copilot meeting notes",
        "inputs": [
            {"id": "notes", "label": "Copilot meeting summary (optional)",
             "type": "textarea", "required": False,
             "placeholder": "Paste meeting notes here, or leave blank for a Jira-only digest..."},
        ],
    },
    {
        "id": "sprint-analysis", "name": "Sprint Analysis", "category": "Daily Ops",
        "mode": "cli", "slug": "/sprint-analysis", "needs_squad": True,
        "description": "Scan sprint for stale, blocked, and unassigned tickets",
        "inputs": [],
    },
    # ── Content ──────────────────────────────────────────────────────────────
    {
        "id": "story", "name": "Write User Story", "category": "Content",
        "mode": "generate", "slug": "/story", "needs_squad": True,
        "description": "Haiku drafts a user story → you edit → push creates the Jira ticket",
        "inputs": [
            {"id": "description", "label": "Feature description",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature or bug fix to turn into a user story..."},
        ],
    },
    {
        "id": "release-notes", "name": "Release Notes", "category": "Content",
        "mode": "cli", "slug": "/release-notes", "needs_squad": True,
        "description": "Pull Done Jira tickets → write release notes → publish to Confluence",
        "inputs": [],
    },
    {
        "id": "doc-pvg", "name": "Generate PVG", "category": "Content",
        "mode": "cli", "slug": "/doc", "needs_squad": False,
        "description": "Fetch UFRF2 item from Jira → generate Product Vision & Goal doc → create Epic",
        "inputs": [
            {"id": "issue_key", "label": "UFRF2 issue key",
             "type": "text", "required": True, "placeholder": "e.g. UFRF2-123"},
        ],
    },
    {
        "id": "doc-feature", "name": "Feature Documentation", "category": "Content",
        "mode": "generate", "slug": "/doc", "needs_squad": False,
        "description": "Haiku drafts user-facing documentation → you edit → push publishes to Confluence",
        "inputs": [
            {"id": "description", "label": "Feature description",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature to document..."},
        ],
    },
    {
        "id": "rfo", "name": "Reason For Outage", "category": "Content",
        "mode": "cli", "slug": "/rfo", "needs_squad": False,
        "description": "Fetch incident ticket from Jira → generate RFO → publish to Confluence",
        "inputs": [
            {"id": "ticket", "label": "Incident ticket key",
             "type": "text", "required": True, "placeholder": "e.g. CB-456"},
        ],
    },
    # ── Roadmap ──────────────────────────────────────────────────────────────
    {
        "id": "idea", "name": "Create Roadmap Item", "category": "Roadmap",
        "mode": "generate", "slug": "/idea", "needs_squad": True,
        "description": "Haiku drafts the roadmap item → you edit → push creates it in UFRF2",
        "inputs": [
            {"id": "description", "label": "Feature idea",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature idea for the roadmap..."},
        ],
    },
    {
        "id": "brainstorm", "name": "Brainstorm", "category": "Roadmap",
        "mode": "generate", "slug": "/brainstorm", "needs_squad": False,
        "description": "Haiku stress-tests your idea — leads with weaknesses, then a recommendation",
        "inputs": [
            {"id": "idea", "label": "Idea to stress-test",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature idea you want to brainstorm and challenge..."},
        ],
    },
    {
        "id": "fcb-weekly", "name": "FCB Weekly Review", "category": "Roadmap",
        "mode": "cli", "slug": "/fcb-weekly", "needs_squad": False,
        "description": "Read Customer Askings from Jira — classify and recommend next actions",
        "inputs": [],
    },
    # ── Communication ────────────────────────────────────────────────────────
    {
        "id": "comment", "name": "Add Jira Comment", "category": "Communication",
        "mode": "cli", "slug": "/comment", "needs_squad": False,
        "description": "Post a comment on a Jira issue with optional @mentions",
        "inputs": [
            {"id": "issue_key", "label": "Jira issue key",
             "type": "text", "required": True, "placeholder": "e.g. CB-123"},
            {"id": "comment_text", "label": "Comment",
             "type": "textarea", "required": True,
             "placeholder": "Write your comment here..."},
            {"id": "mentions", "label": "Tag people (optional)",
             "type": "text", "required": False,
             "placeholder": "e.g. John Smith, Sarah Lee"},
        ],
    },
    # ── Intelligence ─────────────────────────────────────────────────────────
    {
        "id": "market-intel", "name": "Market Intel (Full)", "category": "Intelligence",
        "mode": "python", "slug": "python:market_intel_digest.py", "needs_squad": False,
        "description": "Monthly competitive digest — 4 competitor layers + MENA signals (30-day window)",
        "inputs": [],
    },
    {
        "id": "market-intel-focused", "name": "Market Intel (AI Focus)", "category": "Intelligence",
        "mode": "python", "slug": "python:market_intel_focused.py", "needs_squad": False,
        "description": "7-day focused digest — AI Marketing + AI Care only",
        "inputs": [],
    },
    # ── Presentations ────────────────────────────────────────────────────────
    {
        "id": "deck", "name": "Build Deck", "category": "Presentations",
        "mode": "generate", "slug": "/deck", "needs_squad": False,
        "description": "Haiku outlines the deck → you edit → push builds the branded PowerPoint file",
        "inputs": [
            {"id": "topic", "label": "Deck topic & audience",
             "type": "textarea", "required": True,
             "placeholder": "Describe the presentation topic and audience (customer-facing or internal enablement)..."},
        ],
    },
]

COMMANDS_MAP = {c["id"]: c for c in COMMANDS}

# ---------------------------------------------------------------------------
# Haiku system prompts
# ---------------------------------------------------------------------------

UNIFONIC_CONTEXT = """You are an experienced product manager at Unifonic, a CPaaS and AI-native CX platform serving enterprise customers in Saudi Arabia and the GCC. Unifonic's products include WhatsApp Business API, SMS, Voice, Flow Studio (journey automation), Chatbot Builder, Agent Console, CDP, and MCC (Marketing Campaign Cloud). The company is positioning as an Agentic CX platform and is targeting IPO readiness."""

HAIKU_PROMPTS = {
    "story": {
        "system": f"""{UNIFONIC_CONTEXT}

Write a Jira user story in the standard format used by the team. Be specific and professional.

Output format (use exactly this structure):
## User Story
**As a** [user type], **I want to** [action], **so that** [benefit].

## Acceptance Criteria
- **Given** [context], **When** [action], **Then** [expected result]

(Write 3–5 acceptance criteria)

## Story Points
[Estimate: 1, 2, 3, 5, or 8 — with a one-line rationale]

## Dependencies & Notes
[Any dependencies, edge cases, or technical notes — or "None"]

Use business language in the story itself. Keep acceptance criteria precise and testable.""",
        "user": lambda squad, inputs: f"Squad: {squad}\n\nFeature: {inputs.get('description', '')}",
    },

    "brainstorm": {
        "system": f"""{UNIFONIC_CONTEXT}

You are a critical product strategy advisor. Stress-test this PM's feature idea. Lead with weaknesses and risks — don't be encouraging upfront. Force real trade-offs. Then give a structured recommendation.

Output format:
## ⚠ Weaknesses & Risks
(The hardest questions and failure modes — be direct)

## Approaches
| Approach | Pros | Cons | Effort |
|---|---|---|---|
(2–4 approaches)

## Recommendation
One clear recommendation with a concise rationale.

Be direct. Do not pad with generic PM advice. This is for a senior PM who wants honest pushback.""",
        "user": lambda squad, inputs: inputs.get("idea", ""),
    },

    "doc-feature": {
        "system": f"""{UNIFONIC_CONTEXT}

Write user-facing feature documentation for the Unifonic help center. Clear, structured, non-technical where possible.

Output format:
## Overview
[1–2 sentences: what this feature does and why it matters]

## Who Is This For
[Target users/personas — e.g. campaign managers, IT admins]

## How It Works
[Step-by-step or key capabilities, 3–6 items]

## Configuration
[Any setup or prerequisites — or "No configuration required"]

## FAQ
**Q: [common question]**
A: [answer]

(2–3 FAQs)

Use plain language. This is customer-facing documentation.""",
        "user": lambda squad, inputs: f"Feature to document:\n\n{inputs.get('description', '')}",
    },

    "idea": {
        "system": f"""{UNIFONIC_CONTEXT}

Write a UFRF2 internal roadmap item. Use business language — no technical jargon. Descriptions must explain value to customers and the business, not implementation details.

Output format:
## Feature Title
[Short, clear title — max 8 words]

## Description
[2–3 sentences in business language: what it does, who it's for, and why it matters. Write as if explaining to a non-technical executive.]

## Business Value
[Revenue impact, customer retention, competitive advantage, or compliance — be specific]

## Target Users
[Who benefits: which customer personas or internal teams]

## Success Metrics
[How you'd measure success: 2–3 specific metrics]

Keep it concise. Unifonic targets enterprise customers in KSA and the GCC.""",
        "user": lambda squad, inputs: f"Squad: {squad}\n\nFeature idea:\n\n{inputs.get('description', '')}",
    },

    "deck": {
        "system": f"""{UNIFONIC_CONTEXT}

Create a complete slide outline for a branded Unifonic PowerPoint presentation.

For each slide use this format:
### Slide [N]: [Title]
**Key message:** [one sentence — the takeaway for this slide]
**Bullets:**
- [point]
- [point]
- [point]
**Speaker notes:** [1–2 sentences for the presenter]

Customer-facing decks: 8 slides, professional tone, value-focused, avoid internal jargon.
Internal/enablement decks: 10 slides, direct tone, operational detail is fine.

End with a "Next Steps" slide.""",
        "user": lambda squad, inputs: f"Deck topic and audience:\n\n{inputs.get('topic', '')}",
    },
}

# ---------------------------------------------------------------------------
# Push prompts (sent to Claude CLI after user edits)
# ---------------------------------------------------------------------------

PUSH_PROMPTS = {
    "story": lambda squad_name, squad_key, content: (
        f"My squad is {squad_name} (Jira key: {squad_key}).\n\n"
        f"The PM has reviewed and approved the following user story. "
        f"Please create a new Jira story with this content. "
        f"Use the text exactly as written — do not modify or reformat it.\n\n"
        f"{content}"
    ),
    "doc-feature": lambda squad_name, squad_key, content: (
        f"Please create a new Confluence page in the UPP space (Unifonic Products Playbook) "
        f"with the following feature documentation. "
        f"The PM has approved this content — publish it exactly as written.\n\n"
        f"{content}"
    ),
    "idea": lambda squad_name, squad_key, content: (
        f"My squad is {squad_name} (Jira key: {squad_key}).\n\n"
        f"The PM has reviewed and approved the following roadmap item. "
        f"Please create a new UFRF2 roadmap item. Use the Feature Title as the item name "
        f"and the rest as the description. Do not modify the content.\n\n"
        f"{content}"
    ),
    "deck": lambda squad_name, squad_key, content: (
        f"Please create a branded Unifonic PowerPoint presentation based on the following "
        f"approved slide outline. Use the /deck command behavior to produce the actual .pptx file.\n\n"
        f"{content}"
    ),
}

# ---------------------------------------------------------------------------
# Approval gate detection (for CLI commands)
# ---------------------------------------------------------------------------

APPROVAL_PATTERNS = [
    "approve", "edit", "cancel",
    "should i create", "should i push", "should i publish",
    "ready to execute", "post this comment",
    "type 'approve'", 'type "approve"',
    "proceed?", "confirm?",
]

def contains_approval_gate(text):
    low = text.lower()
    return sum(1 for p in APPROVAL_PATTERNS if p in low) >= 2

# ---------------------------------------------------------------------------
# Build CLI prompt
# ---------------------------------------------------------------------------

def build_cli_prompt(command_id, squad_key, form_inputs):
    cmd = COMMANDS_MAP.get(command_id)
    if not cmd:
        return None, None

    slug = cmd["slug"]

    if slug.startswith("python:"):
        return "python", slug[len("python:"):]

    parts = []
    if cmd["needs_squad"] and squad_key:
        squad_name = next((s["name"] for s in SQUADS if s["key"] == squad_key), squad_key)
        parts.append(f"My squad is {squad_name} (Jira key: {squad_key}).")

    parts.append(slug)

    for inp in cmd["inputs"]:
        val = (form_inputs.get(inp["id"]) or "").strip()
        if val:
            parts.append(val)

    return "claude", " ".join(parts)

# ---------------------------------------------------------------------------
# Subprocess helpers
# ---------------------------------------------------------------------------

def stream_process(proc):
    approval_buffer = ""
    try:
        for line in iter(proc.stdout.readline, ""):
            approval_buffer += line
            approval_hit = contains_approval_gate(approval_buffer[-800:])
            yield f"data: {json.dumps({'text': line, 'approval': approval_hit})}\n\n"
        proc.stdout.close()
    except Exception as e:
        yield f"data: {json.dumps({'text': f'[stream error: {e}]\n', 'approval': False})}\n\n"
    finally:
        proc.wait()
        yield f"data: {json.dumps({'done': True, 'exit_code': proc.returncode})}\n\n"


def launch_claude(prompt, extra_flags=None):
    if not CLAUDE_BIN:
        raise RuntimeError(
            "Claude CLI not found. Set the CLAUDE_BIN environment variable to the full path of your claude executable."
        )
    cmd = [CLAUDE_BIN, "-p", prompt]
    if extra_flags:
        cmd = [CLAUDE_BIN] + extra_flags + ["-p", prompt]
    return subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        cwd=str(PROJECT_ROOT),
        text=True,
        bufsize=1,
        encoding="utf-8",
        errors="replace",
        shell=is_cmd_file(CLAUDE_BIN),
    )


def launch_python(script_name):
    return subprocess.Popen(
        [sys.executable, script_name],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        cwd=str(PROJECT_ROOT),
        text=True,
        bufsize=1,
        encoding="utf-8",
        errors="replace",
    )

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/squads")
def api_squads():
    return jsonify({"squads": SQUADS, "current": session.get("squad", "")})


@app.route("/api/squads/select", methods=["POST"])
def api_select_squad():
    key = (request.json or {}).get("key", "")
    session["squad"] = key
    return jsonify({"ok": True, "key": key})


@app.route("/api/commands")
def api_commands():
    # Include mode + push_label so the frontend knows how to handle each command
    enriched = []
    for c in COMMANDS:
        item = dict(c)
        item["push_label"] = PUSH_LABELS.get(c["id"], "")
        enriched.append(item)
    return jsonify({"commands": enriched})


@app.route("/api/status")
def api_status():
    status = {
        "cli_ok": False, "cli_version": "", "cli_reason": "",
        "haiku_ok": anthropic_client is not None,
        "haiku_reason": "" if anthropic_client else "ANTHROPIC_API_KEY not set in .env",
    }
    if not CLAUDE_BIN:
        status["cli_reason"] = "Claude CLI not found."
        return jsonify(status)
    try:
        result = subprocess.run(
            [CLAUDE_BIN, "--version"],
            capture_output=True, text=True, timeout=8,
            cwd=str(PROJECT_ROOT),
            shell=is_cmd_file(CLAUDE_BIN),
        )
        status["cli_ok"] = result.returncode == 0
        status["cli_version"] = result.stdout.strip()
        status["cli_reason"] = result.stderr.strip() if not status["cli_ok"] else ""
    except Exception as e:
        status["cli_reason"] = str(e)
    return jsonify(status)


# ── Generate with Haiku ────────────────────────────────────────────────────

@app.route("/api/generate", methods=["POST"])
def api_generate():
    if not anthropic_client:
        return jsonify({"error": "ANTHROPIC_API_KEY not set in .env file"}), 503

    data = request.json or {}
    command_id = data.get("command_id", "")
    squad_key  = data.get("squad", session.get("squad", ""))
    form_inputs = data.get("inputs", {})

    prompt_cfg = HAIKU_PROMPTS.get(command_id)
    if not prompt_cfg:
        return jsonify({"error": f"No Haiku prompt for command: {command_id}"}), 400

    squad_name = next((s["name"] for s in SQUADS if s["key"] == squad_key), squad_key or "")
    squad_label = f"{squad_name} ({squad_key})" if squad_key else "No squad selected"

    user_msg = prompt_cfg["user"](squad_label, form_inputs)

    def generate():
        try:
            with anthropic_client.messages.stream(
                model=HAIKU_MODEL,
                max_tokens=2048,
                system=prompt_cfg["system"],
                messages=[{"role": "user", "content": user_msg}],
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'text': text, 'approval': False})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 0})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'text': f'[Haiku error: {e}]\n', 'approval': False})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# ── Push edited content via Claude CLI ────────────────────────────────────

@app.route("/api/push", methods=["POST"])
def api_push():
    data = request.json or {}
    command_id = data.get("command_id", "")
    squad_key  = data.get("squad", session.get("squad", ""))
    content    = data.get("content", "").strip()

    if not content:
        return jsonify({"error": "No content to push"}), 400

    push_fn = PUSH_PROMPTS.get(command_id)
    if not push_fn:
        return jsonify({"error": f"No push action for command: {command_id}"}), 400

    squad_name = next((s["name"] for s in SQUADS if s["key"] == squad_key), squad_key or "")
    prompt = push_fn(squad_name, squad_key, content)

    def generate():
        try:
            proc = launch_claude(prompt)
            yield from stream_process(proc)
        except RuntimeError as e:
            yield f"data: {json.dumps({'text': str(e) + '\n', 'approval': False})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# ── Run CLI command directly ───────────────────────────────────────────────

@app.route("/api/run", methods=["POST"])
def api_run():
    data = request.json or {}
    command_id  = data.get("command_id", "")
    squad_key   = data.get("squad", session.get("squad", ""))
    form_inputs = data.get("inputs", {})

    kind, value = build_cli_prompt(command_id, squad_key, form_inputs)
    if kind is None:
        return jsonify({"error": f"Unknown command: {command_id}"}), 400

    def generate():
        try:
            proc = launch_python(value) if kind == "python" else launch_claude(value)
            yield from stream_process(proc)
        except RuntimeError as e:
            yield f"data: {json.dumps({'text': str(e) + '\n', 'approval': False})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# ── Continue conversation ──────────────────────────────────────────────────

@app.route("/api/continue", methods=["POST"])
def api_continue():
    data = request.json or {}
    response_text = data.get("text", "").strip()
    if not response_text:
        return jsonify({"error": "Empty response"}), 400

    def generate():
        try:
            proc = launch_claude(response_text, extra_flags=["--continue"])
            yield from stream_process(proc)
        except RuntimeError as e:
            yield f"data: {json.dumps({'text': str(e) + '\n', 'approval': False})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# ── File downloads ─────────────────────────────────────────────────────────

SAFE_DOWNLOAD_DIRS = ["intel", "outputs", "tmp"]

@app.route("/api/download/<path:filename>")
def api_download(filename):
    parts = Path(filename).parts
    if not parts or parts[0] not in SAFE_DOWNLOAD_DIRS:
        abort(403)
    safe_dir  = PROJECT_ROOT / parts[0]
    safe_name = str(Path(*parts[1:])) if len(parts) > 1 else ""
    if not safe_name:
        abort(400)
    return send_from_directory(safe_dir, safe_name, as_attachment=True)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 55)
    print("  AI PM Assistant  —  http://localhost:5000")
    print("=" * 55)
    print(f"  Claude CLI : {CLAUDE_BIN or 'NOT FOUND'}")
    print(f"  Haiku (API): {'ready' if anthropic_client else 'no API key — set ANTHROPIC_API_KEY in .env'}")
    print("=" * 55)
    app.run(debug=False, host="127.0.0.1", port=5000, threaded=True)
