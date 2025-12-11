export type UserRole = "admin" | "modo" | "member" | "owner";

export interface AuthUser {
  id: string;
  email?: string;
  roles?: UserRole[];
  username?: string;
}




