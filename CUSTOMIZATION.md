# 🎨 Guide de Personnalisation Avancée

Ce guide vous permet de personnaliser entièrement le design de l'extension selon vos préférences.

---

## 🎯 Modifications rapides

### Changer la couleur d'accent (Facile ⭐)

1. Ouvrez le fichier `styles.css`
2. Trouvez la section `:root` en haut du fichier
3. Modifiez la ligne :
```css
--color-orange: #ff6600;      /* ← Changez cette couleur */
--color-orange-dark: #e55a00; /* ← Assombrissez le hover */
--color-orange-light: #ff7722; /* ← Éclaircissez le focus */
```

**Exemples de couleurs :**
- Bleu : `#0066ff`, `#0052cc`, `#0040ff`
- Rouge : `#ff0033`, `#cc0033`, `#ff0050`
- Vert : `#00ff33`, `#00cc33`, `#00ff50`
- Violet : `#cc00ff`, `#9900ff`, `#ff00ff`
- Rose : `#ff0099`, `#ff0066`, `#ff33cc`

Sauvegardez, actualisez Crunchyroll, et c'est appliqué !

---

### Changer le fond noir (Facile ⭐)

Si vous préférez un gris très sombre au lieu du noir pur :

```css
--color-black: #1a1a1a;           /* Gris très sombre */
--color-black-light: #111111;     /* Gris un peu moins sombre */
--color-black-lighter: #242424;   /* Gris clair */
```

**Suggestions :**
- **Noir ultra pur** : `#000000` (défaut)
- **Noir avec teinte** : `#0a0a0a`
- **Gris très sombre** : `#1a1a1a`
- **Gris sombre** : `#242424`

---

### Modifier la vélocité des animations (Moyen ⭐⭐)

1. Trouvez la section des transitions :
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

2. Changez les valeurs (en millisecondes) :
- **Plus rapide** : 100ms, 150ms, 200ms
- **Plus lent** : 300ms, 400ms, 500ms

**Courbes d'animation :**
- `ease-out` : rapide au début, ralentit à la fin (recommandé)
- `ease-in` : ralentit au début, rapide à la fin
- `ease-in-out` : ralentit au début ET à la fin
- `linear` : vitesse constante

---

## 🎬 Modifications moyennes

### Augmenter l'arrondi des boutons et cartes (Moyen ⭐⭐)

```css
--radius-sm: 4px;   /* Moins arrondi */
--radius-md: 8px;   /* Moyen */
--radius-lg: 12px;  /* Plus arrondi */
--radius-xl: 16px;  /* Très arrondi */
```

Pour des boutons plus carrés :
```css
--radius-md: 2px;   /* Presque pas d'arrondi */
```

Pour des boutons plus arrondis (style "pill") :
```css
--radius-md: 20px;  /* Très arrondi */
```

---

### Modifier la taille des espacements (Moyen ⭐⭐)

Les espacements contrôlent les marges et le padding partout :

```css
--spacing-xs: 4px;    /* Très petit */
--spacing-sm: 8px;    /* Petit */
--spacing-md: 12px;   /* Moyen */
--spacing-lg: 16px;   /* Grand */
--spacing-xl: 24px;   /* Très grand */
--spacing-2xl: 32px;  /* Énorme */
```

Augmentez-les pour un design plus aéré :
```css
--spacing-xl: 32px;   /* Était 24px */
--spacing-2xl: 48px;  /* Était 32px */
```

Diminuez-les pour plus de densité :
```css
--spacing-lg: 12px;   /* Était 16px */
--spacing-xl: 16px;   /* Était 24px */
```

---

### Créer des palettes de couleurs complètes (Moyen ⭐⭐)

**Palette Bleu Tech :**
```css
--color-orange: #0066ff;
--color-orange-dark: #0052cc;
--color-orange-light: #0080ff;
```

**Palette Rose/Magenta :**
```css
--color-orange: #ff0099;
--color-orange-dark: #cc0080;
--color-orange-light: #ff00bb;
```

**Palette Vert Neon :**
```css
--color-orange: #00ff33;
--color-orange-dark: #00cc28;
--color-orange-light: #00ff50;
```

**Palette Jaune/Or :**
```css
--color-orange: #ffcc00;
--color-orange-dark: #cc9900;
--color-orange-light: #ffdd33;
```

---

## 🚀 Modifications avancées

### Ajouter des animations personnalisées (Avancé ⭐⭐⭐)

Créez vos propres animations en ajoutant au fichier `styles.css` :

```css
/* Animation "pulse" - pulse l'élément */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Animation "rotate" - tourne l'élément */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animation "bounce" - rebond */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Application de l'animation */
button:hover {
  animation: pulse 1s ease-in-out infinite;
}

/* Ou sur les cartes */
[class*="card"]:hover {
  animation: bounce 0.6s ease-out;
}
```

### Changer l'effet au hover des cartes (Avancé ⭐⭐⭐)

Trouvez cette section :
```css
[class*="card"]:hover,
[class*="item"]:hover,
[class*="tile"]:hover,
article:hover {
  border-color: var(--color-orange) !important;
  box-shadow: 0 8px 32px rgba(255, 102, 0, 0.2);
  transform: translateY(-4px);  /* ← Modifiez ici */
}
```

**Options de transform :**
- `translateY(-4px)` : Remonte légèrement (défaut)
- `translateY(-8px)` : Remonte beaucoup
- `scale(1.05)` : Agrandit légèrement
- `scale(1.1)` : Agrandit beaucoup
- `rotate(2deg)` : Tourne légèrement
- `skewY(-2deg)` : Penche le texte

**Combinez plusieurs transforms :**
```css
transform: translateY(-4px) scale(1.02) rotate(1deg);
```

### Créer un dégradé personnalisé pour les boutons (Avancé ⭐⭐⭐)

Remplacez cette ligne :
```css
background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-orange-dark) 100%) !important;
```

Par vos propres dégradés :

**Dégradé horizontal :**
```css
background: linear-gradient(90deg, #ff6600 0%, #e55a00 100%);
```

**Dégradé vertical :**
```css
background: linear-gradient(180deg, #ff6600 0%, #e55a00 100%);
```

**Dégradé diagonal opposé :**
```css
background: linear-gradient(-45deg, #ff6600 0%, #e55a00 100%);
```

**Dégradé multi-couleurs :**
```css
background: linear-gradient(135deg, #ff6600 0%, #ff00ff 50%, #e55a00 100%);
```

**Dégradé circulaire :**
```css
background: radial-gradient(circle, #ff6600 0%, #e55a00 100%);
```

---

## 🎯 Modifications complexes

### Modifier le JavaScript pour plus de contrôle (Expert ⭐⭐⭐⭐)

Ouvrez `content.js` et modifiez les comportements.

**Exemple : Ajouter un effet de ripple plus rapide :**
```javascript
createRippleEffect(event) {
  // ... code existant ...
  ripple.style.animation = `ripple 400ms ease-out`; // Était 600ms
}
```

**Exemple : Changer la vélocité du hover :**
```javascript
card.addEventListener('mouseenter', () => {
  card.style.transform = 'translateY(-8px)'; // Était -4px
  card.style.boxShadow = '0 16px 48px rgba(255, 102, 0, 0.3)'; // Shadow augmentée
});
```

### Ajouter un thème personnalisé complet (Expert ⭐⭐⭐⭐)

Créez une nouvelle section CSS pour votre thème :

```css
/* THÈME PERSONNALISÉ - Ajoutez au fichier styles.css */

/* Réinitialiser les variables */
html[data-theme="custom"] {
  --color-black: #0d0221;
  --color-black-light: #1d0b4a;
  --color-black-lighter: #2d0b69;
  --color-orange: #ff006e;
  --color-orange-dark: #cc005a;
  --color-orange-light: #ff0080;
  --color-gray-900: #150033;
  --color-gray-800: #251d4a;
  --color-gray-700: #3d2d5a;
  --color-gray-600: #4d3d6a;
  --color-text-primary: #f0f0f0;
  --color-text-secondary: #a0a0a0;
}

/* Appliquer le thème via JavaScript */
// Dans content.js, ajoutez :
document.documentElement.setAttribute('data-theme', 'custom');
```

---

## 🔌 Intégrations avancées

### Intégrer Font Awesome (Icons)

1. Ajoutez au `popup.html` :
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
```

2. Utilisez les icônes :
```html
<button><i class="fas fa-play"></i> Lire</button>
```

### Utiliser des polices Google Fonts

1. Ajoutez à `styles.css` :
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

body {
  font-family: 'Poppins', sans-serif !important;
}
```

---

## 📊 Comparaison des paramètres

| Aspect | Discret | Défaut | Agressif |
|--------|---------|--------|----------|
| Animation | 150ms | 250ms | 350ms+ |
| Border radius | 2px | 8px | 20px+ |
| Spacing | 8px | 16px | 32px+ |
| Shadow blur | 10px | 32px | 60px+ |
| Scale hover | 1.01 | 1.05 | 1.15 |

---

## 💾 Sauvegarde et partage

### Sauvegarder votre configuration

Créez une copie de vos fichiers modifiés :
```
MonTheme/
├── styles.css (modifié)
├── content.js (modifié)
├── manifest.json
└── popup.html
```

### Partager votre thème

1. Compressez votre dossier en `.zip`
2. Partagez-le avec d'autres utilisateurs
3. Ils peuvent le charger via `chrome://extensions/`

---

## 🧪 Testing et Debugging

### Vérifier vos modifications

1. Ouvrez `chrome://extensions/`
2. Trouvez "Crunchyroll Modernizer"
3. Cliquez sur "Détails"
4. Cliquez le chevron pour afficher les erreurs
5. Actualisez Crunchyroll.com et observez les changements

### Console de debugging

1. Sur Crunchyroll.com, appuyez sur `F12`
2. Allez à l'onglet "Console"
3. Cherchez les erreurs (rouge)
4. Corrigez les fichiers si nécessaire

---

## 🎓 Ressources utiles

- **CSS Gradient Generator** : https://cssgradient.io
- **Color Picker** : https://htmlcolorcodes.com
- **Animation Library** : https://animate.style
- **CSS Shadows** : https://shadows.brumm.af

---

**Vous êtes maintenant un expert en personnalisation ! 🚀**

N'hésitez pas à expérimenter et créer votre propre style ! 🎨
