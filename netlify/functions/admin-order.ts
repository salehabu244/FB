/**
 * GET   /.netlify/functions/admin-order?id=… — the complete order (admin view)
 * PATCH /.netlify/functions/admin-order?id=… — update status, payment status or admin notes
 * POST  /.netlify/functions/admin-order?id=… — { resend: true } retry failed notifications
 */

import { httpError, json, readJson, safeHandler } from "./_lib/http";
import { requireAdmin, unauthorized } from "./_lib/auth";
import { getCatalog, getOrder, saveOrder } from "./_lib/store";
import { notifyOrder } from "./_lib/notify";
import { ORDER_STATUSES, type Order, type OrderStatus, type PaymentStatus } from "../../shared/types";


export default safeHandler(async (req) => {
  const token = await requireAdmin(req);
  if (!token) return unauthorized();

  const id = new URL(req.url).searchParams.get("id")?.trim() ?? "";
  const order = await getOrder(id);
  if (!order) return httpError("Order not found.", 404);

  if (req.method === "GET") {
    return json({ order });
  }

  if (req.method === "PATCH") {
    const patch = await readJson<{ status?: OrderStatus; paymentStatus?: PaymentStatus; adminNotes?: string }>(req);
    const updated: Order = { ...order };

    if (patch.status && ORDER_STATUSES.includes(patch.status) && patch.status !== order.status) {
      updated.status = patch.status;
      updated.statusHistory = [
        ...order.statusHistory,
        { status: patch.status, at: new Date().toISOString() },
      ];
    }
    if (patch.paymentStatus && ["unpaid", "paid", "refunded"].includes(patch.paymentStatus)) {
      updated.paymentStatus = patch.paymentStatus;
    }
    if (typeof patch.adminNotes === "string") {
      updated.adminNotes = patch.adminNotes.slice(0, 2000);
    }

    await saveOrder(updated);
    return json({ order: updated });
  }

  if (req.method === "POST") {
    // Retry notifications (only the channels that did not succeed).
    const catalog = await getCatalog();
    const failedChannels = (Object.keys(order.notifications) as Array<keyof Order["notifications"]>).filter(
      (channel) => order.notifications[channel].status !== "sent",
    );
    if (failedChannels.length === 0) {
      return json({ order, retried: [] });
    }
    const results = await notifyOrder(order, catalog, { channels: failedChannels });
    const updated: Order = { ...order, notifications: { ...order.notifications, ...results } };
    await saveOrder(updated);
    console.log(`[bloom] retried notifications for ${id}: ${failedChannels.join(", ")}`);
    return json({ order: updated, retried: failedChannels });
  }

  return httpError("Method not allowed.", 405);
});
