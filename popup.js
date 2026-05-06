/**
 * CR MODERNIZER · POPUP
 * Pilote chrome.storage.local.settings et notifie les onglets.
 */

const DEFAULTS = {
  enabled:        true,
  hideShop:       true,
  modernNav:      true,
  modernHome:     true,
  modernCards:    true,
  minimalCards:   true,
  clarityUI:      true,
  biggerCards:    true,
  smoothHover:    true,
  modernBrowse:   true,
  modernDetail:   true,
  modernPlayer:   true,
  ambient:        false,
  reducedMotion:  false,
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const status = $("#status");

function setStatus(msg, kind = "") {
  status.textContent = msg || "";
  status.className = "status" + (kind ? " " + kind : "");
  if (msg) setTimeout(() => setStatus(""), 1800);
}

function render(settings) {
  $$(".row").forEach((row) => {
    const key = row.dataset.key;
    const sw = row.querySelector(".switch");
    if (!key || !sw) return;
    sw.setAttribute("aria-checked", settings[key] ? "true" : "false");
  });
}

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

async function init() {
  current = await load();
  render(current);

  /* Toggle d'une rangée */
  $$(".row").forEach((row) => {
    row.addEventListener("click", async () => {
      const key = row.dataset.key;
      if (!key) return;
      current[key] = !current[key];
      render(current);
      await save(current);
      broadcast(current);
    });
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
      }
    });
    row.tabIndex = 0;
  });

  /* Réinitialiser */
  $("#reset").addEventListener("click", async () => {
    current = { ...DEFAULTS };
    render(current);
    await save(current);
    broadcast(current);
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

  /* Affiche la version depuis le manifest */
  try {
    const v = chrome.runtime.getManifest().version;
    const versionEl = document.getElementById("version");
    if (versionEl) versionEl.textContent = "v" + v;
  } catch (_) {}
}

document.addEventListener("DOMContentLoaded", init);
