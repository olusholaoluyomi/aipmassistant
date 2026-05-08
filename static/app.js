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
};

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

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  const [squadsRes, cmdsRes, statusRes, authRes] = await Promise.all([
    fetch("/api/squads").then(r => r.json()),
    fetch("/api/commands").then(r => r.json()),
    fetch("/api/status").then(r => r.json()),
    fetch("/api/auth/status").then(r => r.json()),
  ]);

  state.squads       = squadsRes.squads;
  state.currentSquad = squadsRes.current || "";
  state.commands     = cmdsRes.commands;

  buildSquadSelector();
  buildCommandNav();
  checkStatus(statusRes);
  updateJiraUI(authRes);
  renderHistory();

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

// ── Status check ───────────────────────────────────────────────────────────
function checkStatus(s) {
  // Jira "not connected" is normal — the Connect button in the header handles it.
  // Only banner for real blocking errors (missing API key etc).
  const issues = [];
  if (!s.haiku_ok) issues.push(`Haiku API: ${s.haiku_reason || "no key"}`);

  if (issues.length) {
    authBannerMsg.textContent = "⚠  " + issues.join("  |  ");
    authBanner.classList.remove("hidden");
    document.body.classList.add("has-banner");
  }
}

// ── Jira auth UI ───────────────────────────────────────────────────────────
function updateJiraUI(auth) {
  state.jiraConnected = auth.connected;

  // Find or create the connect area in header-right
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

    // Update engine pill
    const pill = document.querySelector(".pill-jira");
    if (pill) pill.textContent = "✓ Jira";

    // Clear banner if it was only a Jira warning
    if (authBannerMsg.textContent.includes("Jira")) {
      authBanner.classList.add("hidden");
    }
  } else {
    chip.innerHTML = `<a class="jira-connect-btn" href="/oauth/login">🔗 Connect to Jira</a>`;
  }
}

function disconnectJira() {
  if (confirm("Disconnect from Jira?")) {
    window.location.href = "/oauth/logout";
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
  await fetch("/api/squads/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: state.currentSquad }),
  });
  // Refresh any sprint-select or fix-version-select dropdowns for the newly selected squad
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
    const res  = await fetch(`/api/sprints/${squadKey}`);
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
    const res  = await fetch(`/api/fix-versions/${squadKey}`);
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

  // Show/hide category labels based on visible commands
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
  resetPanels();
  saveToHistory(cmd);
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
      if (state.currentSquad) loadSprintOptions(el, state.currentSquad);
    } else if (inp.type === "fix-version-select") {
      el = document.createElement("select");
      el.className = "field-input field-fix-version-select";
      el.innerHTML = `<option value="">— ${inp.placeholder || "Select a squad first…"} —</option>`;
      if (state.currentSquad) loadFixVersionOptions(el, state.currentSquad);
    } else {
      el = document.createElement("input");
      el.type = "text";
      el.className = "field-input";
    }
    el.id          = `field-${inp.id}`;
    if (inp.type !== "sprint-select" && inp.type !== "fix-version-select") el.placeholder = inp.placeholder || "";
    el.addEventListener("change", () => { validateField(inp, el); validateRunBtn(); });
    el.addEventListener("input",  () => { validateField(inp, el); validateRunBtn(); });
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

  // Jira key format
  if (inp.id === "issue_key" || inp.id === "ticket") {
    const ok = /^[A-Z][A-Z0-9]+-\d+$/i.test(val);
    el.classList.toggle("valid", ok);
    el.classList.toggle("invalid", !ok);
    hint.className = `field-hint ${ok ? "valid" : "invalid"}`;
    hint.textContent = ok ? "✓ Valid ticket key" : "Format: PROJECT-123";
    return;
  }

  // Textarea min length soft warning
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
    if (el) result[inp.id] = el.value.trim();
  });
  return result;
}

// ── History ────────────────────────────────────────────────────────────────
const HISTORY_KEY = "aipm_history";
const HISTORY_MAX = 8;

function saveToHistory(cmd) {
  const history = getHistory();
  // Remove existing entry for same command, push to front
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

function startRun() {
  const cmd = state.activeCommand;
  if (!cmd || state.isRunning) return;

  // Check squad required
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
  outputPanel.innerHTML = "";

  setRunning(true);
  setStatus("running", "Running…");
  setPhase(cmd.mode === "generate" ? (cmd.jira_fetch ? "fetching" : "generating") : "");

  const endpoint = cmd.mode === "generate" ? "/api/generate" : "/api/run";

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command_id: cmd.id,
      squad:      state.currentSquad,
      inputs:     gatherInputs(cmd),
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
            // Jira fetch complete — reset rawOutput so only AI content goes to edit textarea
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

  // Clear any previous push-fields form
  const existing = document.getElementById("push-fields-form");
  if (existing) existing.remove();

  if (cmd.push_label) {
    pushBtnLabel.textContent = cmd.push_label;
    pushBtn.classList.remove("hidden");
    editHint.style.display = "none";
    regenerateBtn.classList.remove("hidden");
    // Load required Jira fields for commands that create issues
    if (["story", "idea", "doc-pvg"].includes(cmd.id) && state.currentSquad) {
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
    const res  = await fetch(`/api/push-fields/${commandId}/${squadKey}`);
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

    // Insert before the push button row
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

  setRunning(true, "push");
  pushPanel.classList.remove("hidden");
  pushOutput.textContent = "";
  pushLabelDisplay.textContent = "Pushing to " + (cmd.push_label || "Jira/Confluence") + "…";
  setPushStatus("running", "Pushing…");
  setPhase("pushing");

  fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command_id:  cmd.id,
      squad:       state.currentSquad,
      content,
      inputs:      gatherInputs(cmd),
      push_fields: gatherPushFields(),
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
  // Convert plain URLs to clickable links
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
    a.href = `/api/download/${m[0]}`;
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
  // Ctrl+K or / → focus search
  if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA")) {
    e.preventDefault();
    cmdSearch.focus();
    cmdSearch.select();
    return;
  }

  // Escape → clear search / close modal / reset output
  if (e.key === "Escape") {
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

  // ? → toggle shortcuts modal
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
