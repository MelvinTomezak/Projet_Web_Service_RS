import { Router } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerRouter = Router();

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
swaggerRouter.get("/openapi.json", (_req, res) => {
  res.json(swaggerSpec);
});

