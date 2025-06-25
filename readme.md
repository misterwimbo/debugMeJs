# 🐞 DebugJS Console Last – Tampermonkey SuperScript

> _"Un outil de debug web si pratique qu'on jurerait qu'il a été forgé dans les forges de Valhalla digitale."_

## 🚀 Présentation

**DebugJS Console Last** est un script Tampermonkey conçu pour les développeurs web qui souhaitent *prendre le contrôle total* du front-end. À travers une interface discrète mais puissante, ce script vous offre une boîte à outils de debug avancée pour :

- Intercepter et analyser les formulaires
- Monitorer et bloquer les appels réseau (XHR & Fetch)
- Détecter les éléments interactifs (onclick, onchange…)
- Visualiser dynamiquement les listeners JavaScript
- Inspecter visuellement le DOM
- Afficher les cookies, les inputs cachés, les IDs dupliqués…
- Et même… révéler les champs mots de passe 🕵️‍♂️

---

## ⚙️ Installation

1. Installez [Tampermonkey](https://www.tampermonkey.net/) (ou Greasemonkey).
2. Créez un nouveau script utilisateur.
3. Copiez-collez le code depuis ce repo.
4. Sauvegardez.
5. Rechargez une page web pour en profiter.

---

## 🧰 Fonctionnalités principales

### 🧾 Formulaires

- `fof()` → Bloque tous les formulaires et affiche leurs données
- `fon()` → Réactive la soumission des formulaires
- `df()` → Affiche tous les formulaires avec leurs champs
- Ajoute un indicateur visuel `submit form off` en haut à gauche

### 📡 Réseau

- `net()` → Monitorer les requêtes XHR/Fetch en détail
- `netoff()` → Bloquer toutes les requêtes réseau
- `neton()` → Relancer les requêtes bloquées
- Journalise requêtes, headers, body, réponses, etc.

### 👁️ DOM & Events

- Survol d’éléments = Affichage automatique de leurs événements (`onclick`, `onchange`, etc.)
- Survol de listeners `addEventListener()` → Affiche le code source dans un **tooltip stylisé**
- `ids()` → Détecte les IDs dupliqués dans le DOM
- `sh()` → Affiche/camoufle les `<input type="hidden">` avec style (bordures rouges + labels)

### 🍪 Divers outils

- `cc()` → Affiche les cookies dans la console
- `log(x)` → Logger amélioré (type, longueur, contenu, table…)

### 🔐 Bonus malicieux

- Survoler un champ `<input type="password">` le rend temporairement visible (coloré en orange, style dramatique inclus).

---

## 🖱️ UI intégrée

### 🧭 Bouton flottant
- Un ⚙️ en bas à droite déploie un **menu moderne et responsive** :
  - Formulaires (intercepter, afficher…)
  - Réseau (bloquer, relancer…)
  - Positionnement du panneau d’info
  - Outils divers

### 🖱️ Menu contextuel alternatif
- **Shift + clic droit** → ancien menu contextuel avec options rapides

---

## 🧪 Console globale

Les fonctions suivantes sont accessibles via `console` :

| Commande         | Description                                 |
|------------------|---------------------------------------------|
| `fof()`          | Bloque les formulaires                      |
| `fon()`          | Débloque les formulaires                    |
| `df()`           | Affiche les formulaires                     |
| `net()`          | Monitorer les requêtes réseau               |
| `netoff()`       | Bloquer les requêtes réseau                 |
| `neton()`        | Relancer les requêtes bloquées              |
| `ids()`          | Recherche d’IDs dupliqués                   |
| `sh()`           | Toggle des `input[type="hidden"]`          |
| `cc()`           | Voir les cookies                            |
| `log(x)`         | Logger magique                              |
| `h()`            | Affiche un panneau d’aide détaillé         |

---

## 📸 Aperçu visuel

> ⚙️ Interface flottante + tooltips glassmorphiques + inspection instantanée  
> … Un mélange entre **DevTools**, **Dark Souls**, et **Tron Legacy**.

---

## 💡 Astuces

- L’UI s’adapte à la position : haut/bas, gauche/droite.
- Les requêtes bloquées sont **stockées** et **rejouées**.
- L’aide (`h()`) est riche, commentée, et mise en forme.
- Les événements inline ET dynamiques sont inspectables.

---

## 🧙 Auteurs

- **wimbo** – maître des scripts, dompteur de formulaires, et fan des tooltips chics.

---

## 🛡️ Disclaimer

Ce script est conçu à des fins de debugging uniquement. À utiliser dans des environnements que vous contrôlez. Respectez toujours les règles de sécurité et de vie privée des applications que vous manipulez.

---

## 🏁 Pour commencer

Une fois installé, ouvrez la console développeur (`F12`) et tapez :

```js
h();
