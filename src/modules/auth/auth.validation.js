import { z } from "zod";
import { emailSchema } from "../../utils/validationPrimitives.js";
import { makeSchema, idParamSchema } from "../../utils/resourceValidationHelpers.js";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const ROLES = ["admin", "manager", "staff"];

// POST /auth/register — first admin only
const authRegisterSchema = makeSchema({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: emailSchema("Invalid email"),
    password: passwordSchema,
  }),
});

// POST /auth/login
const authLoginSchema = makeSchema({
  body: z.object({
    email: emailSchema("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

// GET /auth/me
const authMeSchema = makeSchema();

// POST /auth/users
const authCreateUserSchema = makeSchema({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: emailSchema("Invalid email"),
    password: passwordSchema,
    role: z.enum(ROLES),
    phone: z.string().trim().optional(),
  }),
});

// PATCH /auth/users/:id
const authUpdateUserSchema = makeSchema({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
    role: z.enum(ROLES).optional(),
    phone: z.string().trim().optional(),
    password: passwordSchema.optional(),
  }),
  params: idParamSchema,
});

// GET /auth/users
const authListUsersSchema = makeSchema();

export {
  authRegisterSchema,
  authLoginSchema,
  authMeSchema,
  authCreateUserSchema,
  authUpdateUserSchema,
  authListUsersSchema,
};
