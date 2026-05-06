# 🎨 Crunchyroll Modernizer

Une extension Chrome premium qui modernise complètement l'interface de Crunchyroll avec un design sombre épuré, smooth et professionnel.

## ✨ Fonctionnalités

### Design & Apparence
- ✅ **Thème noir pur** (#000000) avec accents orange (#ff6600)
- ✅ **Transitions smooth** sur tous les éléments interactifs
- ✅ **Animations fluides** avec des délais en cascade
- ✅ **Effets hover** sophistiqués et polished
- ✅ **Scrollbar personnalisée** elegant et moderne
- ✅ **Buttons modernes** avec gradient et shadow effects

### Interface
- ✅ **Navbar améliorée** avec gradient et backdrop blur
- ✅ **Sidebar moderne** avec états visuels clairs
- ✅ **Grille de contenu flexible** responsive design
- ✅ **Cartes/Items** avec animations d'apparition
- ✅ **Lecteur vidéo** avec border radius et shadow premium
- ✅ **Modales et overlays** avec blur effect

### Fonctionnalités Avancées
- ✅ **Suppression complète de la boutique** (liens et boutons cachés)
- ✅ **Effet ripple** sur les clics de boutons
- ✅ **Focus states** améliorés pour l'accessibilité
- ✅ **Lazy loading** compatible
- ✅ **Dark mode** permanent
- ✅ **Smooth scroll** sur tous les liens internes

### Personnalisation
- ✅ **Popup settings** intuitif
- ✅ **Préférences sauvegardées** (stockage local)
- ✅ **Toggle switches** pour activer/désactiver les fonctionnalités
- ✅ **Préférences par utilisateur**

## 📥 Installation

### Méthode 1 : Installation en mode développeur (Chrome)

1. **Télécharger ou cloner les fichiers** de l'extension
2. **Ouvrir Chrome** et naviguer vers `chrome://extensions/`
3. **Activer le mode développeur** (toggle en haut à droite)
4. **Cliquer sur "Charger l'extension non empaquetée"**
5. **Sélectionner le dossier** contenant les fichiers de l'extension
6. L'extension apparaît maintenant dans votre liste d'extensions ✓

### Méthode 2 : Installation temporaire (Firefox - venir bientôt)

1. Naviguer vers `about:debugging`
2. Cliquer sur "Ce Firefox"
3. Cliquer sur "Charger un module temporaire"
4. Sélectionner le fichier `manifest.json` de l'extension

### Méthode 3 : Installation via Chrome Web Store (pas encore disponible)

Bientôt disponible sur le Chrome Web Store !

## 📁 Structure des fichiers

```
crunchyroll-modernizer/
├── manifest.json          # Configuration principale de l'extension
├── content.js             # Script injecté dans les pages Crunchyroll
├── styles.css             # Feuille de styles complète (noir + orange)
├── popup.html             # Interface des paramètres
├── popup.js               # Logique de la popup
├── icons/                 # Icônes de l'extension
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md              # Ce fichier
```

## 🎯 Utilisation

### Activation de l'extension

1. L'extension s'active automatiquement sur `https://www.crunchyroll.com/*`
2. Vous verrez immédiatement les changements d'interface
3. Actualisez la page pour voir les effets complets

### Accès aux paramètres

1. **Cliquer sur l'icône** de l'extension dans la barre d'outils Chrome
2. Une popup s'ouvre avec les **paramètres personnalisables**
3. **Modifier les préférences** selon vos envies
4. Cliquer sur "Appliquer" pour sauvegarder

### Paramètres disponibles

- **Mode sombre** - Active le thème noir pur (activé par défaut)
- **Animations smooth** - Active les transitions fluides (activé par défaut)
- **Mouvement réduit** - Réduit les animations pour l'accessibilité
- **Masquer la boutique** - Cache tous les éléments shop (activé par défaut)
- **Navigation améliorée** - Navbar et sidebar modernisées (activé par défaut)
- **Lecteur personnalisé** - Design premium du lecteur vidéo (activé par défaut)

## 🎨 Design Details

### Palette de couleurs
- **Background** : #000000 (noir pur)
- **Surfaces** : #0a0a0a, #1a1a1a (noir dégradé)
- **Accents** : #ff6600 (orange vibrant)
- **Texte principal** : #ffffff (blanc)
- **Texte secondaire** : #b0b0b0 (gris clair)
- **Borders** : #2a2a2a (gris foncé)

### Espacements (système de grille)
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px

### Transitions
- Fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- Normal: 250ms cubic-bezier(0.4, 0, 0.2, 1)
- Slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)

## 🔧 Fonctionnement technique

### Content Script (`content.js`)

Le script injecté dans les pages gère :
- **DOM Mutations** - Détecte les changements dynamiques
- **Smooth Scrolling** - Navigation fluide
- **Event Listeners** - Interactions améliorées
- **Animations** - Effets visuels
- **Preferences** - Récupère les paramètres sauvegardés

### CSS (`styles.css`)

Applique :
- **Reset CSS** - Réinitialisation globale
- **Variables CSS** - Design system réutilisable
- **Sélecteurs intelligents** - Cible les éléments dynamiques
- **Media queries** - Responsive design
- **Animations keyframes** - Effets visuels

### Storage (`popup.js`)

Gère :
- **Sauvegarde locale** - Chrome storage API
- **Récupération** - Chargement au démarrage
- **Synchronisation** - Mise à jour des tabs

## ⚙️ Configuration avancée

### Modifier les couleurs

Dans `styles.css`, modifier les variables CSS :
```css
:root {
  --color-orange: #ff6600;      /* Votre couleur d'accent */
  --color-black: #000000;       /* Fond principal */
  /* ... autres variables ... */
}
```

### Ajouter des animations personnalisées

Ajouter dans `styles.css` :
```css
@keyframes customAnimation {
  from { /* État initial */ }
  to { /* État final */ }
}
```

### Cibler des éléments spécifiques

Dans `content.js`, ajouter un nouveau sélecteur à `enhanceUI()` :
```javascript
enhanceSpecificElement() {
  const element = document.querySelector('[class*="specific"]');
  if (element) {
    // Appliquer les modifications
  }
}
```

## 🐛 Troubleshooting

### L'extension ne fonctionne pas
- Vérifier que vous êtes sur `https://www.crunchyroll.com`
- Actualiser la page complètement (Ctrl+F5)
- Vérifier la console pour les erreurs (F12)

### Les styles ne s'appliquent pas
- Vérifier que le fichier `styles.css` est présent
- S'assurer que `manifest.json` référence correctement les fichiers
- Vérifier les permissions dans le manifest

### Les paramètres ne se sauvegardent pas
- Vérifier que `chrome.storage` a les permissions requises
- Contrôler la console du popup pour les erreurs
- Réinitialiser l'extension via les paramètres

## 📞 Support et feedback

Pour toute question, suggestion ou bug report :
- Créer une issue sur le repository
- Envoyer un email au développeur
- Laisser un avis sur le Chrome Web Store (quand disponible)

## 🔐 Sécurité et confidentialité

- ✅ Aucune donnée n'est envoyée à des serveurs externes
- ✅ Aucune collecte d'informations personnelles
- ✅ Les préférences sont stockées localement uniquement
- ✅ Code ouvert et vérifiable
- ✅ Pas de trackers ou analytics

## 📄 Licence

Cette extension est créée à titre personnel et n'est pas affiliée à Crunchyroll Inc.

## 🚀 Roadmap (À venir)

- [ ] Version Firefox
- [ ] Version Edge
- [ ] Plus d'options de personnalisation
- [ ] Thèmes supplémentaires
- [ ] Synchronisation des paramètres via compte
- [ ] Intégration des sauvegardes
- [ ] Support des extensions Firefox AMO
- [ ] Page de documentation complète
- [ ] Mode light (optionnel)
- [ ] Paramètres avancés

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024  
**Statut** : En développement actif ✓

Bon visionnage ! 🎬
