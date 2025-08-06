import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { openapiSpec } from "./schemas/openapi";
import { config } from "./config/env";
import { errorHandler } from "./middleware/error";
import { userRoutes } from "./routes/users";
import { postRoutes } from "./routes/posts";
import { health } from "./routes/health";

const app = new OpenAPIHono().basePath("/v1");

app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// API Routes
app.route("/_health", health);

app.route("/users", userRoutes);
app.route("/posts", postRoutes);

// OpenAPI Documentation
app.doc("/openapi.json", openapiSpec);

// Swagger UI
app.get("/docs", swaggerUI({ url: "/v1/openapi.json" }));

// Root endpoint with API information
app.get("/", (c) => {
  return c.json({
    message: "barcleys-test API",
    documentation: `${c.req.url}docs`,
    openapi: `${c.req.url}openapi.json`,
    version: "1.0.0",
    endpoints: {
      health: "/_health",
      users: "/users",
      posts: "/posts",
    },
  });
});

// Error handling middleware
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found",
      path: c.req.path,
    },
    404
  );
});

console.log(`🚀 Server starting on http://localhost:${config.PORT}/v1`);
console.log(
  `📚 API Documentation available at http://localhost:${config.PORT}/v1/docs`
);
console.log(
  `📋 OpenAPI JSON available at http://localhost:${config.PORT}/v1/openapi.json`
);

serve({
  fetch: app.fetch,
  port: config.PORT,
});
