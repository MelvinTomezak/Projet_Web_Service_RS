import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSubredditSchema, createPostSchema } from "../schemas/subreddit";
import { z } from "zod";

export const subredditsRouter = Router();

const updateSubSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    description: z.string().max(300).optional(),
    is_private: z.boolean().optional(),
  }),
});

const deleteSubSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

/**
 * @openapi
 * /api/subreddits:
 *   post:
 *     summary: Create a subreddit
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               is_private: { type: boolean }
 *           example:
 *             name: "tech"
 *             description: "Tech news and frameworks"
 *             is_private: false
 *     responses:
 *       200:
 *         description: Subreddit créé
 *   get:
 *     summary: List subreddits
 *     responses:
 *       200: { description: OK }
 */
subredditsRouter.post(
  "/subreddits",
  requireAuth,
  validate(createSubredditSchema),
  async (req: AuthenticatedRequest, res) => {
    const { name, description, is_private } = req.body as {
      name: string;
      description?: string;
      is_private?: boolean;
    };
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { data, error } = await supabase
      .from("subreddits")
      .insert({ name, description, is_private: is_private ?? false })
      .select()
      .single();
    if (error) return res.status(400).json({ code: "CREATE_SUB_ERROR", message: error.message });
    // owner devient membre owner
    await supabase
      .from("sub_members")
      .upsert({ user_id: ownerId, subreddit_id: data.id, role: "owner" });
    res.json(data);
  },
);

// Detail via slug (name)
/**
 * @openapi
 * /api/subreddits/slug/{name}:
 *   get:
 *     summary: Subreddit detail by slug
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 */
subredditsRouter.get("/subreddits/slug/:name", async (req, res) => {
  const { name } = req.params;
  const { data, error } = await supabase.from("subreddits").select("*").eq("name", name).single();
  if (error) return res.status(404).json({ code: "SUB_NOT_FOUND", message: error.message });
  res.json(data);
});

// List subreddits
/**
 * @openapi
 * /api/subreddits/{id}:
 *   get:
 *     summary: Subreddit detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
subredditsRouter.get("/subreddits", async (_req, res) => {
  const { data, error } = await supabase.from("subreddits").select("*").order("created_at", {
    ascending: false,
  });
  if (error) return res.status(400).json({ code: "LIST_SUB_ERROR", message: error.message });
  res.json(data);
});

// Subreddit detail by id
subredditsRouter.get("/subreddits/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("subreddits").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ code: "SUB_NOT_FOUND", message: error.message });
  res.json(data);
});

/**
 * @openapi
 * /api/subreddits/{id}/me:
 *   get:
 *     summary: Current user role in subreddit
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.get("/subreddits/:id/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
  const { data, error } = await supabase
    .from("sub_members")
    .select("role")
    .eq("subreddit_id", id)
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") {
    return res.status(400).json({ code: "MEMBERSHIP_ERROR", message: error.message });
  }
  res.json({ role: data?.role ?? null });
});

// Subreddit posts
/**
 * @openapi
 * /api/subreddits/{id}/posts:
 *   get:
 *     summary: Posts of a subreddit
 *   post:
 *     summary: Create a post in subreddit
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string, enum: [text, link, image] }
 *               media_urls:
 *                 type: array
 *                 items: { type: string, format: uri }
 *           example:
 *             title: "My first post"
 *             content: "Hello subreddit!"
 *             type: "text"
 */
subredditsRouter.get("/subreddits/:id/posts", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("subreddit_id", id)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ code: "LIST_POSTS_ERROR", message: error.message });
  res.json(data);
});

// Créer un post dans un subreddit
subredditsRouter.post(
  "/subreddits/:id/posts",
  requireAuth,
  validate(createPostSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { title, content, type, media_urls } = req.body as {
      title: string;
      content: string;
      type: "text" | "link" | "image";
      media_urls?: string[];
    };
    const { data, error } = await supabase
      .from("posts")
      .insert({
        subreddit_id: id,
        author_id: userId,
        title,
        content,
        type,
        media_urls,
      })
      .select()
      .single();
    if (error) return res.status(400).json({ code: "CREATE_POST_ERROR", message: error.message });
    res.json(data);
  },
);

// Update subreddit (owner)
/**
 * @openapi
 * /api/subreddits/{id}:
 *   put:
 *     summary: Update subreddit (owner)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.put(
  "/subreddits/:id",
  requireAuth,
  validate(updateSubSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", userId)
      .single();
    if (!membership || membership.role !== "owner") {
      return res.status(403).json({ code: "FORBIDDEN", message: "Owner only" });
    }
    const { description, is_private } = req.body as { description?: string; is_private?: boolean };
    const { data, error } = await supabase
      .from("subreddits")
      .update({ description, is_private })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(400).json({ code: "UPDATE_SUB_ERROR", message: error.message });
    res.json(data);
  },
);

/**
 * @openapi
 * /api/subreddits/{id}:
 *   delete:
 *     summary: Supprimer un subreddit (owner)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.delete(
  "/subreddits/:id",
  requireAuth,
  validate(deleteSubSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const roles = req.user?.roles ?? [];
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", userId)
      .single();
    const isAdmin = roles.includes("admin");
    if (!isAdmin && (!membership || membership.role !== "owner")) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Réservé au owner" });
    }
    const { error } = await supabase.from("subreddits").delete().eq("id", id);
    if (error) return res.status(400).json({ code: "DELETE_SUB_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

// Join subreddit
/**
 * @openapi
 * /api/subreddits/{id}/join:
 *   post:
 *     summary: Join a subreddit
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.post("/subreddits/:id/join", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
  const { error } = await supabase
    .from("sub_members")
    .upsert({ user_id: userId, subreddit_id: id, role: "member" }, { onConflict: "user_id,subreddit_id" });
  if (error) return res.status(400).json({ code: "JOIN_ERROR", message: error.message });
  res.json({ ok: true });
});

// Leave subreddit
/**
 * @openapi
 * /api/subreddits/{id}/leave:
 *   post:
 *     summary: Leave a subreddit
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.post(
  "/subreddits/:id/leave",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { error } = await supabase
      .from("sub_members")
      .delete()
      .eq("subreddit_id", id)
      .eq("user_id", userId);
    if (error) return res.status(400).json({ code: "LEAVE_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

// Members list (owner/mod)
/**
 * @openapi
 * /api/subreddits/{id}/members:
 *   get:
 *     summary: List subreddit members (owner/mod)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.get(
  "/subreddits/:id/members",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", userId)
      .single();
    if (!membership || !["owner", "mod"].includes(membership.role)) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Owner or moderator only" });
    }
    const { data, error } = await supabase
      .from("sub_members")
      .select("user_id, role, created_at");
    if (error) return res.status(400).json({ code: "MEMBERS_ERROR", message: error.message });
    res.json(data);
  },
);

// Change member role (owner only)
/**
 * @openapi
 * /api/subreddits/{id}/members/{userId}/role:
 *   post:
 *     summary: Update a member role (owner)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.post(
  "/subreddits/:id/members/:userId/role",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id, userId } = req.params;
    const currentUser = req.user?.id;
    if (!currentUser) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const role = (req.body?.role as string) ?? "";
    if (!["member", "mod"].includes(role)) {
      return res.status(400).json({ code: "ROLE_INVALID", message: "role must be member or mod" });
    }
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", currentUser)
      .single();
    if (!membership || membership.role !== "owner") {
      return res.status(403).json({ code: "FORBIDDEN", message: "Owner only" });
    }
    const { error } = await supabase
      .from("sub_members")
      .upsert({ user_id: userId, subreddit_id: id, role }, { onConflict: "user_id,subreddit_id" });
    if (error) return res.status(400).json({ code: "ROLE_UPDATE_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

