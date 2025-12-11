import { z } from "zod";

export const setUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    role: z.enum(["admin", "member"]),
  }),
});

