import { z } from "zod";
import { searchSchema, booleanQuerySchema } from "../../utils/validationPrimitives.js";
import { makeSchema, idParamSchema, buildListQuery } from "../../utils/resourceValidationHelpers.js";

const SECTIONS = ["men", "women", "kids"];
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens");

const categoryCreateBody = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: slugSchema,
  section: z.enum(SECTIONS),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  displayOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const categoryListSchema = makeSchema({
  query: buildListQuery({
    search: searchSchema,
    section: z.enum(SECTIONS).optional(),
    isActive: booleanQuerySchema,
  }),
});
const categoryCreateSchema = makeSchema({ body: categoryCreateBody });
const categoryUpdateSchema = makeSchema({
  body: categoryCreateBody.partial(),
  params: idParamSchema,
});
const categoryIdSchema = makeSchema({ params: idParamSchema });
const categorySlugSchema = makeSchema({ params: z.object({ slug: slugSchema }) });

export {
  categoryListSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryIdSchema,
  categorySlugSchema,
};
