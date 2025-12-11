import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCommentSchema, voteCommentSchema, deleteCommentSchema } from "../schemas/comment";

export const commentsRouter = Router();

// Lister commentaires d'un post
/**
 * @openapi
 * /api/posts/{id}/comments:
 *   get:
 *     summary: List comments for a post
 */
commentsRouter.get("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id, content, created_at, author:profiles!comments_author_id_fkey(username)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });
  if (error) return res.status(400).json({ code: "LIST_COMMENTS_ERROR", message: error.message });
  const mapped = (data ?? []).map((c) => ({
    ...c,
    author_username: (c as { author?: { username?: string } }).author?.username ?? null,
  }));
  res.json(mapped);
});

// Créer un commentaire
/**
 * @openapi
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Create a comment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *               parent_id: { type: string, format: uuid, nullable: true }
 *           example:
 *             content: "Nice post!"
 *             parent_id: null
 */
commentsRouter.post(
  "/posts/:id/comments",
  requireAuth,
  validate(createCommentSchema),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { id } = req.params;
    const { content, parent_id } = req.body as { content: string; parent_id?: string };
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, author_id: userId, content, parent_id })
      .select()
      .single();
    if (error) return res.status(400).json({ code: "CREATE_COMMENT_ERROR", message: error.message });
    res.json({ ...data, author_username: req.user?.username ?? null });
  },
);

// Vote commentaire
/**
 * @openapi
 * /api/comments/{id}/vote:
 *   post:
 *     summary: Voter sur un commentaire (-1,0,1 ; 0 annule son propre vote)
 *     security: [{ bearerAuth: [] }]
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
 *             value: -1
 */
commentsRouter.post(
  "/comments/:id/vote",
  requireAuth,
  validate(voteCommentSchema),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });
    const { id } = req.params;
    const { value } = req.body as { value: number };
    if (value === 0) {
      const { error: delError } = await supabase
        .from("comment_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", id);
      if (delError) return res.status(400).json({ code: "VOTE_COMMENT_ERROR", message: delError.message });
    } else {
      const { error } = await supabase
        .from("comment_votes")
        .upsert({ user_id: userId, comment_id: id, value }, { onConflict: "user_id,comment_id" });
      if (error) return res.status(400).json({ code: "VOTE_COMMENT_ERROR", message: error.message });
    }
    res.json({ ok: true });
  },
);

// Supprimer un commentaire (auteur ou admin)
/**
 * @openapi
 * /api/comments/{id}:
 *   delete:
 *     summary: Supprimer un commentaire (auteur ou admin)
 *     security: [{ bearerAuth: [] }]
 */
commentsRouter.delete(
  "/comments/:id",
  requireAuth,
  validate(deleteCommentSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const roles = req.user?.roles ?? [];
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });

    const { data: comment } = await supabase.from("comments").select("author_id").eq("id", id).single();
    const isOwner = comment && comment.author_id === userId;
    const isAdmin = roles.includes("admin");
    if (!comment || (!isOwner && !isAdmin)) {
      return res.status(403).json({ code: "FORBIDDEN", message: "Not allowed to delete" });
    }

    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return res.status(400).json({ code: "DELETE_COMMENT_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

