/**
 * CR MODERNIZER · CONTENT SCRIPT
 *
 * Stratégie : le CSS fait le visuel. Le JS :
 *   1. drapeaux <html> (page + modules),
 *   2. masque les liens boutique,
 *   3. déduplique le titre d’épisode sur les cartes « Reprendre » (playable),
 *   4. réagit aux réglages du popup.
 */

(() => {
  "use strict";

  const html = document.documentElement;
  const FLAG_PAGE = "data-cr-page";

  /* --------------------------------------------------------------- */
  /*  Détection de la page (utilisée pour scoper le CSS)             */
  /* --------------------------------------------------------------- */

  function detectPage() {
    const p = (location.pathname || "").toLowerCase();

    let kind = "other";
    if (p.includes("/watch/")) kind = "player";
    else if (p.includes("/series/") || p.includes("/movie")) kind = "detail";
    else if (
      p.includes("/videos/") ||
      p.includes("/browse") ||
      p.includes("/genre") ||
      p.includes("/season") ||
      p.includes("/simulcasts") ||
      p.includes("/categories")
    ) kind = "browse";
    else if (
      p.includes("/account") ||
      p.includes("/profile") ||
      p.includes("/login") ||
      p.includes("/signup") ||
      p.includes("/sso") ||
      p.includes("/manage")
    ) kind = "account";
    else if (p === "" || p === "/" || /^\/[a-z]{2}(-[a-z]{2})?\/?$/.test(p)) kind = "home";

    html.setAttribute(FLAG_PAGE, kind);
  }

  detectPage();

  /* SPA : Crunchyroll change d'URL sans recharger la page */
  const wrap = (key) => {
    const orig = history[key];
    history[key] = function () {
      const ret = orig.apply(this, arguments);
      queueMicrotask(detectPage);
      return ret;
    };
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", detectPage);
  window.addEventListener("hashchange", detectPage);

  /* --------------------------------------------------------------- */
  /*  Drapeaux des modules (issus des réglages)                      */
  /* --------------------------------------------------------------- */

  const DEFAULT_SETTINGS = {
    enabled:        true,   // activer l'extension globalement
    hideShop:       true,   // masquer la boutique (URL conservée)
    modernNav:      true,   // barre du haut
    modernHome:     true,   // accueil
    modernCards:    true,   // cartes anime
    minimalCards:   true,   // mode minimal (cache notes, hover étendu…)
    clarityUI:      true,   // hiérarchie + cartes « Reprendre » lisibles
    biggerCards:    true,   // images plus grandes
    smoothHover:    true,   // animations smooth sur tous les survols
    modernBrowse:   true,   // catalogue / filtres
    modernDetail:   true,   // page série
    modernPlayer:   true,   // lecteur (priorité)
    ambient:        false,  // halo ambient mode
    reducedMotion:  false,  // forcer mouvement réduit
  };

  const FLAG_MAP = {
    enabled:       "data-cr-enabled",
    hideShop:      "data-cr-hide-shop",
    modernNav:     "data-cr-modern-nav",
    modernHome:    "data-cr-modern-home",
    modernCards:   "data-cr-modern-cards",
    minimalCards:  "data-cr-minimal-cards",
    clarityUI:     "data-cr-clarity-ui",
    biggerCards:   "data-cr-bigger-cards",
    smoothHover:   "data-cr-smooth-hover",
    modernBrowse:  "data-cr-modern-browse",
    modernDetail:  "data-cr-modern-detail",
    modernPlayer:  "data-cr-modern-player",
    ambient:       "data-cr-ambient",
    reducedMotion: "data-cr-reduced-motion",
  };

  function applySettings(settings) {
    const merged = Object.assign({}, DEFAULT_SETTINGS, settings || {});
    for (const key in FLAG_MAP) {
      html.setAttribute(FLAG_MAP[key], merged[key] ? "on" : "off");
    }
    if (merged.reducedMotion) {
      html.style.setProperty("--cr-fast", "0ms");
      html.style.setProperty("--cr-mid",  "0ms");
      html.style.setProperty("--cr-slow", "0ms");
      html.style.setProperty("--cr-cinem","0ms");
    } else {
      html.style.removeProperty("--cr-fast");
      html.style.removeProperty("--cr-mid");
      html.style.removeProperty("--cr-slow");
      html.style.removeProperty("--cr-cinem");
    }
  }

  /* Drapeaux par défaut le plus tôt possible (avant le 1er paint) */
  applySettings(DEFAULT_SETTINGS);

  if (chrome?.storage?.local) {
    chrome.storage.local.get(["settings"], (res) => {
      applySettings(res.settings || {});
      const ric2 = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
      ric2(dedupePlayableEpisodeTitles, { timeout: 400 });
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.settings) {
        applySettings(changes.settings.newValue || {});
        const ric2 = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
        ric2(dedupePlayableEpisodeTitles, { timeout: 200 });
      }
    });
  }

  /* --------------------------------------------------------------- */
  /*  Masquage de la boutique (sécurité JS en plus du CSS)           */
  /* --------------------------------------------------------------- */

  const SHOP_RE = /\/(store|shop|merchandise)\b|store\.crunchyroll/i;

  function hideShop(root) {
    if (html.getAttribute("data-cr-hide-shop") !== "on") return;

    const links = (root || document).querySelectorAll("a[href]");
    for (let i = 0; i < links.length; i++) {
      const a = links[i];
      const href = a.getAttribute("href") || "";
      if (!SHOP_RE.test(href) || a.dataset.crShopHidden) continue;

      a.dataset.crShopHidden = "1";
      const container = a.closest("li, [role='menuitem'], [class*='nav-item']") || a;
      container.style.display = "none";
    }
  }

  hideShop();

  /* --------------------------------------------------------------- */
  /*  Tueur de hover-card étendu (panneau qui s’ouvre au survol et   */
  /*  recouvre/duplique la carte). Crunchyroll le rend souvent       */
  /*  ailleurs dans le DOM via un portail React → on doit aussi      */
  /*  scanner les nouveaux nœuds racines.                            */
  /* --------------------------------------------------------------- */

  /* On déclare un panel « hover-card » dès qu’un élément combine :
     - un mot-clé « card / preview / modal / popover »
     - ET un mot-clé d’apparition (hover, popout, expanded, extended,
       tooltip, preview, zoom, large, big)
     Cette double-condition évite de matcher des composants normaux. */
  const CARDISH = ["card", "preview", "modal", "popover", "tile"];
  const HOVERY  = [
    "hover", "hovered",
    "popout", "popover",
    "expanded", "extended",
    "tooltip",
    "zoom", "zoomed",
    "large", "big",
    "quickview", "preview",
    "hovercard",
  ];
  const EXTRA_KILL = [
    "hover-card", "hovercard",
    "card-popout", "card-popover", "card-tooltip", "card-zoom",
    "extended-card", "card-extended",
    "preview-card-hover",
    "quickview", "QuickView",
  ];

  function looksLikeHoverPanel(el) {
    if (!(el instanceof Element)) return false;
    if (el.dataset && el.dataset.crKilled === "1") return false;
    const raw = (el.className && el.className.baseVal) || el.className || "";
    if (typeof raw !== "string" || !raw) return false;
    const lower = raw.toLowerCase();

    /* Match direct (sécurité) */
    for (let i = 0; i < EXTRA_KILL.length; i++) {
      if (lower.includes(EXTRA_KILL[i].toLowerCase())) return true;
    }

    /* Double-condition (cardish + hovery) */
    let hasCard = false;
    for (let i = 0; i < CARDISH.length && !hasCard; i++) {
      if (lower.includes(CARDISH[i])) hasCard = true;
    }
    if (!hasCard) return false;

    for (let i = 0; i < HOVERY.length; i++) {
      if (lower.includes(HOVERY[i])) return true;
    }
    return false;
  }

  function killHoverPanels(root) {
    if (html.getAttribute("data-cr-minimal-cards") !== "on") return;
    const scope = root && root.querySelectorAll ? root : document;
    const all = scope.querySelectorAll("*");
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (!looksLikeHoverPanel(el)) continue;
      el.dataset.crKilled = "1";
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
    }
  }

  killHoverPanels(document);

  /* --------------------------------------------------------------- */
  /*  Cartes « Reprendre » : titre d’épisode en double               */
  /*  Crunchyroll affiche le même libellé dans le panneau sombre    */
  /*  (REPRENDRE En) puis encore en dessous en orange → on masque  */
  /*  la copie hors panneau.                                        */
  /* --------------------------------------------------------------- */

  const META_SEL =
    '[class*="meta"],[class*="Meta"],[class*="details"],[class*="Details"],' +
    '[class*="resume"],[class*="Resume"],[class*="extended"],[class*="Extended"],' +
    '[class*="panel"],[class*="Panel"],[class*="stack"],[class*="content-block"],' +
    '[class*="watch-history"],[class*="continue-watching-info"],' +
    '[class*="card-body"],[class*="CardBody"],[class*="playable-card-body"],' +
    '[class*="info-card"],[class*="episode-info"],' +
    '[class*="series-title"],[class*="show-title"]';

  function normTitle(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /** Texte ressemble à un titre d’épisode (E12, Episode 3, etc.) */
  function looksLikeEpisodeTitle(t) {
    const s = normTitle(t);
    if (s.length < 6 || s.length > 320) return false;
    return (
      /\bE\d+\b/i.test(s) ||
      /^Episode\s+\d+/i.test(s) ||
      /^EP\.?\s*\d+/i.test(s)
    );
  }

  /* La déduplication des « noms de série » étant trop risquée
     (faux positifs cachant le titre d'épisode), elle est désactivée
     par défaut. Seule la dédup des numéros d'épisode (E1, E2…) reste. */

  function clearDedupeMarks() {
    document.querySelectorAll("[data-cr-dedupe-hidden]").forEach((el) => {
      el.removeAttribute("data-cr-dedupe-hidden");
      el.style.removeProperty("display");
    });
  }

  /** Remonte au plus petit bloc à masquer (sans avaler tout le footer).
   *  Ne JAMAIS remonter au-delà d'un bloc « important » (bouton, lien
   *  vers /watch/, image, vignette) — sinon on cache le visuel.
   */
  function hideDuplicateBranch(leaf, cardRoot) {
    const FORBIDDEN = (el) =>
      el.matches?.(
        "img, picture, figure, video, " +
        ".browse-card__image, .playable-card__image, " +
        '[class*="card-image"], [class*="card-thumbnail"], [class*="thumbnail"], ' +
        '[class*="poster"], [class*="play-button"], ' +
        'a[href*="/watch/"], button[class*="play"]'
      );

    let cur = leaf;
    for (let depth = 0; depth < 4 && cur && cur !== cardRoot; depth++) {
      const p = cur.parentElement;
      if (!p || p === cardRoot) break;
      if ([...p.children].some(FORBIDDEN)) break;

      const sibs = [...p.children].filter(
        (c) => c !== cur && !c.hasAttribute("data-cr-dedupe-hidden")
      );
      const meaningful = sibs.filter((c) => (c.textContent || "").trim().length > 0);
      if (meaningful.length === 0) {
        cur = p;
        continue;
      }
      break;
    }
    if (!cur || cur === cardRoot || FORBIDDEN(cur)) return;
    cur.setAttribute("data-cr-dedupe-hidden", "1");
    cur.style.setProperty("display", "none", "important");
  }

  /** Garde seulement les éléments les plus profonds (évite parent + enfant même texte). */
  function pruneNestedDuplicates(elements) {
    return elements.filter(
      (el) => !elements.some((other) => other !== el && el.contains(other))
    );
  }

  function dedupePlayableEpisodeTitles() {
    if (html.getAttribute("data-cr-enabled") !== "on") return;
    if (html.getAttribute("data-cr-modern-cards") !== "on") return;

    clearDedupeMarks();

    const cards = document.querySelectorAll(
      ".playable-card, [class*='playable-card']:not([class*='collection'])"
    );

    cards.forEach((card) => {
      const raw = [];
      card.querySelectorAll("p, h2, h3, h4, h5, span").forEach((el) => {
        if (el.closest("[data-cr-dedupe-hidden]")) return;
        /* Ne dédupliquer que des éléments qui sont sûrement du texte (pas
           des conteneurs de vignette/bouton). */
        if (el.querySelector("img, video, button, a[href*='/watch/']")) return;
        const t = normTitle(el.textContent || "");
        if (!looksLikeEpisodeTitle(t)) return;
        raw.push({ el, t });
      });

      const byText = new Map();
      raw.forEach((c) => {
        if (!byText.has(c.t)) byText.set(c.t, []);
        byText.get(c.t).push(c.el);
      });

      byText.forEach((els) => {
        const leaves = pruneNestedDuplicates(els);
        if (leaves.length < 2) return;

        const scored = leaves.map((el) => ({
          el,
          inMeta: !!el.closest(META_SEL),
        }));

        const inMeta = scored.filter((s) => s.inMeta);
        const outMeta = scored.filter((s) => !s.inMeta);

        if (inMeta.length && outMeta.length) {
          outMeta.forEach((s) => hideDuplicateBranch(s.el, card));
        } else if (outMeta.length >= 2) {
          outMeta.slice(1).forEach((s) => hideDuplicateBranch(s.el, card));
        }
      });
    });
  }

  /* --------------------------------------------------------------- */
  /*  Observer DOM (ultra-léger, tâche en idle)                      */
  /* --------------------------------------------------------------- */

  let pending = false;
  const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));

  const observer = new MutationObserver((mutations) => {
    /* Tueur synchrone pour les hover-panels (avant le 1er paint) */
    for (const m of mutations) {
      if (m.type !== "childList") continue;
      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (looksLikeHoverPanel(node)) {
          node.dataset.crKilled = "1";
          node.style.setProperty("display", "none", "important");
        }
        if (node.querySelector) killHoverPanels(node);
      }
    }

    if (pending) return;
    pending = true;
    ric(() => {
      hideShop();
      dedupePlayableEpisodeTitles();
      pending = false;
    }, { timeout: 500 });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dedupePlayableEpisodeTitles);
  } else {
    ric(dedupePlayableEpisodeTitles, { timeout: 300 });
  }

  /* --------------------------------------------------------------- */
  /*  Messages depuis le popup                                        */
  /* --------------------------------------------------------------- */

  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "cr:settings" && msg.settings) {
        applySettings(msg.settings);
        ric(dedupePlayableEpisodeTitles, { timeout: 100 });
      }
    });
  }
})();
