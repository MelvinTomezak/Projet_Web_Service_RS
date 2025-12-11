# Technical Documentation

## Architecture Overview

This document provides detailed technical information about the Reddit-like social network application.

## Backend Architecture

### Express.js Server

The backend is built with Express.js and TypeScript, following a modular route-based architecture.

#### Entry Point
- `backend/src/index.ts`: Initializes Express app, middleware, routes, and Swagger

#### Middleware Stack
1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Express Rate Limit**: Rate limiting
4. **Body Parser**: JSON parsing
5. **Error Handler**: Centralized error handling
6. **Auth Middleware**: JWT verification (`requireAuth`)
7. **Validation Middleware**: Zod schema validation

#### Route Modules

##### Health (`/api/health`)
- `GET /health`: Health check endpoint

##### Authentication (`/api/auth`)
- `GET /auth/me`: Get current user with roles
- `POST /auth/profile`: Update username

##### Subreddits (`/api/subreddits`)
- `GET /subreddits`: List all subreddits
- `GET /subreddits/:id`: Get subreddit by ID
- `GET /subreddits/slug/:slug`: Get subreddit by slug
- `GET /subreddits/:id/posts`: List posts in subreddit (ordered by score)
- `POST /subreddits`: Create subreddit
- `POST /subreddits/:id/posts`: Create post in subreddit
- `GET /subreddits/:id/me`: Get user's role in subreddit
- `DELETE /subreddits/:id`: Delete subreddit (owner/admin)

##### Posts (`/api/posts`)
- `GET /posts`: Global feed
- `GET /posts/:id`: Post detail
- `POST /posts/:id/vote`: Vote on post (-1, 0, 1)
- `DELETE /posts/:id`: Delete post (author/admin)

##### Comments (`/api/posts/:id/comments`)
- `GET /posts/:id/comments`: List comments
- `POST /posts/:id/comments`: Create comment
- `DELETE /comments/:id`: Delete comment (author/admin)

##### Admin (`/api/admin`)
- `GET /admin/users`: List users with roles (admin only)
- `POST /admin/users/:id/role`: Set user role (admin only)

### Authentication Flow

1. **Client-side**: User authenticates via Supabase Auth
2. **Token Storage**: JWT stored in Supabase session
3. **API Requests**: Token sent as `Authorization: Bearer <token>`
4. **Backend Verification**: Middleware verifies token using `SUPABASE_JWT_SECRET`
5. **User Context**: User ID and roles attached to `req.user`

### Database Schema

#### Tables

**profiles**
- `id` (UUID, FK to auth.users)
- `username` (TEXT, nullable)
- `created_at` (TIMESTAMP)

**roles**
- `id` (SERIAL, PK)
- `name` (TEXT, unique: 'admin', 'member')

**user_roles**
- `user_id` (UUID, FK to profiles)
- `role_id` (INT, FK to roles)

**subreddits**
- `id` (UUID, PK)
- `name` (TEXT, unique, slug)
- `description` (TEXT, nullable)
- `is_private` (BOOLEAN)
- `created_at` (TIMESTAMP)

**sub_members**
- `user_id` (UUID, FK to profiles)
- `subreddit_id` (UUID, FK to subreddits)
- `role` (ENUM: 'owner', 'mod', 'member')
- `created_at` (TIMESTAMP)
- Primary key: (user_id, subreddit_id)

**posts**
- `id` (UUID, PK)
- `subreddit_id` (UUID, FK to subreddits)
- `author_id` (UUID, FK to profiles)
- `title` (TEXT)
- `content` (TEXT)
- `type` (TEXT: 'text', 'link', 'image')
- `media_urls` (TEXT[], nullable)
- `created_at` (TIMESTAMP)

**post_votes**
- `user_id` (UUID, FK to profiles)
- `post_id` (UUID, FK to posts)
- `value` (INT: -1, 1)
- Primary key: (user_id, post_id)

**comments**
- `id` (UUID, PK)
- `post_id` (UUID, FK to posts)
- `author_id` (UUID, FK to profiles)
- `content` (TEXT)
- `parent_id` (UUID, FK to comments, nullable)
- `created_at` (TIMESTAMP)

**comment_votes**
- `user_id` (UUID, FK to profiles)
- `comment_id` (UUID, FK to comments)
- `value` (INT: -1, 1)
- Primary key: (user_id, comment_id)

#### Row Level Security (RLS)

RLS policies enforce:
- Public read access to profiles, subreddits, posts, comments
- Write access only to authenticated users
- Delete access to authors or admins
- Private subreddit access restricted to members

#### Database Triggers

1. **trg_auth_user_profile**
   - Triggered on `auth.users` insert
   - Creates corresponding `profiles` row

2. **trg_profiles_default_role**
   - Triggered on `profiles` insert
   - Assigns "member" role via `user_roles`

### Validation

Zod schemas validate all request payloads:
- `createSubSchema`: Subreddit creation
- `createPostSchema`: Post creation
- `votePostSchema`: Post voting
- `createCommentSchema`: Comment creation
- `deleteCommentSchema`: Comment deletion
- `setUserRoleSchema`: Role assignment

## Frontend Architecture

### React Application

Built with React 18, TypeScript, and Vite for fast development and optimized builds.

#### Component Structure

**Pages** (`frontend/src/pages/`)
- `Home.tsx`: Global feed
- `Subreddit.tsx`: Subreddit-specific feed
- `PostDetail.tsx`: Post with comments
- `CreateSubreddit.tsx`: Subreddit creation form
- `CreatePost.tsx`: Post creation form
- `AdminUsers.tsx`: Admin user management

**Components** (`frontend/src/components/`)
- `Shell.tsx`: Layout wrapper with header and navigation

**Hooks** (`frontend/src/hooks/`)
- `useSession.ts`: Supabase session management
- `useCurrentUser.ts`: Current user data and roles

**Utils** (`frontend/src/utils/`)
- `date.ts`: Date formatting utilities

**API Client** (`frontend/src/api.ts`)
- Centralized API client with automatic token injection
- Methods: `get`, `post`, `delete`

### Routing

React Router DOM handles client-side routing:
- `/login`: Authentication
- `/`: Home (protected)
- `/r/:slug`: Subreddit (protected)
- `/posts/:id`: Post detail (protected)
- `/create-subreddit`: Create subreddit (protected)
- `/create-post`: Create post (protected)
- `/admin`: Admin panel (protected, admin only)

### State Management

- React hooks (`useState`, `useEffect`)
- Custom hooks for session and user data
- API calls trigger re-renders on data changes

### Testing

Jest + React Testing Library:
- Component rendering tests
- User interaction tests
- API mocking
- Supabase mocking

## Security

### Authentication
- JWT tokens from Supabase Auth
- Tokens validated server-side
- Short-lived access tokens (1 hour default)

### Authorization
- Role-based access control (RBAC)
- Database-level RLS policies
- Middleware-level permission checks

### Input Validation
- Zod schemas validate all inputs
- Type-safe request/response handling
- SQL injection prevention via parameterized queries

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting

## Deployment Considerations

### Environment Variables
- Never commit `.env` files
- Use environment-specific configurations
- Secure JWT secrets

### Database
- Run migrations in order (schema.sql, then seed.sql)
- Backup database before major changes
- Monitor RLS policies

### Build Process
- Backend: `npm run build` → `dist/`
- Frontend: `npm run build` → `dist/`
- Production builds are optimized and minified

## Performance

### Backend
- Connection pooling (Supabase client)
- Efficient database queries
- Rate limiting to prevent abuse

### Frontend
- Code splitting (Vite)
- Lazy loading routes
- Optimized bundle size

### Database
- Indexed foreign keys
- Efficient RLS policies
- Query optimization

## Future Enhancements

Potential improvements:
- Real-time updates (Supabase Realtime)
- Image upload (Supabase Storage)
- Search functionality
- Pagination
- Notifications
- Email verification
- Password reset
- OAuth providers

