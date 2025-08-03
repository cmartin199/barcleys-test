import { HealthSchema } from "@/schemas/health";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import z from "zod";

export const health = new OpenAPIHono();

const healthRoute = createRoute({
  method: "get",
  path: "/_health",
  summary: "Health Check",
  description: "Check if the API is running",
  tags: ["Health"],
  responses: {
    200: {
      description: "API is healthy",
      content: {
        "application/json": {
          schema: HealthSchema,
        },
      },
    },
  },
});

health.openapi(healthRoute, (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});
