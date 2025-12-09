import { z } from "zod";

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // post id
  }),
  body: z.object({
    content: z.string().min(1).max(1000),
    parent_id: z.string().uuid().optional(),
  }),
});

export const voteCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // comment id
  }),
  body: z.object({
    value: z.number().int().refine((v) => [-1, 0, 1].includes(v), {
      message: "value must be -1,0,1",
    }),
  }),
});

