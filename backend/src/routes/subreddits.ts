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

/**
 * @openapi
 * /api/subreddits:
 *   post:
 *     summary: Créer un subreddit
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
 *     responses:
 *       200:
 *         description: Subreddit créé
 *   get:
 *     summary: Lister les subreddits
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
    if (!ownerId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
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

// Détail via slug (name)
/**
 * @openapi
 * /api/subreddits/slug/{name}:
 *   get:
 *     summary: Détail d'un subreddit par slug
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

// Liste des subreddits
/**
 * @openapi
 * /api/subreddits/{id}:
 *   get:
 *     summary: Détail d'un subreddit
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

// Détail subreddit
subredditsRouter.get("/subreddits/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("subreddits").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ code: "SUB_NOT_FOUND", message: error.message });
  res.json(data);
});

// Posts d’un subreddit
/**
 * @openapi
 * /api/subreddits/{id}/posts:
 *   get:
 *     summary: Posts d'un subreddit
 *   post:
 *     summary: Créer un post dans un subreddit
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.get("/subreddits/:id/posts", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("subreddit_id", id)
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
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
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

// Mettre à jour un subreddit (owner)
/**
 * @openapi
 * /api/subreddits/{id}:
 *   put:
 *     summary: Mettre à jour un subreddit (owner)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.put(
  "/subreddits/:id",
  requireAuth,
  validate(updateSubSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", userId)
      .single();
    if (!membership || membership.role !== "owner") {
      return res.status(403).json({ code: "FORBIDDEN", message: "Réservé au owner" });
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

// Rejoindre un subreddit
/**
 * @openapi
 * /api/subreddits/{id}/join:
 *   post:
 *     summary: Rejoindre un subreddit
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.post("/subreddits/:id/join", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
  const { error } = await supabase
    .from("sub_members")
    .upsert({ user_id: userId, subreddit_id: id, role: "member" }, { onConflict: "user_id,subreddit_id" });
  if (error) return res.status(400).json({ code: "JOIN_ERROR", message: error.message });
  res.json({ ok: true });
});

// Quitter un subreddit
/**
 * @openapi
 * /api/subreddits/{id}/leave:
 *   post:
 *     summary: Quitter un subreddit
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.post(
  "/subreddits/:id/leave",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const { error } = await supabase
      .from("sub_members")
      .delete()
      .eq("subreddit_id", id)
      .eq("user_id", userId);
    if (error) return res.status(400).json({ code: "LEAVE_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

// Liste des membres (owner ou mod)
/**
 * @openapi
 * /api/subreddits/{id}/members:
 *   get:
 *     summary: Lister les membres d'un subreddit (owner/mod)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.get(
  "/subreddits/:id/members",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", userId)
      .single();
    if (!membership || !["owner", "mod"].includes(membership.role)) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Réservé aux mods/owner" });
    }
    const { data, error } = await supabase
      .from("sub_members")
      .select("user_id, role, created_at");
    if (error) return res.status(400).json({ code: "MEMBERS_ERROR", message: error.message });
    res.json(data);
  },
);

// Changer le rôle d’un membre (owner uniquement)
/**
 * @openapi
 * /api/subreddits/{id}/members/{userId}/role:
 *   post:
 *     summary: Mettre à jour le rôle d'un membre (owner)
 *     security: [{ bearerAuth: [] }]
 */
subredditsRouter.post(
  "/subreddits/:id/members/:userId/role",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id, userId } = req.params;
    const currentUser = req.user?.id;
    if (!currentUser) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const role = (req.body?.role as string) ?? "";
    if (!["member", "mod"].includes(role)) {
      return res.status(400).json({ code: "ROLE_INVALID", message: "role doit être member ou mod" });
    }
    const { data: membership } = await supabase
      .from("sub_members")
      .select("role")
      .eq("subreddit_id", id)
      .eq("user_id", currentUser)
      .single();
    if (!membership || membership.role !== "owner") {
      return res.status(403).json({ code: "FORBIDDEN", message: "Réservé au owner" });
    }
    const { error } = await supabase
      .from("sub_members")
      .upsert({ user_id: userId, subreddit_id: id, role }, { onConflict: "user_id,subreddit_id" });
    if (error) return res.status(400).json({ code: "ROLE_UPDATE_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

