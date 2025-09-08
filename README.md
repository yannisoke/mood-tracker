# Mood Tracker FR

Petit journal d'humeur quotidien : une entrée par jour (humeur + note facultative), stockage local (localStorage). Projet d'apprentissage HTML/CSS/JS sans backend.

## ✨ Fonctionnalités
- Sélection d'une humeur (Très bien, Bien, Moyen, Fatigué, Stressé)
- Note facultative
- 1 entrée maximum par jour (mise à jour si on ré-enregistre)
- Filtre par humeur
- Suppression / modification
- Export JSON et CSV
- Graphique de tendance des humeurs
- Statistiques :
  - Nombre de jours suivis
  - Humeur la plus fréquente
  - Pourcentage d'humeurs positives
  - Série (streak) de jours consécutifs remplis
- Mode sombre automatique (prefers-color-scheme)
- PWA (application web progressive) installable

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
- Notifications de rappel quotidien
- Import de données (pour restaurer un export)
- Stat “% de jours avec humeur positive”
- Annotation d'événements spéciaux
- Thèmes de couleurs personnalisables
- Version React (refactor composants + hooks)
- Synchronisation avec un backend (Plus tard)

---
Projet simple pour progresser étape par étape.