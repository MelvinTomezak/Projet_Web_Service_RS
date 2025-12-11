# Backend - Documentation Technique

Ce document explique les technologies et outils utilisés dans le backend de l'application Reddit-like.

## 📚 Outils et Bibliothèques

### 🔒 Zod - Validation de Schémas

**Qu'est-ce que Zod ?**

Zod est une bibliothèque TypeScript-first pour la validation de schémas. Elle permet de définir la structure et les contraintes des données, puis de valider automatiquement les entrées utilisateur.

**Pourquoi l'utiliser ?**

1. **Sécurité** : Valide toutes les données entrantes avant traitement
2. **Type Safety** : Génère automatiquement des types TypeScript à partir des schémas
3. **Messages d'erreur clairs** : Fournit des erreurs détaillées en cas de validation échouée
4. **Prévention des bugs** : Détecte les erreurs de données avant qu'elles n'atteignent la logique métier

**Comment ça fonctionne dans notre projet ?**

Dans notre application, Zod est utilisé pour :

1. **Valider les requêtes HTTP** (body, query, params)
2. **Définir les schémas de validation** dans `backend/src/schemas/`
3. **Middleware de validation** dans `backend/src/middleware/validate.ts`

**Exemple d'utilisation :**

```typescript
// Définition d'un schéma Zod
import { z } from "zod";

const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    type: z.enum(["text", "link", "image"]),
    is_private: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID"),
  }),
});

// Utilisation dans une route
router.post(
  "/subreddits/:id/posts",
  requireAuth,
  validate(createPostSchema), // ← Validation automatique
  async (req, res) => {
    // req.body est maintenant typé et validé
    const { title, content } = req.body;
    // ...
  }
);
```

**Avantages dans notre projet :**

- ✅ Toutes les routes protégées par validation
- ✅ Erreurs de validation standardisées
- ✅ Types TypeScript automatiques
- ✅ Protection contre les injections et données malformées

---

### 🛡️ Helmet - Sécurité HTTP

**Qu'est-ce que Helmet ?**

Helmet est un middleware Express qui aide à sécuriser les applications en définissant divers en-têtes HTTP de sécurité. Il protège contre les vulnérabilités web courantes.

**Pourquoi l'utiliser ?**

1. **Protection XSS** : Empêche les attaques Cross-Site Scripting
2. **Protection Clickjacking** : Empêche l'intégration malveillante de votre site
3. **HTTPS Enforcement** : Force l'utilisation de HTTPS en production
4. **Content Security Policy** : Contrôle quelles ressources peuvent être chargées
5. **Masquage de la technologie** : Cache les informations sur le serveur utilisé

**Comment ça fonctionne dans notre projet ?**

Helmet est configuré dans `backend/src/app.ts` et s'applique automatiquement à toutes les requêtes :

```typescript
import helmet from "helmet";

app.use(helmet());
```

**En-têtes de sécurité ajoutés :**

- `X-Content-Type-Options: nosniff` - Empêche le MIME-sniffing
- `X-Frame-Options: SAMEORIGIN` - Protection contre le clickjacking
- `X-XSS-Protection: 0` - Désactive la protection XSS obsolète du navigateur (remplacée par CSP)
- `Strict-Transport-Security` - Force HTTPS
- `Content-Security-Policy` - Contrôle les ressources chargées
- Et bien d'autres...

**Exemple de protection :**

Sans Helmet, un attaquant pourrait :
- Intégrer votre site dans un iframe malveillant
- Exploiter des vulnérabilités XSS
- Forcer le navigateur à interpréter incorrectement le contenu

Avec Helmet, ces attaques sont bloquées au niveau des en-têtes HTTP.

**Avantages dans notre projet :**

- ✅ Protection automatique contre les vulnérabilités courantes
- ✅ Configuration simple (une seule ligne)
- ✅ Meilleures pratiques de sécurité appliquées par défaut
- ✅ Conformité aux standards de sécurité web

---

### 🌐 CORS - Cross-Origin Resource Sharing

**Qu'est-ce que CORS ?**

CORS (Cross-Origin Resource Sharing) est un mécanisme de sécurité des navigateurs qui contrôle quels domaines peuvent accéder aux ressources de votre API. Par défaut, les navigateurs bloquent les requêtes entre différents domaines (origines).

**Pourquoi l'utiliser ?**

1. **Sécurité** : Empêche les sites malveillants d'accéder à votre API
2. **Flexibilité** : Permet à votre frontend (sur un autre port/domaine) d'accéder à l'API
3. **Contrôle d'accès** : Définit précisément quels domaines sont autorisés

**Comment ça fonctionne dans notre projet ?**

CORS est configuré dans `backend/src/app.ts` :

```typescript
import cors from "cors";

app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "http://localhost:5173",
    credentials: true, // Permet l'envoi de cookies/credentials
  })
);
```

**Configuration actuelle :**

- **Origines autorisées** : Définies via la variable d'environnement `CORS_ORIGINS`
- **Par défaut** : `http://localhost:5173` (port Vite par défaut)
- **Credentials** : Activés pour permettre l'envoi de tokens d'authentification

**Comment ça marche ?**

1. **Requête du navigateur** : Le frontend fait une requête à `http://localhost:4000/api/posts`
2. **Vérification CORS** : Le backend vérifie si `http://localhost:5173` est dans la liste des origines autorisées
3. **Réponse avec en-têtes CORS** :
   ```
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   ```
4. **Autorisation** : Le navigateur autorise la requête si l'origine est valide

**Scénarios :**

✅ **Autorisé** : Frontend sur `localhost:5173` → API sur `localhost:4000`
❌ **Bloqué** : Site malveillant sur `evil.com` → API sur `localhost:4000` (si non autorisé)

**Avantages dans notre projet :**

- ✅ Frontend et backend peuvent communiquer malgré des ports différents
- ✅ Protection contre les requêtes non autorisées
- ✅ Configuration flexible via variables d'environnement
- ✅ Support des credentials (tokens d'authentification)

---

## 🔗 Intégration dans le Projet

Ces trois outils travaillent ensemble pour sécuriser l'application :

```
Requête HTTP
    ↓
[CORS] ← Vérifie l'origine autorisée
    ↓
[Helmet] ← Ajoute les en-têtes de sécurité
    ↓
[Zod Validation] ← Valide les données
    ↓
[Route Handler] ← Traite la requête
    ↓
Réponse sécurisée
```

**Ordre d'exécution :**

1. **CORS** vérifie d'abord si la requête provient d'une origine autorisée
2. **Helmet** ajoute les en-têtes de sécurité à la réponse
3. **Zod** valide les données avant qu'elles n'atteignent la logique métier

## 📖 Ressources

- [Documentation Zod](https://zod.dev/)
- [Documentation Helmet](https://helmetjs.github.io/)
- [Documentation CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Vulnérabilités web courantes

## ⚙️ Configuration

Toutes ces configurations sont dans :
- **Zod** : `backend/src/schemas/*.ts` et `backend/src/middleware/validate.ts`
- **Helmet** : `backend/src/app.ts`
- **CORS** : `backend/src/app.ts` et `backend/.env` (variable `CORS_ORIGINS`)

