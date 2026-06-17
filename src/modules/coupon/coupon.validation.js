import { z } from "zod";
import {
  searchSchema,
  booleanQuerySchema,
  flexDateSchema,
} from "../../utils/validationPrimitives.js";
import {
  makeSchema,
  idParamSchema,
  buildListQuery,
} from "../../utils/resourceValidationHelpers.js";

const couponBody = z.object({
  code: z.string().trim().min(2, "Code is required").toUpperCase(),
  description: z.string().trim().optional(),
  type: z.enum(["percent", "flat"]),
  value: z.number().min(0, "Value is required"),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(0).optional(),
  startsAt: flexDateSchema.optional(),
  expiresAt: flexDateSchema.optional(),
  isActive: z.boolean().optional(),
});

const couponListSchema = makeSchema({
  query: buildListQuery({ search: searchSchema, isActive: booleanQuerySchema }),
});
const couponCreateSchema = makeSchema({ body: couponBody });
const couponUpdateSchema = makeSchema({ body: couponBody.partial(), params: idParamSchema });
const couponIdSchema = makeSchema({ params: idParamSchema });
const couponValidateSchema = makeSchema({
  body: z.object({
    code: z.string().trim().min(1, "Enter a coupon code"),
    subtotal: z.number().min(0),
  }),
});

export {
  couponListSchema,
  couponCreateSchema,
  couponUpdateSchema,
  couponIdSchema,
  couponValidateSchema,
};
