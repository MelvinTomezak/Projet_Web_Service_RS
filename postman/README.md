# Postman Collection - Reddit-like Complete Workflow

## 📦 Fichiers

- **Collection**: `reddit-like-complete.postman_collection.json`
- **Environment**: `reddit-like-complete.postman_environment.json`

## 🚀 Installation

1. Ouvrir Postman
2. Cliquer sur **Import** (en haut à gauche)
3. Importer les deux fichiers :
   - `reddit-like-complete.postman_collection.json`
   - `reddit-like-complete.postman_environment.json`
4. Sélectionner l'environnement **"Reddit-like Complete Environment"** dans le menu déroulant en haut à droite

## ⚙️ Configuration

### Variables d'environnement

L'environnement contient les variables suivantes :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `base_url` | URL de l'API backend | `http://localhost:4000/api` |
| `supabase_url` | URL du projet Supabase | `https://dcppfoqzklloarpuigci.supabase.co` |
| `supabase_anon_key` | Clé API anonyme Supabase (requis pour login) | *(déjà configuré)* |
| `admin_email` | Email de l'utilisateur admin | `email+demo@domaine.com` |
| `admin_password` | Mot de passe admin | `Test123` |
| `access_token` | Token JWT (auto-rempli) | *(vide au départ)* |
| `user_id` | ID de l'utilisateur (auto-rempli) | *(vide au départ)* |
| `subreddit_id` | ID du subreddit (auto-rempli) | *(vide au départ)* |
| `subreddit_slug` | Slug du subreddit (auto-rempli) | *(vide au départ)* |
| `post_id` | ID du post (auto-rempli) | *(vide au départ)* |
| `comment_id` | ID du commentaire (auto-rempli) | *(vide au départ)* |

### Personnalisation

Modifiez les variables dans Postman si nécessaire :
- `admin_email` et `admin_password` : vos identifiants admin
- `base_url` : si votre backend tourne sur un autre port
- `supabase_url` : votre URL Supabase

## 📋 Workflow

La collection suit un workflow séquentiel :

### 1. Auth - Login (Supabase)
- Se connecte avec les identifiants admin
- **Sauvegarde automatiquement** : `access_token`, `user_id`

### 2. Auth - Get Current User
- Vérifie l'authentification
- Affiche les rôles de l'utilisateur

### 3. Subreddits - List
- Liste tous les subreddits disponibles
- Vous pouvez utiliser un subreddit existant ou en créer un nouveau

### 4. Subreddits - Create
- Crée un nouveau subreddit avec un nom unique (timestamp)
- **Sauvegarde automatiquement** : `subreddit_id`, `subreddit_slug`

### 5. Posts - Create in Subreddit
- Crée un post dans le subreddit
- **Sauvegarde automatiquement** : `post_id`

### 6. Posts - Get Detail
- Récupère les détails du post créé

### 7. Comments - Create
- Crée un commentaire sur le post
- **Sauvegarde automatiquement** : `comment_id`

### 8. Comments - List
- Liste tous les commentaires du post

### 9. Posts - Upvote
- Vote +1 sur le post
- Utilisez `-1` pour downvote, `0` pour retirer le vote

### 10. Posts - Get Detail (After Vote)
- Vérifie le score du post après le vote

### 11. Posts - Delete
- Supprime le post (admin ou auteur uniquement)

### 12. Posts - Verify Deletion
- Vérifie que le post a bien été supprimé (devrait retourner 404)

## 🔄 Exécution automatique

Vous pouvez exécuter toute la collection automatiquement :

1. Cliquez sur la collection **"Reddit-like Complete Workflow"**
2. Cliquez sur **"Run"** (en haut à droite)
3. Cliquez sur **"Run Reddit-like Complete Workflow"**
4. Toutes les requêtes s'exécutent dans l'ordre

## 📝 Notes

- Les scripts de test sauvegardent automatiquement les IDs dans les variables d'environnement
- Chaque requête utilise les variables précédemment définies
- Le workflow est conçu pour être exécuté de manière séquentielle
- Les requêtes 4, 5, 7, 9, 11 nécessitent une authentification (Bearer token)

## 🐛 Dépannage

### "No API key found in request" (Supabase)
- Vérifiez que `supabase_anon_key` est bien rempli dans l'environnement
- La clé est déjà configurée par défaut, mais vérifiez qu'elle est activée

### "Invalid token" ou "Missing token"
- Vérifiez que la requête 1 (Login) a bien été exécutée et a réussi
- Vérifiez que `access_token` est bien rempli dans l'environnement
- Ouvrez la console Postman (View → Show Postman Console) pour voir les messages de sauvegarde

### "Post not found"
- Vérifiez que la requête 5 (Create Post) a bien été exécutée
- Vérifiez que `post_id` est bien rempli dans l'environnement

### "Subreddit not found"
- Vérifiez que la requête 4 (Create Subreddit) a bien été exécutée
- Vérifiez que `subreddit_id` est bien rempli dans l'environnement

### Variables non sauvegardées
- Vérifiez que les scripts de test sont activés dans les requêtes
- Vérifiez que l'environnement est bien sélectionné

