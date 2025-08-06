import { z } from "zod";

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const CreateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120).optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(18).max(120).optional(),
});

export const UserParamsSchema = z.object({
  id: z.string().uuid(),
});

export const UserQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
