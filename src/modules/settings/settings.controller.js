import { settingsRepository } from "./settings.repository.js";
import { toPublicSettingsDto, toSettingsDto } from "./settings.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Public storefront settings
const getPublic = asyncHandler(async (_req, res) => {
  const settings = await settingsRepository.get();
  return sendSuccess(res, { data: toPublicSettingsDto(settings) });
});

// Admin
const get = asyncHandler(async (_req, res) => {
  const settings = await settingsRepository.get();
  return sendSuccess(res, { data: toSettingsDto(settings) });
});

const update = asyncHandler(async (req, res) => {
  const settings = await settingsRepository.update(req.validated.body);
  return sendSuccess(res, { message: "Settings saved", data: toSettingsDto(settings) });
});

const settingsController = { getPublic, get, update };

export { settingsController };
