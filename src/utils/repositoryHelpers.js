/**
 * Shared repository utilities — pagination, soft-delete, active lookups.
 * Use these in every repository to avoid copy-pasting skip/limit logic.
 */

/** Escape special regex characters to prevent regex injection from user input. */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Run a paginated query and return { items, total, page, limit, totalPages, hasNextPage, hasPrevPage }.
 * Controllers can do:
 *   const { items, ...meta } = await service.list(...)
 *   sendSuccess(res, { data: items.map(toDto), meta })
 *
 * @param {object} opts
 * @param {import("mongoose").Model}  opts.model
 * @param {object}  opts.filter   - Mongoose filter object
 * @param {object}  opts.sort     - Mongoose sort object, e.g. { date: -1, createdAt: -1 }
 * @param {number}  opts.page
 * @param {number}  opts.limit
 * @param {Array|object} [opts.populate] - Single populate config or array of them
 */
async function runPagedQuery({ model, filter, sort, page, limit, populate }) {
  const skip = (page - 1) * limit;

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (populate) {
    const pops = Array.isArray(populate) ? populate : [populate];
    for (const p of pops) query = query.populate(p);
  }

  const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);

  const totalPages = Math.ceil(total / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return { items, total, page, limit, totalPages, hasNextPage, hasPrevPage };
}

/**
 * Find a single non-deleted document by _id.
 * @param {import("mongoose").Model} model
 * @param {string} id
 * @param {Array|object} [populate]
 */
function findActiveById(model, id, populate) {
  let q = model.findOne({ _id: id, isDeleted: false });
  if (populate) {
    const pops = Array.isArray(populate) ? populate : [populate];
    for (const p of pops) q = q.populate(p);
  }
  return q.lean();
}

/**
 * Soft-delete a document (sets isDeleted: true, deletedAt: now).
 * @param {import("mongoose").Model} model
 * @param {string} id
 * @param {object} [extra] - Any additional fields to set alongside isDeleted
 */
function softDeleteById(model, id, extra = {}) {
  return model
    .findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), ...extra },
      { new: true },
    )
    .lean();
}

export { escapeRegex, runPagedQuery, findActiveById, softDeleteById };
