import { z } from "zod";
import {
  searchSchema,
  objectIdSchema,
  flexDateSchema,
  emailSchema,
} from "../../utils/validationPrimitives.js";
import {
  makeSchema,
  idParamSchema,
  buildListQuery,
} from "../../utils/resourceValidationHelpers.js";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const orderItemSchema = z.object({
  productId: objectIdSchema,
  variantId: z.string().trim().min(1, "Select a size"),
  quantity: z.number().int().min(1).max(20),
});

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(5, "Phone is required"),
  line1: z.string().trim().min(1, "Address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional(),
  pincode: z.string().trim().min(3, "Pincode is required"),
  country: z.string().trim().optional(),
});

const orderCreateSchema = makeSchema({
  body: z.object({
    items: z.array(orderItemSchema).min(1, "Your cart is empty"),
    contact: z.object({
      name: z.string().trim().min(1, "Name is required"),
      email: emailSchema("Valid email required"),
      phone: z.string().trim().min(5, "Phone is required"),
    }),
    shippingAddress: addressSchema,
    paymentMethod: z.enum(["cod", "razorpay"]),
    couponCode: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  }),
});

const orderListSchema = makeSchema({
  query: buildListQuery({
    search: searchSchema,
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    paymentMethod: z.enum(["cod", "razorpay"]).optional(),
    startDate: flexDateSchema.optional(),
    endDate: flexDateSchema.optional(),
  }),
});

const orderIdSchema = makeSchema({ params: idParamSchema });

const orderStatusSchema = makeSchema({
  body: z.object({
    status: z.enum(ORDER_STATUSES),
    note: z.string().trim().optional(),
  }),
  params: idParamSchema,
});

const orderTrackSchema = makeSchema({
  params: z.object({ orderNumber: z.string().trim().min(1) }),
});

export { orderCreateSchema, orderListSchema, orderIdSchema, orderStatusSchema, orderTrackSchema };
