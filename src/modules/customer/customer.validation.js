import { z } from "zod";
import { emailSchema, searchSchema } from "../../utils/validationPrimitives.js";
import { makeSchema, idParamSchema, buildListQuery } from "../../utils/resourceValidationHelpers.js";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const addressBodySchema = z.object({
  label: z.string().trim().optional(),
  fullName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  line1: z.string().trim().min(1, "Address line is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional(),
  pincode: z.string().trim().min(3, "Pincode is required"),
  country: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

const customerRegisterSchema = makeSchema({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: emailSchema("Invalid email"),
    password: passwordSchema,
    phone: z.string().trim().optional(),
  }),
});

const customerLoginSchema = makeSchema({
  body: z.object({
    email: emailSchema("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

const customerMeSchema = makeSchema();

const customerUpdateSchema = makeSchema({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().optional(),
    password: passwordSchema.optional(),
    currentPassword: z.string().optional(),
  }),
});

const addressCreateSchema = makeSchema({ body: addressBodySchema });
const addressUpdateSchema = makeSchema({ body: addressBodySchema.partial(), params: idParamSchema });
const addressDeleteSchema = makeSchema({ params: idParamSchema });

// Admin
const customerListSchema = makeSchema({ query: buildListQuery({ search: searchSchema }) });
const customerGetSchema = makeSchema({ params: idParamSchema });

export {
  customerRegisterSchema,
  customerLoginSchema,
  customerMeSchema,
  customerUpdateSchema,
  addressCreateSchema,
  addressUpdateSchema,
  addressDeleteSchema,
  customerListSchema,
  customerGetSchema,
};
