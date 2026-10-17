/**
 * GET /.netlify/functions/order?id=<ORDER ID> — lightweight, public order
 * lookup used by the confirmation page. It returns only the minimum the
 * customer needs (no address, no phone, no message).
 */

import { getCatalog, getOrder } from "./_lib/store";
import { httpError, json, safeHandler } from "./_lib/http";
import { deliveryById, formatDate } from "../../shared/pricing";

export default safeHandler(async (req) => {
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") ?? "").trim();

  if (!/^BB-[A-Za-z0-9-]{4,24}$/.test(id)) {
    return httpError("That order ID does not look right.", 400);
  }

  const order = await getOrder(id);
  if (!order) return httpError("We could not find that order. Please check the ID or contact us on WhatsApp.", 404);

  const catalog = await getCatalog();
  const option = deliveryById(catalog, order.config.deliveryOptionId);

  return json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    total: order.quote.total,
    currency: order.quote.currency,
    totalFlowers: order.quote.totalFlowers,
    books: order.quote.books,
    deliveryLabel: option?.name ?? "Delivery",
    deliveryDate: formatDate(order.config.deliveryDate),
    deliveryWindow: order.config.deliveryWindow,
    customerName: order.customer.name.split(" ")[0],
    businessName: catalog.settings.businessName,
    whatsappNumber: catalog.settings.whatsappNumber,
  });
});
