import { paymentService } from "./payment.service.js";
import { settingsRepository } from "../settings/settings.repository.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/** Public payment config the checkout page uses to render options. */
const config = asyncHandler(async (_req, res) => {
  const settings = (await settingsRepository.get()) || {};
  const online = paymentService.isConfigured() && settings.onlinePaymentEnabled !== false;
  return sendSuccess(res, {
    data: {
      codEnabled: settings.codEnabled !== false,
      onlinePaymentEnabled: online,
      razorpayConfigured: paymentService.isConfigured(),
      razorpayKey: online ? paymentService.publicKey() : null,
    },
  });
});

const paymentController = { config };

export { paymentController };
