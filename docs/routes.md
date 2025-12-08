# Routes API (Reddit-like)

Préfixe : `/api`

## Santé
- `GET /health` — statut service.

## Auth / Profil
- `GET /auth/me` — profil courant.
- `PUT /auth/me` — mise à jour profil (username, bio, avatar_url).
- `POST /auth/me/avatar` — upload avatar (Supabase Storage), retourne l’URL.

## Subredit
- `POST /communities` — créer un subredit (owner).
- `GET /communities` — lister/rechercher (filtre `q`, pagination).
- `GET /communities/:id` — détail.
- `POST /communities/:id/join` — rejoindre.
- `POST /communities/:id/leave` — quitter.
- `GET /communities/:id/members` — lister membres (mod/owner).
- `POST /communities/:id/ban/:userId` — bannir (mod/owner).
- `DELETE /communities/:id/ban/:userId` — débannir (mod/owner).

## Posts
- `POST /communities/:id/posts` — créer un post (text/link/image).
- `GET /communities/:id/posts` — feed communauté (tri/pagination).
- `GET /posts/:id` — détail.
- `DELETE /posts/:id` — supprimer (auteur ou mod/owner).
- `POST /posts/:id/vote` — vote `{ value: -1 | 0 | 1 }`.

## Commentaires
- `POST /posts/:id/comments` — créer un commentaire (parent_id optionnel).
- `GET /posts/:id/comments` — lister (arbre/flat).
- `DELETE /comments/:id` — supprimer (auteur ou mod/owner).
- `POST /comments/:id/vote` — vote `{ value: -1 | 0 | 1 }`.

## Modération / Admin
- `POST /posts/:id/lock` — verrouiller un post (mod/owner).
- `POST /posts/:id/unlock` — déverrouiller (mod/owner).
- (optionnel) `GET /admin/users`, `POST /admin/users/:id/ban` si admin global.

## Notifications (optionnel)
- `GET /notifications`
- `POST /notifications/mark-read`

## Sockets / Realtime (si activé)
- Rooms `community:<id>` pour nouveaux posts.
- Rooms `post:<id>` pour nouveaux commentaires.
- Room `user:<id>` pour notifications perso.

