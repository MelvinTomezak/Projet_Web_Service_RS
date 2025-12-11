import { Router } from "express";
import { supabase } from "../services/supabase";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { setUserRoleSchema } from "../schemas/admin";
import { validate } from "../middleware/validate";

const requireAdmin = (req: AuthenticatedRequest, res: any, next: any): void => {
  if (!req.user?.roles?.includes("admin")) {
    res.status(403).json({ code: "FORBIDDEN", message: "Admins only" });
    return;
  }
  next();
};

export const adminRouter = Router();

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Lister les utilisateurs avec leurs rôles (admin uniquement)
 *     security: [{ bearerAuth: [] }]
 */
adminRouter.get("/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, user_roles(role_id, roles(id,name))")
    .order("username", { ascending: true });
  if (error) return res.status(400).json({ code: "LIST_USERS_ERROR", message: error.message });
  const mapped =
    data?.map((u) => {
      const roles =
        (u as any).user_roles?.map((r: any) => r.roles?.name).filter((x: string | null) => Boolean(x)) ?? [];
      return { id: u.id, username: u.username, roles };
    }) ?? [];
  res.json(mapped);
});

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   post:
 *     summary: Définir le rôle d'un utilisateur (admin ou member)
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
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *           example:
 *             role: "member"
 */
adminRouter.post(
  "/admin/users/:id/role",
  requireAuth,
  requireAdmin,
  validate(setUserRoleSchema),
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { role } = req.body as { role: "admin" | "member" };

    let roleId: number | null = null;
    const { data: roleRow, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role)
      .single();
    if (roleRow?.id) {
      roleId = roleRow.id;
    } else {
      // fallback ids si la table roles a des IDs fixes (ex: admin=1, member=3)
      roleId = role === "member" ? 3 : role === "admin" ? 1 : null;
    }
    if (roleError || !roleId) {
      return res.status(400).json({ code: "ROLE_NOT_FOUND", message: roleError?.message ?? "Role not found" });
    }

    const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", id);
    if (delError) return res.status(400).json({ code: "ROLE_UPDATE_ERROR", message: delError.message });

    const { error: insError } = await supabase
      .from("user_roles")
      .insert({ user_id: id, role_id: roleId });
    if (insError) return res.status(400).json({ code: "ROLE_UPDATE_ERROR", message: insError.message });

    res.json({ ok: true, role });
  },
);

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   get:
 *     summary: Définir le rôle d'un utilisateur via query (admin ou member)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, member]
 */
adminRouter.get(
  "/admin/users/:id/role",
  requireAuth,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const role = (req.query.role as string) ?? "";
    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ code: "ROLE_INVALID", message: "role must be admin or member" });
    }

    let roleId: number | null = null;
    const { data: roleRow } = await supabase.from("roles").select("id").eq("name", role).single();
    if (roleRow?.id) {
      roleId = roleRow.id;
    } else {
      roleId = role === "member" ? 3 : role === "admin" ? 1 : null;
    }
    if (!roleId) return res.status(400).json({ code: "ROLE_NOT_FOUND", message: "Role not found" });

    const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", id);
    if (delError) return res.status(400).json({ code: "ROLE_UPDATE_ERROR", message: delError.message });
    const { error: insError } = await supabase.from("user_roles").insert({ user_id: id, role_id: roleId });
    if (insError) return res.status(400).json({ code: "ROLE_UPDATE_ERROR", message: insError.message });
    res.json({ ok: true, role });
  },
);

