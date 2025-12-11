# Reddit-like Social Network

Un réseau social de type Reddit développé avec Express.js, React, TypeScript et Supabase. Cette application permet aux utilisateurs de créer des communautés (subreddits), de publier du contenu, de commenter et de voter sur les publications.

## 🎯 À propos du projet

Ce projet est une application web complète qui reproduit les fonctionnalités principales de Reddit :
- **Communautés (Subreddits)** : Création et gestion de communautés thématiques
- **Publications** : Partage de contenu textuel ou avec images
- **Interactions** : Système de commentaires et de votes (upvote/downvote)
- **Gestion des rôles** : Système d'administration avec gestion des utilisateurs
- **Authentification sécurisée** : Connexion et inscription via Supabase Auth

### Objectifs du projet

- Démonstration d'une architecture full-stack moderne
- Implémentation de bonnes pratiques de sécurité (validation, CORS, Helmet)
- Gestion des rôles et permissions (RBAC)
- Interface utilisateur intuitive et responsive
- Documentation complète (Swagger, Postman, README)

### Technologies clés

- **Backend** : Express.js + TypeScript + Supabase
- **Frontend** : React 18 + Vite + TypeScript
- **Base de données** : PostgreSQL (via Supabase) avec Row Level Security
- **Sécurité** : JWT, Zod validation, Helmet, CORS
- **Tests** : Jest + React Testing Library
- **Documentation** : Swagger/OpenAPI

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Postman Collections](#postman-collections)
- [Frontend Routes](#frontend-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Troubleshooting](#troubleshooting)

## 🎯 Vue d'ensemble

Ce projet est une plateforme de réseau social de type Reddit où les utilisateurs peuvent :

### Fonctionnalités utilisateur
- **Créer et gérer des subreddits** : Créer des communautés publiques ou privées
- **Publier du contenu** : Créer des posts textuels ou avec images dans les subreddits
- **Commenter** : Ajouter des commentaires sous les publications
- **Voter** : Upvote/downvote sur les posts pour les classer par popularité
- **Gérer son profil** : Modifier son nom d'utilisateur
- **Supprimer son contenu** : Supprimer ses propres posts et commentaires

### Fonctionnalités administrateur
- **Gestion des utilisateurs** : Modifier les rôles (admin/member)
- **Modération** : Supprimer n'importe quel post, commentaire ou subreddit
- **Panneau d'administration** : Interface dédiée pour la gestion

### Fonctionnalités techniques
- **Authentification sécurisée** : JWT avec Supabase Auth
- **Validation des données** : Zod pour valider toutes les entrées
- **Sécurité HTTP** : Helmet pour protéger contre les vulnérabilités web
- **CORS configuré** : Communication sécurisée entre frontend et backend
- **Documentation API** : Swagger/OpenAPI pour tester les endpoints
- **Tests automatisés** : Suite de tests Jest pour le frontend

## 🏗️ Architecture

### Backend (Express.js + TypeScript)

Le backend est une API REST construite avec Express.js et TypeScript, offrant :

- **API RESTful** : Endpoints structurés pour toutes les fonctionnalités
- **Validation Zod** : Toutes les données entrantes sont validées avec des schémas Zod
- **Authentification JWT** : Vérification des tokens Supabase pour sécuriser les routes
- **Sécurité** : 
  - Helmet pour les en-têtes HTTP sécurisés
  - CORS pour contrôler les origines autorisées
  - Rate limiting pour prévenir les abus
- **Documentation Swagger** : Interface interactive pour tester l'API
- **Gestion d'erreurs** : Middleware centralisé pour les erreurs
- **Logging** : Pino pour les logs structurés

**Pour en savoir plus** : Voir [`backend/README.md`](backend/README.md) pour une explication détaillée de Zod, Helmet et CORS.

### Frontend (React + TypeScript + Vite)

Le frontend est une Single Page Application (SPA) moderne :

- **React 18** : Framework UI avec hooks et composants fonctionnels
- **TypeScript** : Typage statique pour une meilleure maintenabilité
- **Vite** : Build tool rapide pour le développement et la production
- **React Router** : Navigation côté client entre les pages
- **Supabase Client** : Gestion de l'authentification et de la session
- **Tests Jest** : Suite de tests pour tous les composants principaux
- **Styling CSS** : Styles modulaires et responsive

**Pour en savoir plus** : Voir [`frontend/src/test/README.md`](frontend/src/test/README.md) pour la documentation des tests.

### Base de données (Supabase PostgreSQL)

- **PostgreSQL** : Base de données relationnelle robuste
- **Row Level Security (RLS)** : Sécurité au niveau des lignes pour contrôler l'accès aux données
- **Triggers automatiques** : Attribution automatique du rôle "member" aux nouveaux utilisateurs
- **Schéma structuré** : Tables pour users, subreddits, posts, comments, votes
- **Seed data** : Données de test pour démarrer rapidement

**Pour en savoir plus** : Voir [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) pour le schéma complet de la base de données.

## ✨ Features

### User Features
- User registration and authentication
- Profile management (username)
- Create and join subreddits
- Create posts (text/image)
- Comment on posts
- Vote on posts (upvote/downvote)
- Delete own posts/comments

### Admin Features
- User role management (admin/member)
- Delete any post/comment/subreddit
- Access admin panel

### Subreddit Features
- Create public/private subreddits
- View posts by subreddit
- Post sorting by score (votes)
- Subreddit ownership and management

## 🛠️ Tech Stack

### Backend
- Node.js 18+
- Express.js
- TypeScript
- Supabase JS Client
- Zod (validation)
- Swagger/OpenAPI
- Pino (logging)
- Helmet (security)
- Express Rate Limit

### Frontend
- React 18
- TypeScript
- Vite
- React Router DOM
- Supabase JS Client
- Jest
- React Testing Library

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Database triggers for automatic role assignment

## 📁 Project Structure

```
ProjetWebServices/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── docs/             # Swagger documentation
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/           # API route handlers
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Supabase client
│   │   ├── types/            # TypeScript types
│   │   └── index.ts          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── test/             # Jest tests
│   │   ├── utils/            # Utility functions
│   │   ├── api.ts            # API client
│   │   ├── App.tsx           # Auth component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   └── .env.local
├── supabase/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Seed data
├── postman/
│   ├── reddit-like-complete.postman_collection.json
│   ├── reddit-like-complete.postman_environment.json
│   └── README.md                    # Guide d'utilisation Postman
├── backend/
│   └── README.md                    # Documentation backend (Zod, Helmet, CORS)
├── docs/
│   └── DOCUMENTATION.md      # Technical documentation
└── README.md
```

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)
- Git

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ProjetWebServices
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create `backend/.env` from `backend/.env.example`:

```env
PORT=4000
CORS_ORIGINS=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Frontend Configuration

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000/api
```

## 🏃 Running the Application

### Backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`
- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/docs`

### Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🗄️ Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run Schema**
   - Open Supabase SQL Editor
   - Execute `supabase/schema.sql`
   - This creates all tables, enums, RLS policies, and triggers

3. **Seed Data** (Optional)
   - Execute `supabase/seed.sql` in SQL Editor
   - Creates sample subreddits, posts, comments, and users

## 📚 API Documentation

### Swagger UI

Once the backend is running, visit:
```
http://localhost:4000/docs
```

### API Endpoints

#### Health
- `GET /api/health` - Health check

#### Authentication
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/profile` - Update username (requires auth)

#### Subreddits
- `GET /api/subreddits` - List all subreddits
- `GET /api/subreddits/:id` - Get subreddit by ID
- `GET /api/subreddits/slug/:slug` - Get subreddit by slug
- `GET /api/subreddits/:id/posts` - Get posts in subreddit
- `POST /api/subreddits` - Create subreddit (requires auth)
- `POST /api/subreddits/:id/posts` - Create post in subreddit (requires auth)
- `GET /api/subreddits/:id/me` - Get user's role in subreddit (requires auth)
- `DELETE /api/subreddits/:id` - Delete subreddit (owner/admin only)

#### Posts
- `GET /api/posts` - Global posts feed
- `GET /api/posts/:id` - Get post detail
- `POST /api/posts/:id/vote` - Vote on post (requires auth)
- `DELETE /api/posts/:id` - Delete post (author/admin only)

#### Comments
- `GET /api/posts/:id/comments` - List comments for a post
- `POST /api/posts/:id/comments` - Create comment (requires auth)
- `DELETE /api/comments/:id` - Delete comment (author/admin only)

#### Admin
- `GET /api/admin/users` - List users with roles (admin only)
- `POST /api/admin/users/:id/role` - Set user role (admin only)

## 🧪 Testing

### Tests Frontend

Les tests sont écrits avec Jest et React Testing Library pour garantir la qualité du code.

```bash
cd frontend
npm test
```

**Fichiers de tests** dans `frontend/src/test/` :
- `Home.test.tsx` - Tests de la page d'accueil
- `Subreddit.test.tsx` - Tests de la page subreddit
- `PostDetail.test.tsx` - Tests de la page détail post
- `CreatePost.test.tsx` - Tests du formulaire de création de post
- `CreateSubreddit.test.tsx` - Tests du formulaire de création de subreddit
- `AdminUsers.test.tsx` - Tests de la page admin
- `App.test.tsx` - Tests de l'authentification

**Documentation complète** : Voir [`frontend/src/test/README.md`](frontend/src/test/README.md) pour une explication détaillée de tous les tests.

## 📮 Collections Postman

Une collection Postman complète est fournie pour tester toutes les fonctionnalités de l'API.

### Import

1. Ouvrir Postman
2. Importer `postman/reddit-like-complete.postman_collection.json`
3. Importer `postman/reddit-like-complete.postman_environment.json`
4. Sélectionner l'environnement "Reddit-like Complete Environment"

### Workflow automatique

La collection suit un workflow séquentiel complet :
1. **Connexion admin** → Sauvegarde automatique du token
2. **Création de subreddit** → Sauvegarde de l'ID
3. **Création de post** → Sauvegarde de l'ID
4. **Création de commentaire** → Sauvegarde de l'ID
5. **Upvote sur le post**
6. **Suppression du post**

Toutes les variables sont automatiquement sauvegardées par les scripts de test Postman.

**Documentation complète** : Voir [`postman/README.md`](postman/README.md) pour le guide d'utilisation détaillé.

## 🎨 Frontend Routes

- `/login` - Authentication page (sign in/sign up)
- `/` - Home page (global feed)
- `/r/:slug` - Subreddit page (posts in subreddit)
- `/posts/:id` - Post detail page (with comments)
- `/create-subreddit` - Create new subreddit
- `/create-post` - Create new post
- `/admin` - Admin panel (admin only)

## 🔐 Authentication & Authorization

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Supabase returns JWT `access_token`
3. Frontend stores token in session
4. Token sent as `Authorization: Bearer <token>` header
5. Backend validates token using `SUPABASE_JWT_SECRET`

### Role-Based Access Control (RBAC)

- **Default Role**: All new users get "member" role automatically
- **Admin Role**: Can be assigned via admin panel
- **Permissions**:
  - Members: Create posts/comments, delete own content
  - Admins: All member permissions + delete any content, manage users

### Database Triggers

- `trg_auth_user_profile`: Creates profile when user signs up
- `trg_profiles_default_role`: Assigns "member" role to new profiles

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Ensure `SUPABASE_JWT_SECRET` matches your Supabase project
   - Regenerate token by logging in again

2. **"Foreign key constraint" errors**
   - Ensure seed data uses valid UUIDs from `auth.users`
   - Run schema.sql before seed.sql

3. **CORS errors**
   - Check `CORS_ORIGINS` in backend `.env`
   - Ensure frontend URL matches

4. **"No parameters" in Swagger**
   - Refresh the Swagger page
   - Ensure route has `@openapi` documentation with `parameters` section

5. **Tests failing**
   - Run `npm install` in frontend
   - Ensure all mocks are properly configured

## 📚 Documentation supplémentaire

- **[Documentation technique](docs/DOCUMENTATION.md)** : Architecture détaillée, schéma de base de données, sécurité
- **[Documentation backend](backend/README.md)** : Explication de Zod, Helmet, CORS en français
- **[Documentation des tests](frontend/src/test/README.md)** : Guide complet de tous les tests
- **[Guide Postman](postman/README.md)** : Utilisation de la collection Postman

## 🎓 Apprentissages et bonnes pratiques

Ce projet démontre :

- ✅ **Architecture full-stack moderne** : Séparation backend/frontend
- ✅ **Sécurité** : Validation, authentification JWT, en-têtes HTTP sécurisés
- ✅ **TypeScript** : Typage statique pour réduire les erreurs
- ✅ **Tests automatisés** : Couverture de tests pour le frontend
- ✅ **Documentation** : Swagger, Postman, README complets
- ✅ **Gestion des rôles** : RBAC avec Supabase et middleware Express
- ✅ **Validation des données** : Zod pour sécuriser les entrées
- ✅ **Gestion d'erreurs** : Middleware centralisé et messages clairs

## 📝 License

Ce projet est à des fins éducatives.

## 🤝 Contribution

1. Fork le repository
2. Créer une branche feature
3. Faire vos modifications
4. Ajouter des tests
5. Soumettre une pull request

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
