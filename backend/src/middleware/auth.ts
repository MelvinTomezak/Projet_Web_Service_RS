import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { supabase } from "../services/supabase";
import { AuthUser, UserRole } from "../types/user";

const bearer = (header?: string | null): string | null => {
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

const decodeToken = (token: string): AuthUser | null => {
  try {
    const payload = jwt.verify(token, env.supabaseJwtSecret ?? "") as {
      sub?: string;
      email?: string;
      role?: string;
    };
    if (!payload.sub) return null;
    const role = payload.role as UserRole | undefined;
    return {
      id: payload.sub,
      email: payload.email,
      roles: role ? [role] : [],
    };
  } catch {
    return null;
  }
};

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = bearer(req.headers.authorization || null);
  if (!token) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Token manquant" });
    return;
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Token invalide" });
    return;
  }

  // Optionnel : récupérer le profil depuis Supabase pour enrichir req.user
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url")
    .eq("id", decoded.id)
    .single();

  if (error || !profile) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Utilisateur introuvable" });
    return;
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", decoded.id);
  const roles =
    roleRows
      ?.map((r) => (r as { roles?: { name?: string } }).roles?.name)
      .filter((x): x is UserRole => Boolean(x && ["admin", "modo", "member", "owner"].includes(x))) || [];

  req.user = { ...decoded, ...profile, roles };
  next();
};

