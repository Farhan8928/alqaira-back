/**
 * Date helpers — all UTC-based to keep day boundaries consistent regardless
 * of the server timezone.
 */

/** Returns the UTC start-of-day Date for a YYYY-MM-DD (or ISO) string. */
function toUtcDay(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Returns [startOfDay, endOfDay] UTC range for a given date string. */
function dayRange(dateStr) {
  const start = toUtcDay(dateStr);
  const end = new Date(start.getTime() + 86400000 - 1);
  return [start, end];
}

/** Returns the start of the current month (UTC). */
function startOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

export { toUtcDay, dayRange, startOfMonth };
