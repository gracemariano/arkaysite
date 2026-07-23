const LINKEDIN = "https://www.linkedin.com/company/arkaypackaging/?viewAsMember=true";

let manifest = [];
let meetings = {};
let currentId = null;
let ownerFilter = "all";

async function loadManifest() {
  const res = await fetch("meetings/index.json");
  manifest = await res.json();
  manifest.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));
  await Promise.all(
    manifest.map(async (m) => {
      const r = await fetch(`meetings/${m.file}`);
      meetings[m.id] = await r.json();
    })
  );
}

function fmtDate(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMonthBar() {
  const bar = document.getElementById("month-bar");
  bar.innerHTML = manifest
    .map(
      (m, i) =>
        `<button type="button" class="month-btn${m.id === currentId ? " active" : ""}" data-id="${m.id}">${
          i === 0 ? "Latest" : m.month
        }</button>`
    )
    .join("");
  bar.querySelectorAll(".month-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectMeeting(btn.dataset.id, false));
  });
}

function renderSummaryBlock(item) {
  const pills = (item.metrics || [])
    .map(
      (m) =>
        `<span class="metric-pill"><span class="metric-pill-num">${escapeHtml(m.value)}</span><span class="metric-pill-label">${escapeHtml(m.label)}</span></span>`
    )
    .join("");
  return `<div class="summary-block">
    <p class="summary-theme">${escapeHtml(item.theme)}</p>
    <p class="summary-line">${escapeHtml(item.line)}</p>
    <div class="summary-pills">${pills}</div>
  </div>`;
}

function renderKpiCard(kpi) {
  const v = kpi.variant || "default";
  return `<div class="kpi-card kpi-${v}">
    <div class="kpi-num">${escapeHtml(kpi.value)}</div>
    <div class="kpi-label">${escapeHtml(kpi.label)}</div>
    ${kpi.subtitle ? `<div class="kpi-sub">${escapeHtml(kpi.subtitle)}</div>` : ""}
  </div>`;
}

function renderMiniMetrics(metrics) {
  if (!metrics?.length) return "";
  return `<div class="mini-metrics">${metrics
    .map(
      (m) =>
        `<div class="mini-metric"><div class="mini-metric-num">${escapeHtml(m.value)}</div><div class="mini-metric-label">${escapeHtml(m.label)}</div></div>`
    )
    .join("")}</div>`;
}

function renderSection(sec, isFirst) {
  const bullets = sec.bullets?.length
    ? `<ul class="section-bullets">${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
    : "";
  const open = sec.expanded || isFirst ? " open" : "";
  return `<details class="dash-section"${open}>
    <summary>${escapeHtml(sec.title)}</summary>
    <div class="section-body">
      ${renderMiniMetrics(sec.metrics)}
      ${bullets}
    </div>
  </details>`;
}

function renderActions(actions) {
  const owners = [...new Set(actions.map((a) => a.owner))].sort();
  const filtered =
    ownerFilter === "all" ? actions : actions.filter((a) => a.owner === ownerFilter);

  const ownerOpts = owners
    .map((o) => `<option value="${escapeHtml(o)}"${o === ownerFilter ? " selected" : ""}>${escapeHtml(o)}</option>`)
    .join("");

  const rows = filtered
    .map(
      (a) =>
        `<tr>
          <td><strong>${escapeHtml(a.owner)}</strong></td>
          <td>${escapeHtml(a.action)}</td>
          <td><span class="priority priority-${(a.priority || "medium").toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(a.priority || "—")}</span></td>
          <td><span class="status">${escapeHtml(a.status || "—")}</span></td>
        </tr>`
    )
    .join("");

  return `<div class="actions-wrap">
    <div class="actions-toolbar">
      <label for="owner-filter">Filter by owner</label>
      <select id="owner-filter"><option value="all"${ownerFilter === "all" ? " selected" : ""}>All owners</option>${ownerOpts}</select>
      <span class="actions-count">${filtered.length} item${filtered.length === 1 ? "" : "s"}</span>
    </div>
    <div class="table-scroll">
      <table class="actions-table">
        <thead><tr><th>Owner</th><th>Action</th><th>Priority</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">No actions for this filter.</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}

function renderDashboard(meeting) {
  const root = document.getElementById("dashboard");
  root.classList.add("fade-out");
  requestAnimationFrame(() => {
    root.innerHTML = `
      <header class="meeting-header">
        <p class="meeting-badge">${meeting.id === manifest[0].id ? "Latest meeting" : "Archive"} · ${escapeHtml(meeting.month)} ${meeting.year}</p>
        <h1 class="meeting-heading">${escapeHtml(meeting.title)}</h1>
        <p class="meeting-meta">${escapeHtml(meeting.subtitle || "")}${meeting.subtitle ? " · " : ""}${fmtDate(meeting.meetingDate)}</p>
      </header>

      <section class="dash-card summary-card" aria-labelledby="exec-summary-title">
        <h2 id="exec-summary-title">Executive Summary</h2>
        <div class="summary-grid">${meeting.executiveSummary.map(renderSummaryBlock).join("")}</div>
      </section>

      <section class="kpi-section" aria-label="Key performance indicators">
        <h2 class="section-heading">KPI Dashboard</h2>
        <div class="kpi-grid">${meeting.kpis.map(renderKpiCard).join("")}</div>
      </section>

      <section class="sections-wrap" aria-label="Meeting sections">
        <h2 class="section-heading">Details</h2>
        ${meeting.sections.map((s, i) => renderSection(s, i === 0)).join("")}
      </section>

      <section class="dash-card actions-card" aria-labelledby="actions-title">
        <h2 id="actions-title">Action Items</h2>
        ${renderActions(meeting.actions)}
      </section>

      <footer class="dash-footer">Arkay Packaging · Confidential · Updated monthly — latest session selected by default.</footer>
    `;

    document.getElementById("owner-filter")?.addEventListener("change", (e) => {
      ownerFilter = e.target.value;
      renderDashboard(meetings[currentId]);
    });

    root.classList.remove("fade-out");
    syncHeaderHeight();
  });
}

function selectMeeting(id, fromSearch) {
  if (!meetings[id]) return;
  currentId = id;
  ownerFilter = "all";
  renderMonthBar();
  renderDashboard(meetings[id]);
  document.getElementById("date-pill").textContent = `${meetings[id].month} Management Meeting Notes${id === manifest[0].id ? " · Latest" : ""}`;
  if (!fromSearch) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  clearSearchResults();
}

function buildSearchIndex() {
  return manifest.map((m) => {
    const data = meetings[m.id];
    const blob = [
      data.title,
      data.subtitle,
      ...(data.searchKeywords || []),
      ...data.executiveSummary.flatMap((s) => [s.theme, s.line, ...(s.metrics || []).flatMap((x) => [x.value, x.label])]),
      ...data.kpis.flatMap((k) => [k.value, k.label, k.subtitle]),
      ...data.sections.flatMap((s) => [s.title, ...(s.bullets || []), ...(s.metrics || []).flatMap((x) => [x.value, x.label])]),
      ...data.actions.flatMap((a) => [a.owner, a.action]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return { id: m.id, label: `${data.month} ${data.year}`, blob };
  });
}

let searchIndex = [];

function runSearch(query) {
  const q = query.trim().toLowerCase();
  const resultsEl = document.getElementById("search-results");
  if (!q) {
    clearSearchResults();
    return;
  }
  const hits = searchIndex.filter((e) => e.blob.includes(q));
  if (!hits.length) {
    resultsEl.innerHTML = `<p class="search-empty">No meetings match “${escapeHtml(query)}”</p>`;
    resultsEl.hidden = false;
    return;
  }
  resultsEl.innerHTML = hits
    .map(
      (h) =>
        `<button type="button" class="search-hit" data-id="${h.id}">${escapeHtml(h.label)} — match found</button>`
    )
    .join("");
  resultsEl.hidden = false;
  resultsEl.querySelectorAll(".search-hit").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectMeeting(btn.dataset.id, true);
      document.getElementById("global-search").value = "";
    });
  });
}

function clearSearchResults() {
  const el = document.getElementById("search-results");
  el.innerHTML = "";
  el.hidden = true;
}

function syncHeaderHeight() {
  const header = document.querySelector(".site-header");
  if (header) document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
}

async function init() {
  await loadManifest();
  searchIndex = buildSearchIndex();
  currentId = manifest[0].id;
  renderMonthBar();
  renderDashboard(meetings[currentId]);
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);
  document.querySelector(".site-logo")?.addEventListener("load", syncHeaderHeight);

  const search = document.getElementById("global-search");
  let debounce;
  search.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(search.value), 180);
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      search.value = "";
      clearSearchResults();
    }
  });
}

init().catch((err) => {
  document.getElementById("dashboard").innerHTML = `<p class="error">Failed to load meetings: ${escapeHtml(err.message)}</p>`;
});
