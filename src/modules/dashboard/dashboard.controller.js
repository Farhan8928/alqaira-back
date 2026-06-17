import { dashboardService } from "./dashboard.service.js";
import { toOrderDto } from "../order/order.dto.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const overview = asyncHandler(async (_req, res) => {
  const data = await dashboardService.overview();
  return sendSuccess(res, {
    data: { ...data, recentOrders: (data.recentOrders || []).map(toOrderDto) },
  });
});

const dashboardController = { overview };

export { dashboardController };
