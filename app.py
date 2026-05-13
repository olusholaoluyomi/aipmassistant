import os
import sys
import json
import time
import html as html_lib
import re
import secrets
import subprocess
import urllib.parse
from datetime import datetime
from pathlib import Path
from flask import (
    Flask, request, Response,
    stream_with_context, session, jsonify, send_from_directory, abort, redirect
)
import requests as http
from flask_cors import CORS


# ---------------------------------------------------------------------------
# Env loader
# ---------------------------------------------------------------------------

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
app.secret_key = os.environ.get("FLASK_SECRET", os.urandom(24))
CORS(app, origins=[
    "https://aipmassistant-pcj1.vercel.app",
    "http://localhost:5001",
    "http://127.0.0.1:5001",
])

PROJECT_ROOT = Path(__file__).parent
OUTPUTS_DIR  = PROJECT_ROOT / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Atlassian OAuth 2.0 (3LO) — token management
# ---------------------------------------------------------------------------

ATLASSIAN_CLIENT_ID     = os.environ.get("ATLASSIAN_CLIENT_ID", "")
ATLASSIAN_CLIENT_SECRET = os.environ.get("ATLASSIAN_CLIENT_SECRET", "")
ATLASSIAN_REDIRECT_URI  = os.environ.get("ATLASSIAN_REDIRECT_URI",
                                          "http://localhost:5001/oauth/callback")

_ATLASSIAN_AUTH_URL  = "https://auth.atlassian.com/authorize"
_ATLASSIAN_TOKEN_URL = "https://auth.atlassian.com/oauth/token"
_ATLASSIAN_RES_URL   = "https://api.atlassian.com/oauth/token/accessible-resources"

ATLASSIAN_SCOPES = " ".join([
    "read:jira-work",
    "write:jira-work",
    "read:jira-user",
    "read:confluence-content.all",
    "write:confluence-content",
    "offline_access",
    "read:me",
])

TOKENS_FILE = PROJECT_ROOT / ".atlassian_tokens.json"


def load_tokens():
    if TOKENS_FILE.exists():
        try:
            return json.loads(TOKENS_FILE.read_text(encoding="utf-8"))
        except Exception:
            return None
    return None


def save_tokens(tokens):
    TOKENS_FILE.write_text(json.dumps(tokens, indent=2), encoding="utf-8")


def clear_tokens():
    if TOKENS_FILE.exists():
        TOKENS_FILE.unlink()


def _do_refresh(refresh_token):
    try:
        r = http.post(_ATLASSIAN_TOKEN_URL, json={
            "grant_type":    "refresh_token",
            "client_id":     ATLASSIAN_CLIENT_ID,
            "client_secret": ATLASSIAN_CLIENT_SECRET,
            "refresh_token": refresh_token,
        }, timeout=15)
        if r.ok:
            data = r.json()
            data["expires_at"] = time.time() + data.get("expires_in", 3600) - 60
            return data
    except Exception:
        pass
    return None


def get_valid_token():
    """Return a valid access token, refreshing if expired. Returns None if not connected."""
    tokens = load_tokens()
    if not tokens:
        return None
    if tokens.get("expires_at", 0) < time.time():
        new = _do_refresh(tokens.get("refresh_token", ""))
        if not new:
            return None
        for k in ("cloud_id", "cloud_url"):
            if k in tokens and k not in new:
                new[k] = tokens[k]
        save_tokens(new)
        tokens = new
    return tokens.get("access_token")


def get_cloud_info():
    """Returns (cloud_id, cloud_url). Cached in token file after first call."""
    tokens = load_tokens()
    if not tokens:
        return None, None
    if "cloud_id" in tokens:
        return tokens["cloud_id"], tokens.get("cloud_url", "")
    access_token = get_valid_token()
    if not access_token:
        return None, None
    try:
        r = http.get(_ATLASSIAN_RES_URL,
                     headers={"Authorization": f"Bearer {access_token}"},
                     timeout=10)
        resources = r.json()
        if resources:
            cloud_id  = resources[0]["id"]
            cloud_url = resources[0].get("url", "")
            tokens["cloud_id"]  = cloud_id
            tokens["cloud_url"] = cloud_url
            save_tokens(tokens)
            return cloud_id, cloud_url
    except Exception:
        pass
    return None, None


# ---------------------------------------------------------------------------
# Atlassian API helpers
# ---------------------------------------------------------------------------

def _auth_headers():
    token = get_valid_token()
    if not token:
        raise RuntimeError("Not connected to Atlassian. Click 'Connect to Jira' in the header.")
    return {"Authorization": f"Bearer {token}", "Accept": "application/json"}


def _atlassian_error(r, system="Jira"):
    """Extract a readable error message from a failed Atlassian response."""
    try:
        body = r.json()
        msgs = body.get("errorMessages") or []
        errs = body.get("errors") or {}
        detail = body.get("message") or body.get("detail") or ""
        parts = list(msgs) + [f"{k}: {v}" for k, v in errs.items()] + ([detail] if detail else [])
        msg = " | ".join(parts) if parts else json.dumps(body)[:300]
    except Exception:
        msg = r.text[:300]
    if r.status_code == 403:
        return (f"{system} 403 Forbidden — your OAuth token may be missing write scopes. "
                f"Click your name in the header → Disconnect, then reconnect Jira. Detail: {msg}")
    return f"{system} {r.status_code}: {msg}"


def jira_req(method, path, **kwargs):
    cloud_id, _ = get_cloud_info()
    if not cloud_id:
        raise RuntimeError("Could not get Atlassian cloud ID.")
    url     = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3{path}"
    headers = _auth_headers()
    if method.upper() in ("POST", "PUT", "PATCH"):
        headers["Content-Type"] = "application/json"
    r = http.request(method, url, headers=headers, timeout=30, **kwargs)
    if not r.ok:
        raise RuntimeError(_atlassian_error(r, "Jira"))
    return r.json() if r.content else {}


def agile_req(method, path, **kwargs):
    cloud_id, _ = get_cloud_info()
    if not cloud_id:
        raise RuntimeError("Could not get Atlassian cloud ID.")
    url     = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/agile/1.0{path}"
    headers = _auth_headers()
    r = http.request(method, url, headers=headers, timeout=30, **kwargs)
    r.raise_for_status()
    return r.json() if r.content else {}


def conf_req(method, path, **kwargs):
    cloud_id, _ = get_cloud_info()
    if not cloud_id:
        raise RuntimeError("Could not get Atlassian cloud ID.")
    url     = f"https://api.atlassian.com/ex/confluence/{cloud_id}/wiki/rest/api{path}"
    headers = _auth_headers()
    if method.upper() in ("POST", "PUT", "PATCH"):
        headers["Content-Type"] = "application/json"
    r = http.request(method, url, headers=headers, timeout=30, **kwargs)
    if not r.ok:
        raise RuntimeError(_atlassian_error(r, "Confluence"))
    return r.json() if r.content else {}


_conf_homepage_cache = {}   # space_key → page_id

def _conf_space_homepage(space_key):
    """Return the homepage page ID for a Confluence space (cached)."""
    if space_key in _conf_homepage_cache:
        return _conf_homepage_cache[space_key]
    try:
        data = conf_req("GET", f"/space/{space_key}?expand=homepage")
        page_id = data.get("homepage", {}).get("id")
        if page_id:
            _conf_homepage_cache[space_key] = page_id
        return page_id
    except Exception:
        return None


def _conf_create_page(title, space_key, body_html, parent_id=None):
    """Create a Confluence page, using an explicit parent or the space homepage."""
    payload = {
        "type":  "page",
        "title": title,
        "space": {"key": space_key},
        "body":  {"storage": {"value": body_html, "representation": "storage"}},
    }
    parent_id = parent_id or _conf_space_homepage(space_key)
    if parent_id:
        payload["ancestors"] = [{"id": parent_id}]
    return conf_req("POST", "/content", json=payload)


def jira_url(key):
    _, cloud_url = get_cloud_info()
    return f"{cloud_url}/browse/{key}" if cloud_url else key


def conf_url(page_id):
    _, cloud_url = get_cloud_info()
    return f"{cloud_url}/wiki/spaces/UPP/pages/{page_id}" if cloud_url else page_id


# ---------------------------------------------------------------------------
# Content conversion utilities
# ---------------------------------------------------------------------------

def extract_title(content, fallback="Untitled"):
    """Extract the first heading or first non-empty line as a title."""
    for line in content.split("\n"):
        s = line.strip()
        if s.startswith("## Feature Title"):
            continue
        for prefix in ("### ", "## ", "# "):
            if s.startswith(prefix):
                return s[len(prefix):].strip()[:120]
    for line in content.split("\n"):
        s = line.strip()
        if s and not s.startswith("#"):
            return s[:120]
    return fallback


def _inline_adf(text):
    """Parse inline markdown (bold, italic, code) into a list of ADF text nodes."""
    nodes = []
    # Split on **bold**, *italic*, `code`  — order matters: ** before *
    parts = re.split(r'(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            nodes.append({"type": "text", "text": part[2:-2],
                          "marks": [{"type": "strong"}]})
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            nodes.append({"type": "text", "text": part[1:-1],
                          "marks": [{"type": "em"}]})
        elif part.startswith('`') and part.endswith('`') and len(part) > 2:
            nodes.append({"type": "text", "text": part[1:-1],
                          "marks": [{"type": "code"}]})
        else:
            # Merge adjacent plain-text nodes
            if nodes and nodes[-1].get("type") == "text" and not nodes[-1].get("marks"):
                nodes[-1]["text"] += part
            else:
                nodes.append({"type": "text", "text": part})
    return nodes or [{"type": "text", "text": text}]


def markdown_to_adf(text):
    """Convert markdown to Atlassian Document Format."""
    nodes = []
    lines = text.split("\n")
    i = 0

    while i < len(lines):
        line   = lines[i]
        s      = line.strip()

        # Horizontal rule
        if re.match(r'^[-*_]{3,}\s*$', s):
            nodes.append({"type": "rule"})
            i += 1
            continue

        # Headings — markdown (## ) and Confluence wiki (h2.)
        m = re.match(r'^(#{1,6})\s+(.+)$', s) or re.match(r'^h([1-6])\.\s+(.+)$', s)
        if m:
            raw_level = m.group(1)
            level = len(raw_level) if raw_level.startswith('#') else int(raw_level)
            nodes.append({"type": "heading",
                          "attrs": {"level": max(1, min(6, level))},
                          "content": _inline_adf(m.group(2).strip())})
            i += 1
            continue

        # Bullet list
        if re.match(r'^[-*]\s+', s):
            items = []
            while i < len(lines):
                ls = lines[i].strip()
                bm = re.match(r'^[-*]\s+(.+)$', ls)
                if bm:
                    items.append({"type": "listItem", "content": [
                        {"type": "paragraph", "content": _inline_adf(bm.group(1))}
                    ]})
                    i += 1
                else:
                    break
            nodes.append({"type": "bulletList", "content": items})
            continue

        # Numbered list
        m2 = re.match(r'^\d+\.\s+(.+)$', s)
        if m2:
            items = []
            while i < len(lines):
                ls  = lines[i].strip()
                nm  = re.match(r'^\d+\.\s+(.+)$', ls)
                if nm:
                    items.append({"type": "listItem", "content": [
                        {"type": "paragraph", "content": _inline_adf(nm.group(1))}
                    ]})
                    i += 1
                else:
                    break
            nodes.append({"type": "orderedList", "content": items})
            continue

        # Empty line → skip
        if not s:
            i += 1
            continue

        # Paragraph
        nodes.append({"type": "paragraph", "content": _inline_adf(s)})
        i += 1

    if not nodes:
        nodes.append({"type": "paragraph", "content": [{"type": "text", "text": text}]})
    return {"version": 1, "type": "doc", "content": nodes}


def _inline_html(text):
    """Convert inline markdown to HTML for Confluence storage format."""
    s = html_lib.escape(text)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*([^*\n]+?)\*",  r"<em>\1</em>",       s)
    s = re.sub(r"`([^`\n]+?)`",    r"<code>\1</code>",    s)
    return s


def markdown_to_confluence(text):
    """Convert markdown to Confluence storage format (XHTML-like)."""
    out      = []
    lines    = text.split("\n")
    in_ul    = False
    in_ol    = False
    in_table = False

    def close_lists():
        nonlocal in_ul, in_ol
        if in_ul:  out.append("</ul>"); in_ul = False
        if in_ol:  out.append("</ol>"); in_ol = False

    for line in lines:
        s = line.strip()

        # Close table if no longer in a table row
        if in_table and not ("|" in line and s.startswith("|")):
            out.append("</table>")
            in_table = False

        # Table
        if "|" in line and s.startswith("|"):
            if re.match(r"^\s*\|[-|\s:]+\|\s*$", line):
                continue
            close_lists()
            if not in_table:
                out.append("<table>")
                in_table = True
            cells = [c.strip() for c in s.strip("|").split("|")]
            out.append("<tr>" + "".join(f"<td>{_inline_html(c)}</td>" for c in cells) + "</tr>")
            continue

        # Headings — markdown (##) and Confluence wiki (h2.)
        hm = re.match(r'^(#{1,6})\s+(.+)$', s) or re.match(r'^h([1-6])\.\s+(.+)$', s)
        if hm:
            close_lists()
            raw = hm.group(1)
            lvl = len(raw) if raw.startswith('#') else int(raw)
            lvl = max(1, min(6, lvl))
            out.append(f"<h{lvl}>{_inline_html(hm.group(2).strip())}</h{lvl}>")
            continue

        # Bullet list
        bm = re.match(r'^[-*]\s+(.+)$', s)
        if bm:
            if in_ol: out.append("</ol>"); in_ol = False
            if not in_ul: out.append("<ul>"); in_ul = True
            out.append(f"<li>{_inline_html(bm.group(1))}</li>")
            continue

        # Numbered list
        nm = re.match(r'^\d+\.\s+(.+)$', s)
        if nm:
            if in_ul: out.append("</ul>"); in_ul = False
            if not in_ol: out.append("<ol>"); in_ol = True
            out.append(f"<li>{_inline_html(nm.group(1))}</li>")
            continue

        # Horizontal rule
        if re.match(r'^[-*_]{3,}\s*$', s):
            close_lists()
            out.append("<hr/>")
            continue

        # Empty line
        if not s:
            close_lists()
            continue

        # Paragraph
        close_lists()
        out.append(f"<p>{_inline_html(s)}</p>")

    close_lists()
    if in_table:
        out.append("</table>")
    return "\n".join(out)


def build_adf_comment(text, mention_ids=None):
    """Build ADF for a Jira comment, appending mentions at the end."""
    para = [{"type": "text", "text": text}]
    if mention_ids:
        para.append({"type": "text", "text": "  "})
        for name, account_id in mention_ids.items():
            para.append({"type": "mention",
                         "attrs": {"id": account_id,
                                   "text": f"@{name}",
                                   "accessLevel": ""}})
            para.append({"type": "text", "text": " "})
    return {"version": 1, "type": "doc",
            "content": [{"type": "paragraph", "content": para}]}


# ---------------------------------------------------------------------------
# Squads & Commands
# ---------------------------------------------------------------------------

SQUADS = [
    {"key": "PMRKT", "name": "Campaigns & CDP",            "config": "Campaigns and CDP.md"},
    {"key": "CON",   "name": "Business Messaging",         "config": "Business Messaging.md"},
    {"key": "SMS",   "name": "SMS Unified",                "config": "SMS.md"},
    {"key": "VC",    "name": "Voice",                      "config": "Voice.md"},
    {"key": "JO",    "name": "Flow Studio & Integrations", "config": "Flow Studio and Integrations.md"},
    {"key": "CB",    "name": "Agent Console",              "config": "Agent Console.md"},
    {"key": "AIS",   "name": "Conversational AI",          "config": "Conversational AI.md"},
    {"key": "ACX",   "name": "Agentic CX",                 "config": "Agentic CX.md"},
    {"key": "UCCC",  "name": "UC Platform",                "config": "UC Platform.md"},
    {"key": "CI",    "name": "Customer Insights",          "config": "Customer Insights.md"},
    {"key": "DENG",  "name": "Data Engineering",           "config": "Data Engineering.md"},
]

# Product Area field value → squad key (used by doc-pvg)
PRODUCT_AREA_TO_SQUAD = {
    "SMS":                                 "SMS",
    "Agent Console":                       "CB",
    "CCaaS and Agent Console Integration": "CB",
    "Audience":                            "PMRKT",
    "Multi Channels Campaigns":            "PMRKT",
    "Conversational AI":                   "AIS",
    "Agentic CX":                          "ACX",
    "Flow Studio":                         "JO",
    "Voice":                               "VC",
    "WhatsApp":                            "CON",
    "Business Messaging":                  "CON",
}

COMMANDS = [
    # ── Daily Ops ────────────────────────────────────────────────────────────
    {
        "id": "daily", "name": "Daily Standup", "category": "Daily Ops",
        "mode": "generate", "jira_fetch": True, "slug": "/daily",
        "needs_squad": True, "push_label": "",
        "description": "Fetch active sprint from Jira → AI drafts standup digest",
        "inputs": [
            {"id": "notes", "label": "Copilot meeting summary (optional)",
             "type": "textarea", "required": False,
             "placeholder": "Paste meeting notes here, or leave blank…"},
        ],
    },
    {
        "id": "sprint-analysis", "name": "Sprint Analysis", "category": "Daily Ops",
        "mode": "generate", "jira_fetch": True, "slug": "/sprint-analysis",
        "needs_squad": True, "push_label": "",
        "description": "Select a sprint → AI flags stale, blocked, and unassigned tickets",
        "inputs": [
            {"id": "sprint_id", "label": "Sprint", "type": "sprint-select",
             "required": True, "placeholder": "Select a squad first…"},
        ],
    },
    # ── Content ──────────────────────────────────────────────────────────────
    {
        "id": "story", "name": "Create Jira Epic", "category": "Content",
        "mode": "generate", "jira_fetch": False, "slug": "/story",
        "needs_squad": True, "push_label": "Create Epic + Approved Stories",
        "description": "AI drafts an Epic and suggested Stories → you approve → creates and links Jira tickets",
        "inputs": [
            {"id": "description", "label": "Feature description",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature or bug fix…"},
            {"id": "ac_format", "label": "Acceptance Criteria Format",
             "type": "select", "required": False,
             "default": "gherkin",
             "options": [
                 {"value": "gherkin",     "label": "Gherkin (Given / When / Then)"},
                 {"value": "checklist",   "label": "Checklist"},
                 {"value": "test-cases",  "label": "Test Cases (numbered)"},
             ]},
            {"id": "extras", "label": "Include",
             "type": "checkboxes", "required": False,
             "default": ["story_points", "dependencies"],
             "options": [
                 {"value": "edge_cases",      "label": "Edge cases"},
                 {"value": "story_points",    "label": "Story points"},
                 {"value": "dependencies",    "label": "Dependencies"},
                 {"value": "technical_notes", "label": "Technical notes"},
             ]},
        ],
    },
    {
        "id": "release-notes", "name": "Release Notes", "category": "Content",
        "mode": "generate", "jira_fetch": True, "slug": "/release-notes",
        "needs_squad": True, "push_label": "Publish Release Notes",
        "description": "Select a Fix Version (release) → fetch Done tickets → AI writes release notes → publish to Confluence",
        "inputs": [
            {"id": "fix_version", "label": "Release (Fix Version)", "type": "fix-version-select",
             "required": True, "placeholder": "Select a squad first…"},
        ],
    },
    {
        "id": "doc-pvg", "name": "Generate PVG", "category": "Content",
        "mode": "generate", "jira_fetch": False, "slug": "/doc",
        "needs_squad": True, "push_label": "Publish PVG + Create Epic",
        "description": "Share feature context → AI generates Product Value Guide → publish to Confluence + create Epic",
        "inputs": [
            {"id": "feature_context", "label": "Feature / initiative context",
             "type": "textarea", "required": True,
             "placeholder": "Describe the problem, target users, goals, scope, non-goals, dependencies, and any known risks…"},
        ],
    },
    {
        "id": "doc-feature", "name": "Feature Documentation", "category": "Content",
        "mode": "generate", "jira_fetch": False, "slug": "/doc",
        "needs_squad": False, "push_label": "Publish to Confluence",
        "description": "AI drafts help-center docs → you edit → publishes to Confluence",
        "inputs": [
            {"id": "description", "label": "Feature description",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature to document…"},
        ],
    },
    {
        "id": "rfo", "name": "Reason For Outage", "category": "Content",
        "mode": "generate", "jira_fetch": True, "slug": "/rfo",
        "needs_squad": False, "push_label": "Publish RFO",
        "description": "Fetch incident ticket → AI drafts RFO → publish to Confluence",
        "inputs": [
            {"id": "ticket", "label": "Incident ticket key",
             "type": "text", "required": True, "placeholder": "e.g. CB-456"},
        ],
    },
    # ── Roadmap ──────────────────────────────────────────────────────────────
    {
        "id": "idea", "name": "Create Roadmap Item", "category": "Roadmap",
        "mode": "generate", "jira_fetch": False, "slug": "/idea",
        "needs_squad": True, "push_label": "Create Roadmap Item",
        "description": "AI drafts UFRF2 roadmap item → you edit → creates it via Jira REST API",
        "inputs": [
            {"id": "description", "label": "Feature idea",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature idea…"},
        ],
    },
    {
        "id": "brainstorm", "name": "Brainstorm", "category": "Roadmap",
        "mode": "generate", "jira_fetch": False, "slug": "/brainstorm",
        "needs_squad": False, "push_label": "",
        "description": "AI stress-tests your idea — leads with weaknesses, then a recommendation",
        "inputs": [
            {"id": "idea", "label": "Idea to stress-test",
             "type": "textarea", "required": True,
             "placeholder": "Describe the feature idea you want to brainstorm…"},
        ],
    },
    {
        "id": "fcb-weekly", "name": "FCB Weekly Review", "category": "Roadmap",
        "mode": "generate", "jira_fetch": True, "slug": "/fcb-weekly",
        "needs_squad": False, "push_label": "",
        "description": "Fetch Customer Askings updated this week → AI classifies and recommends actions",
        "inputs": [],
    },
    # ── Communication ────────────────────────────────────────────────────────
    {
        "id": "comment", "name": "Add Jira Comment", "category": "Communication",
        "mode": "run", "jira_fetch": False, "slug": "/comment",
        "needs_squad": False, "push_label": "",
        "description": "Post a comment on any Jira issue with optional @mentions",
        "inputs": [
            {"id": "issue_key",    "label": "Jira issue key",
             "type": "text",     "required": True, "placeholder": "e.g. JO-123"},
            {"id": "comment_text", "label": "Comment",
             "type": "textarea", "required": True, "placeholder": "Write your comment…"},
            {"id": "mentions",     "label": "Tag people (optional)",
             "type": "text",     "required": False, "placeholder": "e.g. John Smith, Sarah Lee"},
        ],
    },
    # ── Intelligence ─────────────────────────────────────────────────────────
    {
        "id": "market-intel", "name": "Market Intelligence", "category": "Intelligence",
        "mode": "generate", "jira_fetch": False, "slug": "/market-intel",
        "needs_squad": False, "push_label": "",
        "description": "AI-powered competitive intelligence digest tailored to your market and competitors",
        "inputs": [
            {"id": "company",     "label": "Your company / product", "type": "text",      "required": True,  "placeholder": "e.g. Acme Corp — B2B SaaS CRM"},
            {"id": "industry",    "label": "Industry / category",    "type": "text",      "required": True,  "placeholder": "e.g. CPaaS, FinTech, HR SaaS"},
            {"id": "region",      "label": "Region / market",        "type": "select",    "required": False, "default": "global",
             "options": [
                 {"value": "global",        "label": "Global"},
                 {"value": "north-america", "label": "North America"},
                 {"value": "mena",          "label": "MENA"},
                 {"value": "europe",        "label": "Europe"},
                 {"value": "apac",          "label": "Asia Pacific"},
                 {"value": "latam",         "label": "Latin America"},
                 {"value": "africa",        "label": "Africa"},
             ]},
            {"id": "competitors", "label": "Key competitors (comma-separated)", "type": "text",       "required": False, "placeholder": "e.g. Twilio, Vonage, MessageBird"},
            {"id": "focus",       "label": "Focus areas",                       "type": "checkboxes", "required": False,
             "default": ["features", "gtm"],
             "options": [
                 {"value": "features",  "label": "Product & features"},
                 {"value": "pricing",   "label": "Pricing"},
                 {"value": "gtm",       "label": "GTM & marketing"},
                 {"value": "funding",   "label": "Funding & M&A"},
                 {"value": "launches",  "label": "Recent launches"},
                 {"value": "sentiment", "label": "Customer sentiment"},
             ]},
        ],
    },
    # ── Presentations ────────────────────────────────────────────────────────
    {
        "id": "deck", "name": "Build Deck", "category": "Presentations",
        "mode": "generate", "jira_fetch": False, "slug": "/deck",
        "needs_squad": False, "push_label": "",
        "description": "AI outlines a presentation deck tailored to your audience, style, and tone",
        "inputs": [
            {"id": "topic",    "label": "Topic & objective",  "type": "textarea", "required": True,  "placeholder": "What is this deck about and what should the audience do or feel after seeing it?"},
            {"id": "audience", "label": "Audience",           "type": "select",   "required": False, "default": "internal",
             "options": [
                 {"value": "internal",  "label": "Internal team"},
                 {"value": "executive", "label": "Executive / leadership"},
                 {"value": "customer",  "label": "Customer-facing"},
                 {"value": "sales",     "label": "Sales pitch"},
                 {"value": "board",     "label": "Board / investors"},
             ]},
            {"id": "style",    "label": "Visual style",       "type": "select",   "required": False, "default": "professional",
             "options": [
                 {"value": "professional", "label": "Professional & clean"},
                 {"value": "bold",         "label": "Bold & direct"},
                 {"value": "minimal",      "label": "Minimal & elegant"},
                 {"value": "playful",      "label": "Playful & energetic"},
                 {"value": "corporate",    "label": "Corporate & formal"},
             ]},
            {"id": "tone",     "label": "Tone",               "type": "select",   "required": False, "default": "confident",
             "options": [
                 {"value": "confident",      "label": "Confident & clear"},
                 {"value": "conversational", "label": "Conversational"},
                 {"value": "inspiring",      "label": "Inspiring & visionary"},
                 {"value": "analytical",     "label": "Data-driven & analytical"},
             ]},
            {"id": "length",   "label": "Length",             "type": "select",   "required": False, "default": "medium",
             "options": [
                 {"value": "short",  "label": "Short — 5 to 7 slides"},
                 {"value": "medium", "label": "Medium — 8 to 10 slides"},
                 {"value": "long",   "label": "Long — 12 to 15 slides"},
             ]},
        ],
    },
]

COMMANDS_MAP = {c["id"]: c for c in COMMANDS}


# ---------------------------------------------------------------------------
# Jira fetch functions (for jira_fetch commands)
# ---------------------------------------------------------------------------

def _squad_name(key):
    return next((s["name"] for s in SQUADS if s["key"] == key), key or "Unknown Squad")


def _squad_config_path(key):
    squad = next((s for s in SQUADS if s["key"] == key), None)
    if not squad:
        return None
    config_name = squad.get("config") or f"{squad['name']}.md"
    return PROJECT_ROOT / "squads" / config_name


def _squad_conf_parent_page_id(key):
    """Read the selected squad's Confluence parent page ID from squads/*.md."""
    path = _squad_config_path(key)
    if not path or not path.exists():
        return ""
    text = path.read_text(encoding="utf-8", errors="ignore")
    for line in text.splitlines():
        if "Confluence Parent Page" not in line:
            continue
        match = re.search(r"\bID:\s*`?(\d+)`?", line, re.I)
        if match:
            return match.group(1)
    return ""


def fetch_sprint_data(squad_key, form_inputs):
    """Fetch sprint issues via JQL. Uses selected sprint_id if provided."""
    try:
        sprint_id = form_inputs.get("sprint_id", "").strip()
        if sprint_id:
            jql = f"project = {squad_key} AND sprint = {sprint_id} ORDER BY updated DESC"
        else:
            jql = f"project = {squad_key} AND sprint in openSprints() ORDER BY updated DESC"

        data = jira_req(
            "GET",
            f"/search/jql?jql={urllib.parse.quote(jql)}&maxResults=100"
            "&fields=summary,status,assignee,labels,updated,customfield_10016,customfield_10021,duedate,issuetype"
        )
        issues = data.get("issues", [])
        if not issues:
            return None, f"No issues found for the selected sprint in {squad_key}."

        # Sprint name from customfield_10016 (sprint field on this instance)
        sprint_name = "Selected Sprint"
        for issue in issues:
            sf = issue.get("fields", {}).get("customfield_10016")
            if not sf:
                continue
            entries = sf if isinstance(sf, list) else [sf]
            for entry in entries:
                if isinstance(entry, dict):
                    if not sprint_id or str(entry.get("id")) == str(sprint_id):
                        sprint_name = entry.get("name", sprint_name)
                        break
                elif isinstance(entry, str):
                    m = re.search(r"name=([^,\]]+)", entry)
                    if m:
                        sprint_name = m.group(1).strip()
                        break
            break

        done = sum(
            1 for i in issues
            if i["fields"].get("status", {}).get("statusCategory", {}).get("key") == "done"
        )
        lines = [
            f"Sprint: {sprint_name}",
            f"Total issues: {len(issues)}",
            f"Done: {done} / {len(issues)}",
            "",
        ]
        for issue in issues:
            f = issue.get("fields") or {}
            status_obj = f.get("status") or {}
            status   = status_obj.get("name", "Unknown") if isinstance(status_obj, dict) else str(status_obj)
            assignee_obj = f.get("assignee") or {}
            assignee = assignee_obj.get("displayName", "Unassigned") if isinstance(assignee_obj, dict) else "Unassigned"
            points   = f.get("customfield_10021") or "?"
            labels_raw = f.get("labels") or []
            labels   = ", ".join(labels_raw) if isinstance(labels_raw, list) else str(labels_raw) or "—"
            updated  = str(f.get("updated") or "")[:10]
            lines.append(f"[{issue.get('key', '?')}] {f.get('summary', '')}")
            lines.append(f"  Status: {status} | Assignee: {assignee} | Points: {points} | Labels: {labels} | Updated: {updated}")
            lines.append("")

        return "\n".join(lines), None
    except RuntimeError as e:
        return None, str(e)
    except Exception as e:
        return None, f"Jira API error: {e}"


def fetch_release_tickets(squad_key, form_inputs):
    """Fetch completed tickets for a Fix Version (release) for release notes."""
    try:
        fix_version = form_inputs.get("fix_version", "").strip()
        if not fix_version:
            return None, "No Fix Version selected. Please select a release from the dropdown."
        jql = f'project = {squad_key} AND fixVersion = "{fix_version}" AND statusCategory = Done ORDER BY updated DESC'
        data = jira_req("GET", f"/search/jql?jql={urllib.parse.quote(jql)}&maxResults=100"
                        "&fields=summary,issuetype,labels,fixVersions,updated")
        issues = data.get("issues", [])
        if not issues:
            return None, f"No completed issues found for release '{fix_version}' in {squad_key}."

        lines = [f"Release: {fix_version}", f"Project: {squad_key}", ""]
        for issue in issues:
            f = issue.get("fields", {})
            itype  = f.get("issuetype", {}).get("name", "Issue")
            labels = ", ".join(f.get("labels", [])) or "—"
            lines.append(f"[{issue['key']}] [{itype}] {f.get('summary', '')}")
            if labels != "—":
                lines.append(f"  Labels: {labels}")
        return "\n".join(lines), None
    except RuntimeError as e:
        return None, str(e)
    except Exception as e:
        return None, f"Jira API error: {e}"


def fetch_ufrf2_item(squad_key, form_inputs):
    """Fetch a UFRF2 roadmap item by key."""
    issue_key = form_inputs.get("issue_key", "").strip().upper()
    if not issue_key:
        return None, "UFRF2 issue key is required."
    try:
        issue = jira_req("GET", f"/issue/{issue_key}"
                         "?fields=summary,description,customfield_11991,status,assignee,labels")
        f = issue.get("fields", {})
        summary = f.get("summary", "")
        status  = f.get("status", {}).get("name", "")

        # Product area (multi-select custom field)
        product_areas = []
        pa_field = f.get("customfield_11991") or []
        if isinstance(pa_field, list):
            product_areas = [p.get("value", "") for p in pa_field if isinstance(p, dict)]

        # Infer squad from product area
        inferred_squad = ""
        for pa in product_areas:
            if pa in PRODUCT_AREA_TO_SQUAD:
                inferred_squad = PRODUCT_AREA_TO_SQUAD[pa]
                break

        # Store for doc-pvg push
        session["doc_pvg_issue_key"]    = issue_key
        session["doc_pvg_squad_key"]    = inferred_squad or squad_key

        # Description text (handle ADF or plain)
        desc_field = f.get("description")
        desc_text = ""
        if isinstance(desc_field, dict):
            # ADF — extract text nodes
            def adf_text(node):
                t = ""
                if node.get("type") == "text":
                    t += node.get("text", "")
                for child in node.get("content", []):
                    t += adf_text(child)
                return t
            desc_text = adf_text(desc_field)
        elif isinstance(desc_field, str):
            desc_text = desc_field

        lines = [
            f"Key: {issue_key}",
            f"Title: {summary}",
            f"Status: {status}",
            f"Product Areas: {', '.join(product_areas) or '—'}",
            f"Inferred Squad: {inferred_squad or squad_key or '—'}",
            "",
            "Description:",
            desc_text or "(no description)",
        ]
        return "\n".join(lines), None
    except RuntimeError as e:
        return None, str(e)
    except Exception as e:
        return None, f"Jira API error fetching {issue_key}: {e}"


def fetch_incident_ticket(squad_key, form_inputs):
    """Fetch incident ticket details for RFO generation."""
    ticket = form_inputs.get("ticket", "").strip().upper()
    if not ticket:
        return None, "Incident ticket key is required."
    try:
        issue = jira_req("GET", f"/issue/{ticket}"
                         "?fields=summary,description,status,priority,labels,"
                         "created,updated,assignee,comment,issuetype")
        f = issue.get("fields", {})

        def adf_text(node):
            t = ""
            if node.get("type") == "text":
                t += node.get("text", "")
            for child in node.get("content", []):
                t += adf_text(child)
            return t

        desc_field = f.get("description")
        desc_text  = adf_text(desc_field) if isinstance(desc_field, dict) else (desc_field or "")

        # Recent comments
        comments = []
        for c in (f.get("comment") or {}).get("comments", [])[-5:]:
            body = c.get("body", {})
            body_text = adf_text(body) if isinstance(body, dict) else str(body)
            author = (c.get("author") or {}).get("displayName", "Unknown")
            created = (c.get("created") or "")[:16]
            comments.append(f"  [{created}] {author}: {body_text[:200]}")

        lines = [
            f"Key: {ticket}",
            f"Title: {f.get('summary', '')}",
            f"Status: {f.get('status', {}).get('name', '')}",
            f"Priority: {f.get('priority', {}).get('name', '')}",
            f"Created: {(f.get('created') or '')[:16]}",
            f"Updated: {(f.get('updated') or '')[:16]}",
            f"Labels: {', '.join(f.get('labels', [])) or '—'}",
            "",
            "Description:",
            desc_text or "(no description)",
            "",
            "Comments:",
        ] + (comments if comments else ["  (none)"])
        return "\n".join(lines), None
    except RuntimeError as e:
        return None, str(e)
    except Exception as e:
        return None, f"Jira API error fetching {ticket}: {e}"


def fetch_fcb_items(squad_key, form_inputs):
    """Fetch FCB Customer Asking items updated in the last 7 days."""
    try:
        jql = (
            "project = FCB AND updated >= -7d "
            "ORDER BY updated DESC"
        )
        data = jira_req("GET", f"/search/jql?jql={urllib.parse.quote(jql)}&maxResults=50"
                        "&fields=summary,status,description,labels,updated,assignee,priority")
        issues = data.get("issues", [])
        if not issues:
            return None, "No FCB items updated in the last 7 days."

        def adf_text(node):
            t = ""
            if node.get("type") == "text":
                t += node.get("text", "")
            for child in node.get("content", []):
                t += adf_text(child)
            return t

        lines = [f"FCB items updated in last 7 days: {len(issues)}", ""]
        for issue in issues:
            f = issue.get("fields", {})
            status   = f.get("status", {}).get("name", "")
            updated  = (f.get("updated") or "")[:10]
            desc     = f.get("description")
            desc_txt = (adf_text(desc) if isinstance(desc, dict) else str(desc or ""))[:200]
            lines.append(f"[{issue['key']}] {f.get('summary', '')}")
            lines.append(f"  Status: {status} | Updated: {updated}")
            if desc_txt:
                lines.append(f"  {desc_txt}")
            lines.append("")
        return "\n".join(lines), None
    except RuntimeError as e:
        return None, str(e)
    except Exception as e:
        return None, f"Jira API error: {e}"


JIRA_FETCH_MAP = {
    "daily":          (fetch_sprint_data,    "Fetching active sprint from Jira"),
    "sprint-analysis":(fetch_sprint_data,    "Fetching sprint issues from Jira"),
    "release-notes":  (fetch_release_tickets,"Fetching completed tickets from Jira"),
    "rfo":            (fetch_incident_ticket,"Fetching incident ticket from Jira"),
    "fcb-weekly":     (fetch_fcb_items,      "Fetching Customer Askings from Jira"),
}


# ---------------------------------------------------------------------------
# Push handlers (via Jira / Confluence REST)
# ---------------------------------------------------------------------------

def _push_stream(gen_fn, *args, **kwargs):
    """Wrap a push generator in SSE format."""
    def outer():
        try:
            for msg in gen_fn(*args, **kwargs):
                yield f"data: {json.dumps({'text': msg})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 0})}\n\n"
        except RuntimeError as e:
            yield f"data: {json.dumps({'text': f'❌ {e}\n'})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'text': f'❌ Unexpected error: {e}\n'})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"
    return outer


_ALWAYS_SET = {"project", "summary", "description", "issuetype", "reporter", "assignee"}


def _createmeta(project_key, issue_type_name=None):
    """
    Fetch Jira create metadata using the classic endpoint (read:jira-work scope).
    Returns the fields dict for the matched issue type, or {} on failure.
    """
    path = f"/issue/createmeta?projectKeys={project_key}&expand=projects.issuetypes.fields"
    if issue_type_name:
        path += f"&issueTypeNames={urllib.parse.quote(issue_type_name)}"
    try:
        meta = jira_req("GET", path)
        projects = meta.get("projects", [])
        if not projects:
            return {}, []
        issue_types = projects[0].get("issuetypes", [])
        names = [t.get("name", "") for t in issue_types]
        matched = None
        if issue_type_name:
            wanted = issue_type_name.strip().lower()
            matched = next((t for t in issue_types if (t.get("name") or "").strip().lower() == wanted), None)
        fields = (matched or issue_types[0]).get("fields", {}) if issue_types else {}
        return fields, names
    except Exception:
        return {}, []


def _resolve_issuetype(squad_key, preferred="Story", allow_fallback=True):
    """Return the best available issue type name from the project."""
    _, names = _createmeta(squad_key)
    name_set = set(names)
    if preferred in name_set:
        return preferred
    if not allow_fallback:
        available = ", ".join(names) if names else "none returned by Jira"
        raise RuntimeError(f"Issue type '{preferred}' is not available in project {squad_key}. Available types: {available}")
    for candidate in (preferred, "Story", "Task", "User Story"):
        if candidate in name_set:
            return candidate
    return names[0] if names else preferred


def _fetch_create_meta(project_key, issue_type_name):
    """Return list of required custom field descriptors for a project + issue type."""
    fields, _ = _createmeta(project_key, issue_type_name)
    result = []
    for fid, f in fields.items():
        if not f.get("required") or fid in _ALWAYS_SET:
            continue
        schema  = f.get("schema", {})
        ftype   = schema.get("type", "string")
        allowed = [
            {"id": str(a["id"]), "value": a.get("value") or a.get("name", "")}
            for a in f.get("allowedValues", []) if a.get("id")
        ]
        result.append({
            "id":      fid,
            "name":    f.get("name", fid),
            "type":    ftype,
            "allowed": allowed,
        })
    return result


def _build_extra_fields(meta_fields, user_values):
    """Convert required-field metadata + user selections into a Jira fields dict."""
    NEUTRAL = {"none", "medium", "normal", "unassigned", "n/a", "other", "new feature"}
    extra   = {}
    for f in meta_fields:
        fid     = f["id"]
        allowed = f["allowed"]
        uval    = user_values.get(fid, "")
        if allowed:
            chosen = (next((a for a in allowed if a["id"] == uval or a["value"] == uval), None)
                      or next((a for a in allowed if a["value"].lower() in NEUTRAL), None)
                      or allowed[0])
            extra[fid] = {"id": chosen["id"]}
        elif f["type"] in ("number", "float"):
            try:
                extra[fid] = float(uval) if uval else 0
            except ValueError:
                extra[fid] = 0
        elif f["type"] == "string":
            extra[fid] = uval or ""
    return extra


def _extract_epic_title(content):
    """Prefer an explicit Epic heading/summary over generic section names."""
    for line in content.splitlines():
        s = line.strip()
        m = re.match(r"^#{1,3}\s*Epic\s*[:\-]\s*(.+)$", s, re.I)
        if m:
            return m.group(1).strip()[:120]
    for line in content.splitlines():
        s = line.strip()
        m = re.match(r"^\*\*Epic Summary\*\*\s*[:\-]\s*(.+)$", s, re.I)
        if m:
            return m.group(1).strip()[:120]
        m = re.match(r"^Epic Summary\s*[:\-]\s*(.+)$", s, re.I)
        if m:
            return m.group(1).strip()[:120]
    return extract_title(content, "Epic")


def _extract_suggested_stories(content):
    """Parse the generated Suggested Stories section into Jira story drafts."""
    match = re.search(r"^##\s+Suggested Stories\s*$", content, re.I | re.M)
    if not match:
        return []
    section = content[match.end():]
    next_section = re.search(r"^##\s+", section, re.M)
    if next_section:
        section = section[:next_section.start()]

    stories = []
    heading_pat = re.compile(r"^###\s+(?:(?:User\s+)?Story\s*\d*\s*[:.\-]\s*)?(.+?)\s*$", re.I | re.M)
    matches = list(heading_pat.finditer(section))
    for idx, item in enumerate(matches):
        title = item.group(1).strip()
        start = item.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(section)
        body = section[start:end].strip()
        if title:
            stories.append({"title": title[:120], "body": body or title})

    if stories:
        return stories

    for line in section.splitlines():
        s = re.sub(r"^[-*]\s+(?:\[[ xX]\]\s*)?", "", line.strip())
        if s:
            stories.append({"title": s[:120], "body": s})
    return stories


def _story_parent_fields(project_key, issue_type, epic_key):
    fields, _ = _createmeta(project_key, issue_type)
    if "parent" in fields:
        return {"parent": {"key": epic_key}}
    for fid, field in fields.items():
        if (field.get("name") or "").strip().lower() == "epic link":
            return {fid: epic_key}
    return {"parent": {"key": epic_key}}


def _epic_link_field_id():
    try:
        fields = jira_req("GET", "/field")
    except Exception:
        return ""
    for field in fields:
        if (field.get("name") or "").strip().lower() == "epic link":
            return field.get("id", "")
    return ""


def _link_story_to_epic(child_key, epic_key):
    attempts = [
        {"parent": {"key": epic_key}},
    ]
    epic_link_field = _epic_link_field_id()
    if epic_link_field:
        attempts.append({epic_link_field: epic_key})

    last_error = None
    for fields in attempts:
        try:
            jira_req("PUT", f"/issue/{child_key}", json={"fields": fields})
            return True, ""
        except Exception as e:
            last_error = e
    return False, str(last_error) if last_error else "No supported Epic link field found"


def _push_story(content, squad_key, inputs):
    title       = _extract_epic_title(content)
    epic_type   = _resolve_issuetype(squad_key, "Epic", allow_fallback=False)
    meta_fields = _fetch_create_meta(squad_key, epic_type)
    user_vals   = inputs.get("_push_fields", {})
    extra       = _build_extra_fields(meta_fields, user_vals)
    yield f"Creating Jira {epic_type} in {squad_key}…\n"
    result = jira_req("POST", "/issue", json={"fields": {
        "project":     {"key": squad_key},
        "summary":     title,
        "description": markdown_to_adf(content),
        "issuetype":   {"name": epic_type},
        **extra,
    }})
    epic_key = result.get("key", "")
    yield f"✓ {epic_type} created: {epic_key}\n"
    if epic_key:
        yield f"{jira_url(epic_key)}\n"

    approved = inputs.get("_approved_stories")
    stories = approved if isinstance(approved, list) else _extract_suggested_stories(content)
    stories = [s for s in stories if isinstance(s, dict) and s.get("title")]
    if not stories:
        yield "No approved Stories selected. Epic created without child Stories.\n"
        return

    story_type = _resolve_issuetype(squad_key, "Story")
    story_meta = _fetch_create_meta(squad_key, story_type)
    story_extra = _build_extra_fields(story_meta, user_vals)
    yield f"\nCreating {len(stories)} approved {story_type} issue(s) under {epic_key}…\n"
    for idx, story in enumerate(stories, start=1):
        story_title = str(story.get("title", "")).strip()[:120]
        story_body  = str(story.get("body", "")).strip() or story_title
        fields = {
            "project":     {"key": squad_key},
            "summary":     story_title,
            "description": markdown_to_adf(story_body),
            "issuetype":   {"name": story_type},
            **story_extra,
        }
        parent_payload = _story_parent_fields(squad_key, story_type, epic_key) if epic_key else {}
        fields.update(parent_payload)
        try:
            issue = jira_req("POST", "/issue", json={"fields": fields})
        except Exception:
            for field_id in parent_payload:
                fields.pop(field_id, None)
            issue = jira_req("POST", "/issue", json={"fields": fields})
            child_key = issue.get("key", "")
            if child_key and epic_key:
                linked, link_error = _link_story_to_epic(child_key, epic_key)
                if linked:
                    yield f"  {idx}. Linked to Epic: {child_key}\n"
                else:
                    yield f"  {idx}. ⚠ Created but could not link to Epic: {link_error}\n"
            if child_key:
                yield f"  {idx}. ✓ {story_type} created: {child_key} - {jira_url(child_key)}\n"
            continue
        child_key = issue.get("key", "")
        yield f"  {idx}. ✓ {story_type} created: {child_key} - {jira_url(child_key)}\n"


def _push_doc_feature(content, squad_key, inputs):
    title = extract_title(content, "Feature Documentation")
    yield "Creating Confluence page in UPP space…\n"
    page    = _conf_create_page(title, "UPP", markdown_to_confluence(content))
    page_id = page.get("id", "")
    yield f"✓ Page created: {title}\n"
    if page_id:
        yield f"{conf_url(page_id)}\n"


def _push_idea(content, squad_key, inputs):
    title       = extract_title(content, "Roadmap Item")
    issue_type  = _resolve_issuetype("UFRF2", "Idea")
    meta_fields = _fetch_create_meta("UFRF2", issue_type)
    user_vals   = inputs.get("_push_fields", {})
    extra       = _build_extra_fields(meta_fields, user_vals)
    yield f"Creating UFRF2 roadmap item (type: {issue_type})…\n"
    result = jira_req("POST", "/issue", json={"fields": {
        "project":     {"key": "UFRF2"},
        "summary":     title,
        "description": markdown_to_adf(content),
        "issuetype":   {"name": issue_type},
        **extra,
    }})
    key = result.get("key", "")
    yield f"✓ Roadmap item created: {key}\n"
    if key:
        yield f"{jira_url(key)}\n"


def _push_release_notes(content, squad_key, inputs):
    squad_name = _squad_name(squad_key)
    date_label = datetime.now().strftime("%B %Y")
    title      = f"Release Notes — {squad_name} — {date_label}"
    yield "Publishing release notes to Confluence…\n"
    page    = _conf_create_page(title, "UPP", markdown_to_confluence(content))
    page_id = page.get("id", "")
    yield f"✓ Published: {title}\n"
    if page_id:
        yield f"{conf_url(page_id)}\n"


def _push_doc_pvg(content, squad_key, inputs):
    # Squad key may have been inferred from product_area only for legacy UFRF2-based drafts.
    _push_meta = inputs.get("_push_meta", {})
    effective_squad = _push_meta.get("doc_pvg_squad_key") or squad_key
    ufrf2_key       = _push_meta.get("doc_pvg_issue_key", "")
    squad_name      = _squad_name(effective_squad)
    feature_title   = extract_title(content, "PVG")
    parent_page_id  = _squad_conf_parent_page_id(effective_squad)

    yield "Creating PVG Confluence page…\n"
    if parent_page_id:
        yield f"Using {squad_name} Confluence parent page: {parent_page_id}\n"
    else:
        yield f"⚠ No confirmed Confluence parent page ID found for {squad_name}; publishing under UPP homepage.\n"
    pvg_title = f"PVG — {feature_title}"
    page      = _conf_create_page(pvg_title, "UPP", markdown_to_confluence(content), parent_page_id)
    page_id   = page.get("id", "")
    page_url = conf_url(page_id)
    yield f"✓ PVG page created: {pvg_title}\n"
    yield f"{page_url}\n\n"

    if effective_squad:
        epic_type   = _resolve_issuetype(effective_squad, "Epic")
        meta_fields = _fetch_create_meta(effective_squad, epic_type)
        user_vals   = inputs.get("_push_fields", {})
        extra       = _build_extra_fields(meta_fields, user_vals)
        yield f"Creating {epic_type} in {squad_name} ({effective_squad})…\n"
        epic = jira_req("POST", "/issue", json={"fields": {
            "project":     {"key": effective_squad},
            "summary":     feature_title,
            "description": markdown_to_adf(f"PVG: {page_url}"),
            "issuetype":   {"name": epic_type},
            **extra,
        }})
        epic_key = epic.get("key", "")
        yield f"✓ Epic created: {epic_key}\n"
        yield f"{jira_url(epic_key)}\n\n"

        # Link Epic to UFRF2 item
        if ufrf2_key and epic_key:
            yield f"Linking {ufrf2_key} → {epic_key}…\n"
            try:
                jira_req("POST", "/issueLink", json={
                    "type":         {"id": "10413"},
                    "inwardIssue":  {"key": epic_key},
                    "outwardIssue": {"key": ufrf2_key},
                })
                yield f"✓ Linked\n"
            except Exception as e:
                yield f"⚠ Could not create Polaris link: {e}\n"

        # Comment on Epic with page link
        if epic_key and page_id:
            try:
                jira_req("POST", f"/issue/{epic_key}/comment", json={
                    "body": markdown_to_adf(f"PVG published: {page_url}")
                })
                yield f"✓ Comment added to {epic_key} with PVG link\n"
            except Exception:
                pass
    else:
        yield "⚠ No squad determined — skipped Epic creation. Select a squad and re-push if needed.\n"


def _push_rfo(content, squad_key, inputs):
    ticket    = inputs.get("ticket", "").strip().upper()
    date_label= datetime.now().strftime("%Y-%m-%d")
    title     = f"RFO — {ticket} — {date_label}" if ticket else f"RFO — {date_label}"
    yield "Publishing RFO to Confluence…\n"
    page    = _conf_create_page(title, "UPP", markdown_to_confluence(content))
    page_id = page.get("id", "")
    yield f"✓ Published: {title}\n"
    if page_id:
        yield f"{conf_url(page_id)}\n"
    if ticket and page_id:
        try:
            jira_req("POST", f"/issue/{ticket}/comment", json={
                "body": markdown_to_adf(f"RFO published: {conf_url(page_id)}")
            })
            yield f"✓ Comment added to {ticket}\n"
        except Exception:
            pass


def _push_deck(content, squad_key, inputs):
    ts       = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"deck_{ts}.md"
    path     = OUTPUTS_DIR / filename
    path.write_text(content, encoding="utf-8")
    yield f"✓ Deck outline saved to outputs/{filename}\n"
    yield f"Download via the link that will appear below.\n"


PUSH_HANDLERS = {
    "story":         _push_story,
    "doc-feature":   _push_doc_feature,
    "idea":          _push_idea,
    "release-notes": _push_release_notes,
    "doc-pvg":       _push_doc_pvg,
    "rfo":           _push_rfo,
    "deck":          _push_deck,
}


# ---------------------------------------------------------------------------
# Subprocess helper (Python scripts only — market intel)
# ---------------------------------------------------------------------------

def launch_python(script_name):
    return subprocess.Popen(
        [sys.executable, script_name],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        cwd=str(PROJECT_ROOT), text=True,
        bufsize=1, encoding="utf-8", errors="replace",
    )

def stream_process(proc):
    try:
        for line in iter(proc.stdout.readline, ""):
            yield f"data: {json.dumps({'text': line, 'approval': False})}\n\n"
        proc.stdout.close()
    except Exception as e:
        yield f"data: {json.dumps({'text': f'[stream error: {e}]\n', 'approval': False})}\n\n"
    finally:
        proc.wait()
        yield f"data: {json.dumps({'done': True, 'exit_code': proc.returncode})}\n\n"


# ---------------------------------------------------------------------------
# OAuth routes
# ---------------------------------------------------------------------------

@app.route("/oauth/login")
def oauth_login():
    state = secrets.token_hex(16)
    session["oauth_state"] = state
    params = {
        "audience":      "api.atlassian.com",
        "client_id":     ATLASSIAN_CLIENT_ID,
        "scope":         ATLASSIAN_SCOPES,
        "redirect_uri":  ATLASSIAN_REDIRECT_URI,
        "state":         state,
        "response_type": "code",
        "prompt":        "consent",
    }
    return redirect(f"{_ATLASSIAN_AUTH_URL}?{urllib.parse.urlencode(params)}")


@app.route("/oauth/callback")
def oauth_callback():
    error = request.args.get("error")
    if error:
        return redirect(f"/?auth_error={urllib.parse.quote(error)}")

    code  = request.args.get("code", "")
    state = request.args.get("state", "")

    if state != session.get("oauth_state"):
        return redirect("/?auth_error=state_mismatch")

    try:
        r = http.post(_ATLASSIAN_TOKEN_URL, json={
            "grant_type":    "authorization_code",
            "client_id":     ATLASSIAN_CLIENT_ID,
            "client_secret": ATLASSIAN_CLIENT_SECRET,
            "code":          code,
            "redirect_uri":  ATLASSIAN_REDIRECT_URI,
        }, timeout=15)
        if not r.ok:
            return redirect(f"/?auth_error=token_exchange_failed")
        tokens = r.json()
        tokens["expires_at"] = time.time() + tokens.get("expires_in", 3600) - 60
        save_tokens(tokens)
        get_cloud_info()  # cache cloud_id immediately
    except Exception as e:
        return redirect(f"/?auth_error={urllib.parse.quote(str(e)[:60])}")

    return redirect("/")


@app.route("/oauth/logout")
def oauth_logout():
    clear_tokens()
    return redirect("/")


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory(PROJECT_ROOT / "web", "index.html")

@app.route("/setup")
def setup():
    return send_from_directory(PROJECT_ROOT / "web" / "setup", "index.html")

@app.route("/static/<path:filename>")
def web_static(filename):
    return send_from_directory(PROJECT_ROOT / "web" / "static", filename)

@app.route("/health")
def health():
    return jsonify({"ok": True, "jira": get_valid_token() is not None})


@app.route("/api/auth/status")
def api_auth_status():
    tokens = load_tokens()
    if not tokens:
        return jsonify({"connected": False})
    token = get_valid_token()
    if not token:
        return jsonify({"connected": False})
    try:
        r = http.get("https://api.atlassian.com/me",
                     headers={"Authorization": f"Bearer {token}"}, timeout=10)
        user = r.json() if r.ok else {}
        return jsonify({
            "connected": True,
            "user": {
                "name":    user.get("name") or user.get("displayName", "Connected"),
                "email":   user.get("email", ""),
                "picture": user.get("picture", ""),
            },
            "cloud_url": tokens.get("cloud_url", ""),
        })
    except Exception:
        return jsonify({"connected": True, "user": {"name": "Connected"}})


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
    enriched = [
        {**cmd, "needs_backend": cmd.get("jira_fetch", False) or bool(cmd.get("push_label", ""))}
        for cmd in COMMANDS
    ]
    return jsonify({"commands": enriched})


@app.route("/api/jira/fetch")
def api_jira_fetch():
    command = request.args.get("command", "")
    squad_key = request.args.get("squad_key", session.get("squad", ""))
    form_inputs = {
        "sprint_id":   request.args.get("sprint_id", ""),
        "fix_version": request.args.get("fix_version", ""),
        "issue_key":   request.args.get("issue_key", ""),
        "ticket":      request.args.get("ticket", ""),
        "notes":       request.args.get("notes", ""),
    }
    if command not in JIRA_FETCH_MAP:
        return jsonify({"error": f"No Jira fetch for command: {command}"}), 400
    if not get_valid_token():
        return jsonify({"error": "Not connected to Atlassian. Open Settings and connect Jira."}), 401
    try:
        fetch_fn, _ = JIRA_FETCH_MAP[command]
        context, error = fetch_fn(squad_key, form_inputs)
        if error:
            return jsonify({"error": error}), 400
        meta = {}
        if command == "doc-pvg":
            meta = {
                "doc_pvg_issue_key": session.get("doc_pvg_issue_key", ""),
                "doc_pvg_squad_key": session.get("doc_pvg_squad_key", squad_key),
            }
        return jsonify({"context": context, "command": command, "squad_key": squad_key, "meta": meta})
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/push-fields/<command_id>/<squad_key>")
def api_push_fields(command_id, squad_key):
    """Return required Jira fields (with allowed values) for a push action."""
    COMMAND_ISSUE_MAP = {
        "story":   (squad_key, "Epic"),
        "idea":    ("UFRF2",   "Idea"),
        "doc-pvg": (squad_key, "Epic"),
    }
    if command_id not in COMMAND_ISSUE_MAP:
        return jsonify({"fields": []})
    try:
        project, preferred = COMMAND_ISSUE_MAP[command_id]
        issue_type = _resolve_issuetype(project, preferred)
        fields     = _fetch_create_meta(project, issue_type)
        return jsonify({"fields": fields, "issue_type": issue_type})
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sprints/<squad_key>")
def api_sprints(squad_key):
    """Return list of sprints for a squad, extracted from the sprint custom field."""
    try:
        jql = f"project = {squad_key} ORDER BY updated DESC"
        data = jira_req(
            "GET",
            f"/search/jql?jql={urllib.parse.quote(jql)}&maxResults=200"
            "&fields=customfield_10016"
        )
        issues = data.get("issues", [])

        seen   = {}  # sprint_id → sprint dict
        for issue in issues:
            sf = issue.get("fields", {}).get("customfield_10016")
            if not sf:
                continue
            entries = sf if isinstance(sf, list) else [sf]
            for entry in entries:
                if isinstance(entry, dict):
                    sid   = entry.get("id")
                    name  = entry.get("name", "")
                    state = entry.get("state", "").lower()
                elif isinstance(entry, str):
                    sid_m   = re.search(r"id=(\d+)",       entry)
                    name_m  = re.search(r"name=([^,\]]+)", entry)
                    state_m = re.search(r"state=([^,\]]+)",entry)
                    sid   = int(sid_m.group(1))  if sid_m   else None
                    name  = name_m.group(1).strip()  if name_m  else ""
                    state = state_m.group(1).strip().lower() if state_m else ""
                else:
                    continue
                if sid and sid not in seen:
                    seen[sid] = {"id": sid, "name": name, "state": state}

        # Sort: active first, then closed by id descending
        def sort_key(s):
            order = {"active": 0, "future": 1, "closed": 2}
            return (order.get(s["state"], 3), -s["id"])

        sprints = sorted(seen.values(), key=sort_key)
        return jsonify({"sprints": sprints})
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/fix-versions/<squad_key>")
def api_fix_versions(squad_key):
    """Return Fix Versions (releases) for a project, unreleased first."""
    try:
        data = jira_req("GET", f"/project/{squad_key}/versions")
        versions = []
        for v in data:
            if v.get("archived"):
                continue
            versions.append({
                "id":       v.get("id", ""),
                "name":     v.get("name", ""),
                "released": v.get("released", False),
                "releaseDate": v.get("releaseDate", ""),
            })
        # Sort: unreleased first, then released by releaseDate descending
        versions.sort(key=lambda v: (1 if v["released"] else 0, v["releaseDate"]), reverse=False)
        versions.sort(key=lambda v: (v["released"], v["releaseDate"]))
        return jsonify({"versions": versions})
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/status")
def api_status():
    return jsonify({
        "jira_ok":     get_valid_token() is not None,
        "jira_reason": "" if get_valid_token() else "Not connected — click Connect to Jira",
    })


# ── Push (Jira / Confluence REST) ─────────────────────────────────────────

@app.route("/api/push", methods=["POST"])
def api_push():
    data       = request.json or {}
    command_id = data.get("command_id", "")
    squad_key  = data.get("squad", session.get("squad", ""))
    content    = data.get("content", "").strip()
    inputs     = dict(data.get("inputs", {}))
    inputs["_push_fields"] = data.get("push_fields", {})
    inputs["_push_meta"]   = data.get("push_meta", {})
    inputs["_approved_stories"] = data.get("approved_stories", [])

    if not content:
        return jsonify({"error": "No content to push"}), 400

    handler = PUSH_HANDLERS.get(command_id)
    if not handler:
        return jsonify({"error": f"No push handler for: {command_id}"}), 400

    if not get_valid_token():
        def no_auth():
            yield f"data: {json.dumps({'text': '❌ Not connected to Atlassian. Click Connect to Jira.\n'})}\n\n"
            yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"
        return Response(stream_with_context(no_auth()),
                        content_type="text/event-stream",
                        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})

    gen = _push_stream(handler, content, squad_key, inputs)()
    return Response(stream_with_context(gen),
                    content_type="text/event-stream",
                    headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})


# ── Run (comment → direct Jira action, or Python scripts) ────────────────

@app.route("/api/run", methods=["POST"])
def api_run():
    data        = request.json or {}
    command_id  = data.get("command_id", "")
    squad_key   = data.get("squad", session.get("squad", ""))
    form_inputs = data.get("inputs", {})

    cmd = COMMANDS_MAP.get(command_id)
    if not cmd:
        return jsonify({"error": f"Unknown command: {command_id}"}), 400

    # Python script
    if cmd["mode"] == "python":
        script = cmd["slug"].replace("python:", "")
        def py_gen():
            try:
                proc = launch_python(script)
                yield from stream_process(proc)
            except Exception as e:
                yield f"data: {json.dumps({'text': f'Error: {e}\n'})}\n\n"
                yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"
        return Response(stream_with_context(py_gen()),
                        content_type="text/event-stream",
                        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})

    # Comment → direct Jira action
    if command_id == "comment":
        issue_key    = form_inputs.get("issue_key", "").strip().upper()
        comment_text = form_inputs.get("comment_text", "").strip()
        mentions_str = form_inputs.get("mentions", "").strip()

        def comment_gen():
            if not get_valid_token():
                yield f"data: {json.dumps({'text': '❌ Not connected to Atlassian. Click Connect to Jira.\n'})}\n\n"
                yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"
                return

            mention_ids = {}
            if mentions_str:
                yield f"data: {json.dumps({'text': 'Resolving user mentions…\n'})}\n\n"
                for name in [m.strip() for m in mentions_str.split(",") if m.strip()]:
                    try:
                        results = jira_req("GET", f"/user/search?query={urllib.parse.quote(name)}&maxResults=3")
                        if results:
                            mention_ids[name] = results[0]["accountId"]
                            dn = results[0].get("displayName", name)
                            yield f"data: {json.dumps({'text': f'  ✓ {name} → {dn}\n'})}\n\n"
                        else:
                            yield f"data: {json.dumps({'text': f'  ⚠ Could not resolve: {name}\n'})}\n\n"
                    except Exception as e:
                        yield f"data: {json.dumps({'text': f'  ⚠ Error resolving {name}: {e}\n'})}\n\n"

            yield f"data: {json.dumps({'text': f'Posting comment to {issue_key}…\n'})}\n\n"
            try:
                jira_req("POST", f"/issue/{issue_key}/comment", json={
                    "body": build_adf_comment(comment_text, mention_ids)
                })
                yield f"data: {json.dumps({'text': f'✓ Comment posted to {jira_url(issue_key)}\n'})}\n\n"
                yield f"data: {json.dumps({'done': True, 'exit_code': 0})}\n\n"
            except RuntimeError as e:
                yield f"data: {json.dumps({'text': f'❌ {e}\n'})}\n\n"
                yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'text': f'❌ Error: {e}\n'})}\n\n"
                yield f"data: {json.dumps({'done': True, 'exit_code': 1})}\n\n"

        return Response(stream_with_context(comment_gen()),
                        content_type="text/event-stream",
                        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})

    return jsonify({"error": f"No run handler for: {command_id}"}), 400


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
    port = int(os.environ.get("PORT", 5001))
    print("=" * 60)
    print(f"  AI PM Assistant  —  http://localhost:{port}")
    print("=" * 60)
    print(f"  Claude (API): browser-side via Vercel (key stored in browser)")
    print(f"  Jira (OAuth): {'connected' if load_tokens() else 'not connected — open UI to connect'}")
    print(f"  OAuth callback: {ATLASSIAN_REDIRECT_URI}")
    print("=" * 60)
    app.run(debug=False, host="127.0.0.1", port=port, threaded=True)
