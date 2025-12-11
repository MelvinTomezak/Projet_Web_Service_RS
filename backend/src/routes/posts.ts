import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { votePostSchema } from "../schemas/post";

export const postsRouter = Router();

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     summary: Get post detail
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 * /api/posts:
 *   get:
 *     summary: Global posts feed
 * /api/posts/{id}/vote:
 *   post:
 *     summary: Voter sur un post (-1,0,1)
 *     security: [{ bearerAuth: [] }]
 */
postsRouter.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
  if (error) return res.status(404).json({ code: "POST_NOT_FOUND", message: error.message });
  res.json(data);
});

postsRouter.get("/posts", async (_req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ code: "LIST_POSTS_ERROR", message: error.message });
  res.json(data);
});

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     summary: Supprimer un post (auteur)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
postsRouter.delete("/posts/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const roles = req.user?.roles ?? [];
  if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
  const { data: post } = await supabase.from("posts").select("author_id").eq("id", id).single();
  const isOwner = post && post.author_id === userId;
  const isAdmin = roles.includes("admin");
  if (!post || (!isOwner && !isAdmin)) {
    return res.status(403).json({ code: "FORBIDDEN", message: "Not allowed to delete" });
  }
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return res.status(400).json({ code: "DELETE_POST_ERROR", message: error.message });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/posts/{id}/vote:
 *   post:
 *     summary: Voter sur un post
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *                 enum: [-1, 0, 1]
 *           example:
 *             value: 1
 */
postsRouter.post(
  "/posts/:id/vote",
  requireAuth,
  validate(votePostSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { value } = req.body as { value: number };
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });

    if (value === 0) {
      const { error: delError } = await supabase.from("post_votes").delete().eq("user_id", userId).eq("post_id", id);
      if (delError) return res.status(400).json({ code: "VOTE_ERROR", message: delError.message });
    } else {
      const { error } = await supabase
        .from("post_votes")
        .upsert({ user_id: userId, post_id: id, value }, { onConflict: "user_id,post_id" });
      if (error) return res.status(400).json({ code: "VOTE_ERROR", message: error.message });
    }
    const { data: agg } = await supabase
      .from("post_votes")
      .select("value")
      .eq("post_id", id);
    const score = (agg ?? []).reduce((acc, v) => acc + (v.value ?? 0), 0);
    await supabase.from("posts").update({ score }).eq("id", id);
    res.json({ ok: true, score });
  },
);

