import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../schemas/profile";
import { z } from "zod";

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil courant (auth requis)
 *     security: [{ bearerAuth: [] }]
 */
authRouter.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

/**
 * @openapi
 * /api/auth/me:
 *   put:
 *     summary: Update profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               bio: { type: string }
 *               avatar_url: { type: string, format: uri }
 *           example:
 *             username: "john_doe"
 *             bio: "Fullstack dev"
 *             avatar_url: "https://example.com/avatar.png"
 */
authRouter.put(
  "/auth/me",
  requireAuth,
  validate(updateProfileSchema),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "User not authenticated" });
      return;
    }

    const { username, bio, avatar_url } = req.body as {
      username?: string;
      bio?: string;
      avatar_url?: string;
    };

    const { data, error } = await supabase
      .from("profiles")
      .update({ username, bio, avatar_url })
      .eq("id", userId)
      .select("id, username, bio, avatar_url")
      .single();

    if (error) {
      res.status(400).json({ code: "UPDATE_FAILED", message: error.message });
      return;
    }

    res.json({ user: data });
  },
);

/**
 * @openapi
 * /api/auth/profile:
 *   post:
 *     summary: Update username
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *           example:
 *             username: "johnny"
 */
authRouter.post("/auth/profile", validate(z.object({
  body: z.object({
    username: z.string().min(3).max(50),
  }),
})), requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const { username } = req.body as { username: string };
  if (!userId) return res.status(401).json({ code: "UNAUTHORIZED", message: "User not authenticated" });
  const { data, error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId)
    .select("id, username, bio, avatar_url")
    .single();
  if (error) return res.status(400).json({ code: "UPDATE_FAILED", message: error.message });
  res.json({ user: data });
});




