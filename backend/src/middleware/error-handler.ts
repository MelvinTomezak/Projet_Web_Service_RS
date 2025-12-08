import { NextFunction, Request, Response } from "express";

// 404 pour les routes non trouvées
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: "Route non trouvée",
  });
};

// Gestion centralisée des erreurs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Erreur interne du serveur";

  res.status(status).json({
    code,
    message,
    details: err.details,
  });
};

