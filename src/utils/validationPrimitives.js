import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const searchSchema = z.string().trim().optional();

const pageSchema = z
  .string()
  .optional()
  .transform((v) => Number(v || 1))
  .pipe(z.number().int().min(1));

const limitSchema = z
  .string()
  .optional()
  .transform((v) => Number(v || 20))
  .pipe(z.number().int().min(1).max(200));

const sortDirSchema = z.enum(["asc", "desc"]).optional().default("desc");

const booleanQuerySchema = z
  .union([z.string(), z.boolean()])
  .optional()
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (v === undefined) return undefined;
    if (v === "true") return true;
    if (v === "false") return false;
    return undefined;
  });

const emptyObjectPassthroughSchema = z.object({}).passthrough();

function emailSchema(message = "Invalid email") {
  return z.string().trim().toLowerCase().email(message);
}

/** Accepts DD/MM/YYYY or ISO strings and converts to a JS Date. */
const flexDateSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    let date;
    if (v.includes("/")) {
      const [d, m, y] = v.split("/");
      date = new Date(
        `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00.000Z`,
      );
    } else {
      date = new Date(v);
    }
    if (isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date" });
      return z.NEVER;
    }
    return date;
  });

export {
  objectIdSchema,
  searchSchema,
  pageSchema,
  limitSchema,
  sortDirSchema,
  booleanQuerySchema,
  emptyObjectPassthroughSchema,
  emailSchema,
  flexDateSchema,
};
