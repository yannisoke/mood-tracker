# Mood Tracker FR

Petit journal d'humeur quotidien : une entrée par jour (humeur + note facultative), stockage local (localStorage). Projet d'apprentissage HTML/CSS/JS sans backend.

## ✨ Fonctionnalités
- Sélection d'une humeur (Très bien, Bien, Moyen, Fatigué, Stressé)
- Note facultative
- 1 entrée maximum par jour (mise à jour si on ré-enregistre)
- Filtre par humeur
- Suppression / modification
- Export JSON
- Statistiques :
  - Nombre de jours suivis
  - Humeur la plus fréquente
  - Série (streak) de jours consécutifs remplis
- Mode sombre automatique (prefers-color-scheme)

## 🗂 Structure
```
index.html
style.css
app.js
```

## 🚀 Utilisation
Ouvrir simplement `index.html` dans un navigateur moderne.  
Les données restent dans ton navigateur (localStorage). Aucune synchro distante.

## 🧠 Objectifs pédagogiques
- Manipulation du DOM
- Gestion d'événements (formulaire, clic, filtres)
- Stockage local (localStorage)
- Petites statistiques dérivées
- Organisation basique du code

## 🛠 Améliorations possibles
- Graphique (Chart.js ou canvas maison)
- Export CSV
- Stat “% de jours avec humeur positive”
- PWA (manifest + service worker)
- Version React (refactor composants + hooks)
- Synchronisation avec un backend (Plus tard)

---
Projet simple pour progresser étape par étape.