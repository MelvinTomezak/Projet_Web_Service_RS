import { z } from "zod";

export const votePostSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    value: z.number().int().refine((v) => [-1, 0, 1].includes(v), {
      message: "value must be -1,0,1",
    }),
  }),
});

