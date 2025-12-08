import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { swaggerRouter } from "./docs/swagger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { router as apiRouter } from "./routes";

const app = express();

// Sécurité & utilitaires
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Documentation Swagger
app.use("/docs", swaggerRouter);

// Routes API
app.use("/api", apiRouter);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

export { app };

