# 🚀 Guide d'Installation - Crunchyroll Modernizer

## ✅ Pré-requis

- Google Chrome (version 88+)
- Accès à Crunchyroll.com
- Quelques minutes de temps

---

## 📖 Installation en Mode Développeur (Recommandé)

### Étape 1 : Préparer les fichiers

1. Créez un dossier sur votre ordinateur : `CrunchyrollModernizer`
2. Copiez tous les fichiers fournis dedans :
   - `manifest.json`
   - `content.js`
   - `styles.css`
   - `popup.html`
   - `popup.js`
   - `README.md`
   - Dossier `icons/`

Votre structure doit ressembler à ça :
```
CrunchyrollModernizer/
├── manifest.json
├── content.js
├── styles.css
├── popup.html
├── popup.js
├── README.md
├── icons/
│   └── icon-128.svg
```

### Étape 2 : Ouvrir Chrome Extensions

1. **Ouvrez Google Chrome**
2. Cliquez sur l'icône **menu** (trois points) en haut à droite
3. Allez à **"Plus d'outils" → "Extensions"**
   
   OU tapez directement dans la barre d'adresse :
   ```
   chrome://extensions/
   ```

### Étape 3 : Activer le Mode Développeur

1. En haut à droite, activez le **"Mode de développement"** (toggle switch)
2. Vous verrez apparaître 3 nouveaux boutons : 
   - "Charger l'extension non empaquetée"
   - "Empaqueter l'extension"
   - "Mettre à jour les extensions"

### Étape 4 : Charger l'extension

1. Cliquez sur le bouton **"Charger l'extension non empaquetée"**
2. Naviguez vers le dossier `CrunchyrollModernizer` que vous avez créé
3. Sélectionnez le dossier complet et cliquez "Sélectionner"
4. ✅ L'extension s'installe automatiquement !

### Étape 5 : Vérifier l'installation

1. L'extension apparaît dans la liste avec un icône orange
2. Vous pouvez voir :
   - **"Crunchyroll Modernizer"** - nom de l'extension
   - **"1.0.0"** - version
   - **États des fichiers** - tout devrait être bleu (pas d'erreurs)

3. À côté du nom Chrome, cliquez l'icône d'extension (puzzle) et épinglez "Crunchyroll Modernizer"

---

## 🎬 Utilisation

### Activer la modernisation

1. **Allez sur** https://www.crunchyroll.com
2. **Actualisez la page** complètement (Ctrl+F5 ou Cmd+Shift+R)
3. ✨ L'interface devient noire avec des accents orange !

### Accéder aux paramètres

1. **Cliquez sur l'icône orange** de Crunchyroll Modernizer dans la barre d'outils
2. Une **popup s'ouvre** avec les options
3. Activez/désactivez les fonctionnalités selon vos préférences
4. Cliquez **"Appliquer"** pour sauvegarder

### Paramètres disponibles

- ✅ Mode sombre (activé par défaut)
- ✅ Animations smooth (activé par défaut)
- ✅ Mouvement réduit (pour accessibilité)
- ✅ Masquer la boutique (activé par défaut)
- ✅ Navigation améliorée (activé par défaut)
- ✅ Lecteur personnalisé (activé par défaut)

---

## 🔧 Dépannage

### L'extension ne s'affiche pas sur Crunchyroll

**Solution 1 : Actualiser la page**
- Appuyez sur `Ctrl+F5` (ou `Cmd+Shift+R` sur Mac)
- Attendez quelques secondes

**Solution 2 : Vérifier les permissions**
- Allez à `chrome://extensions/`
- Cliquez sur "Détails" pour Crunchyroll Modernizer
- Vérifiez que "Accès au site" est sur "Sur crunchyroll.com"

**Solution 3 : Réinstaller**
- Allez à `chrome://extensions/`
- Supprimez l'extension (bouton poubelle)
- Refaites les étapes 2-4 du guide d'installation

### Les couleurs sont bizarres

**Raison** : Crunchyroll a des styles en conflit
**Solution** :
1. Ouvrez les paramètres de l'extension (cliquez sur l'icône)
2. Cliquez "Réinitialiser"
3. Cliquez "Appliquer"
4. Actualisez la page

### Les boutons ne changent pas de couleur au survol

**Raison** : Les styles CSS ne s'appliquent pas complètement
**Solution** :
1. Appuyez sur `F12` pour ouvrir les outils de développement
2. Allez à l'onglet "Console"
3. Vérifiez qu'il n'y a pas de messages d'erreur rouge
4. Si oui, décrivez l'erreur au support

### L'extension ralentit le site

**Raison** : Trop d'animations simultanées
**Solution** :
1. Ouvrez les paramètres de l'extension
2. Désactivez "Animations smooth" ou "Mouvement réduit"
3. Cliquez "Appliquer"

---

## 📋 Checklist de vérification

Après l'installation, vérifiez que tout fonctionne :

- [ ] L'extension apparaît dans `chrome://extensions/`
- [ ] L'icône orange est visible dans la barre d'outils
- [ ] Crunchyroll.com a un fond noir après actualisation
- [ ] Les boutons sont orange avec des dégradés
- [ ] La navigation est lisse et fluide
- [ ] Les animations sont fluides (pas de saccades)
- [ ] La popup des paramètres s'ouvre au clic sur l'icône
- [ ] Les boutons toggle fonctionnent dans la popup
- [ ] Les paramètres se sauvegardent

---

## 🎨 Aperçu des changements

### Avant (Crunchyroll original)
- Interface claire (blanc/gris)
- Fond blanc éblouissant
- Pas de cohérence visuelle
- Animations absentes

### Après (Avec Crunchyroll Modernizer)
- ✨ Interface sombre et épurée
- 🖤 Fond noir pur (#000000)
- 🟠 Accents orange (#ff6600) partout
- 🎬 Animations smooth et fluides
- ⚡ Transitions rapides et agréables
- 🎯 Boutons modernes avec dégradés
- 🌌 Scrollbar élégante et orange
- 📱 Design responsive et accessible

---

## 🆘 Besoin d'aide ?

### Vérifier la console

1. Appuyez sur `F12` (Windows) ou `Cmd+Option+J` (Mac)
2. Allez à l'onglet "Console"
3. Cherchez les messages d'erreur (en rouge)
4. Copiez-les pour le support

### Réinitialiser complètement

1. Allez à `chrome://extensions/`
2. Supprimez l'extension (cliquez sur la poubelle)
3. Retirez le dossier `CrunchyrollModernizer` sur votre ordinateur
4. Redémarrez Chrome
5. Recommencez le guide d'installation

### Contacter le support

- ❓ Questions : Consultez le README.md
- 🐛 Bug : Décrivez le problème avec des screenshots
- 💡 Suggestion : Proposez vos idées !

---

## 📱 Compatibilité

| Navigateur | Support | Statut |
|-----------|---------|--------|
| Chrome | ✅ | Complet |
| Edge | ⏳ | En développement |
| Firefox | ⏳ | En développement |
| Safari | ❌ | Non planifié |
| Opera | ✅ | Via Chromium |

---

## 🔒 Sécurité

- ✅ Pas de transmission de données
- ✅ Aucun tracker ou analytics
- ✅ Code 100% transparent
- ✅ Permissions minimales requises
- ✅ Stockage local uniquement

---

## 📊 Infos techniques

- **Manifest Version** : 3 (V3)
- **Minimum Chrome** : 88+
- **Permissions** : scripting, storage
- **Permissions host** : crunchyroll.com/*

---

**Bravo ! L'extension est maintenant installée et prête à l'emploi ! 🎉**

Profitez de votre expérience Crunchyroll modernisée ! 🎬✨
