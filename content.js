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
    else if (
      p.includes("/simulcastcalendar") ||
      p.includes("/simulcast-calendar") ||
      p.includes("/calendar") ||
      p.includes("/agenda")
    ) kind = "agenda";
    else if (
      p.includes("/series/") ||
      p.includes("/show/") ||
      /\/movies?(\/|$)/i.test(p)
    ) kind = "detail";
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

  /* SPA : Crunchyroll change d'URL sans recharger la page.
     On en profite pour déclencher l’animation de page (data-cr-pt). */
  function onNavigate() {
    detectPage();
    triggerPageTransition();
    /* L'agenda s'auto-installe si on arrive dessus.
       Le poll interne gérera le timing après le rendu React. */
    if (typeof setupAgenda === "function") setTimeout(setupAgenda, 350);
    /* pushState/replaceState ne déclenchent pas popstate : on relance le
       motion (reveal, images) après chaque navigation SPA. */
    if (typeof setupMotionAll === "function") setTimeout(setupMotionAll, 320);
  }

  function triggerPageTransition() {
    if (html.getAttribute("data-cr-motion") !== "on") return;
    html.setAttribute("data-cr-pt", "enter");
    /* On relâche le flag après un peu plus que la durée de l’animation */
    setTimeout(() => html.removeAttribute("data-cr-pt"), 420);
  }

  const wrap = (key) => {
    const orig = history[key];
    history[key] = function () {
      const ret = orig.apply(this, arguments);
      queueMicrotask(onNavigate);
      return ret;
    };
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", onNavigate);
  window.addEventListener("hashchange", onNavigate);

  /* --------------------------------------------------------------- */
  /*  Drapeaux des modules (issus des réglages)                      */
  /* --------------------------------------------------------------- */

  const DEFAULT_SETTINGS = {
    enabled:        true,   // activer l'extension globalement
    hideShop:       true,   // masquer la boutique (URL conservée)
    hideGames:      true,   // masquer le menu « Jeux »
    hideNews:       true,   // masquer le menu « News »
    modernNav:      true,   // barre du haut
    modernHome:     true,   // accueil
    modernCards:    true,   // cartes anime
    minimalCards:   true,   // mode minimal (cache notes, hover étendu…)
    clarityUI:      true,   // hiérarchie + cartes « Reprendre » lisibles
    biggerCards:    true,   // images plus grandes
    smoothHover:    true,   // animations smooth sur tous les survols
    motion:         true,   // fade-in SPA + reveal au scroll + img fade
    scrollTools:    true,   // barre de progression + bouton retour en haut
    modernBrowse:   true,   // catalogue / filtres
    modernDetail:   true,   // page série
    modernPlayer:   true,   // lecteur (priorité)
    ambient:        false,  // halo ambient mode
    reducedMotion:  false,  // forcer mouvement réduit
    /* v3.0.0 */
    theme:          "orange",   // orange | sakura | mint | neon | mono
    accentHue:      null,       // [h, s, l] OU null (override personnalisé)
    cardZoom:       1.18,       // 1.00 → 1.40
    playerHotkeys:  true,       // raccourcis sur la page lecteur
  };

  const FLAG_MAP = {
    enabled:       "data-cr-enabled",
    hideShop:      "data-cr-hide-shop",
    hideGames:     "data-cr-hide-games",
    hideNews:      "data-cr-hide-news",
    modernNav:     "data-cr-modern-nav",
    modernHome:    "data-cr-modern-home",
    modernCards:   "data-cr-modern-cards",
    minimalCards:  "data-cr-minimal-cards",
    clarityUI:     "data-cr-clarity-ui",
    biggerCards:   "data-cr-bigger-cards",
    smoothHover:   "data-cr-smooth-hover",
    motion:        "data-cr-motion",
    scrollTools:   "data-cr-scroll-tools",
    modernBrowse:  "data-cr-modern-browse",
    modernDetail:  "data-cr-modern-detail",
    modernPlayer:  "data-cr-modern-player",
    ambient:       "data-cr-ambient",
    reducedMotion: "data-cr-reduced-motion",
    playerHotkeys: "data-cr-player-hotkeys",
  };

  const VALID_THEMES = ["orange", "sakura", "mint", "neon", "mono"];

  function applySettings(settings) {
    const merged = Object.assign({}, DEFAULT_SETTINGS, settings || {});
    for (const key in FLAG_MAP) {
      html.setAttribute(FLAG_MAP[key], merged[key] ? "on" : "off");
    }

    /* Thème */
    const theme = VALID_THEMES.includes(merged.theme) ? merged.theme : "orange";
    html.setAttribute("data-cr-theme", theme);

    /* Accent perso (HSL) */
    if (Array.isArray(merged.accentHue) && merged.accentHue.length === 3) {
      const [h, s, l] = merged.accentHue;
      html.style.setProperty("--cr-accent-h", String(h));
      html.style.setProperty("--cr-accent-s", String(s) + "%");
      html.style.setProperty("--cr-accent-l", String(l) + "%");
      html.setAttribute("data-cr-accent-custom", "on");
    } else {
      html.style.removeProperty("--cr-accent-h");
      html.style.removeProperty("--cr-accent-s");
      html.style.removeProperty("--cr-accent-l");
      html.removeAttribute("data-cr-accent-custom");
    }

    /* Zoom des cartes */
    const z = Number(merged.cardZoom);
    if (!Number.isFinite(z) || z < 1 || z > 1.6) {
      html.style.removeProperty("--cr-card-zoom");
    } else {
      html.style.setProperty("--cr-card-zoom", String(z));
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
      ric2(() => {
        hideExtraCategories();
        dedupePlayableEpisodeTitles();
      }, { timeout: 400 });
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.settings) {
        applySettings(changes.settings.newValue || {});
        const ric2 = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
        ric2(() => {
          hideExtraCategories();
          dedupePlayableEpisodeTitles();
        }, { timeout: 200 });
      }
    });
  }

  /* --------------------------------------------------------------- */
  /*  Masquage de la boutique (sécurité JS en plus du CSS)           */
  /* --------------------------------------------------------------- */

  const SHOP_RE = /\/(store|shop|merchandise)\b|store\.crunchyroll/i;
  const GAMES_RE = /\/games?\b|games\.crunchyroll/i;
  const NEWS_RE  = /\/news\b/i;

  /** Cache une catégorie à partir d'un regex sur l'URL OU du texte du lien.
   *  marker = nom du flag dataset (ex: "crShopHidden")
   *  Garde une ouverture : on ne cache que si le module correspondant est ON. */
  function hideCategory(root, urlRe, textTokens, marker, enabled) {
    if (!enabled) return;
    const links = (root || document).querySelectorAll("a[href]");
    for (let i = 0; i < links.length; i++) {
      const a = links[i];
      if (a.dataset[marker]) continue;
      const href = (a.getAttribute("href") || "").toLowerCase();
      const txt  = (a.textContent || "").trim().toLowerCase();

      const matchUrl  = urlRe && urlRe.test(href);
      const matchText = textTokens && textTokens.some((t) => txt === t);
      if (!matchUrl && !matchText) continue;

      /* Sécurité : ne masquer que les liens DANS la barre du haut */
      if (!a.closest('header, nav, [role="navigation"]')) continue;

      a.dataset[marker] = "1";
      const container = a.closest("li, [role='menuitem'], [class*='nav-item']") || a;
      container.style.setProperty("display", "none", "important");
    }
  }

  function hideShop(root) {
    hideCategory(
      root, SHOP_RE,
      ["boutique", "shop", "store"],
      "crShopHidden",
      html.getAttribute("data-cr-hide-shop") === "on"
    );
  }
  function hideGames(root) {
    hideCategory(
      root, GAMES_RE,
      ["jeux", "games"],
      "crGamesHidden",
      html.getAttribute("data-cr-hide-games") === "on"
    );
  }
  function hideNews(root) {
    hideCategory(
      root, NEWS_RE,
      ["news", "actualités", "actualites"],
      "crNewsHidden",
      html.getAttribute("data-cr-hide-news") === "on"
    );
  }

  function hideExtraCategories(root) {
    hideShop(root);
    hideGames(root);
    hideNews(root);
  }

  hideExtraCategories();

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
    /* Page série : panneaux « hover » parfois légitimes (infos épisode) */
    if (html.getAttribute(FLAG_PAGE) === "detail") return;
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
    /* Accueil / catalogue uniquement — sur la fiche série ça peut casser la liste d’épisodes */
    const pg = html.getAttribute(FLAG_PAGE);
    if (pg === "detail" || pg === "player" || pg === "account" || pg === "agenda") return;

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
      hideExtraCategories();
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

  /* =================================================================== */
  /*  MOTION — reveal au scroll, fade-in image, transitions de page      */
  /* =================================================================== */

  /* Pas de sélecteur « section » nu : sur les pages série il attrape
     les blocs d’onglets / panneaux cachés → opacity 0 définitive si l’IO
     ne se déclenche jamais. Même logique pour les grilles hors browse. */
  const REVEAL_SEL =
    '.erc-feed > section, [class*="feed-section"], ' +
    '[class*="hero-carousel"], ' +
    '[class*="collection-card"], ' +
    '[class*="continue-watching"]:not(item), ' +
    '[class*="watchlist"]:not(item)';

  const REVEAL_CHILDREN_SEL =
    '.erc-browse-cards-collection, ' +
    '[class*="results-grid"]';

  let revealIO = null;

  function stripRevealAttributes() {
    document.querySelectorAll("[data-cr-reveal]").forEach((el) => {
      el.removeAttribute("data-cr-reveal");
    });
    document.querySelectorAll("[data-cr-reveal-children]").forEach((el) => {
      el.removeAttribute("data-cr-reveal-children");
    });
  }

  function setupReveal() {
    if (html.getAttribute("data-cr-motion") !== "on") return;

    const page = html.getAttribute(FLAG_PAGE);
    /* Reveal au scroll : uniquement accueil + catalogue (grilles feed). */
    if (page !== "home" && page !== "browse") {
      if (revealIO) {
        revealIO.disconnect();
        revealIO = null;
      }
      stripRevealAttributes();
      return;
    }

    if (revealIO) revealIO.disconnect();

    revealIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-cr-reveal", "true");
            revealIO.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.05 }
    );

    document.querySelectorAll(REVEAL_SEL).forEach((el) => {
      if (el.hasAttribute("data-cr-reveal")) return;
      el.setAttribute("data-cr-reveal", "false");
      revealIO.observe(el);
    });

    document.querySelectorAll(REVEAL_CHILDREN_SEL).forEach((el) => {
      if (!el.hasAttribute("data-cr-reveal-children")) {
        el.setAttribute("data-cr-reveal-children", "true");
      }
    });
  }

  function setupImageFade(root) {
    if (html.getAttribute("data-cr-motion") !== "on") return;
    const scope = root && root.querySelectorAll ? root : document;
    const imgs = scope.querySelectorAll(
      'img:not([data-cr-fade]):not([class*="logo"]):not([class*="icon"])'
    );
    imgs.forEach((img) => {
      /* Ignorer les très petites images (avatars de la barre, icônes) */
      if (img.width && img.width < 80 && img.height && img.height < 80) return;
      img.setAttribute("data-cr-fade", "1");
      if (img.complete && img.naturalWidth > 0) {
        img.setAttribute("data-cr-img-loaded", "1");
      } else {
        img.addEventListener(
          "load",
          () => img.setAttribute("data-cr-img-loaded", "1"),
          { once: true }
        );
        img.addEventListener(
          "error",
          () => img.setAttribute("data-cr-img-loaded", "1"),
          { once: true }
        );
      }
    });
  }

  /* Scroll progress + bouton retour en haut */
  let scrollTopBtn = null;

  function ensureScrollTopBtn() {
    if (scrollTopBtn || !document.body) return;
    scrollTopBtn = document.createElement("button");
    scrollTopBtn.id = "cr-scroll-top";
    scrollTopBtn.setAttribute("aria-label", "Retour en haut");
    scrollTopBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(scrollTopBtn);
  }

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? h.scrollTop / max : 0;
      h.style.setProperty("--cr-scroll", String(pct.toFixed(4)));

      if (scrollTopBtn) {
        if (h.scrollTop > 600) scrollTopBtn.classList.add("cr-show");
        else scrollTopBtn.classList.remove("cr-show");
      }
      scrollTicking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* Setup à l’arrivée et après chaque navigation SPA */
  function setupMotionAll() {
    setupReveal();
    setupImageFade();
    if (html.getAttribute("data-cr-scroll-tools") === "on") {
      ensureScrollTopBtn();
    }
    onScroll();
  }

  /* Lance le motion une fois le DOM prêt */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupMotionAll);
  } else {
    ric(setupMotionAll, { timeout: 600 });
  }

  /* setupMotionAll est déjà invoqué depuis onNavigate (pushState / popstate /
     hashchange) — pas de second listener popstate pour éviter les doublons. */

  /* Observer secondaire : nouveaux nœuds → re-instrumenter motion */
  let motionPending = false;
  const motionObserver = new MutationObserver((mutations) => {
    if (motionPending) return;
    /* Vérifie qu’il y a bien de nouvelles images / nouvelles sections */
    const interesting = mutations.some((m) =>
      [...m.addedNodes].some(
        (n) =>
          n.nodeType === 1 &&
          (n.matches?.(REVEAL_SEL) ||
           n.querySelector?.(REVEAL_SEL) ||
           n.matches?.("img") ||
           n.querySelector?.("img"))
      )
    );
    if (!interesting) return;
    motionPending = true;
    ric(() => {
      setupReveal();
      setupImageFade();
      motionPending = false;
    }, { timeout: 600 });
  });
  motionObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  /* =================================================================== */
  /*  AGENDA / SIMULCAST CALENDAR — refonte « Hyakanime »                */
  /*  - Repère les blocs « jour »                                         */
  /*  - Marque le jour courant                                            */
  /*  - Injecte une barre d'onglets collante en haut                      */
  /*  - Permet de filtrer / faire défiler vers un jour                    */
  /* =================================================================== */

  /* Identification d'un jour à partir du texte du heading */
  const DAY_INDEX = [
    { key: "sunday",    fr: "dimanche",   short: "Dim", patterns: ["sunday", "dimanche", "domingo"] },
    { key: "monday",    fr: "lundi",      short: "Lun", patterns: ["monday", "lundi", "lunes"] },
    { key: "tuesday",   fr: "mardi",      short: "Mar", patterns: ["tuesday", "mardi", "martes"] },
    { key: "wednesday", fr: "mercredi",   short: "Mer", patterns: ["wednesday", "mercredi", "miércoles", "miercoles"] },
    { key: "thursday",  fr: "jeudi",      short: "Jeu", patterns: ["thursday", "jeudi", "jueves"] },
    { key: "friday",    fr: "vendredi",   short: "Ven", patterns: ["friday", "vendredi", "viernes"] },
    { key: "saturday",  fr: "samedi",     short: "Sam", patterns: ["saturday", "samedi", "sábado", "sabado"] },
  ];

  function detectDayFromText(txt) {
    const low = (txt || "").toLowerCase();
    for (const d of DAY_INDEX) {
      if (d.patterns.some((p) => low.includes(p))) return d;
    }
    return null;
  }

  const AGENDA_SECTION_SEL = [
    '[class*="day-of-week"]',
    '[class*="DayOfWeek"]',
    '[class*="day-section"]',
    '[class*="release-day"]',
    'section[class*="day"]',
    'article[class*="day"]',
    '[data-day-name]',
    '[data-day]',
  ].join(",");

  /** Marque chaque section avec data-cr-day="monday" etc.
   *  Si on ne trouve rien via les classes, on fait un balayage des
   *  headings <h1>-<h4> et on tagge leur conteneur le plus pertinent. */
  function tagAgendaSections() {
    const found = [];
    const todayKey = DAY_INDEX[new Date().getDay()].key;
    const main = document.querySelector("main") || document.body;
    if (!main) return found;

    const tagged = new Set();

    function tag(section, day) {
      if (!section || tagged.has(section)) return;
      tagged.add(section);
      section.dataset.crDay = day.key;
      if (day.key === todayKey) section.dataset.crToday = "true";

      /* On marque tous les ancêtres jusqu'au <main> pour forcer leur
         layout en bloc vertical (annule les flex/grid horizontaux qui
         créent les colonnes par jour côte-à-côte).                   */
      let parent = section.parentElement;
      let depth = 0;
      while (parent && parent !== main && depth < 5) {
        parent.dataset.crDayWrap = "1";
        parent = parent.parentElement;
        depth++;
      }

      /* Tagger toutes les cartes interactives à l'intérieur (li, lien
         direct, release-card) pour cibler proprement leur style. */
      const CARD_SEL =
        "li, [class*='release-card'], [class*='ReleaseCard'], " +
        "a[href*='/series/'], a[href*='/watch/']";
      section.querySelectorAll(CARD_SEL).forEach((card) => {
        if (!card.dataset.crCard) card.dataset.crCard = "agenda";
      });

      /* Si la section ne contient AUCUNE carte, on la marque comme vide. */
      const hasCards = section.querySelector(CARD_SEL);
      if (!hasCards) section.dataset.crDayEmpty = "true";

      found.push({ key: day.key, el: section });
    }

    /* Passe 1 — sélecteurs explicites */
    main.querySelectorAll(AGENDA_SECTION_SEL).forEach((section) => {
      const native =
        section.getAttribute("data-day-name") ||
        section.getAttribute("data-day") ||
        section.dataset?.dayName;

      let day = native ? detectDayFromText(native) : null;

      if (!day) {
        const meta = (section.id || "") + " " + (section.getAttribute("aria-label") || "");
        day = detectDayFromText(meta);
      }
      if (!day) {
        const heading = section.querySelector(
          "h1, h2, h3, h4, [class*='day-name'], [class*='day-title']"
        );
        day = detectDayFromText(heading?.textContent || "");
      }
      if (!day) {
        day = detectDayFromText(section.className || "");
      }
      if (day) tag(section, day);
    });

    /* Passe 2 — fallback : on cherche les headings contenant un jour
       et on tagge leur parent comme section. Utile si Crunchyroll a
       changé ses classes ou si la structure est plus plate. */
    if (found.length < 3) {
      const headings = main.querySelectorAll("h1, h2, h3, h4");
      headings.forEach((h) => {
        const day = detectDayFromText(h.textContent || "");
        if (!day) return;
        /* On remonte au conteneur naturel (article/section/li/div direct) */
        let parent = h.parentElement;
        while (
          parent &&
          parent !== main &&
          parent.tagName !== "ARTICLE" &&
          parent.tagName !== "SECTION" &&
          !/day|release|column/i.test(parent.className || "")
        ) {
          parent = parent.parentElement;
        }
        const section = parent && parent !== main ? parent : h.parentElement;
        if (section) tag(section, day);
      });
    }

    return found;
  }

  let dayTabsEl = null;

  function buildDayTabs(sections) {
    if (!sections.length) return;

    const main = document.querySelector("main") || document.body;
    if (!main) return;

    /* Nettoyage si déjà présent */
    if (dayTabsEl && dayTabsEl.parentNode) dayTabsEl.parentNode.removeChild(dayTabsEl);

    const todayKey = DAY_INDEX[new Date().getDay()].key;
    /* On veut un onglet par jour de la semaine, à partir de Lundi pour
       coller à l'usage agenda (mais on garde l'ordre naturel des sections
       trouvées si le calendrier ne commence pas par Lundi). */
    const orderRef = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    const presentKeys = Array.from(new Set(sections.map((s) => s.key)));
    presentKeys.sort((a, b) => orderRef.indexOf(a) - orderRef.indexOf(b));

    dayTabsEl = document.createElement("nav");
    dayTabsEl.className = "cr-day-tabs";
    dayTabsEl.setAttribute("aria-label", "Navigation par jour");

    presentKeys.forEach((key) => {
      const meta = DAY_INDEX.find((d) => d.key === key);
      if (!meta) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cr-day-tab";
      btn.dataset.crDayTarget = key;
      if (key === todayKey) btn.dataset.crToday = "true";
      btn.innerHTML =
        '<span style="font-weight:700">' + meta.fr.charAt(0).toUpperCase() + meta.fr.slice(1) + '</span>' +
        '<small>' + meta.short + '</small>';
      dayTabsEl.appendChild(btn);
    });

    /* Bouton « Tous les jours » à la fin */
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "cr-day-tab";
    allBtn.dataset.crDayTarget = "__all__";
    allBtn.dataset.crActive = "true";
    allBtn.innerHTML = '<span>Tout</span><small>la semaine</small>';
    dayTabsEl.insertBefore(allBtn, dayTabsEl.firstChild);

    dayTabsEl.addEventListener("click", (e) => {
      const target = e.target.closest(".cr-day-tab");
      if (!target) return;
      e.preventDefault();
      onDayTabClicked(target.dataset.crDayTarget);
    });

    /* Insertion au début du <main>, après les headers existants */
    const insertionPoint = main.querySelector("h1")?.parentElement || main;
    if (insertionPoint && insertionPoint.firstChild) {
      const h1 = main.querySelector("h1");
      if (h1 && h1.parentNode) {
        h1.parentNode.insertBefore(dayTabsEl, h1.nextSibling);
      } else {
        main.insertBefore(dayTabsEl, main.firstChild);
      }
    } else {
      main.appendChild(dayTabsEl);
    }

    /* Marqueur visuel actif suivant le scroll */
    setupDayScrollSpy(presentKeys);
  }

  function onDayTabClicked(targetKey) {
    if (!dayTabsEl) return;

    /* Mise à jour visuelle */
    dayTabsEl.querySelectorAll(".cr-day-tab").forEach((t) => {
      t.dataset.crActive = String(t.dataset.crDayTarget === targetKey);
    });

    if (targetKey === "__all__") {
      html.removeAttribute("data-cr-day-focus");
      document.querySelectorAll("[data-cr-day]").forEach((s) => {
        s.removeAttribute("data-cr-day-active");
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    /* Mode focus : on cache les autres jours via attribut */
    html.setAttribute("data-cr-day-focus", "1");
    document.querySelectorAll("[data-cr-day]").forEach((s) => {
      s.dataset.crDayActive = String(s.dataset.crDay === targetKey);
    });

    /* Scroll vers la section ciblée */
    const section = document.querySelector('[data-cr-day="' + targetKey + '"]');
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    }
  }

  let scrollSpyIO = null;
  function setupDayScrollSpy(presentKeys) {
    if (scrollSpyIO) scrollSpyIO.disconnect();
    if (!("IntersectionObserver" in window)) return;

    scrollSpyIO = new IntersectionObserver(
      (entries) => {
        /* On ne change l'onglet actif que si on est en mode "tout" */
        if (html.getAttribute("data-cr-day-focus") === "1") return;
        let bestKey = null;
        let bestTop = Infinity;
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const t = en.target.getBoundingClientRect().top;
            if (t >= -40 && t < bestTop) {
              bestTop = t;
              bestKey = en.target.dataset.crDay;
            }
          }
        });
        if (bestKey && dayTabsEl) {
          dayTabsEl.querySelectorAll(".cr-day-tab").forEach((t) => {
            t.dataset.crActive = String(t.dataset.crDayTarget === bestKey);
          });
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: [0, 0.25, 0.6] }
    );
    presentKeys.forEach((k) => {
      const sec = document.querySelector('[data-cr-day="' + k + '"]');
      if (sec) scrollSpyIO.observe(sec);
    });
  }

  function setupAgenda() {
    if (html.getAttribute(FLAG_PAGE) !== "agenda") {
      /* Cleanup quand on quitte la page */
      if (dayTabsEl && dayTabsEl.parentNode) {
        dayTabsEl.parentNode.removeChild(dayTabsEl);
        dayTabsEl = null;
      }
      html.removeAttribute("data-cr-day-focus");
      return;
    }

    const sections = tagAgendaSections();
    if (!sections.length) return;
    buildDayTabs(sections);
  }

  /* Premier passage à l’arrivée + à chaque navigation SPA */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ric(setupAgenda, { timeout: 800 }));
  } else {
    ric(setupAgenda, { timeout: 800 });
  }
  window.addEventListener("popstate", () => setTimeout(setupAgenda, 400));

  /* Observer dédié à la page agenda : si Crunchyroll injecte les jours
     plus tard (chargement async), on retente jusqu’à les trouver. */
  let agendaTries = 0;
  const agendaPoll = setInterval(() => {
    if (html.getAttribute(FLAG_PAGE) === "agenda" && !dayTabsEl) {
      setupAgenda();
    }
    if (++agendaTries > 20) clearInterval(agendaPoll);
  }, 700);

  /* =================================================================== */
  /*  RACCOURCIS CLAVIER LECTEUR (data-cr-player-hotkeys="on")           */
  /*                                                                      */
  /*  Contrat :                                                           */
  /*   - actifs uniquement sur la page lecteur (data-cr-page="player")   */
  /*   - on ignore quand le focus est dans un input/textarea/editable    */
  /*   - on n'écrase pas les raccourcis natifs Crunchyroll : on agit     */
  /*     directement sur l'élément <video>, ou on clique des boutons     */
  /*     précis (next-episode, prev-episode).                             */
  /*                                                                      */
  /*  Touches :                                                           */
  /*   K / Espace      → play/pause                                       */
  /*   J / ←           → -10 s                                            */
  /*   L / →           → +10 s                                            */
  /*   ↑ / ↓           → volume +/- 10 %                                  */
  /*   M               → mute                                             */
  /*   F               → plein écran                                      */
  /*   T               → mode théâtre / large (best-effort)               */
  /*   N               → épisode suivant                                  */
  /*   P               → épisode précédent                                */
  /*   0..9            → seek 0%..90%                                     */
  /*   < / >           → vitesse -/+ 0.25                                 */
  /*   I               → afficher le toast info (titre, vitesse)         */
  /* =================================================================== */

  const HOTKEY_TOAST_ID = "cr-hotkey-toast";

  function isEditableTarget(t) {
    if (!t) return false;
    const tag = (t.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (t.isContentEditable) return true;
    return false;
  }

  function getVideo() {
    /* Crunchyroll utilise plusieurs racines (vilos / velocity).
       On prend la 1re <video> visible ; si plusieurs, la plus grande. */
    const vids = [...document.querySelectorAll("video")].filter((v) => {
      if (!v.isConnected) return false;
      const r = v.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!vids.length) return null;
    vids.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    });
    return vids[0];
  }

  function ensureToast() {
    let el = document.getElementById(HOTKEY_TOAST_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = HOTKEY_TOAST_ID;
    el.setAttribute("aria-live", "polite");
    document.body && document.body.appendChild(el);
    return el;
  }

  let toastTimer = 0;
  function toast(msg) {
    const el = ensureToast();
    if (!el) return;
    el.textContent = msg;
    el.classList.add("cr-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("cr-show"), 1400);
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function clickButtonByLabel(re) {
    const buttons = document.querySelectorAll(
      'button, [role="button"], a[role="button"]'
    );
    for (const b of buttons) {
      const txt = (b.getAttribute("aria-label") || b.textContent || "").trim();
      if (re.test(txt)) {
        b.click();
        return true;
      }
    }
    return false;
  }

  function nextEpisode() {
    /* Crunchyroll expose un bouton « Next Episode » / « Up Next » */
    if (clickButtonByLabel(/up\s*next|next\s*episode|épisode\s*suivant|suivant/i)) return true;
    /* Fallback : déclencher un keydown N natif */
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n", code: "KeyN", bubbles: true }));
    return false;
  }
  function prevEpisode() {
    if (clickButtonByLabel(/previous\s*episode|épisode\s*précédent|précédent/i)) return true;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "p", code: "KeyP", bubbles: true }));
    return false;
  }

  function toggleFullscreen() {
    const v = getVideo();
    const target = v ? (v.closest('[class*="player-wrapper"], [class*="vilos"], [class*="velocity-player"]') || v) : null;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (target?.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    }
  }

  function fmtTime(sec) {
    if (!Number.isFinite(sec)) return "--:--";
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      return `${h}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function onPlayerKey(e) {
    if (html.getAttribute("data-cr-player-hotkeys") !== "on") return;
    if (html.getAttribute(FLAG_PAGE) !== "player") return;
    if (isEditableTarget(e.target)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const v = getVideo();

    /* Touches actives même sans <video> (next/prev episode) */
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      nextEpisode();
      toast("Épisode suivant");
      return;
    }
    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      prevEpisode();
      toast("Épisode précédent");
      return;
    }
    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    if (!v) return;

    switch (e.key) {
      case " ":
      case "k":
      case "K":
        e.preventDefault();
        if (v.paused) { v.play().catch(() => {}); toast("▶ Lecture"); }
        else { v.pause(); toast("⏸ Pause"); }
        break;

      case "j":
      case "J":
      case "ArrowLeft":
        e.preventDefault();
        v.currentTime = Math.max(0, v.currentTime - 10);
        toast("◀ -10 s · " + fmtTime(v.currentTime));
        break;

      case "l":
      case "L":
      case "ArrowRight":
        e.preventDefault();
        v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 10);
        toast("▶ +10 s · " + fmtTime(v.currentTime));
        break;

      case "ArrowUp":
        e.preventDefault();
        v.volume = clamp(v.volume + 0.1, 0, 1);
        v.muted = false;
        toast("🔊 " + Math.round(v.volume * 100) + "%");
        break;

      case "ArrowDown":
        e.preventDefault();
        v.volume = clamp(v.volume - 0.1, 0, 1);
        toast("🔉 " + Math.round(v.volume * 100) + "%");
        break;

      case "m":
      case "M":
        e.preventDefault();
        v.muted = !v.muted;
        toast(v.muted ? "🔇 Muet" : "🔊 Son rétabli");
        break;

      case "<":
      case ",":
        e.preventDefault();
        v.playbackRate = clamp(Math.round((v.playbackRate - 0.25) * 100) / 100, 0.25, 3);
        toast("Vitesse ×" + v.playbackRate.toFixed(2));
        break;

      case ">":
      case ".":
        e.preventDefault();
        v.playbackRate = clamp(Math.round((v.playbackRate + 0.25) * 100) / 100, 0.25, 3);
        toast("Vitesse ×" + v.playbackRate.toFixed(2));
        break;

      case "i":
      case "I":
        e.preventDefault();
        toast(`${fmtTime(v.currentTime)} / ${fmtTime(v.duration)} · ×${v.playbackRate.toFixed(2)}`);
        break;

      default:
        if (/^[0-9]$/.test(e.key) && Number.isFinite(v.duration)) {
          e.preventDefault();
          const ratio = Number(e.key) / 10;
          v.currentTime = v.duration * ratio;
          toast(`Saut ${e.key * 10}% · ` + fmtTime(v.currentTime));
        }
        break;
    }
  }

  /* Capture phase pour préempter d'éventuels handlers natifs */
  document.addEventListener("keydown", onPlayerKey, true);
})();
