/**
 * @module orderRepository
 * @description Raw DB access for the Order collection plus the aggregates the
 * admin dashboard needs (revenue, status breakdown, best sellers).
 */
import mongoose from "mongoose";
import { OrderModel } from "./order.model.js";
import { runPagedQuery, escapeRegex } from "../../utils/repositoryHelpers.js";

const POPULATE = [{ path: "customer", select: "name email" }];

const orderRepository = {
  findMany({
    search,
    status,
    paymentStatus,
    paymentMethod,
    startDate,
    endDate,
    customer,
    page,
    limit,
  }) {
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (customer) filter.customer = customer;
    if (startDate || endDate) {
      filter.placedAt = {};
      if (startDate) filter.placedAt.$gte = startDate;
      if (endDate) filter.placedAt.$lte = endDate;
    }
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { orderNumber: rx },
        { "contact.name": rx },
        { "contact.email": rx },
        { "contact.phone": rx },
      ];
    }
    return runPagedQuery({
      model: OrderModel,
      filter,
      sort: { placedAt: -1 },
      page,
      limit,
      populate: POPULATE,
    });
  },

  findByCustomer: (customerId) =>
    OrderModel.find({ customer: customerId }).sort({ placedAt: -1 }).lean(),

  findById: (id) => OrderModel.findById(id).populate(POPULATE).lean(),
  findByOrderNumber: (orderNumber) => OrderModel.findOne({ orderNumber }).lean(),
  findByRazorpayOrderId: (orderId) => OrderModel.findOne({ "razorpay.orderId": orderId }),

  create: (data) => OrderModel.create(data),

  /** Returns the raw mongoose doc for mutation (status updates, payment marks). */
  docById: (id) => OrderModel.findById(id),

  count: (filter = {}) => OrderModel.countDocuments(filter),

  // ── Dashboard aggregates ─────────────────────────────────────────────────
  revenueSummary(monthStart) {
    return OrderModel.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
          thisMonthRevenue: {
            $sum: { $cond: [{ $gte: ["$placedAt", monthStart] }, "$total", 0] },
          },
          thisMonthOrders: {
            $sum: { $cond: [{ $gte: ["$placedAt", monthStart] }, 1, 0] },
          },
        },
      },
    ]);
  },

  statusBreakdown() {
    return OrderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  },

  topProducts(limit = 5) {
    return OrderModel.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productName",
          units: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { units: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: "$_id", units: 1, revenue: 1 } },
    ]);
  },

  revenueByDay(since) {
    return OrderModel.aggregate([
      { $match: { status: { $ne: "cancelled" }, placedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$placedAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
    ]);
  },

  recent(limit = 8) {
    return OrderModel.find().sort({ placedAt: -1 }).limit(limit).populate(POPULATE).lean();
  },
};

export { orderRepository, mongoose };
