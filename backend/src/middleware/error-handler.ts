import { NextFunction, Request, Response } from "express";

// 404 handler
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: "Route not found",
  });
};

// Centralized error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Internal server error";

  res.status(status).json({
    code,
    message,
    details: err.details,
  });
};
