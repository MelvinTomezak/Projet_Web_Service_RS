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

    const { body, query, params } = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };

    req.body = body as Request["body"];
    req.query = query as Request["query"];
    req.params = params as Request["params"];
    next();
  };

