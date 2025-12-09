export type UserRole = "admin" | "mod" | "member" | "owner";

export interface AuthUser {
  id: string;
  email?: string;
  roles?: UserRole[];
}

