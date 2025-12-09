# Projet Reddit-like (Express + Supabase + React)

## Aperçu
- Backend : Express/TypeScript, Supabase (Postgres + Auth), Swagger.
- Frontend : Vite + React/TypeScript, client Supabase et API custom.
- Docs & outils : Postman collections, scripts SQL (`supabase/schema.sql` + `supabase/seed.sql`).

## Structure des dossiers
- `backend/` : API Express (src/), config TS, env exemple.
- `frontend/` : SPA React Vite (src/), config TS/Vite.
- `supabase/` : schéma et seed SQL.
- `docs/` : overview, routes, implementation.
- `postman/` : collections + environnement prêts à importer.

## Prérequis
- Node 18+ et npm.
- Un projet Supabase (URL + clés anon/service_role + secret JWT).

## Installation
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Variables d’environnement
- Backend (`backend/.env` à créer depuis `env.example`) :
  - `PORT=4000`
  - `CORS_ORIGINS=http://localhost:5173`
  - `SUPABASE_URL=...`
  - `SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `SUPABASE_JWT_SECRET=...`
- Frontend (`frontend/.env.local`) :
  - `VITE_SUPABASE_URL=...`
  - `VITE_SUPABASE_ANON_KEY=...`
  - `VITE_API_URL=http://localhost:4000/api`

## Lancement en local
```bash
# Backend
cd backend
npm run dev      # http://localhost:4000/api

# Frontend (nouveau terminal)
cd frontend
npm run dev      # http://localhost:5173
```

## Base de données Supabase
1. Exécuter `supabase/schema.sql` (tables, RLS, enums).
2. Exécuter `supabase/seed.sql` (données de test subreddits/posts/comments/votes).
3. Deux utilisateurs de test sont attendus (UUID dans le seed) : adaptez les UUID si vos utilisateurs Supabase diffèrent.

## Tests API
- Importer `postman/reddit-like-full.postman_collection.json` et `postman/reddit-like.postman_environment.json`.
- Renseigner dans l’environnement : `base_url`, `supabase_url`, `supabase_anon_key`, `access_token`.
- Flow : signup/login via Supabase → récupérer `access_token` → appeler `/api/auth/me`, `/api/subreddits`, `/api/posts`, etc.

## Frontend : navigation
- `/login` : inscription/connexion (Supabase email/password).
- `/` : feed global (API ou fallback mock).
- `/r/:slug` : posts d’un subreddit.
- `/posts/:id` : détail + commentaires.
- `/create-subreddit` : création de subreddit.

## Nettoyage / bonnes pratiques
- Les dossiers `dist/` sont générés (backend/ frontend/) : ignorés par git ; supprimez-les en local si besoin de repartir propre.
- Ne pas versionner les `.env` ; utiliser les exemples fournis.
- Utiliser les schémas Zod pour valider les entrées ; ne pas modifier `req.params`/`req.query` directement (Express 5).

## Raccourcis utiles
- Backend lint/build : `npm run lint`, `npm run build`.
- Frontend build : `npm run build` (Vite).
- Swagger : `http://localhost:4000/api/docs`.

## Points d’attention connus
- Création de subreddit : nom unique (erreur `duplicate key ... communities_name_key` si déjà présent, ex. `tech`).
- UUID requis dans les routes : fournir des IDs valides issus des réponses API ou du seed.

