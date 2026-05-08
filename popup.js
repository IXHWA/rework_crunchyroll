/**
 * CR MODERNIZER · POPUP
 * Pilote chrome.storage.local.settings et notifie les onglets.
 * v3.0.0 — gère thèmes, zoom des cartes, export/import, lien options.
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
  /* v3.0.0 */
  theme:          "orange",
  accentHue:      null,
  cardZoom:       1.18,
  playerHotkeys:  true,
};

/* Couleurs des thèmes (sync avec styles/themes.css) */
const THEME_COLORS = {
  orange: { accent: "#ff7a1a", soft: "#ff9a4d", deep: "#d65500", glow: "rgba(255,122,26,0.32)" },
  sakura: { accent: "#ff5d8f", soft: "#ff8fb3", deep: "#c43673", glow: "rgba(255,93,143,0.34)"  },
  mint:   { accent: "#2cd9b8", soft: "#6be4cb", deep: "#1aa790", glow: "rgba(44,217,184,0.32)" },
  neon:   { accent: "#b16dff", soft: "#d09bff", deep: "#7c3df0", glow: "rgba(177,109,255,0.34)" },
  mono:   { accent: "#e4e4e7", soft: "#ffffff", deep: "#a1a1aa", glow: "rgba(228,228,231,0.20)" },
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const status = $("#status");

function setStatus(msg, kind = "") {
  status.textContent = msg || "";
  status.className = "status" + (kind ? " " + kind : "");
  if (msg) setTimeout(() => setStatus(""), 2200);
}

/* ----------------------------------------------------------------- */
/*  Rendu                                                             */
/* ----------------------------------------------------------------- */

function applyAccentToPopup(theme) {
  const c = THEME_COLORS[theme] || THEME_COLORS.orange;
  const root = document.documentElement;
  root.style.setProperty("--accent-color",      c.accent);
  root.style.setProperty("--accent-color-soft", c.soft);
  root.style.setProperty("--accent-color-deep", c.deep);
  root.style.setProperty("--accent-glow",       c.glow);
}

function render(settings) {
  $$(".row").forEach((row) => {
    const key = row.dataset.key;
    const sw = row.querySelector(".switch");
    if (!key || !sw) return;
    sw.setAttribute("aria-checked", settings[key] ? "true" : "false");
  });

  $$(".theme-chip").forEach((chip) => {
    chip.dataset.active = String(chip.dataset.theme === settings.theme);
  });

  const zoomPct = Math.round((settings.cardZoom || 1.18) * 100);
  $("#zoom").value = String(zoomPct);
  $("#zoomValue").textContent = "×" + (zoomPct / 100).toFixed(2);

  applyAccentToPopup(settings.theme);
}

/* ----------------------------------------------------------------- */
/*  Diffusion + persistance                                           */
/* ----------------------------------------------------------------- */

function broadcast(settings) {
  if (!chrome?.tabs) return;
  chrome.tabs.query({ url: "https://www.crunchyroll.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "cr:settings", settings }).catch(() => {});
    });
  });
}

function save(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ settings }, () => resolve());
  });
}

async function load() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["settings"], (res) => {
      const merged = Object.assign({}, DEFAULTS, res.settings || {});
      resolve(merged);
    });
  });
}

let current = { ...DEFAULTS };

async function commit() {
  await save(current);
  broadcast(current);
}

/* ----------------------------------------------------------------- */
/*  Export / import                                                   */
/* ----------------------------------------------------------------- */

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
      render(current);
      await commit();
      setStatus("Réglages importés", "ok");
    } catch (_) {
      setStatus("Fichier invalide", "err");
    }
  };
  reader.readAsText(file);
}

/* ----------------------------------------------------------------- */
/*  Init                                                              */
/* ----------------------------------------------------------------- */

async function init() {
  current = await load();
  render(current);

  /* Toggle des rangées */
  $$(".row").forEach((row) => {
    row.addEventListener("click", async () => {
      const key = row.dataset.key;
      if (!key) return;
      current[key] = !current[key];
      render(current);
      await commit();
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
      }
    });
    row.tabIndex = 0;
  });

  /* Sélection de thème */
  $$(".theme-chip").forEach((chip) => {
    chip.addEventListener("click", async () => {
      const theme = chip.dataset.theme;
      if (!theme || theme === current.theme) return;
      current.theme = theme;
      current.accentHue = null;
      render(current);
      await commit();
      setStatus(`Thème : ${theme}`, "ok");
    });
  });

  /* Slider zoom */
  $("#zoom").addEventListener("input", (e) => {
    const pct = Number(e.target.value);
    const zoom = pct / 100;
    current.cardZoom = zoom;
    $("#zoomValue").textContent = "×" + zoom.toFixed(2);
  });
  $("#zoom").addEventListener("change", async () => {
    await commit();
    setStatus("Zoom enregistré", "ok");
  });

  /* Réinitialiser */
  $("#reset").addEventListener("click", async () => {
    current = { ...DEFAULTS };
    render(current);
    await commit();
    setStatus("Réglages réinitialisés", "ok");
  });

  /* Recharger l'onglet actif */
  $("#reload").addEventListener("click", () => {
    if (!chrome?.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.tabs.reload(tab.id);
        setStatus("Onglet rechargé", "ok");
      }
    });
  });

  /* Options page */
  $("#openOptions").addEventListener("click", () => {
    if (chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
      window.close();
    }
  });

  /* Export / import */
  $("#exportSettings").addEventListener("click", exportSettings);
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    importSettings(file);
    e.target.value = "";
  });

  /* Version depuis le manifest */
  try {
    const v = chrome.runtime.getManifest().version;
    const versionEl = document.getElementById("version");
    if (versionEl) versionEl.textContent = "v" + v;
  } catch (_) {}
}

document.addEventListener("DOMContentLoaded", init);
