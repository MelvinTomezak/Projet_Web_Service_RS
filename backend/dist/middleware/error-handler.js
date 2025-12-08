"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
// 404 pour les routes non trouvées
const notFoundHandler = (_req, res) => {
    res.status(404).json({
        code: "NOT_FOUND",
        message: "Route non trouvée",
    });
};
exports.notFoundHandler = notFoundHandler;
// Gestion centralisée des erreurs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (err, _req, res, _next) => {
    const status = err.status || 500;
    const code = err.code || "INTERNAL_ERROR";
    const message = err.message || "Erreur interne du serveur";
    res.status(status).json({
        code,
        message,
        details: err.details,
    });
};
exports.errorHandler = errorHandler;
