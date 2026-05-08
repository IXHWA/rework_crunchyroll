# Crunchyroll Modernizer

Extension Chrome (MV3) qui modernise l'interface de Crunchyroll : thèmes,
animations cinématiques, lecteur vidéo premium et raccourcis clavier
complets.

> Version actuelle : **3.0.0** — voir [`CHANGELOG.md`](CHANGELOG.md)

## Fonctionnalités

### Apparence
- **5 thèmes de couleurs** : Orange (Crunchyroll), Sakura (rose poudré),
  Mint (turquoise), Neon (violet cyber), Mono (gris perle).
- **Couleur d'accent personnalisée** via curseurs HSL.
- **Zoom des cartes** ajustable de 100 % à 140 %.
- **Animations** : fade-in à la navigation, reveal au scroll, fade
  des images au chargement, transitions smooth partout.
- **Mode mouvement réduit** pour couper toutes les animations.

### Modules par page
- **Accueil** : hero cinématique, carrousels élégants, voile dégradé.
- **Catalogue / Explorer** : filtres en pilules, grilles aérées.
- **Page série** : bannière immersive, onglets nets, liste d'épisodes
  premium.
- **Page lecteur** : contrôles affinés, sous-titres lisibles, ambient
  mode optionnel, gradient orange sur la barre de progression.
- **Agenda / simulcast calendar** : refonte complète avec onglets jours
  collants en haut, mode focus par jour, scroll-spy.
- **Cartes anime** : style Netflix-like (la carte s'agrandit en place,
  ombre d'accent, halo doux), titre fort en deux lignes max, sub/dub
  en pilule discrète.

### Lecteur
- **Raccourcis clavier** style YouTube (`K`, `J`, `L`, `↑`, `↓`, `M`,
  `F`, `N`, `P`, `0`–`9`, `<`, `>`, `I`).
- **Toast** discret en haut de la vidéo quand un raccourci est pressé.

### Productivité
- **Page d'options dédiée** (5 onglets).
- **Export / import** des réglages au format JSON.
- **Service worker** avec badge `OFF` quand l'extension est désactivée.
- **Raccourcis Chrome globaux** : `Alt+Shift+C` (popup), `Alt+Shift+O`
  (options), `toggle-extension`, `cycle-theme`.

## Installation (mode développeur)

1. Télécharger le dossier (ou cloner le dépôt).
2. Ouvrir `chrome://extensions/` dans Chrome.
3. Activer le **mode développeur** (toggle en haut à droite).
4. Cliquer **« Charger l'extension non empaquetée »** et sélectionner
   le dossier du projet.
5. Aller sur https://www.crunchyroll.com et profiter !

À la première installation, la **page d'options** s'ouvre automatiquement.

## Structure du projet

```
crunchyroll-modernizer/
├── manifest.json            # Manifest MV3
├── background.js            # Service worker (badge, commandes, broadcast)
├── content.js               # Script injecté (drapeaux, hover-killer,
│                            #  motion, agenda, raccourcis lecteur)
├── popup.html / popup.js    # Popup compact (toggles + thèmes + zoom)
├── options.html             # Page d'options complète (5 onglets)
├── options.js / options.css
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── styles/                  # CSS modulaire (15 fichiers)
│   ├── tokens.css           # variables de design (couleurs, espacements…)
│   ├── themes.css           # 5 presets + accent perso (HSL)
│   ├── base.css             # reset léger, scrollbar, sélection, focus
│   ├── animations.css       # @keyframes partagés
│   ├── utilities.css        # masquage shop / jeux / news
│   ├── interactions.css     # hover smooth global
│   ├── motion.css           # transitions de page + reveal au scroll
│   ├── scroll.css           # progress bar + bouton « retour en haut »
│   ├── navigation.css       # barre du haut
│   ├── homepage.css         # accueil
│   ├── cards.css            # cartes anime
│   ├── clarity.css          # hiérarchie typo + sub/dub
│   ├── catalogue.css        # explorer / filtres
│   ├── anime-detail.css     # page série / film
│   ├── agenda.css           # simulcast calendar
│   └── player.css           # lecteur vidéo (priorité)
├── README.md
├── CHANGELOG.md
├── LICENSE
├── INDEX.md                 # carte des guides
├── INSTALL.md               # installation détaillée
├── DEMARRAGE_RAPIDE.md      # 3 étapes rapides
├── CUSTOMIZATION.md         # guide de personnalisation
├── RESUMÉ_PROJET.md
├── STRUCTURE_COMPLETE.txt
└── VERIFICATION.txt
```

## Architecture

L'extension fonctionne par **drapeaux `data-cr-*`** posés sur l'élément
`<html>` à partir de `chrome.storage.local.settings`. Chaque module CSS
est gardé par un drapeau, ce qui rend chaque toggle isolé.

```
data-cr-enabled           data-cr-modern-nav        data-cr-theme="orange"
data-cr-modern-home       data-cr-modern-cards      data-cr-card-zoom=…
data-cr-modern-browse     data-cr-modern-detail     data-cr-page="player"
data-cr-modern-player     data-cr-clarity-ui        data-cr-pt="enter"
data-cr-bigger-cards      data-cr-minimal-cards     data-cr-day-focus="1"
data-cr-smooth-hover      data-cr-motion            data-cr-accent-custom
data-cr-scroll-tools      data-cr-ambient
data-cr-hide-shop         data-cr-hide-games        data-cr-hide-news
data-cr-reduced-motion    data-cr-player-hotkeys
```

`content.js` détecte aussi le **type de page** (`home`, `player`,
`agenda`, `browse`, `detail`, `account`, `other`) et le pose dans
`data-cr-page`. Cela permet à chaque CSS de scoper précisément ses
règles.

## Raccourcis clavier (page lecteur)

Voir aussi [`CHANGELOG.md`](CHANGELOG.md#300--2026-05-09).

| Touche(s)            | Action                          |
|----------------------|---------------------------------|
| `K` `Espace`         | Lecture / pause                 |
| `J` `←`              | Reculer 10 s                    |
| `L` `→`              | Avancer 10 s                    |
| `↑` `↓`              | Volume ± 10 %                   |
| `M`                  | Couper le son                   |
| `F`                  | Plein écran                     |
| `N`                  | Épisode suivant                 |
| `P`                  | Épisode précédent               |
| `0` – `9`            | Saut à 0 % – 90 %               |
| `<` `>`              | Vitesse ± 0.25                  |
| `I`                  | Afficher l'info actuelle        |

Désactivables via le toggle « Raccourcis clavier lecteur » dans le popup
ou la page d'options.

## Personnalisation rapide

### Changer la couleur d'accent

1. Ouvrir le popup → choisir un thème.
2. Ou ouvrir la page d'options → onglet « Apparence » → activer
   « Accent personnalisé » et bouger les sliders HSL.

### Modifier les variables manuellement

Toutes les variables de design sont dans
[`styles/tokens.css`](styles/tokens.css). Les couleurs d'accent par
thème sont dans [`styles/themes.css`](styles/themes.css).

```css
:root {
  --cr-bg:       #050506;
  --cr-orange:   #ff7a1a;
  --cr-card-zoom: 1.18;
  --cr-fast:     140ms;
  /* … */
}
```

### Ajouter un nouveau module

1. Ajouter une clé dans `DEFAULT_SETTINGS` (`content.js` + `popup.js` +
   `options.js`).
2. Mapper la clé vers un attribut `data-cr-*` dans `FLAG_MAP`
   (`content.js`).
3. Créer un `styles/<module>.css` gardé par cet attribut.
4. Référencer le CSS dans `manifest.json`.
5. Ajouter une rangée dans `popup.html` et un groupe dans
   `options.js`.

## Confidentialité

- Aucune donnée n'est envoyée à l'extérieur.
- Pas d'analytics, pas de trackers.
- Les réglages sont stockés via `chrome.storage.local`.
- Permissions : `storage` + accès au domaine `crunchyroll.com`.
- Code 100 % open source — vérifie par toi-même.

## Compatibilité

- **Chrome 88+** (Manifest V3 requis pour service worker).
- **Edge** : compatible (basé sur Chromium).
- **Brave / Opera / Vivaldi** : compatibles.
- **Firefox** : non supporté pour l'instant (différences MV3 / WebExtensions).

## Licence

Cette extension est créée à titre personnel et n'est pas affiliée à
Crunchyroll Inc. Voir [`LICENSE`](LICENSE).

---

Bon visionnage !
