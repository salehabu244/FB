/**
 * GET /.netlify/functions/admin-orders — order list + dashboard statistics.
 * Query params: q, status, delivery, from, to
 */

import { json, safeHandler } from "./_lib/http";
import { requireAdmin, unauthorized } from "./_lib/auth";
import { getCatalog, listOrderIndex } from "./_lib/store";
import { ORDER_STATUSES, type OrderIndexEntry } from "../../shared/types";


export default safeHandler(async (req) => {
  const token = await requireAdmin(req);
  if (!token) return unauthorized();

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = url.searchParams.get("status") || "";
  const delivery = url.searchParams.get("delivery") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  const catalog = await getCatalog();
  const all = await listOrderIndex();

  const matches = all.filter((entry: OrderIndexEntry) => {
    if (status && entry.status !== status) return false;
    if (delivery && entry.deliveryType !== delivery) return false;
    if (from && entry.createdAt.slice(0, 10) < from) return false;
    if (to && entry.createdAt.slice(0, 10) > to) return false;
    if (q) {
      const haystack = `${entry.id} ${entry.name} ${entry.phone}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    total: all.length,
    today: all.filter((e) => e.createdAt.slice(0, 10) === today).length,
    pending: all.filter((e) => e.status === "pending").length,
    active: all.filter((e) => !["delivered", "cancelled"].includes(e.status)).length,
    revenueToday: all
      .filter((e) => e.createdAt.slice(0, 10) === today && e.status !== "cancelled")
      .reduce((sum, e) => sum + e.total, 0),
    failedNotifications: all.filter((e) => e.notificationsFailed).length,
  };

  return json({
    orders: matches.slice(0, 400),
    stats,
    currency: catalog.settings.currency,
    statuses: ORDER_STATUSES,
  });
});
