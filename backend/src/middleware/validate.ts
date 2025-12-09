import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

// Middleware de validation générique avec Zod
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
        message: "Payload invalide",
        details: result.error.flatten(),
      });
      return;
    }

    const { body } = result.data as { body?: unknown };
    // On ne réassigne pas req.query/req.params (non mutables en Express 5)
    req.body = body as Request["body"];
    next();
  };

