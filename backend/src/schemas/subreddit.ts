import { z } from "zod";

export const createSubredditSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(300).optional(),
    is_private: z.boolean().optional().default(false),
  }),
});

export const createPostSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(1).max(2000),
    type: z.enum(["text", "link", "image"]).default("text"),
    media_urls: z.array(z.string().url()).optional(),
  }),
});

