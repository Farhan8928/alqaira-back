/**
 * Shared Zod schema builders — eliminate the body/params/query boilerplate
 * that repeats across every validation file.
 *
 * Usage:
 *   makeSchema()                                    → no-op (all passthrough)
 *   makeSchema({ body: mySchema })                  → body-only
 *   makeSchema({ params: idParamSchema })            → /:id only
 *   makeSchema({ body: X, params: idParamSchema })  → PATCH /:id
 *   makeSchema({ query: buildListQuery({ search }) }) → list endpoint
 */
import { z } from "zod";
import {
  objectIdSchema,
  pageSchema,
  limitSchema,
  emptyObjectPassthroughSchema,
} from "./validationPrimitives.js";

/** Reusable params shape for all /:id routes. */
const idParamSchema = z.object({ id: objectIdSchema });

/**
 * Build a full { body, params, query } Zod schema.
 * Any field omitted defaults to emptyObjectPassthroughSchema.
 */
function makeSchema({ body, params, query } = {}) {
  return z.object({
    body: body ?? emptyObjectPassthroughSchema,
    params: params ?? emptyObjectPassthroughSchema,
    query: query ?? emptyObjectPassthroughSchema,
  });
}

/**
 * Build a list query schema with page + limit baked in.
 * Pass extra Zod field definitions to extend it.
 *
 * @example
 * buildListQuery({ search: searchSchema, status: z.enum([...]).optional() })
 */
function buildListQuery(extraFields = {}) {
  return z.object({
    page: pageSchema,
    limit: limitSchema,
    ...extraFields,
  });
}

export { idParamSchema, makeSchema, buildListQuery };
