# Index — Crunchyroll Modernizer v3.0.0

Carte de tous les fichiers du projet.

## Démarrer

| Fichier | Pour qui ? | Durée |
|---|---|---|
| **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** | Tout le monde | 2 min |
| **[INSTALL.md](INSTALL.md)** | Installation détaillée + dépannage | 5 min |
| **[README.md](README.md)** | Vue d'ensemble et architecture | 8 min |
| **[CHANGELOG.md](CHANGELOG.md)** | Historique des versions | 3 min |
| **[CUSTOMIZATION.md](CUSTOMIZATION.md)** | Personnalisation avancée | 30 min |

## Code

### Cœur

| Fichier | Rôle |
|---|---|
| `manifest.json` | Manifest MV3 : permissions, content scripts, options page, commands. |
| `background.js` | Service worker : badge, raccourcis Chrome, broadcast. |
| `content.js` | Script injecté : drapeaux `data-cr-*`, détection de page, hover-killer, motion, agenda, raccourcis lecteur. |

### Interface

| Fichier | Rôle |
|---|---|
| `popup.html` / `popup.js` | Popup compact (toggles + sélecteur de thèmes + slider zoom + export/import). |
| `options.html` / `options.js` / `options.css` | Page d'options complète à 5 onglets (Apparence, Modules, Lecteur, Avancé, À propos). |

### Styles (15 fichiers, modulaires)

| Fichier | Rôle |
|---|---|
| `styles/tokens.css` | Variables de design (couleurs, espacements, durées). |
| `styles/themes.css` | 5 presets de thèmes + accent perso HSL. |
| `styles/base.css` | Reset léger, scrollbar, sélection, focus-visible. |
| `styles/animations.css` | `@keyframes` partagés (rise, fade, shimmer…). |
| `styles/utilities.css` | Masquage shop / jeux / news. |
| `styles/interactions.css` | Hover smooth global. |
| `styles/motion.css` | Transitions de page + reveal au scroll. |
| `styles/scroll.css` | Barre de progression + bouton « retour en haut ». |
| `styles/navigation.css` | Barre du haut. |
| `styles/homepage.css` | Accueil (hero, carrousels, dots). |
| `styles/cards.css` | Cartes anime (lift Netflix-like). |
| `styles/clarity.css` | Hiérarchie typo + sub/dub en pilule. |
| `styles/catalogue.css` | Explorer / filtres. |
| `styles/anime-detail.css` | Page série / film. |
| `styles/agenda.css` | Simulcast calendar refondu. |
| `styles/player.css` | Lecteur vidéo (priorité, ambient, toast clavier). |

### Icônes

| Fichier | Taille |
|---|---|
| `icons/icon-16.png` | 16 × 16 |
| `icons/icon-48.png` | 48 × 48 |
| `icons/icon-128.png` | 128 × 128 |

> Note : ces trois fichiers sont actuellement la même image source. Les
> redimensionner aux bonnes dimensions est sur la liste des polish à
> faire.

## Architecture en deux phrases

1. `chrome.storage.local.settings` est la **source de vérité**.
   `background.js` (service worker) la maintient et la diffuse.
2. `content.js` traduit les réglages en attributs `data-cr-*` sur
   `<html>`. Les CSS sont gardés par ces attributs, donc chaque module
   est isolé et désactivable indépendamment.

## Drapeaux `data-cr-*`

```
ON/OFF par module :
  data-cr-enabled              data-cr-modern-nav
  data-cr-modern-home          data-cr-modern-cards
  data-cr-modern-browse        data-cr-modern-detail
  data-cr-modern-player        data-cr-clarity-ui
  data-cr-bigger-cards         data-cr-minimal-cards
  data-cr-smooth-hover         data-cr-motion
  data-cr-scroll-tools         data-cr-ambient
  data-cr-hide-shop            data-cr-hide-games
  data-cr-hide-news            data-cr-reduced-motion
  data-cr-player-hotkeys

Choix :
  data-cr-theme="orange|sakura|mint|neon|mono"
  data-cr-accent-custom="on"            (override HSL)

État (posé par content.js, lu par les CSS) :
  data-cr-page="home|player|agenda|browse|detail|account|other"
  data-cr-pt="enter"                    (transition de page SPA)
  data-cr-day-focus="1"                 (mode focus jour sur agenda)
  data-cr-reveal="true|false"           (reveal au scroll)
```

## Variables CSS exposées

```
--cr-bg / --cr-bg-elev-{1,2,3}   surfaces
--cr-text / --cr-text-muted/dim  texte
--cr-border / --cr-border-strong bordures
--cr-orange*                     accent (varie selon theme)
--cr-card-zoom                   zoom des grilles de cartes
--cr-fast / --cr-mid / --cr-slow durées de transition
--cr-ease / --cr-ease-out        easings
--cr-r-{xs,sm,md,lg,xl,pill}     rayons
--cr-s-{1,2,3,4,5,6,8,10,12}     espacements
```

## Raccourcis clavier

### Globaux (Chrome)

| Raccourci | Action |
|---|---|
| `Alt+Shift+C` | Ouvrir le popup |
| `Alt+Shift+O` | Ouvrir la page d'options |
| (à configurer) | Activer / désactiver l'extension |
| (à configurer) | Cycler les thèmes |

Configurables sur `chrome://extensions/shortcuts`.

### Page lecteur

Voir [`README.md#raccourcis-clavier-page-lecteur`](README.md#raccourcis-clavier-page-lecteur).

## Confidentialité

- 100 % local, aucune donnée envoyée.
- Permissions : `storage` + `https://www.crunchyroll.com/*`.
- Pas de tracker, pas d'analytics, pas de fetch externe.

## Liens utiles

- Configurer les raccourcis Chrome : `chrome://extensions/shortcuts`
- Page d'extensions : `chrome://extensions/`
- Voir les logs du service worker : `chrome://extensions` →
  Crunchyroll Modernizer → « Inspecter les vues : service worker ».
