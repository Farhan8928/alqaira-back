import { z } from "zod";
import { makeSchema } from "../../utils/resourceValidationHelpers.js";

const settingsUpdateSchema = makeSchema({
  body: z.object({
    storeName: z.string().trim().optional(),
    tagline: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    supportEmail: z.string().trim().optional(),
    supportPhone: z.string().trim().optional(),
    whatsapp: z.string().trim().optional(),
    addressLine: z.string().trim().optional(),
    instagram: z.string().trim().optional(),
    facebook: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    freeShippingThreshold: z.number().min(0).optional(),
    shippingFee: z.number().min(0).optional(),
    codEnabled: z.boolean().optional(),
    onlinePaymentEnabled: z.boolean().optional(),
    announcement: z.string().trim().optional(),
    // Editable size charts: { [chartId]: { columns: [{key,label}], rows: [{...}] } }
    sizeCharts: z
      .record(
        z.object({
          columns: z.array(z.object({ key: z.string(), label: z.string() })),
          rows: z.array(z.record(z.union([z.string(), z.number()]))),
        }),
      )
      .optional(),
  }),
});

export { settingsUpdateSchema };
