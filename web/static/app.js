// ── Config ────────────────────────────────────────────────────────────────
const FALLBACK_SQUADS = [
  { key:"PMRKT", name:"Campaigns & CDP" },
  { key:"CON",   name:"Business Messaging" },
  { key:"SMS",   name:"SMS Unified" },
  { key:"VC",    name:"Voice" },
  { key:"JO",    name:"Flow Studio & Integrations" },
  { key:"CB",    name:"Agent Console" },
  { key:"AIS",   name:"Conversational AI" },
  { key:"ACX",   name:"Agentic CX" },
  { key:"UCCC",  name:"UC Platform" },
  { key:"CI",    name:"Customer Insights" },
  { key:"DENG",  name:"Data Engineering" },
];

// Embedded command list (served locally from Flask when backend is up, but also available offline)
const COMMANDS_DATA = [
  {
    "id": "daily", "name": "Daily Standup", "category": "Daily Ops",
    "mode": "generate", "jira_fetch": true, "slug": "/daily",
    "needs_squad": true, "push_label": "", "needs_backend": true,
    "description": "Fetch active sprint from Jira → AI drafts standup digest",
    "inputs": [
      {"id": "notes", "label": "Copilot meeting summary (optional)",
       "type": "textarea", "required": false,
       "placeholder": "Paste meeting notes here, or leave blank…"},
    ],
  },
  {
    "id": "sprint-analysis", "name": "Sprint Analysis", "category": "Daily Ops",
    "mode": "generate", "jira_fetch": true, "slug": "/sprint-analysis",
    "needs_squad": true, "push_label": "", "needs_backend": true,
    "description": "Select a sprint → AI flags stale, blocked, and unassigned tickets",
    "inputs": [
      {"id": "sprint_id", "label": "Sprint", "type": "sprint-select",
       "required": true, "placeholder": "Select a squad first…"},
    ],
  },
  {
    "id": "story", "name": "Write User Story", "category": "Content",
    "mode": "generate", "jira_fetch": false, "slug": "/story",
    "needs_squad": true, "push_label": "Create Jira Story", "needs_backend": true,
    "description": "AI drafts user story → you edit → creates Jira ticket via REST API",
    "inputs": [
      {"id": "description", "label": "Feature description",
       "type": "textarea", "required": true,
       "placeholder": "Describe the feature or bug fix…"},
      {"id": "ac_format", "label": "Acceptance Criteria Format",
       "type": "select", "required": false, "default": "gherkin",
       "options": [
         {"value": "gherkin",    "label": "Gherkin (Given / When / Then)"},
         {"value": "checklist",  "label": "Checklist"},
         {"value": "test-cases", "label": "Test Cases (numbered)"},
       ]},
      {"id": "extras", "label": "Include",
       "type": "checkboxes", "required": false,
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
    "mode": "generate", "jira_fetch": true, "slug": "/release-notes",
    "needs_squad": true, "push_label": "Publish Release Notes", "needs_backend": true,
    "description": "Select a Fix Version (release) → fetch Done tickets → AI writes release notes → publish to Confluence",
    "inputs": [
      {"id": "fix_version", "label": "Release (Fix Version)", "type": "fix-version-select",
       "required": true, "placeholder": "Select a squad first…"},
      {"id": "period", "label": "Period label (optional)",
       "type": "text", "required": false, "placeholder": "e.g. May 2026 — defaults to current month"},
    ],
  },
  {
    "id": "doc-pvg", "name": "Generate PVG", "category": "Content",
    "mode": "generate", "jira_fetch": true, "slug": "/doc",
    "needs_squad": true, "push_label": "Publish PVG + Create Epic", "needs_backend": true,
    "description": "Fetch UFRF2 item → AI generates Product Vision & Goal doc → publish to Confluence + create Epic",
    "inputs": [
      {"id": "issue_key", "label": "UFRF2 issue key",
       "type": "text", "required": true, "placeholder": "e.g. UFRF2-123"},
    ],
  },
  {
    "id": "doc-feature", "name": "Feature Documentation", "category": "Content",
    "mode": "generate", "jira_fetch": false, "slug": "/doc",
    "needs_squad": false, "push_label": "Publish to Confluence", "needs_backend": true,
    "description": "AI drafts help-center docs → you edit → publishes to Confluence",
    "inputs": [
      {"id": "description", "label": "Feature description",
       "type": "textarea", "required": true,
       "placeholder": "Describe the feature to document…"},
    ],
  },
  {
    "id": "rfo", "name": "Reason For Outage", "category": "Content",
    "mode": "generate", "jira_fetch": true, "slug": "/rfo",
    "needs_squad": false, "push_label": "Publish RFO", "needs_backend": true,
    "description": "Fetch incident ticket → AI drafts RFO → publish to Confluence",
    "inputs": [
      {"id": "ticket", "label": "Incident ticket key",
       "type": "text", "required": true, "placeholder": "e.g. CB-456"},
    ],
  },
  {
    "id": "idea", "name": "Create Roadmap Item", "category": "Roadmap",
    "mode": "generate", "jira_fetch": false, "slug": "/idea",
    "needs_squad": true, "push_label": "Create Roadmap Item", "needs_backend": true,
    "description": "AI drafts UFRF2 roadmap item → you edit → creates it via Jira REST API",
    "inputs": [
      {"id": "description", "label": "Feature idea",
       "type": "textarea", "required": true,
       "placeholder": "Describe the feature idea…"},
    ],
  },
  {
    "id": "brainstorm", "name": "Brainstorm", "category": "Roadmap",
    "mode": "generate", "jira_fetch": false, "slug": "/brainstorm",
    "needs_squad": false, "push_label": "", "needs_backend": false,
    "description": "AI stress-tests your idea — leads with weaknesses, then a recommendation",
    "inputs": [
      {"id": "idea", "label": "Idea to stress-test",
       "type": "textarea", "required": true,
       "placeholder": "Describe the feature idea you want to brainstorm…"},
    ],
  },
  {
    "id": "fcb-weekly", "name": "FCB Weekly Review", "category": "Roadmap",
    "mode": "generate", "jira_fetch": true, "slug": "/fcb-weekly",
    "needs_squad": false, "push_label": "", "needs_backend": true,
    "description": "Fetch Customer Askings updated this week → AI classifies and recommends actions",
    "inputs": [],
  },
  {
    "id": "comment", "name": "Add Jira Comment", "category": "Communication",
    "mode": "run", "jira_fetch": false, "slug": "/comment",
    "needs_squad": false, "push_label": "", "needs_backend": true,
    "description": "Post a comment on any Jira issue with optional @mentions",
    "inputs": [
      {"id": "issue_key",    "label": "Jira issue key",
       "type": "text",     "required": true, "placeholder": "e.g. JO-123"},
      {"id": "comment_text", "label": "Comment",
       "type": "textarea", "required": true, "placeholder": "Write your comment…"},
      {"id": "mentions",     "label": "Tag people (optional)",
       "type": "text",     "required": false, "placeholder": "e.g. John Smith, Sarah Lee"},
    ],
  },
  {
    "id": "market-intel", "name": "Market Intelligence", "category": "Intelligence",
    "mode": "generate", "jira_fetch": false, "slug": "/market-intel",
    "needs_squad": false, "push_label": "", "needs_backend": false,
    "description": "AI-powered competitive intelligence digest tailored to your market and competitors",
    "inputs": [
      {"id": "company",     "label": "Your company / product",
       "type": "text",     "required": true,  "placeholder": "e.g. Acme Corp — B2B SaaS CRM"},
      {"id": "industry",    "label": "Industry / category",
       "type": "text",     "required": true,  "placeholder": "e.g. CPaaS, FinTech, HR SaaS, E-commerce"},
      {"id": "region",      "label": "Region / market",
       "type": "select",   "required": false, "default": "global",
       "options": [
         {"value": "global",         "label": "Global"},
         {"value": "north-america",  "label": "North America"},
         {"value": "mena",           "label": "MENA"},
         {"value": "europe",         "label": "Europe"},
         {"value": "apac",           "label": "Asia Pacific"},
         {"value": "latam",          "label": "Latin America"},
         {"value": "africa",         "label": "Africa"},
       ]},
      {"id": "competitors", "label": "Key competitors (comma-separated)",
       "type": "text",     "required": false, "placeholder": "e.g. Twilio, Vonage, MessageBird"},
      {"id": "period", "label": "Period label (optional)",
       "type": "text",     "required": false, "placeholder": "e.g. May 2026 — defaults to current month"},
      {"id": "focus",       "label": "Focus areas",
       "type": "checkboxes","required": false,
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
  {
    "id": "deck", "name": "Build Deck", "category": "Presentations",
    "mode": "generate", "jira_fetch": false, "slug": "/deck",
    "needs_squad": false, "push_label": "Build Deck (.pptx)", "needs_backend": false,
    "description": "AI outlines a presentation deck tailored to your audience, style and tone — then builds a real .pptx file",
    "inputs": [
      {"id": "topic",    "label": "Topic & objective",
       "type": "textarea","required": true,
       "placeholder": "What is this deck about and what should the audience do or feel after seeing it?"},
      {"id": "audience", "label": "Audience",
       "type": "select", "required": false, "default": "internal",
       "options": [
         {"value": "internal",  "label": "Internal team"},
         {"value": "executive", "label": "Executive / leadership"},
         {"value": "customer",  "label": "Customer-facing"},
         {"value": "sales",     "label": "Sales pitch"},
         {"value": "board",     "label": "Board / investors"},
       ]},
      {"id": "style",    "label": "Visual style",
       "type": "select", "required": false, "default": "professional",
       "options": [
         {"value": "professional", "label": "Professional & clean"},
         {"value": "bold",         "label": "Bold & direct"},
         {"value": "minimal",      "label": "Minimal & elegant"},
         {"value": "playful",      "label": "Playful & energetic"},
         {"value": "corporate",    "label": "Corporate & formal"},
       ]},
      {"id": "tone",     "label": "Tone",
       "type": "select", "required": false, "default": "confident",
       "options": [
         {"value": "confident",      "label": "Confident & clear"},
         {"value": "conversational", "label": "Conversational"},
         {"value": "inspiring",      "label": "Inspiring & visionary"},
         {"value": "analytical",     "label": "Data-driven & analytical"},
       ]},
      {"id": "length",   "label": "Length",
       "type": "select", "required": false, "default": "medium",
       "options": [
         {"value": "short",  "label": "Short — 5 to 7 slides"},
         {"value": "medium", "label": "Medium — 8 to 10 slides"},
         {"value": "long",   "label": "Long — 12 to 15 slides"},
       ]},
    ],
  },
];

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  commands:          [],
  squads:            [],
  currentSquad:      "",
  activeCommand:     null,
  isRunning:         false,
  rawOutput:         "",   // only AI-generated content (after jira_done reset)
  fullOutput:        "",   // everything including progress lines
  generatedContent:  "",
  jiraConnected:     false,
  backendUrl:        localStorage.getItem('aipm_backend_url') || 'http://localhost:5001',
  backendConnected:  false,
  anthropicKey:      localStorage.getItem('aipm_anthropic_key') || '',
  companyContext:    localStorage.getItem('aipm_company_context') || '',
  jiraFetchMeta:     {},
};

function apiUrl(path) {
  return state.backendUrl.replace(/\/$/, '') + path;
}

function _squadLabel(key) {
  const sq = state.squads.find(s => s.key === key);
  return sq ? `${sq.name} (${key})` : key || 'No squad selected';
}

// ── Command icons & categories ─────────────────────────────────────────────
const CMD_ICONS = {
  "daily":               "☀️",
  "sprint-analysis":     "🔎",
  "story":               "📝",
  "release-notes":       "🚀",
  "doc-pvg":             "📄",
  "doc-feature":         "📖",
  "rfo":                 "🚨",
  "idea":                "💡",
  "brainstorm":          "🧠",
  "fcb-weekly":          "📬",
  "comment":             "💬",
  "market-intel":        "🌐",
  "market-intel-focused":"🎯",
  "deck":                "🎨",
};

const CATEGORY_ICONS = {
  "Daily Ops":     "📋",
  "Content":       "✍️",
  "Roadmap":       "🗺️",
  "Communication": "💬",
  "Intelligence":  "🔍",
  "Presentations": "📊",
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const squadSelect      = document.getElementById("squad-select");
const commandNav       = document.getElementById("command-nav");
const commandTitle     = document.getElementById("command-title");
const commandDesc      = document.getElementById("command-desc");
const modeBadgeWrap    = document.getElementById("mode-badge-wrap");
const inputFields      = document.getElementById("input-fields");
const squadWarning     = document.getElementById("squad-warning");
const runBtn           = document.getElementById("run-btn");
const runBtnLabel      = document.getElementById("run-btn-label");
const outputPanel      = document.getElementById("output-panel");
const outputLabel      = document.getElementById("output-label");
const phaseBadge       = document.getElementById("phase-badge");
const statusIndicator  = document.getElementById("status-indicator");
const regenerateBtn    = document.getElementById("regenerate-btn");
const copyBtn          = document.getElementById("copy-btn");
const editPanel        = document.getElementById("edit-panel");
const editTextarea     = document.getElementById("edit-textarea");
const pushBtn          = document.getElementById("push-btn");
const pushBtnLabel     = document.getElementById("push-btn-label");
const editHint         = document.getElementById("edit-hint");
const pushPanel        = document.getElementById("push-panel");
const pushLabelDisplay = document.getElementById("push-label-display");
const pushStatusInd    = document.getElementById("push-status-indicator");
const pushOutput       = document.getElementById("push-output");
const continueBar      = document.getElementById("continue-bar");
const continueInput    = document.getElementById("continue-input");
const continueBtn      = document.getElementById("continue-btn");
const authBanner       = document.getElementById("auth-banner");
const authBannerMsg    = document.getElementById("auth-banner-msg");
const cmdSearch        = document.getElementById("cmd-search");
const searchEmpty      = document.getElementById("search-empty");
const historyPanel     = document.getElementById("history-panel");
const historyToggle    = document.getElementById("history-toggle");
const historyList      = document.getElementById("history-list");
const historyCount     = document.getElementById("history-count");
const historyChevron   = document.getElementById("history-chevron");
const shortcutsBtn     = document.getElementById("shortcuts-btn");
const shortcutsModal   = document.getElementById("shortcuts-modal");
const shortcutsClose   = document.getElementById("shortcuts-close");
const settingsBtn      = document.getElementById("settings-btn");

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  // Start with embedded commands and fallback squads immediately
  state.commands = COMMANDS_DATA;
  state.squads = FALLBACK_SQUADS;

  buildCommandNav();
  buildSquadSelector();
  renderHistory();
  renderBackendChip();

  // Wire up settings button
  settingsBtn.addEventListener("click", openSettings);

  // Try to ping backend with 2s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const healthRes = await fetch(apiUrl('/health'), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (healthRes.ok) {
      state.backendConnected = true;
      renderBackendChip();

      // Fetch squads and auth status from backend
      const [squadsRes, authRes, statusRes] = await Promise.all([
        fetch(apiUrl('/api/squads')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/auth/status')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/status')).then(r => r.json()).catch(() => null),
      ]);

      if (squadsRes && squadsRes.squads) {
        state.squads = squadsRes.squads;
        state.currentSquad = squadsRes.current || "";
        buildSquadSelector();
      }
      if (authRes) updateJiraUI(authRes);
      if (statusRes) checkStatus(statusRes);
    } else {
      throw new Error('Backend not ok');
    }
  } catch (_) {
    state.backendConnected = false;
    renderBackendChip();
    // Use fallback squads silently — no banner for this
  }

  // Handle OAuth error in URL
  const params = new URLSearchParams(window.location.search);
  const authErr = params.get("auth_error");
  if (authErr) {
    authBannerMsg.textContent = `⚠  Jira connection failed: ${authErr}`;
    authBanner.classList.remove("hidden");
    document.body.classList.add("has-banner");
    window.history.replaceState({}, "", "/");
  }
}

// ── Backend chip ───────────────────────────────────────────────────────────
function renderBackendChip() {
  let chip = document.getElementById("backend-chip");
  if (!chip) {
    chip = document.createElement("span");
    chip.id = "backend-chip";
    // Insert before settings button
    const headerRight = document.querySelector(".header-right");
    headerRight.insertBefore(chip, settingsBtn);
  }

  if (state.backendConnected) {
    chip.className = "backend-chip connected";
    chip.innerHTML = '<span class="chip-dot"></span> Backend';
    chip.title = "Local backend connected";
    chip.onclick = null;
    chip.style.cursor = "default";
  } else {
    chip.className = "backend-chip offline";
    chip.innerHTML = '<span class="chip-dot"></span> Offline';
    chip.title = "Local backend offline — click to open settings";
    chip.onclick = openSettings;
    chip.style.cursor = "pointer";
  }
}

async function pingBackend() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(apiUrl('/health'), { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      state.backendConnected = true;
      renderBackendChip();
      // Re-fetch squads and auth
      const [squadsRes, authRes] = await Promise.all([
        fetch(apiUrl('/api/squads')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/auth/status')).then(r => r.json()).catch(() => null),
      ]);
      if (squadsRes && squadsRes.squads) {
        state.squads = squadsRes.squads;
        state.currentSquad = squadsRes.current || "";
        buildSquadSelector();
      }
      if (authRes) updateJiraUI(authRes);
      // Refresh current command view
      if (state.activeCommand) selectCommand(state.activeCommand);
      return true;
    }
  } catch (_) {}
  state.backendConnected = false;
  renderBackendChip();
  return false;
}

// ── Settings modal ─────────────────────────────────────────────────────────
function openSettings() {
  let modal = document.getElementById("settings-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "settings-modal";
    modal.className = "settings-modal hidden";
    modal.innerHTML = `
      <div class="settings-dialog">
        <div class="settings-dialog-header">
          <span class="settings-title">Settings</span>
          <button id="settings-close" class="settings-close">✕</button>
        </div>
        <div class="settings-section">
          <div class="settings-section-title">Anthropic API Key</div>
          <div class="settings-row">
            <input id="settings-key-input" type="password" class="settings-input" placeholder="sk-ant-..." />
            <button id="settings-key-save" class="settings-btn-save">Save</button>
            <button id="settings-key-clear" class="settings-btn-clear">Clear</button>
          </div>
          <div class="settings-hint">Your key is stored only in this browser. Never shared with anyone. Get yours at <a href="https://console.anthropic.com" target="_blank" style="color:#818cf8">console.anthropic.com</a></div>
        </div>
        <div class="settings-section">
          <div class="settings-section-title">Company Context</div>
          <textarea id="settings-context-input" class="settings-input" rows="4" placeholder="Describe your company, product, market, and role. e.g. 'I'm a PM at Acme Corp, a B2B SaaS company building HR automation tools for mid-market companies in North America.'"></textarea>
          <div class="settings-row" style="margin-top:8px">
            <button id="settings-context-save" class="settings-btn-save">Save Context</button>
            <button id="settings-context-clear" class="settings-btn-clear">Clear</button>
          </div>
          <div class="settings-hint">Used by all AI commands to tailor output to your company. The more detail you give, the better the results.</div>
        </div>
        <div class="settings-section">
          <div class="settings-section-title">Local Backend URL</div>
          <div class="settings-row">
            <input id="settings-backend-input" type="text" class="settings-input" placeholder="http://localhost:5001" />
            <button id="settings-backend-save" class="settings-btn-save">Test &amp; Save</button>
          </div>
          <div id="settings-backend-status" class="settings-status hidden"></div>
          <div class="settings-hint">Run start.bat on your local machine to start the backend. Default: http://localhost:5001</div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById("settings-close").addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.classList.add("hidden");
    });

    document.getElementById("settings-key-save").addEventListener("click", () => {
      const val = document.getElementById("settings-key-input").value.trim();
      if (val) {
        state.anthropicKey = val;
        localStorage.setItem('aipm_anthropic_key', val);
      }
      if (state.activeCommand) validateRunBtn();
    });

    document.getElementById("settings-key-clear").addEventListener("click", () => {
      state.anthropicKey = "";
      localStorage.removeItem('aipm_anthropic_key');
      document.getElementById("settings-key-input").value = "";
      if (state.activeCommand) validateRunBtn();
    });

    document.getElementById("settings-context-save").addEventListener("click", () => {
      const val = document.getElementById("settings-context-input").value.trim();
      state.companyContext = val;
      if (val) localStorage.setItem('aipm_company_context', val);
      else localStorage.removeItem('aipm_company_context');
    });

    document.getElementById("settings-context-clear").addEventListener("click", () => {
      state.companyContext = "";
      localStorage.removeItem('aipm_company_context');
      document.getElementById("settings-context-input").value = "";
    });

    document.getElementById("settings-backend-save").addEventListener("click", async () => {
      const url = document.getElementById("settings-backend-input").value.trim();
      const statusEl = document.getElementById("settings-backend-status");
      if (!url) return;
      state.backendUrl = url;
      localStorage.setItem('aipm_backend_url', url);
      statusEl.textContent = "Testing…";
      statusEl.className = "settings-status";
      statusEl.classList.remove("hidden");
      const ok = await pingBackend();
      if (ok) {
        statusEl.textContent = "Connected successfully!";
        statusEl.className = "settings-status ok";
      } else {
        statusEl.textContent = "Could not connect. Check the URL and that start.bat is running.";
        statusEl.className = "settings-status err";
      }
    });
  }

  // Populate current values
  const keyInput     = document.getElementById("settings-key-input");
  const backendInput = document.getElementById("settings-backend-input");
  const ctxInput     = document.getElementById("settings-context-input");
  if (keyInput)     keyInput.value     = state.anthropicKey ? "••••••••••••" : "";
  if (backendInput) backendInput.value = state.backendUrl;
  if (ctxInput)     ctxInput.value     = state.companyContext;

  // Reset status
  const statusEl = document.getElementById("settings-backend-status");
  if (statusEl) statusEl.className = "settings-status hidden";

  modal.classList.remove("hidden");
}

// ── Status check ───────────────────────────────────────────────────────────
function checkStatus(s) {
  // Only banner for real blocking errors (missing API key is now handled in-app)
  const issues = [];
  // Skip haiku_ok check — API key is now browser-side

  if (issues.length) {
    authBannerMsg.textContent = "⚠  " + issues.join("  |  ");
    authBanner.classList.remove("hidden");
    document.body.classList.add("has-banner");
  }
}

// ── Jira auth UI ───────────────────────────────────────────────────────────
function updateJiraUI(auth) {
  state.jiraConnected = auth.connected;

  let chip = document.getElementById("jira-auth-chip");
  if (!chip) {
    chip = document.createElement("div");
    chip.id = "jira-auth-chip";
    document.querySelector(".header-right").prepend(chip);
  }

  if (auth.connected) {
    const name = (auth.user || {}).name || "Connected";
    chip.innerHTML = `
      <span class="jira-user-chip">
        <span class="user-dot"></span>
        ${name}
        <button class="jira-disconnect-btn" onclick="disconnectJira()" title="Disconnect">✕</button>
      </span>`;

    const pill = document.querySelector(".pill-jira");
    if (pill) pill.textContent = "✓ Jira";

    if (authBannerMsg.textContent.includes("Jira")) {
      authBanner.classList.add("hidden");
    }
  } else {
    chip.innerHTML = `<a class="jira-connect-btn" href="${apiUrl('/oauth/login')}">🔗 Connect to Jira</a>`;
  }
}

function disconnectJira() {
  if (confirm("Disconnect from Jira?")) {
    window.location.href = apiUrl('/oauth/logout');
  }
}

// ── Squad selector ─────────────────────────────────────────────────────────
function buildSquadSelector() {
  squadSelect.innerHTML = '<option value="">— Select squad —</option>';
  state.squads.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.key;
    opt.textContent = `${s.name} (${s.key})`;
    if (s.key === state.currentSquad) opt.selected = true;
    squadSelect.appendChild(opt);
  });
}

squadSelect.addEventListener("change", async () => {
  state.currentSquad = squadSelect.value;
  squadSelect.classList.remove("pulse-required");
  if (state.backendConnected) {
    await fetch(apiUrl('/api/squads/select'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: state.currentSquad }),
    }).catch(() => {});
  }
  document.querySelectorAll(".field-sprint-select").forEach(el => {
    loadSprintOptions(el, state.currentSquad);
  });
  document.querySelectorAll(".field-fix-version-select").forEach(el => {
    loadFixVersionOptions(el, state.currentSquad);
  });
  if (state.activeCommand) validateRunBtn();
});

// ── Sprint loader ──────────────────────────────────────────────────────────
async function loadSprintOptions(selectEl, squadKey) {
  if (!squadKey) {
    selectEl.innerHTML = '<option value="">— Select a squad first —</option>';
    validateRunBtn();
    return;
  }
  selectEl.innerHTML = '<option value="">Loading sprints…</option>';
  selectEl.disabled  = true;
  try {
    const res  = await fetch(apiUrl(`/api/sprints/${squadKey}`));
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const sprints = data.sprints || [];
    if (!sprints.length) {
      selectEl.innerHTML = '<option value="">No sprints found</option>';
    } else {
      const opts = sprints.map(s => {
        const label = s.state === "active" ? `▶ ${s.name}` : s.name;
        return `<option value="${s.id}">${label}</option>`;
      });
      selectEl.innerHTML = '<option value="">— Pick a sprint —</option>' + opts.join("");
    }
  } catch (err) {
    selectEl.innerHTML = `<option value="">⚠ ${err.message}</option>`;
  }
  selectEl.disabled = false;
  validateRunBtn();
}

// ── Fix Version loader ─────────────────────────────────────────────────────
async function loadFixVersionOptions(selectEl, squadKey) {
  if (!squadKey) {
    selectEl.innerHTML = '<option value="">— Select a squad first —</option>';
    validateRunBtn();
    return;
  }
  selectEl.innerHTML = '<option value="">Loading releases…</option>';
  selectEl.disabled  = true;
  try {
    const res  = await fetch(apiUrl(`/api/fix-versions/${squadKey}`));
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const versions = data.versions || [];
    if (!versions.length) {
      selectEl.innerHTML = '<option value="">No releases found</option>';
    } else {
      const opts = versions.map(v => {
        const label = v.released ? `✓ ${v.name}` : `⬡ ${v.name}`;
        return `<option value="${v.name}">${label}</option>`;
      });
      selectEl.innerHTML = '<option value="">— Pick a release —</option>' + opts.join("");
    }
  } catch (err) {
    selectEl.innerHTML = `<option value="">⚠ ${err.message}</option>`;
  }
  selectEl.disabled = false;
  validateRunBtn();
}

// ── Command nav ────────────────────────────────────────────────────────────
function buildCommandNav() {
  const categories = [...new Set(state.commands.map(c => c.category))];
  commandNav.innerHTML = "";

  categories.forEach(cat => {
    const label = document.createElement("div");
    label.className = "category-label";
    label.dataset.category = cat;
    label.textContent = (CATEGORY_ICONS[cat] || "") + "  " + cat;
    commandNav.appendChild(label);

    state.commands
      .filter(c => c.category === cat)
      .forEach(c => commandNav.appendChild(buildCmdBtn(c)));
  });
}

function buildCmdBtn(cmd) {
  const btn = document.createElement("button");
  btn.className = `cmd-btn mode-${cmd.mode}`;
  btn.dataset.id   = cmd.id;
  btn.dataset.name = cmd.name.toLowerCase();

  const slug     = cmd.slug.startsWith("python:") ? cmd.slug.replace("python:", "") : cmd.slug;
  const isGenerate = cmd.mode === "generate";
  const hasFetch   = cmd.jira_fetch;

  const tags = [];
  if (cmd.needs_squad) tags.push('<span class="tag tag-squad">SQUAD</span>');
  if (isGenerate && hasFetch) {
    tags.push('<span class="tag tag-jira">JIRA</span>');
    tags.push('<span class="tag tag-haiku">AI</span>');
  } else if (isGenerate) {
    tags.push('<span class="tag tag-haiku">HAIKU</span>');
  } else if (cmd.mode === "run") {
    tags.push('<span class="tag tag-jira">JIRA</span>');
  } else if (cmd.mode === "python") {
    tags.push('<span class="tag tag-python">PYTHON</span>');
  }

  btn.innerHTML = `
    <span class="cmd-icon">${CMD_ICONS[cmd.id] || "▸"}</span>
    <span class="cmd-info">
      <span class="cmd-name">${cmd.name}</span>
      <span class="cmd-slug">${slug}</span>
      <span class="cmd-tags">${tags.join("")}</span>
    </span>`;

  btn.addEventListener("click", () => selectCommand(cmd));
  return btn;
}

// ── Search / filter ────────────────────────────────────────────────────────
cmdSearch.addEventListener("input", () => filterCommands(cmdSearch.value));

function filterCommands(query) {
  const q = query.trim().toLowerCase();
  let visibleCount = 0;

  commandNav.querySelectorAll(".cmd-btn").forEach(btn => {
    const matches = !q || btn.dataset.name.includes(q);
    btn.classList.toggle("hidden", !matches);
    if (matches) visibleCount++;
  });

  commandNav.querySelectorAll(".category-label").forEach(label => {
    const cat = label.dataset.category;
    const havisible = [...commandNav.querySelectorAll(`.cmd-btn:not(.hidden)`)]
      .some(b => state.commands.find(c => c.id === b.dataset.id)?.category === cat);
    label.style.display = havisible ? "" : "none";
  });

  searchEmpty.classList.toggle("hidden", visibleCount > 0);
}

// ── Command selection ──────────────────────────────────────────────────────
function selectCommand(cmd) {
  state.activeCommand = cmd;

  document.querySelectorAll(".cmd-btn").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector(`.cmd-btn[data-id="${cmd.id}"]`);
  if (btn) btn.classList.add("active");

  commandTitle.textContent = cmd.name;
  commandDesc.textContent  = cmd.description;

  // Mode badge
  let badgeHtml = "";
  if (cmd.mode === "generate" && cmd.jira_fetch) {
    badgeHtml = '<span class="mode-badge jira-generate">📊 Jira → AI → Edit' + (cmd.push_label ? " → Push" : "") + '</span>';
  } else if (cmd.mode === "generate") {
    badgeHtml = '<span class="mode-badge generate">⚡ AI → Edit' + (cmd.push_label ? " → Push" : "") + '</span>';
  } else if (cmd.mode === "run") {
    badgeHtml = '<span class="mode-badge run">🔗 Jira Direct</span>';
  } else if (cmd.mode === "python") {
    badgeHtml = '<span class="mode-badge python-mode">🐍 Python Script</span>';
  }
  modeBadgeWrap.innerHTML = badgeHtml;

  runBtnLabel.textContent = cmd.mode === "generate" ? "Generate" : "Run";
  runBtn.className = `run-btn mode-${cmd.mode}`;

  buildInputFields(cmd);
  validateRunBtn();

  // Show appropriate overlay if requirements not met
  if (cmd.needs_backend && !state.backendConnected) {
    showNeedsBackendOverlay();
  } else if (cmd.mode === "generate" && !state.anthropicKey) {
    showNoKeyOverlay();
  } else {
    resetPanels();
  }

  saveToHistory(cmd);
}

function showNeedsBackendOverlay() {
  editPanel.classList.add("hidden");
  pushPanel.classList.add("hidden");
  continueBar.classList.add("hidden");
  copyBtn.classList.add("hidden");
  regenerateBtn.classList.add("hidden");
  setPhase("");
  setStatus("", "");
  outputPanel.innerHTML = `
    <div class="needs-backend-overlay">
      <div class="nb-icon">🔌</div>
      <div class="nb-title">Local backend required</div>
      <div class="nb-desc">This command needs Jira access. Run <strong>start.bat</strong> on your local machine to connect.</div>
      <a href="./setup/" class="nb-link" target="_blank">Setup guide →</a>
      <button class="nb-retry" onclick="pingBackend()">Retry connection</button>
    </div>`;
}

function showNoKeyOverlay() {
  editPanel.classList.add("hidden");
  pushPanel.classList.add("hidden");
  continueBar.classList.add("hidden");
  copyBtn.classList.add("hidden");
  regenerateBtn.classList.add("hidden");
  setPhase("");
  setStatus("", "");
  outputPanel.innerHTML = `
    <div class="no-key-overlay">
      <div class="nk-icon">🔑</div>
      <div class="nk-title">Anthropic API key required</div>
      <div class="nk-desc">Add your Claude API key to use AI generation. Your key stays in your browser only.</div>
      <button class="nk-btn" onclick="openSettings()">Add API Key</button>
    </div>`;
}

// ── Input fields ───────────────────────────────────────────────────────────
function buildInputFields(cmd) {
  inputFields.innerHTML = "";

  cmd.inputs.forEach(inp => {
    const wrap = document.createElement("div");
    wrap.className = "field-wrap";

    const lbl = document.createElement("label");
    lbl.className = "field-label";
    lbl.textContent = inp.label + (inp.required ? " *" : "");
    lbl.htmlFor = `field-${inp.id}`;
    wrap.appendChild(lbl);

    let el;
    if (inp.type === "textarea") {
      el = document.createElement("textarea");
      el.className = "field-textarea";
      el.rows = 4;
    } else if (inp.type === "sprint-select") {
      el = document.createElement("select");
      el.className = "field-input field-sprint-select";
      el.innerHTML = `<option value="">— ${inp.placeholder || "Select a squad first…"} —</option>`;
      if (state.currentSquad && state.backendConnected) loadSprintOptions(el, state.currentSquad);
    } else if (inp.type === "fix-version-select") {
      el = document.createElement("select");
      el.className = "field-input field-fix-version-select";
      el.innerHTML = `<option value="">— ${inp.placeholder || "Select a squad first…"} —</option>`;
      if (state.currentSquad && state.backendConnected) loadFixVersionOptions(el, state.currentSquad);
    } else if (inp.type === "select") {
      el = document.createElement("select");
      el.className = "field-input";
      (inp.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === (inp.default || "")) o.selected = true;
        el.appendChild(o);
      });
    } else if (inp.type === "checkboxes") {
      el = document.createElement("div");
      el.className = "field-checkboxes";
      const defaults = inp.default || [];
      (inp.options || []).forEach(opt => {
        const lbl = document.createElement("label");
        lbl.className = "field-checkbox-label";
        const cb = document.createElement("input");
        cb.type    = "checkbox";
        cb.value   = opt.value;
        cb.checked = defaults.includes(opt.value);
        cb.className = "field-checkbox";
        cb.addEventListener("change", validateRunBtn);
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(" " + opt.label));
        el.appendChild(lbl);
      });
    } else {
      el = document.createElement("input");
      el.type = "text";
      el.className = "field-input";
    }
    el.id = `field-${inp.id}`;
    if (inp.type !== "sprint-select" && inp.type !== "fix-version-select" && inp.type !== "checkboxes") {
      el.placeholder = inp.placeholder || "";
    }
    if (inp.type !== "checkboxes") {
      el.addEventListener("change", () => { validateField(inp, el); validateRunBtn(); });
      el.addEventListener("input",  () => { validateField(inp, el); validateRunBtn(); });
    }
    wrap.appendChild(el);

    const hint = document.createElement("span");
    hint.className = "field-hint hidden";
    hint.id = `hint-${inp.id}`;
    wrap.appendChild(hint);

    inputFields.appendChild(wrap);
  });
}

function validateField(inp, el) {
  const val  = el.value.trim();
  const hint = document.getElementById(`hint-${inp.id}`);
  if (!hint) return;

  if (!val) {
    el.classList.remove("valid", "invalid");
    hint.className = "field-hint hidden";
    return;
  }

  if (inp.id === "issue_key" || inp.id === "ticket") {
    const ok = /^[A-Z][A-Z0-9]+-\d+$/i.test(val);
    el.classList.toggle("valid", ok);
    el.classList.toggle("invalid", !ok);
    hint.className = `field-hint ${ok ? "valid" : "invalid"}`;
    hint.textContent = ok ? "✓ Valid ticket key" : "Format: PROJECT-123";
    return;
  }

  if (inp.type === "textarea" && val.length < 20) {
    el.classList.remove("valid");
    el.classList.add("invalid");
    hint.className = "field-hint invalid";
    hint.textContent = "Add more detail for better output";
    return;
  }

  el.classList.add("valid");
  el.classList.remove("invalid");
  hint.className = "field-hint hidden";
}

function validateRunBtn() {
  const cmd = state.activeCommand;
  if (!cmd || state.isRunning) { runBtn.disabled = true; return; }

  // Check needs_backend
  if (cmd.needs_backend && !state.backendConnected) { runBtn.disabled = true; return; }

  // Check API key for generate commands
  if (cmd.mode === "generate" && !state.anthropicKey) { runBtn.disabled = true; return; }

  if (cmd.needs_squad && !state.currentSquad) {
    runBtn.disabled = true;
    squadWarning.classList.remove("hidden");
    return;
  }
  squadWarning.classList.add("hidden");

  const missingRequired = cmd.inputs
    .filter(i => i.required)
    .some(i => {
      const el = document.getElementById(`field-${i.id}`);
      return !el || !el.value.trim();
    });

  runBtn.disabled = missingRequired;
}

function gatherInputs(cmd) {
  const result = {};
  cmd.inputs.forEach(inp => {
    const el = document.getElementById(`field-${inp.id}`);
    if (!el) return;
    if (inp.type === "checkboxes") {
      result[inp.id] = Array.from(el.querySelectorAll("input[type=checkbox]:checked"))
        .map(cb => cb.value).join(",");
    } else {
      result[inp.id] = el.value.trim();
    }
  });
  return result;
}

// ── History ────────────────────────────────────────────────────────────────
const HISTORY_KEY = "aipm_history";
const HISTORY_MAX = 8;

function saveToHistory(cmd) {
  const history = getHistory();
  const filtered = history.filter(h => h.id !== cmd.id);
  filtered.unshift({ id: cmd.id, name: cmd.name, ts: Date.now() });
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, HISTORY_MAX)));
  renderHistory();
}

function getHistory() {
  try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]"); }
  catch(_) { return []; }
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    historyPanel.classList.add("hidden");
    return;
  }
  historyPanel.classList.remove("hidden");
  historyCount.textContent = history.length;
  historyList.innerHTML = "";
  history.forEach(h => {
    const item = document.createElement("div");
    item.className = "history-item";
    const cmd = state.commands.find(c => c.id === h.id);
    const mins = Math.round((Date.now() - h.ts) / 60000);
    const timeStr = mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : `${Math.round(mins/60)}h ago`;
    item.innerHTML = `
      <span class="history-item-icon">${CMD_ICONS[h.id] || "▸"}</span>
      <span class="history-item-info">
        <span class="history-item-name">${h.name}</span>
        <span class="history-item-time">${timeStr}</span>
      </span>`;
    item.addEventListener("click", () => {
      if (cmd) selectCommand(cmd);
    });
    historyList.appendChild(item);
  });
}

historyToggle.addEventListener("click", () => {
  historyPanel.classList.toggle("collapsed");
  historyChevron.textContent = historyPanel.classList.contains("collapsed") ? "▸" : "▾";
});

// ── Panel reset ────────────────────────────────────────────────────────────
function resetPanels() {
  outputPanel.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚡</div>
      <div>Click <strong>${state.activeCommand?.mode === "generate" ? "Generate" : "Run"}</strong> to start.</div>
      ${state.activeCommand?.mode === "generate"
        ? '<div class="empty-sub">AI drafts the content — you review and edit before anything goes to Jira or Confluence.</div>'
        : ""}
    </div>`;
  state.rawOutput       = "";
  state.fullOutput      = "";
  state.generatedContent= "";
  editPanel.classList.add("hidden");
  pushPanel.classList.add("hidden");
  continueBar.classList.add("hidden");
  copyBtn.classList.add("hidden");
  regenerateBtn.classList.add("hidden");
  setPhase("");
  setStatus("", "");
}

// ── Run button ─────────────────────────────────────────────────────────────
runBtn.addEventListener("click", startRun);
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !runBtn.disabled) startRun();
});

async function startRun() {
  const cmd = state.activeCommand;
  if (!cmd || state.isRunning) return;

  if (cmd.needs_squad && !state.currentSquad) {
    squadSelect.classList.add("pulse-required");
    squadSelect.focus();
    return;
  }

  editPanel.classList.add("hidden");
  pushPanel.classList.add("hidden");
  continueBar.classList.add("hidden");
  copyBtn.classList.add("hidden");
  regenerateBtn.classList.add("hidden");
  state.rawOutput       = "";
  state.fullOutput      = "";
  state.generatedContent= "";
  state.jiraFetchMeta   = {};
  outputPanel.innerHTML = "";

  setRunning(true);
  setStatus("running", "Running…");

  // For "run" mode commands (e.g. comment) — route to backend /api/run
  if (cmd.mode === "run") {
    setPhase("");
    fetch(apiUrl('/api/run'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command_id: cmd.id,
        squad:      state.currentSquad,
        inputs:     gatherInputs(cmd),
      }),
    }).then(res => handleStream(res, "run")).catch(onStreamError);
    return;
  }

  // For "python" mode commands — route to backend /api/run
  if (cmd.mode === "python") {
    setPhase("");
    fetch(apiUrl('/api/run'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command_id: cmd.id,
        squad:      state.currentSquad,
        inputs:     gatherInputs(cmd),
      }),
    }).then(res => handleStream(res, "run")).catch(onStreamError);
    return;
  }

  // Generate mode
  setPhase(cmd.jira_fetch ? "fetching" : "generating");

  let jiraContext = null;

  // Step 1: Fetch Jira context from backend if needed
  if (cmd.jira_fetch) {
    if (!state.backendConnected) {
      appendOutput("❌ Backend not connected. Cannot fetch Jira data.\n", false);
      setRunning(false);
      setStatus("error", "Error");
      return;
    }

    outputPanel.innerHTML = '<div style="padding:20px;color:#94a3b8">⏳ Fetching data from Jira…</div>';

    const fetchParams = new URLSearchParams({
      command:     cmd.id,
      squad_key:   state.currentSquad,
      ...gatherInputs(cmd),
    });

    try {
      const fetchRes = await fetch(apiUrl(`/api/jira/fetch?${fetchParams}`));
      const fetchData = await fetchRes.json();

      if (fetchData.error) {
        outputPanel.innerHTML = "";
        appendOutput(`❌ ${fetchData.error}\n`, false);
        setRunning(false);
        setStatus("error", "Error");
        return;
      }

      jiraContext = fetchData.context;
      state.jiraFetchMeta = fetchData.meta || {};

      outputPanel.innerHTML = "";
      appendOutput("✓ Fetched. Generating with AI…\n\n", true);
    } catch (e) {
      outputPanel.innerHTML = "";
      appendOutput(`❌ Jira fetch error: ${e.message}\n`, false);
      setRunning(false);
      setStatus("error", "Error");
      return;
    }
  }

  setPhase("generating");

  // Step 2: Post to Vercel /api/generate with jira_context
  fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-anthropic-key": state.anthropicKey,
    },
    body: JSON.stringify({
      command_id:      cmd.id,
      squad_key:       state.currentSquad,
      squad_label:     _squadLabel(state.currentSquad),
      inputs:          gatherInputs(cmd),
      jira_context:    jiraContext,
      company_context: state.companyContext,
      current_date:    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    }),
  }).then(res => handleStream(res, "generate")).catch(onStreamError);
}

// ── Regenerate ─────────────────────────────────────────────────────────────
regenerateBtn.addEventListener("click", startRun);

// ── Stream handler ─────────────────────────────────────────────────────────
async function handleStream(response, phase) {
  if (!response.ok) {
    const err = await response.text();
    appendOutput(`[Error ${response.status}: ${err}]\n`, false);
    finishStream(false, phase);
    return;
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";

  const read = async () => {
    try {
      const { done, value } = await reader.read();
      if (done) { finishStream(true, phase); return; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6));

          if (payload.done) { finishStream(payload.exit_code === 0, phase); return; }

          if (payload.jira_done) {
            state.rawOutput = "";
            setPhase("generating");
            continue;
          }

          if (payload.text) {
            const isProgress = !!payload.progress;
            appendOutput(payload.text, isProgress);
          }
        } catch (_) {}
      }
      read();
    } catch (e) {
      appendOutput(`[Stream error: ${e.message}]\n`, false);
      finishStream(false, phase);
    }
  };
  read();
}

function appendOutput(text, isProgress) {
  state.fullOutput += text;
  if (!isProgress) state.rawOutput += text;

  let pre = outputPanel.querySelector(".stream-output");
  if (!pre) {
    pre = document.createElement("pre");
    pre.className = "stream-output";
    outputPanel.innerHTML = "";
    outputPanel.appendChild(pre);
  }

  if (isProgress) {
    const span = document.createElement("span");
    span.className = "stream-progress";
    span.textContent = text;
    pre.appendChild(span);
  } else {
    pre.appendChild(document.createTextNode(text));
  }

  outputPanel.scrollTop = outputPanel.scrollHeight;
}

function finishStream(success, phase) {
  setRunning(false);
  setStatus(success ? "done" : "error", success ? "Done" : "Error");

  if (phase === "generate" || phase === "run") {
    renderMarkdown();
    if (state.activeCommand?.mode === "generate") {
      state.generatedContent = state.rawOutput;
      showEditPanel();
      setPhase("editing");
    } else {
      setPhase("done");
      highlightDownloads();
    }
  } else {
    renderMarkdown();
    setPhase("done");
    highlightDownloads();
  }

  copyBtn.classList.remove("hidden");
}

function onStreamError(err) {
  appendOutput(`[Fetch error: ${err.message}]\n`, false);
  setRunning(false);
  setStatus("error", "Error");
}

// ── Edit panel ─────────────────────────────────────────────────────────────
function showEditPanel() {
  const cmd = state.activeCommand;
  editTextarea.value = state.generatedContent;
  editPanel.classList.remove("hidden");

  const existing = document.getElementById("push-fields-form");
  if (existing) existing.remove();

  if (cmd.push_label) {
    pushBtnLabel.textContent = cmd.push_label;
    pushBtn.classList.remove("hidden");
    editHint.style.display = "none";
    regenerateBtn.classList.remove("hidden");
    if (["story", "idea", "doc-pvg"].includes(cmd.id) && state.currentSquad && state.backendConnected) {
      loadPushFields(cmd.id, state.currentSquad);
    }
  } else {
    pushBtn.classList.add("hidden");
    editHint.textContent = "Analysis complete — copy or regenerate as needed.";
    editHint.style.display = "";
    regenerateBtn.classList.remove("hidden");
  }
  editTextarea.focus();
}

async function loadPushFields(commandId, squadKey) {
  try {
    const res  = await fetch(apiUrl(`/api/push-fields/${commandId}/${squadKey}`));
    const data = await res.json();
    if (data.error || !data.fields || !data.fields.length) return;

    const form = document.createElement("div");
    form.id = "push-fields-form";
    form.className = "push-fields-form";

    const heading = document.createElement("div");
    heading.className = "push-fields-heading";
    heading.textContent = `Required fields for ${data.issue_type || "issue"}`;
    form.appendChild(heading);

    data.fields.forEach(f => {
      const row = document.createElement("div");
      row.className = "push-field-row";

      const lbl = document.createElement("label");
      lbl.className = "push-field-label";
      lbl.textContent = f.name;
      lbl.htmlFor = `pf-${f.id}`;
      row.appendChild(lbl);

      let el;
      if (f.allowed && f.allowed.length) {
        el = document.createElement("select");
        el.className = "field-input push-field-select";
        f.allowed.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt.id;
          o.textContent = opt.value;
          el.appendChild(o);
        });
      } else {
        el = document.createElement("input");
        el.type = f.type === "number" ? "number" : "text";
        el.className = "field-input push-field-input";
        el.placeholder = f.name;
      }
      el.id = `pf-${f.id}`;
      el.dataset.fieldId = f.id;
      row.appendChild(el);
      form.appendChild(row);
    });

    const actionsRow = document.querySelector(".edit-actions");
    if (actionsRow) actionsRow.before(form);
  } catch (_) {}
}

function gatherPushFields() {
  const result = {};
  document.querySelectorAll("[data-field-id]").forEach(el => {
    result[el.dataset.fieldId] = el.value;
  });
  return result;
}

// ── Push ───────────────────────────────────────────────────────────────────
pushBtn.addEventListener("click", doPush);

function doPush() {
  const cmd = state.activeCommand;
  if (!cmd || state.isRunning) return;

  const content = editTextarea.value.trim();
  if (!content) return;

  // Deck: build .pptx locally via Vercel function — no Flask backend needed
  if (cmd.id === "deck") {
    doBuildDeck(content);
    return;
  }

  setRunning(true, "push");
  pushPanel.classList.remove("hidden");
  pushOutput.textContent = "";
  pushLabelDisplay.textContent = "Pushing to " + (cmd.push_label || "Jira/Confluence") + "…";
  setPushStatus("running", "Pushing…");
  setPhase("pushing");

  fetch(apiUrl('/api/push'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command_id:  cmd.id,
      squad:       state.currentSquad,
      content,
      inputs:      gatherInputs(cmd),
      push_fields: gatherPushFields(),
      push_meta:   state.jiraFetchMeta,
    }),
  }).then(res => handlePushStream(res)).catch(onPushError);
}

async function handlePushStream(response) {
  if (!response.ok) {
    const err = await response.text();
    pushOutput.textContent += `[Error: ${err}]\n`;
    finishPush(false);
    return;
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";

  const read = async () => {
    try {
      const { done, value } = await reader.read();
      if (done) { finishPush(true); return; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6));
          if (payload.done) { finishPush(payload.exit_code === 0); return; }
          if (payload.text) {
            appendPushLine(payload.text);
          }
        } catch (_) {}
      }
      read();
    } catch (e) {
      pushOutput.textContent += `[Stream error: ${e.message}]\n`;
      finishPush(false);
    }
  };
  read();
}

function appendPushLine(text) {
  const urlPat = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlPat);
  parts.forEach((part, i) => {
    if (urlPat.test(part)) {
      const a = document.createElement("a");
      a.href = part; a.textContent = part; a.target = "_blank";
      pushOutput.appendChild(a);
    } else {
      pushOutput.appendChild(document.createTextNode(part));
    }
  });
  pushPanel.scrollTop = pushPanel.scrollHeight;
}

function finishPush(success) {
  setRunning(false);
  if (success) {
    setPushStatus("done", "Done ✓");
    pushLabelDisplay.textContent = "Push complete";
    setPhase("done");
  } else {
    setPushStatus("error", "Failed");
    setPhase("done");
  }
}

function onPushError(err) {
  pushOutput.textContent += `[Fetch error: ${err.message}]\n`;
  finishPush(false);
}

// ── Deck builder (.pptx download) ──────────────────────────────────────────
function doBuildDeck(content) {
  const inputs   = gatherInputs(state.activeCommand);
  const style    = inputs.style    || "professional";
  const topic    = (inputs.topic  || "Presentation").substring(0, 80);

  setRunning(true, "push");
  pushPanel.classList.remove("hidden");
  pushOutput.textContent = "";
  pushLabelDisplay.textContent = "Building .pptx deck…";
  setPushStatus("running", "Building…");
  setPhase("pushing");

  appendPushLine("Generating PowerPoint file…\n");

  fetch("/api/build-deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, style, title: topic }),
  })
  .then(async res => {
    if (!res.ok) {
      const err = await res.text();
      appendPushLine(`[Error: ${err}]\n`);
      finishPush(false);
      return;
    }
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);
    const filename = topic.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/ +/g, "_") || "deck";
    const a        = document.createElement("a");
    a.href = url; a.download = `${filename}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    appendPushLine("✓ Deck downloaded — check your Downloads folder.\n");
    finishPush(true);
  })
  .catch(err => {
    appendPushLine(`[Fetch error: ${err.message}]\n`);
    finishPush(false);
  });
}

// ── Markdown rendering ─────────────────────────────────────────────────────
function renderMarkdown() {
  if (!state.rawOutput.trim()) return;
  try {
    const html = DOMPurify.sanitize(marked.parse(state.rawOutput));
    outputPanel.innerHTML = `<div class="rendered-output">${html}</div>`;
    outputPanel.scrollTop = 0;
  } catch (_) {}
}

function highlightDownloads() {
  const pat = /\b(intel|outputs|tmp)\/[\w\-\.]+\.(docx|pptx|pdf|md|csv)\b/g;
  const matches = [...state.rawOutput.matchAll(pat)];
  if (!matches.length) return;

  const div = document.createElement("div");
  div.style.cssText = "margin-top:16px;border-top:1px solid var(--border);padding-top:12px;";
  const h = document.createElement("div");
  h.style.cssText = "font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px;";
  h.textContent = "Generated files";
  div.appendChild(h);

  const seen = new Set();
  matches.forEach(m => {
    if (seen.has(m[0])) return;
    seen.add(m[0]);
    const a = document.createElement("a");
    a.href = apiUrl(`/api/download/${m[0]}`);
    a.className = "download-link";
    a.textContent = "⬇  " + m[0].split("/").pop();
    a.download = "";
    div.appendChild(a);
  });
  outputPanel.appendChild(div);
}

// ── Copy ───────────────────────────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  const text = editTextarea.value || state.rawOutput;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = copyBtn.innerHTML;
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
    setTimeout(() => { copyBtn.innerHTML = orig; }, 1500);
  });
});

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
    e.preventDefault();
    cmdSearch.focus();
    cmdSearch.select();
    return;
  }

  if (e.key === "Escape") {
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal && !settingsModal.classList.contains("hidden")) {
      settingsModal.classList.add("hidden");
      return;
    }
    if (!shortcutsModal.classList.contains("hidden")) {
      shortcutsModal.classList.add("hidden");
      return;
    }
    if (document.activeElement === cmdSearch) {
      cmdSearch.value = "";
      filterCommands("");
      cmdSearch.blur();
      return;
    }
    if (state.activeCommand && !state.isRunning) {
      resetPanels();
    }
    return;
  }

  if (e.key === "?" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
    shortcutsModal.classList.toggle("hidden");
    return;
  }
});

shortcutsBtn.addEventListener("click", () => shortcutsModal.classList.toggle("hidden"));
shortcutsClose.addEventListener("click", () => shortcutsModal.classList.add("hidden"));
shortcutsModal.addEventListener("click", e => {
  if (e.target === shortcutsModal) shortcutsModal.classList.add("hidden");
});

// ── Helpers ────────────────────────────────────────────────────────────────
function setRunning(yes, context) {
  state.isRunning = yes;
  if (yes) {
    runBtn.disabled = true;
    runBtn.classList.add("running");
    runBtn.innerHTML = `<span class="run-icon pulsing">●</span> <span>${context === "push" ? "Pushing…" : "Running…"}</span>`;
    if (context !== "push") pushBtn.disabled = true;
  } else {
    runBtn.classList.remove("running");
    runBtn.innerHTML = `<span class="run-icon">▶</span> <span id="run-btn-label">${state.activeCommand?.mode === "generate" ? "Generate" : "Run"}</span>`;
    pushBtn.disabled = false;
    validateRunBtn();
  }
}

function setStatus(type, text) {
  statusIndicator.className = "status-indicator " + (type || "");
  if      (type === "running") statusIndicator.innerHTML = `<span class="pulsing">●</span> ${text}`;
  else if (type === "done")    statusIndicator.innerHTML = `<span style="color:var(--green)">✓</span> ${text}`;
  else if (type === "error")   statusIndicator.innerHTML = `<span style="color:var(--danger)">✕</span> ${text}`;
  else                         statusIndicator.textContent = "";
}

function setPushStatus(type, text) {
  pushStatusInd.className = "status-indicator " + (type || "");
  if      (type === "running") pushStatusInd.innerHTML = `<span class="pulsing">●</span> ${text}`;
  else if (type === "done")    pushStatusInd.innerHTML = `<span style="color:var(--green)">✓</span> ${text}`;
  else if (type === "error")   pushStatusInd.innerHTML = `<span style="color:var(--danger)">✕</span> ${text}`;
}

function setPhase(phase) {
  const labels = {
    fetching:   "⏳ Fetching Jira data…",
    generating: "⚡ Generating…",
    editing:    "✏️ Review & Edit",
    pushing:    "→ Pushing…",
    done:       "✓ Complete",
  };
  if (phase && labels[phase]) {
    phaseBadge.textContent = labels[phase];
    phaseBadge.className = `phase-badge ${phase === "fetching" ? "generating" : phase}`;
  } else {
    phaseBadge.className = "phase-badge hidden";
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
init();
