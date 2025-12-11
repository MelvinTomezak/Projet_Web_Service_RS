import { Router } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Reddit-like API",
    version: "0.1.0",
    description: "Express + Supabase backend for a Reddit-like social network.",
  },
  servers: [
    {
      url: "http://{host}:{port}",
      description: "Template server",
      variables: {
        host: {
          default: "localhost",
          description: "API host",
        },
        port: {
          default: "4000",
          description: "API port",
        },
      },
    },
    {
      url: "http://localhost:4000",
      description: "Local development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Paste user access_token (no 'Bearer ' prefix needed in Swagger UI)",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./src/routes/**/*.ts", "./src/docs/**/*.yaml"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerRouter = Router();

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
swaggerRouter.get("/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});

