# Changelog

Toutes les modifications notables sont consignées ici.
Le format suit [Keep a Changelog](https://keepachangelog.com/) et les versions
respectent [SemVer](https://semver.org/lang/fr/).

## [3.0.0] — 2026-05-09

Refonte majeure : thèmes, page d'options, raccourcis clavier, service worker.

### Ajouté
- **5 thèmes de couleurs** : Orange (défaut), Sakura, Mint, Neon, Mono.
  Sélectionnables depuis le popup ou la page d'options (`styles/themes.css`).
- **Couleur d'accent personnalisée** via curseurs HSL (teinte / saturation /
  luminosité) — surcharge les presets pour ce qui est de l'accent.
- **Slider « zoom des cartes »** (100 % → 140 %), exposé via la variable CSS
  `--cr-card-zoom`.
- **Page d'options dédiée** (`options.html`/`options.js`/`options.css`) avec
  cinq onglets : Apparence, Modules, Lecteur, Avancé, À propos.
- **Service worker** (`background.js`) :
  - badge `OFF` sur l'icône quand l'extension est désactivée
  - infobulle dynamique avec le nom du thème actif
  - migration automatique des réglages v2 → v3
  - ouverture de la page d'options à la première installation
- **Raccourcis clavier sur le lecteur** (style YouTube), activés par défaut :
  - `K` / `Espace` lecture / pause
  - `J` / `←` reculer 10 s
  - `L` / `→` avancer 10 s
  - `↑` / `↓` volume ± 10 %
  - `M` couper le son, `F` plein écran
  - `N` épisode suivant, `P` épisode précédent
  - `0` – `9` saut à 0 % – 90 %
  - `<` / `>` vitesse ± 0.25
  - `I` afficher l'info (titre, vitesse, position)
- **Toast** discret en haut de la vidéo quand un raccourci est pressé.
- **Raccourcis Chrome globaux** déclarés dans le manifest :
  - `Alt+Shift+C` ouvrir le popup
  - `Alt+Shift+O` ouvrir la page d'options
  - Commandes `toggle-extension` et `cycle-theme` (à configurer dans
    `chrome://extensions/shortcuts`).
- **Export / import** des réglages au format JSON depuis le popup ou la page
  d'options.
- **Réinitialisation** dans la page d'options (avec confirmation).
- **Diagnostic** dans la page d'options (versions, modules actifs, UA).

### Modifié
- `manifest.json` passe en `version: 3.0.0` et déclare
  `background.service_worker`, `options_page`, `commands`.
- `tokens.css` : les variables d'accent sont désormais surchargées par
  `themes.css` (pas de duplication).
- `popup.html` redesigné : sélecteur de thèmes en pastilles, slider zoom,
  liens vers la page d'options + export/import. Hauteur max 600 px avec
  scroll interne.
- `content.js` lit les nouveaux champs (`theme`, `accentHue`, `cardZoom`,
  `playerHotkeys`) et les applique en attributs/variables CSS sur `<html>`.
- `player.css` : ambient mode utilise désormais `--cr-orange-tint`
  (théâtre adaptatif au thème) et style du toast clavier.

### Corrigé
- Fichiers d'icônes : suppression du fichier de test
  `icons/icon-16 - Copie (2).png`.
- Le mode `reducedMotion` n'écrase plus l'animation `cr-page-in`
  (elle reste guardée par `@media (prefers-reduced-motion: no-preference)`).

### Sécurité
- Aucune donnée n'est envoyée à l'extérieur. Le storage reste local
  (`chrome.storage.local`).

---

## [2.6.1] — 2026-05-09 (état précédent)

### Ajouté
- Refonte de la page agenda / simulcast calendar avec onglets jours et
  scroll-spy (`styles/agenda.css`, JS associé dans `content.js`).
- Modules `motion` (reveal au scroll, fade-in image, transition de page).
- Drapeaux `hideGames` et `hideNews` pour cacher les catégories
  correspondantes dans la barre du haut.

### Modifié
- Architecture CSS modulaire (`styles/tokens.css`, `base.css`,
  `animations.css`, etc.) au lieu d'un unique `styles.css`.

---

## [1.0.0] — 2024

- Version initiale : thème noir + orange, masquage de la boutique,
  popup de réglages, animations de base.
