"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerRouter = exports.swaggerSpec = void 0;
const express_1 = require("express");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Reddit-like API",
        version: "0.1.0",
        description: "API Express + Supabase pour un réseau social type Reddit.",
    },
    servers: [
        {
            url: "http://localhost:4000",
            description: "Développement local",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [{ bearerAuth: [] }],
};
const swaggerOptions = {
    definition: swaggerDefinition,
    apis: ["./src/routes/**/*.ts", "./src/docs/**/*.yaml"],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.swaggerRouter = (0, express_1.Router)();
exports.swaggerRouter.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec));
exports.swaggerRouter.get("/openapi.json", (_req, res) => {
    res.json(exports.swaggerSpec);
});
