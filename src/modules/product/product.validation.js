import { z } from "zod";
import {
  searchSchema,
  booleanQuerySchema,
  objectIdSchema,
} from "../../utils/validationPrimitives.js";
import {
  makeSchema,
  idParamSchema,
  buildListQuery,
} from "../../utils/resourceValidationHelpers.js";

const SECTIONS = ["men", "women", "kids"];
const SORTS = ["newest", "oldest", "price-asc", "price-desc", "popular", "rating"];

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens");

const numFromQuery = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v === "" ? undefined : Number(v)))
  .pipe(z.number().min(0).optional());

const variantSchema = z.object({
  size: z.string().trim().min(1, "Size is required"),
  color: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  stock: z.number().int().min(0).default(0),
});

const productCreateBody = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: slugSchema,
  description: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  category: objectIdSchema,
  section: z.enum(SECTIONS),
  price: z.number().min(0, "Price is required"),
  compareAtPrice: z.number().min(0).optional(),
  images: z.array(z.string().trim()).default([]),
  variants: z.array(variantSchema).default([]),
  fabric: z.string().trim().optional(),
  color: z.string().trim().optional(),
  careInstructions: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const productListSchema = makeSchema({
  query: buildListQuery({
    search: searchSchema,
    section: z.enum(SECTIONS).optional(),
    category: objectIdSchema.optional(),
    minPrice: numFromQuery,
    maxPrice: numFromQuery,
    sort: z.enum(SORTS).optional(),
    isFeatured: booleanQuerySchema,
    isNewArrival: booleanQuerySchema,
    isActive: booleanQuerySchema,
    tag: z.string().trim().optional(),
  }),
});
const productCreateSchema = makeSchema({ body: productCreateBody });
const productUpdateSchema = makeSchema({
  body: productCreateBody.partial(),
  params: idParamSchema,
});
const productIdSchema = makeSchema({ params: idParamSchema });
const productSlugSchema = makeSchema({ params: z.object({ slug: slugSchema }) });

export {
  productListSchema,
  productCreateSchema,
  productUpdateSchema,
  productIdSchema,
  productSlugSchema,
};
