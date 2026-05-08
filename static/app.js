// ── State ──────────────────────────────────────────────────────────────────
const state = {
  commands: [],
  squads: [],
  currentSquad: "",
  activeCommand: null,
  isRunning: false,
  rawOutput: "",
  generatedContent: "",  // clean text for the edit textarea
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

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  const [squadsRes, cmdsRes, statusRes] = await Promise.all([
    fetch("/api/squads").then(r => r.json()),
    fetch("/api/commands").then(r => r.json()),
    fetch("/api/status").then(r => r.json()),
  ]);

  state.squads   = squadsRes.squads;
  state.currentSquad = squadsRes.current || "";
  state.commands = cmdsRes.commands;

  buildSquadSelector();
  buildCommandNav();
  checkStatus(statusRes);
}

// ── Status check ───────────────────────────────────────────────────────────
function checkStatus(s) {
  const issues = [];
  if (!s.cli_ok)   issues.push(`Claude CLI: ${s.cli_reason || "not ready"}`);
  if (!s.haiku_ok) issues.push(`Haiku API: ${s.haiku_reason || "no key"}`);
  if (issues.length) {
    authBannerMsg.textContent = "⚠  " + issues.join("  |  ");
    authBanner.classList.remove("hidden");
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
  await fetch("/api/squads/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: state.currentSquad }),
  });
  if (state.activeCommand) validateRunBtn();
});

// ── Command nav ────────────────────────────────────────────────────────────
function buildCommandNav() {
  const categories = [...new Set(state.commands.map(c => c.category))];
  commandNav.innerHTML = "";

  categories.forEach(cat => {
    const label = document.createElement("div");
    label.className = "category-label";
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
  btn.dataset.id = cmd.id;

  const slug = cmd.slug.startsWith("python:") ? cmd.slug.replace("python:", "") : cmd.slug;
  const isGenerate = cmd.mode === "generate";

  const tags = [];
  if (cmd.needs_squad) tags.push('<span class="tag tag-squad">SQUAD</span>');
  if (isGenerate)      tags.push('<span class="tag tag-haiku">HAIKU</span>');
  else if (cmd.mode === "cli") tags.push('<span class="tag tag-cli">CLI</span>');

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

// ── Command selection ──────────────────────────────────────────────────────
function selectCommand(cmd) {
  state.activeCommand = cmd;

  document.querySelectorAll(".cmd-btn").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector(`.cmd-btn[data-id="${cmd.id}"]`);
  if (btn) btn.classList.add("active");

  commandTitle.textContent = cmd.name;
  commandDesc.textContent  = cmd.description;

  // Mode badge
  modeBadgeWrap.innerHTML = cmd.mode === "generate"
    ? '<span class="mode-badge generate">⚡ Haiku → Edit → Push</span>'
    : cmd.mode === "cli"
    ? '<span class="mode-badge cli">🔗 Claude CLI</span>'
    : "";

  // Run button label
  runBtnLabel.textContent = cmd.mode === "generate" ? "Generate" : "Run";
  runBtn.className = `run-btn mode-${cmd.mode}`;

  buildInputFields(cmd);
  validateRunBtn();
  resetPanels();
}

// ── Input fields ───────────────────────────────────────────────────────────
function buildInputFields(cmd) {
  inputFields.innerHTML = "";

  cmd.inputs.forEach(inp => {
    const wrap = document.createElement("div");

    const lbl = document.createElement("label");
    lbl.className = "field-label";
    lbl.textContent = inp.label + (inp.required ? " *" : "");
    lbl.htmlFor = `field-${inp.id}`;
    wrap.appendChild(lbl);

    if (inp.type === "textarea") {
      const ta = document.createElement("textarea");
      ta.className = "field-textarea";
      ta.id = `field-${inp.id}`;
      ta.placeholder = inp.placeholder || "";
      ta.rows = 4;
      ta.addEventListener("input", validateRunBtn);
      wrap.appendChild(ta);
    } else {
      const el = document.createElement("input");
      el.type = "text";
      el.className = "field-input";
      el.id = `field-${inp.id}`;
      el.placeholder = inp.placeholder || "";
      el.addEventListener("input", validateRunBtn);
      wrap.appendChild(el);
    }
    inputFields.appendChild(wrap);
  });
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
    .some(i => { const el = document.getElementById(`field-${i.id}`); return !el || !el.value.trim(); });

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

// ── Panel reset ────────────────────────────────────────────────────────────
function resetPanels() {
  outputPanel.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚡</div>
      <div>Click <strong>${state.activeCommand?.mode === "generate" ? "Generate" : "Run"}</strong> to start.</div>
      ${state.activeCommand?.mode === "generate"
        ? '<div class="empty-sub">Haiku drafts the content — you review and edit before anything goes to Jira.</div>'
        : ""}
    </div>`;
  state.rawOutput = "";
  state.generatedContent = "";
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

  editPanel.classList.add("hidden");
  pushPanel.classList.add("hidden");
  continueBar.classList.add("hidden");
  copyBtn.classList.add("hidden");
  regenerateBtn.classList.add("hidden");
  state.rawOutput = "";
  state.generatedContent = "";
  outputPanel.innerHTML = "";

  setRunning(true);
  setPhase(cmd.mode === "generate" ? "generating" : "");

  const endpoint = cmd.mode === "generate" ? "/api/generate" : "/api/run";

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command_id: cmd.id,
      squad: state.currentSquad,
      inputs: gatherInputs(cmd),
    }),
  }).then(res => handleStream(res, "generate")).catch(onStreamError);
}

// ── Regenerate ─────────────────────────────────────────────────────────────
regenerateBtn.addEventListener("click", startRun);

// ── Stream handler ─────────────────────────────────────────────────────────
async function handleStream(response, phase) {
  if (!response.ok) {
    const err = await response.text();
    appendLine(`[Error: ${err}]\n`);
    finishStream(false, phase);
    return;
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";
  let   approvalShown = false;

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
          if (payload.text) appendLine(payload.text);
          if (payload.approval && !approvalShown) {
            approvalShown = true;
            setTimeout(() => continueBar.classList.remove("hidden"), 300);
          }
        } catch (_) {}
      }
      read();
    } catch (e) {
      appendLine(`[Stream error: ${e.message}]\n`);
      finishStream(false, phase);
    }
  };
  read();
}

function appendLine(text) {
  state.rawOutput += text;
  let pre = outputPanel.querySelector(".stream-output");
  if (!pre) {
    pre = document.createElement("pre");
    pre.className = "stream-output";
    outputPanel.innerHTML = "";
    outputPanel.appendChild(pre);
  }
  pre.textContent += text;
  outputPanel.scrollTop = outputPanel.scrollHeight;
}

function finishStream(success, phase) {
  setRunning(false);

  if (success) {
    setStatus("done", "Done");
  } else {
    setStatus("error", "Error");
  }

  if (phase === "generate") {
    // Render markdown in output panel
    renderMarkdown();
    // Populate edit panel
    state.generatedContent = state.rawOutput;
    showEditPanel();
    setPhase("editing");
  } else {
    renderMarkdown();
    setPhase("done");
    highlightDownloads();
  }

  copyBtn.classList.remove("hidden");
}

function onStreamError(err) {
  appendLine(`[Fetch error: ${err.message}]\n`);
  setRunning(false);
  setStatus("error", "Error");
}

// ── Edit panel ─────────────────────────────────────────────────────────────
function showEditPanel() {
  const cmd = state.activeCommand;
  editTextarea.value = state.generatedContent;
  editPanel.classList.remove("hidden");

  const hasPush = cmd.push_label;
  if (hasPush) {
    pushBtnLabel.textContent = cmd.push_label;
    pushBtn.classList.remove("hidden");
    editHint.style.display = "none";
    regenerateBtn.classList.remove("hidden");
  } else {
    pushBtn.classList.add("hidden");
    editHint.textContent = "Read-only analysis — no push needed. Copy if useful.";
    editHint.style.display = "";
    regenerateBtn.classList.remove("hidden");
  }
  editTextarea.focus();
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

  state.rawOutput = "";

  fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command_id: cmd.id,
      squad: state.currentSquad,
      content,
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
            pushOutput.textContent += payload.text;
            pushPanel.scrollTop = pushPanel.scrollHeight;
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

// ── Continue conversation ──────────────────────────────────────────────────
continueBtn.addEventListener("click", sendContinue);
continueInput.addEventListener("keydown", e => { if (e.key === "Enter") sendContinue(); });
document.querySelectorAll(".quick-btn").forEach(btn => {
  btn.addEventListener("click", () => { continueInput.value = btn.dataset.value; sendContinue(); });
});

function sendContinue() {
  const text = continueInput.value.trim();
  if (!text || state.isRunning) return;
  continueInput.value = "";
  continueBar.classList.add("hidden");
  setRunning(true);

  fetch("/api/continue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then(res => handleStream(res, "cli")).catch(onStreamError);
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
    generating: "⚡ Generating…",
    editing:    "✏️ Review & Edit",
    pushing:    "→ Pushing…",
    done:       "✓ Complete",
  };
  if (phase && labels[phase]) {
    phaseBadge.textContent = labels[phase];
    phaseBadge.className = `phase-badge ${phase}`;
  } else {
    phaseBadge.className = "phase-badge hidden";
  }
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
init();
