import z from "zod";

export const HealthSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  timestamp: z
    .string()
    .datetime()
    .openapi({ example: "2024-01-01T00:00:00.000Z" }),
  version: z.string().openapi({ example: "1.0.0" }),
});
