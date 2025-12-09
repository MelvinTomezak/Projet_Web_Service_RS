"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// Middleware de validation générique avec Zod
const validate = (schema) => (req, res, next) => {
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
    const { body } = result.data;
    // On ne réassigne pas req.query/req.params (non mutables en Express 5)
    req.body = body;
    next();
};
exports.validate = validate;
