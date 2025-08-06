import { config } from "../config/env";

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Hono API Template",
    description:
      "A Node.js API template built with Hono framework featuring automatic OpenAPI documentation generation",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}`,
      description: "Development server",
    },
    {
      url: "https://api.example.com",
      description: "Production server",
    },
  ],
};
