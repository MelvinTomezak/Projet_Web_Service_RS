import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../schemas/profile";

export const authRouter = Router();

// Profil courant
authRouter.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// Mise à jour du profil
authRouter.put(
  "/auth/me",
  requireAuth,
  validate(updateProfileSchema),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Utilisateur non authentifié" });
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




