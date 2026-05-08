/**
 * CR MODERNIZER · SERVICE WORKER (MV3)
 *
 * Rôle :
 *   1. Maintenir un badge sur l'icône (ON / OFF + thème actif).
 *   2. Gérer les raccourcis clavier globaux (commands).
 *   3. Ouvrir la page d'options.
 *   4. Diffuser les changements de réglages aux onglets Crunchyroll.
 *
 * Aucune donnée ne quitte le navigateur.
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
  /* nouveau v3.0.0 */
  theme:          "orange",
  accentHue:      null,
  cardZoom:       1.18,
  playerHotkeys:  true,
};

const THEME_ORDER = ["orange", "sakura", "mint", "neon", "mono"];

const BADGES = {
  on:  { text: "",    color: "#ff7a1a" },
  off: { text: "OFF", color: "#5a5a5a" },
};

/* ------------------------------------------------------------------ */
/*  Badge & icône                                                      */
/* ------------------------------------------------------------------ */

async function refreshBadge() {
  const { settings = {} } = await chrome.storage.local.get(["settings"]);
  const merged = Object.assign({}, DEFAULTS, settings);
  const isOn = merged.enabled !== false;
  const badge = isOn ? BADGES.on : BADGES.off;

  try {
    await chrome.action.setBadgeText({ text: badge.text });
    await chrome.action.setBadgeBackgroundColor({ color: badge.color });
    if (chrome.action.setBadgeTextColor) {
      await chrome.action.setBadgeTextColor({ color: "#ffffff" });
    }
    const themeLabel = (merged.theme || "orange").toUpperCase();
    await chrome.action.setTitle({
      title: isOn
        ? `Crunchyroll Modernizer · ${themeLabel}`
        : "Crunchyroll Modernizer · désactivé",
    });
  } catch (_) {
    /* certaines APIs peuvent être indisponibles selon la version Chrome */
  }
}

/* ------------------------------------------------------------------ */
/*  Diffusion vers les onglets actifs                                  */
/* ------------------------------------------------------------------ */

async function broadcastSettings(settings) {
  try {
    const tabs = await chrome.tabs.query({ url: "https://www.crunchyroll.com/*" });
    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.tabs
        .sendMessage(tab.id, { type: "cr:settings", settings })
        .catch(() => {});
    }
  } catch (_) {}
}

async function updateSettings(patch) {
  const { settings = {} } = await chrome.storage.local.get(["settings"]);
  const merged = Object.assign({}, DEFAULTS, settings, patch);
  await chrome.storage.local.set({ settings: merged });
  await refreshBadge();
  broadcastSettings(merged);
  return merged;
}

/* ------------------------------------------------------------------ */
/*  Lifecycle                                                          */
/* ------------------------------------------------------------------ */

chrome.runtime.onInstalled.addListener(async (details) => {
  const { settings } = await chrome.storage.local.get(["settings"]);
  if (!settings) {
    await chrome.storage.local.set({ settings: DEFAULTS });
  } else {
    /* Migration v2 → v3 : on remplit les nouveaux champs absents */
    const merged = Object.assign({}, DEFAULTS, settings);
    await chrome.storage.local.set({ settings: merged });
  }
  await refreshBadge();

  /* Sur installation/upgrade majeur, on peut ouvrir l'options page */
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage?.();
  }
});

chrome.runtime.onStartup.addListener(refreshBadge);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.settings) return;
  refreshBadge();
});

/* ------------------------------------------------------------------ */
/*  Commands (raccourcis clavier globaux)                              */
/* ------------------------------------------------------------------ */

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "open-options":
      chrome.runtime.openOptionsPage?.();
      break;

    case "toggle-extension": {
      const { settings = {} } = await chrome.storage.local.get(["settings"]);
      const merged = Object.assign({}, DEFAULTS, settings);
      await updateSettings({ enabled: !merged.enabled });
      break;
    }

    case "cycle-theme": {
      const { settings = {} } = await chrome.storage.local.get(["settings"]);
      const merged = Object.assign({}, DEFAULTS, settings);
      const idx = Math.max(0, THEME_ORDER.indexOf(merged.theme || "orange"));
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      await updateSettings({ theme: next });
      break;
    }
  }
});

/* ------------------------------------------------------------------ */
/*  Messages depuis popup / options                                    */
/* ------------------------------------------------------------------ */

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return false;

  if (msg.type === "cr:openOptions") {
    chrome.runtime.openOptionsPage?.();
    sendResponse({ ok: true });
    return true;
  }

  if (msg.type === "cr:refreshBadge") {
    refreshBadge();
    sendResponse({ ok: true });
    return true;
  }

  return false;
});
