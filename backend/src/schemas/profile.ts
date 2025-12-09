import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    bio: z.string().max(300).optional(),
    avatar_url: z.string().url().max(300).optional(),
  }),
});

