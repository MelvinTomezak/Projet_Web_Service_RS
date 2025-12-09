import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCommentSchema, voteCommentSchema } from "../schemas/comment";

export const commentsRouter = Router();

// Lister commentaires d'un post
/**
 * @openapi
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Lister les commentaires d'un post
 */
commentsRouter.get("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });
  if (error) return res.status(400).json({ code: "LIST_COMMENTS_ERROR", message: error.message });
  res.json(data);
});

// Créer un commentaire
/**
 * @openapi
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Ajouter un commentaire
 *     security: [{ bearerAuth: [] }]
 */
commentsRouter.post(
  "/posts/:id/comments",
  requireAuth,
  validate(createCommentSchema),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const { id } = req.params;
    const { content, parent_id } = req.body as { content: string; parent_id?: string };
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, author_id: userId, content, parent_id })
      .select()
      .single();
    if (error) return res.status(400).json({ code: "CREATE_COMMENT_ERROR", message: error.message });
    res.json(data);
  },
);

// Vote commentaire
/**
 * @openapi
 * /api/comments/{id}/vote:
 *   post:
 *     summary: Voter sur un commentaire
 *     security: [{ bearerAuth: [] }]
 */
commentsRouter.post(
  "/comments/:id/vote",
  requireAuth,
  validate(voteCommentSchema),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "Non authentifié" });
    const { id } = req.params;
    const { value } = req.body as { value: number };
    const { error } = await supabase
      .from("comment_votes")
      .upsert({ user_id: userId, comment_id: id, value }, { onConflict: "user_id,comment_id" });
    if (error) return res.status(400).json({ code: "VOTE_COMMENT_ERROR", message: error.message });
    res.json({ ok: true });
  },
);

