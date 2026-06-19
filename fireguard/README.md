# FireGuard — Interface React

Interface web pour l'application de détection d'incendies FireGuard (EfficientNet-B1 via Django REST).

## Structure des fichiers

```
fireguard/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Analyze.jsx      # Upload image + prédiction
│   │   ├── History.jsx      # Historique paginé + filtres
│   │   ├── Dashboard.jsx    # Stats + graphiques
│   │   └── Health.jsx       # Statut API + modèle
│   ├── services/
│   │   ├── api.js           # Appels vers Django REST
│   │   └── wilayas.js       # Liste des 58 wilayas
│   ├── App.jsx              # Sidebar + navigation
│   ├── index.css            # Styles globaux (thème sombre)
│   └── index.js             # Point d'entrée React
├── .env.example
└── package.json
```

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Lancer en développement (proxy vers Django sur :8000)
npm start
```

## Configuration CORS dans Django

Ajoutez dans `settings.py` :

```python
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE.insert(0, 'corsheaders.middleware.CorsMiddleware')

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",   # React dev server
]
# En production, remplacez par votre domaine
```

```bash
pip install django-cors-headers
```

## Build production

```bash
npm run build
# Les fichiers statiques sont dans build/
# Vous pouvez les servir avec Django (WhiteNoise) ou un serveur Nginx
```

## Fonctionnalités

| Page        | Endpoint Django          | Description                          |
|-------------|--------------------------|--------------------------------------|
| Analyser    | POST /api/predict/       | Upload image, wilaya, notes → résultat |
| Historique  | GET  /api/history/       | Liste paginée, filtres label/wilaya  |
| Dashboard   | GET  /api/stats/         | Graphiques 7 jours, répartition      |
| Santé API   | GET  /api/health/        | Statut modèle, GPU/CPU, framework    |
