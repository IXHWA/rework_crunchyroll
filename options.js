/**
 * CR MODERNIZER · OPTIONS PAGE
 * Page de réglages complète, mêmes données que le popup mais étalées,
 * avec sélecteur de thèmes, accent perso, sliders, export/import, diag.
 */

const DEFAULTS = {
  enabled:        true,
  hideShop:       true,
  hideGames:      true,
  hideNews:       true,
  modernNav:      true,
  modernHome:     true,
  modernCards:    true,
  minimalCards:   true,
  clarityUI:      true,
  biggerCards:    true,
  smoothHover:    true,
  motion:         true,
  scrollTools:    true,
  modernBrowse:   true,
  modernDetail:   true,
  modernPlayer:   true,
  ambient:        false,
  reducedMotion:  false,
  theme:          "orange",
  accentHue:      null,        // [h, s, l] OU null
  cardZoom:       1.18,
  playerHotkeys:  true,
};

const THEME_COLORS = {
  orange: { accent: "#ff7a1a", soft: "#ff9a4d", deep: "#d65500", glow: "rgba(255,122,26,0.32)" },
  sakura: { accent: "#ff5d8f", soft: "#ff8fb3", deep: "#c43673", glow: "rgba(255,93,143,0.34)"  },
  mint:   { accent: "#2cd9b8", soft: "#6be4cb", deep: "#1aa790", glow: "rgba(44,217,184,0.32)" },
  neon:   { accent: "#b16dff", soft: "#d09bff", deep: "#7c3df0", glow: "rgba(177,109,255,0.34)" },
  mono:   { accent: "#e4e4e7", soft: "#ffffff", deep: "#a1a1aa", glow: "rgba(228,228,231,0.20)" },
};

/* Groupes de modules pour la page d'options */
const GROUPS = {
  global: [
    ["enabled",       "Activer l'extension",       "Désactive tous les modules d'un coup."],
    ["smoothHover",   "Survols animés",            "Transitions smooth sur liens, boutons, icônes."],
    ["motion",        "Animations de page",        "Fade-in à la navigation, reveal au scroll."],
    ["scrollTools",   "Outils de défilement",      "Barre de progression + bouton « retour en haut »."],
    ["reducedMotion", "Mouvement réduit",          "Coupe les animations pour plus de calme."],
  ],
  modules: [
    ["modernNav",     "Barre du haut",             "Sticky, blur et hover d'accent."],
    ["modernHome",    "Accueil",                   "Hero cinématique et carrousels élégants."],
    ["modernBrowse",  "Catalogue / Explorer",      "Filtres en pilules, grilles aérées."],
    ["modernDetail",  "Page série",                "Bannière immersive, onglets propres."],
    ["modernCards",   "Cartes anime",              "Survol smooth, ombre d'accent."],
    ["biggerCards",   "Images plus grandes",       "Vignettes mises en valeur."],
    ["minimalCards",  "Mode minimal",              "Masque notes, synopsis longs, hover étendu."],
    ["clarityUI",     "Interface lisible",         "Titres forts, sub/dub en pilule."],
  ],
  hide: [
    ["hideShop",      "Masquer la boutique",       "Liens cachés. URL directe accessible."],
    ["hideGames",     "Masquer la catégorie « Jeux »", "Lien retiré de la barre du haut."],
    ["hideNews",      "Masquer la catégorie « News »", "Lien retiré de la barre du haut."],
  ],
  player: [
    ["modernPlayer",  "Lecteur premium",           "Contrôles affinés, sous-titres lisibles, gradient orange."],
    ["playerHotkeys", "Raccourcis clavier",        "K/J/L, F, M, N, 0–9, etc."],
    ["ambient",       "Ambient mode",              "Halo lumineux subtil derrière la vidéo."],
  ],
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const statusEl = $("#status");

let current = { ...DEFAULTS };

/* ------------------------------------------------------------------- */
/*  Storage                                                              */
/* ------------------------------------------------------------------- */

function load() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["settings"], (res) => {
      resolve(Object.assign({}, DEFAULTS, res.settings || {}));
    });
  });
}

function save() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ settings: current }, () => resolve());
  });
}

function broadcast() {
  if (!chrome?.tabs) return;
  chrome.tabs.query({ url: "https://www.crunchyroll.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "cr:settings", settings: current }).catch(() => {});
    });
  });
}

async function commit() {
  await save();
  broadcast();
}

/* ------------------------------------------------------------------- */
/*  Status toast                                                         */
/* ------------------------------------------------------------------- */

let statusTimer = 0;
function setStatus(msg, kind = "") {
  statusEl.textContent = msg || "";
  statusEl.className = "status show" + (kind ? " " + kind : "");
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => statusEl.classList.remove("show"), 2400);
}

/* ------------------------------------------------------------------- */
/*  Toggle list rendering                                                */
/* ------------------------------------------------------------------- */

function buildToggleList(rootSel, group) {
  const root = $(rootSel);
  if (!root) return;
  root.innerHTML = "";
  for (const [key, name, desc] of group) {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.key = key;
    row.innerHTML = `
      <div class="row-label">
        <strong>${name}</strong>
        <span class="muted small">${desc}</span>
      </div>
      <div class="switch" role="switch" aria-checked="false" tabindex="0"></div>
    `;
    row.addEventListener("click", async () => {
      current[key] = !current[key];
      renderToggles();
      await commit();
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
      }
    });
    root.appendChild(row);
  }
}

function renderToggles() {
  $$(".row").forEach((row) => {
    const key = row.dataset.key;
    const sw = row.querySelector(".switch");
    if (!key || !sw) return;
    sw.setAttribute("aria-checked", current[key] ? "true" : "false");
  });
}

/* ------------------------------------------------------------------- */
/*  Theme                                                                */
/* ------------------------------------------------------------------- */

function applyAccentToOptionsPage() {
  let c;
  if (Array.isArray(current.accentHue) && current.accentHue.length === 3) {
    const [h, s, l] = current.accentHue;
    c = {
      accent: `hsl(${h} ${s}% ${l}%)`,
      soft:   `hsl(${h} ${s}% ${Math.min(l + 12, 95)}%)`,
      deep:   `hsl(${h} ${s}% ${Math.max(l - 12,  5)}%)`,
      glow:   `hsl(${h} ${s}% ${l}% / 0.32)`,
    };
  } else {
    c = THEME_COLORS[current.theme] || THEME_COLORS.orange;
  }
  const root = document.documentElement;
  root.style.setProperty("--accent-color",      c.accent);
  root.style.setProperty("--accent-color-soft", c.soft);
  root.style.setProperty("--accent-color-deep", c.deep);
  root.style.setProperty("--accent-glow",       c.glow);
}

function renderThemes() {
  $$(".theme-card").forEach((card) => {
    card.dataset.active = String(card.dataset.theme === current.theme && !current.accentHue);
  });
}

/* ------------------------------------------------------------------- */
/*  Custom accent (HSL)                                                  */
/* ------------------------------------------------------------------- */

function readHsl() {
  return [
    Number($("#hue").value),
    Number($("#sat").value),
    Number($("#light").value),
  ];
}

function renderHsl() {
  const isCustom = Array.isArray(current.accentHue) && current.accentHue.length === 3;
  const [h, s, l] = isCustom ? current.accentHue : [22, 100, 55];
  $("#hue").value   = String(h);
  $("#sat").value   = String(s);
  $("#light").value = String(l);
  $("#hueValue").textContent   = h + "°";
  $("#satValue").textContent   = s + "%";
  $("#lightValue").textContent = l + "%";

  $("#customAccentToggle").setAttribute("aria-checked", String(isCustom));
  $("#hslGroup").dataset.active = String(isCustom);
}

/* ------------------------------------------------------------------- */
/*  Zoom                                                                 */
/* ------------------------------------------------------------------- */

function renderZoom() {
  const pct = Math.round((current.cardZoom || 1.18) * 100);
  $("#zoom").value = String(pct);
  $("#zoomValue").textContent = "×" + (pct / 100).toFixed(2);
}

/* ------------------------------------------------------------------- */
/*  Diag                                                                 */
/* ------------------------------------------------------------------- */

function renderDiag() {
  const m = chrome.runtime.getManifest();
  const lines = [
    `Version          : ${m.version}`,
    `Manifest         : v${m.manifest_version}`,
    `Permissions      : ${(m.permissions || []).join(", ") || "—"}`,
    `Host permissions : ${(m.host_permissions || []).join(", ") || "—"}`,
    `Theme actuel     : ${current.theme}` +
       (Array.isArray(current.accentHue) ? `  (override HSL: ${current.accentHue.join(", ")})` : ""),
    `Zoom des cartes  : ×${(current.cardZoom || 1.18).toFixed(2)}`,
    `Modules actifs   : ${
      Object.entries(current).filter(([k,v]) => v === true && k !== "playerHotkeys")
        .map(([k]) => k).join(", ") || "—"
    }`,
    `User-Agent       : ${navigator.userAgent}`,
  ];
  $("#diag").textContent = lines.join("\n");
}

/* ------------------------------------------------------------------- */
/*  Tabs                                                                 */
/* ------------------------------------------------------------------- */

function setupTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      $$(".panel").forEach((p) => {
        p.dataset.active = String(p.dataset.panel === target);
      });
    });
  });
}

/* ------------------------------------------------------------------- */
/*  Export / import                                                      */
/* ------------------------------------------------------------------- */

function exportSettings() {
  const blob = new Blob(
    [JSON.stringify(current, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `crunchyroll-modernizer-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  setStatus("Réglages exportés", "ok");
}

function importSettings(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== "object") throw new Error("invalid");
      const next = Object.assign({}, DEFAULTS);
      for (const k of Object.keys(DEFAULTS)) {
        if (k in parsed) next[k] = parsed[k];
      }
      current = next;
      await commit();
      renderAll();
      setStatus("Réglages importés", "ok");
    } catch (_) {
      setStatus("Fichier invalide", "err");
    }
  };
  reader.readAsText(file);
}

/* ------------------------------------------------------------------- */
/*  Render all                                                           */
/* ------------------------------------------------------------------- */

function renderAll() {
  applyAccentToOptionsPage();
  renderThemes();
  renderHsl();
  renderZoom();
  renderToggles();
  renderDiag();
}

/* ------------------------------------------------------------------- */
/*  Init                                                                 */
/* ------------------------------------------------------------------- */

async function init() {
  current = await load();

  /* Build toggle lists */
  buildToggleList("#globalList",  GROUPS.global);
  buildToggleList("#modulesList", GROUPS.modules);
  buildToggleList("#hideList",    GROUPS.hide);
  buildToggleList("#playerList",  GROUPS.player);

  setupTabs();

  /* Theme cards */
  $$(".theme-card").forEach((card) => {
    card.addEventListener("click", async () => {
      const theme = card.dataset.theme;
      if (!theme) return;
      current.theme = theme;
      current.accentHue = null;
      await commit();
      renderAll();
      setStatus(`Thème : ${theme}`, "ok");
    });
  });

  /* Custom accent toggle */
  $("#customAccentToggle").addEventListener("click", async () => {
    const wasCustom = Array.isArray(current.accentHue);
    if (wasCustom) {
      current.accentHue = null;
    } else {
      current.accentHue = readHsl();
    }
    await commit();
    renderAll();
  });

  /* HSL inputs */
  ["hue", "sat", "light"].forEach((id) => {
    $("#" + id).addEventListener("input", () => {
      const v = Number($("#" + id).value);
      if (id === "hue")   $("#hueValue").textContent   = v + "°";
      if (id === "sat")   $("#satValue").textContent   = v + "%";
      if (id === "light") $("#lightValue").textContent = v + "%";
      if (Array.isArray(current.accentHue)) {
        current.accentHue = readHsl();
        applyAccentToOptionsPage();
      }
    });
    $("#" + id).addEventListener("change", async () => {
      if (Array.isArray(current.accentHue)) {
        current.accentHue = readHsl();
        await commit();
      }
    });
  });

  /* Zoom slider */
  $("#zoom").addEventListener("input", () => {
    const pct = Number($("#zoom").value);
    current.cardZoom = pct / 100;
    $("#zoomValue").textContent = "×" + current.cardZoom.toFixed(2);
  });
  $("#zoom").addEventListener("change", async () => {
    await commit();
    setStatus("Zoom des cartes enregistré", "ok");
  });

  /* Export / import / reset */
  $("#exportBtn").addEventListener("click", exportSettings);
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    importSettings(file);
    e.target.value = "";
  });
  $("#resetBtn").addEventListener("click", async () => {
    if (!confirm("Réinitialiser tous les réglages ?")) return;
    current = { ...DEFAULTS };
    await commit();
    renderAll();
    setStatus("Réinitialisé", "ok");
  });

  /* chrome://extensions/shortcuts (lien) */
  $("#openShortcuts").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs?.create({ url: "chrome://extensions/shortcuts" });
  });

  /* Version */
  try {
    const v = chrome.runtime.getManifest().version;
    $("#version").textContent = "v" + v;
  } catch (_) {}

  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

/* React aux changements depuis le popup ouvert en parallèle */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    current = Object.assign({}, DEFAULTS, changes.settings.newValue || {});
    renderAll();
  }
});
