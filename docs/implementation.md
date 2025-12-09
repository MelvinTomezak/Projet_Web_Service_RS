# Implémentation Reddit-like (état actuel)

## Backend (Express + Supabase)
- Routes ajoutées :
  - Auth : `/api/auth/me` (JWT Supabase en Bearer).
  - Subreddits : `POST /subreddits`, `GET /subreddits`, `GET /subreddits/:id`, `GET /subreddits/:id/posts`, `POST /subreddits/:id/posts`.
  - Posts : `GET /posts`, `GET /posts/:id`, `DELETE /posts/:id` (auteur), `POST /posts/:id/vote`.
  - Comments : `GET /posts/:id/comments`, `POST /posts/:id/comments`, `POST /comments/:id/vote`.
- Middlewares : auth JWT Supabase (`requireAuth`), validation Zod (`validate`), CORS/helmet/rate-limit déjà en place.
- Schémas Zod : `subreddit.ts`, `post.ts`, `comment.ts`.
- Supabase : client service role (`src/services/supabase.ts`) ; RLS déjà dans `supabase/schema.sql`.
- Seed SQL : `supabase/seed.sql` (subreddits tech/gaming/news, 3 posts, 2 commentaires, votes). Remplace les UUID users si besoin.

## Frontend (Vite React TS)
- Routage (`react-router-dom`) :
  - `/login` : formulaire auth (signup/login Supabase, redirection vers `/`).
  - `/` : feed global (appels API `GET /posts`, fallback mock).
  - `/r/:slug` : page subreddit (posts du sub via API).
  - `/posts/:id` : détail + commentaires via API.
- Pages : `Home.tsx`, `Subreddit.tsx`, `PostDetail.tsx`, `App.tsx` (auth).
- API client (`src/api.ts`) : fetch vers `VITE_API_URL` (par défaut `http://localhost:4000/api`), envoie le token Supabase s’il existe.
- Styles globaux : `src/styles.css` (fond dark, cartes, layout grid, formulaire auth).
- Données mock (fallback) : `src/data/mock.ts`.

## Variables d’environnement
- Backend `.env` : `PORT`, `CORS_ORIGINS=http://localhost:5173`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`.
- Front `.env.local` : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL=http://localhost:4000/api`.

## Test rapide
1) Backend : `cd backend && npm run dev`.
2) Front : `cd frontend && npm run dev` → http://localhost:5173.
3) Signup/Login (email/password) → redirection vers `/`.
4) Feed : charge les posts via API si dispo, sinon mock.
5) Subreddit/post : navigation via liens `r/{slug}` et posts.

## À faire ensuite
- Relier votes/commentaires côté front (actions POST).
- Gestion membres/roles sub (join/leave, bans) et contrôles RLS avancés.
- Swagger/Doc API à enrichir.

