import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

// Generic validation middleware using Zod
export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: result.error.flatten(),
      });
      return;
    }

    const { body } = result.data as { body?: unknown };
    // Do not reassign req.query/req.params (not mutable in Express 5)
    req.body = body as Request["body"];
    next();
  };

