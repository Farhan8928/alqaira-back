import { z } from "zod";
import { objectIdSchema, booleanQuerySchema } from "../../utils/validationPrimitives.js";
import { makeSchema, idParamSchema, buildListQuery } from "../../utils/resourceValidationHelpers.js";

const reviewCreateSchema = makeSchema({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().optional(),
    comment: z.string().trim().max(2000).optional(),
  }),
  params: z.object({ productId: objectIdSchema }),
});

const reviewProductSchema = makeSchema({ params: z.object({ productId: objectIdSchema }) });
const reviewListSchema = makeSchema({ query: buildListQuery({ isApproved: booleanQuerySchema }) });
const reviewIdSchema = makeSchema({ params: idParamSchema });
const reviewApproveSchema = makeSchema({
  body: z.object({ isApproved: z.boolean() }),
  params: idParamSchema,
});

export { reviewCreateSchema, reviewProductSchema, reviewListSchema, reviewIdSchema, reviewApproveSchema };
