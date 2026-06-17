/**
 * @module customerRepository
 * @description Raw DB access for the Customer collection. Used by
 * customer.service and the authenticateCustomer middleware.
 */
import { CustomerModel } from "./customer.model.js";
import { runPagedQuery, escapeRegex } from "../../utils/repositoryHelpers.js";

const customerRepository = {
  findById: (id) => CustomerModel.findById(id).select("-password").lean(),

  findByEmail: (email) => CustomerModel.findOne({ email: email.trim().toLowerCase() }).lean(),

  create: (data) => CustomerModel.create(data),

  updateById: (id, patch) =>
    CustomerModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).select("-password").lean(),

  /** Returns the raw mongoose doc (with addresses) for mutation. */
  docById: (id) => CustomerModel.findById(id),

  findMany({ search, page, limit }) {
    const filter = {};
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    return runPagedQuery({
      model: CustomerModel,
      filter,
      sort: { createdAt: -1 },
      page,
      limit,
    });
  },

  count: () => CustomerModel.countDocuments(),
};

export { customerRepository };
