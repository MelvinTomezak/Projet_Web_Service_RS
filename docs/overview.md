# Vue d’ensemble du projet Reddit-like (Backend + Frontend + Supabase)

## Backend (Express/TS)
- Auth : middleware `requireAuth` vérifie le JWT Supabase (Authorization: Bearer). Route `/api/auth/me`.
- Sécurité : helmet, CORS (origins depuis `.env`), rate-limit, validation Zod (`validate`).
- Routes :
  - Subreddits : créer (`POST /subreddits`), lister/détail (`GET /subreddits`, `/subreddits/:id`, `/subreddits/slug/:name`), posts d’un sub (`GET /subreddits/:id/posts`), créer un post dans un sub (`POST /subreddits/:id/posts`), join/leave, liste membres (owner/mod), changement de rôle (owner), update sub (owner).
  - Posts : feed global (`GET /posts`), détail (`GET /posts/:id`), suppression auteur (`DELETE /posts/:id`), vote (`POST /posts/:id/vote` → recalcule le score).
  - Comments : lister/ajouter (`/posts/:id/comments`), voter (`/comments/:id/vote`).
- Swagger : `/docs` (annotations @openapi dans les routes), `/docs/openapi.json`.
- Supabase : client service role (`src/services/supabase.ts`), schéma cible dans `supabase/schema.sql`.
- Build/serve : `npm run dev` (ts-node-dev), `npm run build` → dist, `npm start`.

## Frontend (Vite/React/TS)
- Routage : `react-router-dom` avec `/login`, `/` (feed), `/r/:slug`, `/posts/:id`, `/create-subreddit`.
- Auth : page `/login` (signup/login Supabase), redirection vers `/` après login, bouton logout (retour /login avec message).
- Layout : `Shell` avec topbar, flash message, styles globaux (`src/styles.css`) thème sombre.
- Pages :
  - Home : feed global, fallback mock si API KO, affichage images, score.
  - Subreddit : liste des posts du sub, création de post (texte + URL d’image optionnelle), score.
  - PostDetail : détail post + commentaires (lecture), image éventuelle, score.
  - CreateSubreddit : formulaire de création (owner auto).
- API client : `src/api.ts` envoie le token Supabase si présent, base `VITE_API_URL` (défaut `http://localhost:4000/api`).
- Mocks : `src/data/mock.ts` comme fallback.
- Build : `npm run dev`, `npm run build`, `npm run preview`.

## Supabase (DB/Auth)
- Schéma cible : `supabase/schema.sql` (subreddits, sub_members, posts, comments, votes, roles globaux).
- Seed : `supabase/seed.sql` (création tables si manquantes, rename community_id→subreddit_id si besoin, inserts subreddits/posts/comments/votes, owners/mods alice/bob). Remplacer/ajouter vos `auth.users.id` si besoin.
- Auth : désactivation possible de la confirmation email pour les tests (dashboard).

## Variables d’environnement
- Backend `.env` : `PORT`, `CORS_ORIGINS`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`.
- Front `.env.local` : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=http://localhost:4000/api`.

## Flux d’usage
1) Lancer backend (`npm run dev`), front (`npm run dev`).
2) Signup/login sur `/login`, redirection vers `/`.
3) Créer un subreddit (`/create-subreddit`), créer des posts (texte/image), voter (backend gère le score), voir détail post/commentaires.
4) Gérer les membres/roles sub via les routes protégées (owner/mod) ou via l’API.

## Points restants / extensions possibles
- Brancher côté front les actions de vote et commentaires (actuellement lecture, vote côté backend prêt).
- Ajouter gestion join/leave depuis l’UI.
- Enrichir Swagger (schémas d’inputs/outputs) et tests end-to-end.




