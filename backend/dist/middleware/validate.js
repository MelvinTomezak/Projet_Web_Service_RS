"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// Middleware de validation générique avec Zod
const validate = (schema) => (req, res, next) => {
    const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    if (!parsed.success) {
        res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "Payload invalide",
            details: parsed.error.flatten(),
        });
        return;
    }
    req.body = parsed.data.body;
    req.query = parsed.data.query;
    req.params = parsed.data.params;
    next();
};
exports.validate = validate;
