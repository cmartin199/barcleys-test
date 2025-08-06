import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserParamsSchema,
  User,
} from "../schemas/users";
import { ErrorSchema } from "../schemas/error";

export const userRoutes = new OpenAPIHono();

// In-memory storage for demo purposes
// In production, replace with actual database
let users: User[] = [];

// Get user by ID
const getUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "Get user by ID",
  description: "Retrieve a specific user by their unique identifier",
  tags: ["Users"],
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      description: "User found",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    401: {
      description: "Unauthorized - missing or invalid JWT token",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: "Forbidden - cannot access another user's data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

userRoutes.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid("param");
  const authHeader = c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Missing or invalid authorization header",
      },
      401
    );
  }
  const token = authHeader.substring("Bearer ".length);
  const payload = verifyJwt(token);
  if (!payload || payload.sub !== id) {
    return c.json(
      {
        error: "Forbidden",
        message: "You are not allowed to access this user's data",
      },
      403
    );
  }

  const user = users.find((u) => u.id === id);

  if (!user) {
    return c.json(
      {
        error: "Not Found",
        message: "User not found",
      },
      404
    );
  }

  return c.json(user, 200);
});

// Create user
const createUserRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create new user",
  description: "Create a new user with the provided information",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    409: {
      description: "User with email already exists",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

userRoutes.openapi(createUserRoute, (c) => {
  let userData;
  try {
    userData = CreateUserSchema.parse(c.req.valid("json"));
  } catch (err) {
    return c.json(
      {
        error: "Bad Request",
        message: "Invalid user data",
      },
      400
    );
  }

  // Ensure password is present in the request
  if (!userData.password || typeof userData.password !== "string") {
    return c.json(
      {
        error: "Bad Request",
        message: "Password is required",
      },
      400
    );
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  return c.json(newUser, 201);
});

// Update user
const updateUserRoute = createRoute({
  method: "put",
  path: "/{id}",
  summary: "Update user",
  description: "Update an existing user with new information",
  tags: ["Users"],
  request: {
    params: UserParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: "User not found",
    },
  },
});

userRoutes.openapi(updateUserRoute, (c) => {
  const { id } = c.req.valid("param");
  const updateData = c.req.valid("json");

  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return c.json(
      {
        error: "Not Found",
        message: "User not found",
      },
      404
    );
  }

  // Check email uniqueness if updating email
  if (updateData.email && updateData.email !== users[userIndex].email) {
    const existingUser = users.find((u) => u.email === updateData.email);
    if (existingUser) {
      return c.json(
        {
          error: "Conflict",
          message: "User with this email already exists",
        },
        409
      );
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  return c.json(users[userIndex]);
});

// Delete user
const deleteUserRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "Delete user",
  description: "Delete a user by their unique identifier",
  tags: ["Users"],
  request: {
    params: UserParamsSchema,
  },
  responses: {
    204: {
      description: "User deleted successfully",
    },
    404: {
      description: "User not found",
    },
  },
});

userRoutes.openapi(deleteUserRoute, (c) => {
  const { id } = c.req.valid("param");

  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return c.json(
      {
        error: "Not Found",
        message: "User not found",
      },
      404
    );
  }

  users.splice(userIndex, 1);
  return c.body(null, 204);
});

// Add zod schema for login request and JWT response
const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const JWTResponseSchema = z.object({
  token: z.string(),
});

// Add authentication endpoint OpenAPI spec
const loginRoute = createRoute({
  method: "post",
  path: "/auth/login",
  summary: "Authenticate user and return JWT token",
  description:
    "Authenticate a user with email and password, returning a JWT token for use as a Bearer token.",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authentication successful",
      content: {
        "application/json": {
          schema: JWTResponseSchema,
        },
      },
    },
    403: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
  security: [], // No auth required for login
});

// Dummy secret for JWT signing (in production, use env/config)
const JWT_SECRET = process.env.JWT_SECRET;

function createJwt(payload: object): string {
  // Minimal JWT implementation for demo (use a library like jose or jsonwebtoken in production)
  const header = { alg: "HS256", typ: "JWT" };
  function base64url(obj: object) {
    return Buffer.from(JSON.stringify(obj)).toString("base64url");
  }
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signature = require("crypto")
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Helper to verify JWT and extract payload
function verifyJwt(token: string): { sub: string; email: string } | null {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    const expectedSig = require("crypto")
      .createHmac("sha256", JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");
    if (expectedSig !== signature) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    return payload;
  } catch {
    return null;
  }
}

userRoutes.openapi(loginRoute, (c) => {
  const { email, password } = c.req.valid("json");
  const user = users.find((u) => u.email === email);
  let userData;
  try {
    userData = CreateUserSchema.parse(c.req.valid("json"));
  } catch (err) {
    return c.json(
      {
        error: "Bad Request",
        message: "Invalid user data",
      },
      400
    );
  }
  if (!user || user.password !== password) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Invalid email or password",
      },
      403
    );
  }

  // JWT payload can include user id and email
  const token = createJwt({ sub: user.id, email: user.email });

  return c.json({ token }, 200);
});
