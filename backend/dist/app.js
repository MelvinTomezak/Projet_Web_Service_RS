"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const swagger_1 = require("./docs/swagger");
const error_handler_1 = require("./middleware/error-handler");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
exports.app = app;
// Sécurité & utilitaires
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.corsOrigins.length > 0 ? env_1.env.corsOrigins : true,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, pino_http_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
}));
// Documentation Swagger
app.use("/docs", swagger_1.swaggerRouter);
// Routes API
app.use("/api", routes_1.router);
// Gestion des erreurs
app.use(error_handler_1.notFoundHandler);
app.use(error_handler_1.errorHandler);
