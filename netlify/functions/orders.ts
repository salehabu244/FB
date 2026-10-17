/**
 * POST /.netlify/functions/orders — create an order.
 *
 * The browser sends only the *configuration*; the server re-validates
 * everything against the catalog and recalculates the price itself, so a
 * manipulated client can never change what is actually charged.
 */

import type { Config } from "@netlify/functions";
import {
  getCatalog,
  saveOrder,
  findDuplicate,
  rememberIdempotency,
  getOrder,
  randomToken,
} from "./_lib/store";
import { httpError, json, readJson, safeHandler } from "./_lib/http";
import { notifyOrder, orderSummaryText } from "./_lib/notify";
import { computeQuote, deliveryById, formatDate, formatMoney } from "../../shared/pricing";
import { validateSubmission, type Submission } from "../../shared/validation";
import type { Catalog, Order } from "../../shared/types";

export const config: Config = { method: "POST" };

async function generateOrderId(catalog: Catalog): Promise<string> {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: catalog.settings.timezone,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "");
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const id = `BB-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await getOrder(id))) return id;
  }
  return `BB-${ymd}-${randomToken(4).toUpperCase()}`;
}

export default safeHandler(async (req) => {
  const body = await readJson<Submission>(req);
  const catalog = await getCatalog();
  const now = new Date();

  const submission: Submission = {
    config: body.config,
    customer: body.customer,
    specialRequest: (body.specialRequest || "").trim(),
    photoKey: typeof body.photoKey === "string" ? body.photoKey.slice(0, 64) : undefined,
    consent: Boolean(body.consent),
    campaign: body.campaign ?? {},
    idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey.slice(0, 64) : "",
  };

  // 1. Validation (server-side, against the live catalog)
  const validation = validateSubmission(submission, catalog, now);
  if (!validation.ok) {
    return httpError(validation.message, 422, { fields: validation.fields });
  }

  // 2. Duplicate protection (double taps, refreshes, retried requests)
  if (submission.idempotencyKey) {
    const existing = await findDuplicate(submission.idempotencyKey);
    if (existing) {
      return json({ ok: true, duplicate: true, order: publicOrder(existing, catalog) });
    }
  }

  // 3. Authoritative pricing — the browser value is never trusted
  const quote = computeQuote(submission.config, catalog);

  const status = "pending" as const;
  const order: Order = {
    id: await generateOrderId(catalog),
    createdAt: now.toISOString(),
    status,
    paymentStatus: "unpaid",
    customer: {
      name: submission.customer.name.trim(),
      phone: submission.customer.phone.trim(),
      email: (submission.customer.email || "").trim(),
      whatsapp: (submission.customer.whatsapp || "").trim(),
      address: submission.customer.address.trim(),
      area: (submission.customer.area || "").trim(),
      instructions: (submission.customer.instructions || "").trim(),
    },
    config: submission.config,
    quote,
    specialRequest: submission.specialRequest,
    photoKey: submission.photoKey,
    consent: submission.consent,
    campaign: submission.campaign ?? {},
    summaryText: "",
    notifications: {
      businessEmail: { status: "skipped", detail: "Not attempted yet." },
      customerEmail: { status: "skipped", detail: "Not attempted yet." },
      whatsapp: { status: "skipped", detail: "Not attempted yet." },
    },
    statusHistory: [{ status, at: now.toISOString() }],
  };
  order.summaryText = orderSummaryText(order, catalog);

  // 4. SAVE FIRST — the customer only sees success once the order exists.
  await saveOrder(order);
  if (submission.idempotencyKey) await rememberIdempotency(submission.idempotencyKey, order.id);
  console.log(`[bloom] order ${order.id} saved · ${formatMoney(quote.currency, quote.total)} · ${order.customer.name}`);

  // 5. Notifications — a failure never loses the order; the real result is
  //    stored with the order and can be retried from the admin dashboard.
  try {
    order.notifications = await notifyOrder(order, catalog);
  } catch (err) {
    console.error("[bloom] notification error", err instanceof Error ? err.message : err);
  }
  await saveOrder(order);

  return json({ ok: true, order: publicOrder(order, catalog) }, 201);
});

function publicOrder(order: Order, catalog: Catalog) {
  const option = deliveryById(catalog, order.config.deliveryOptionId);
  return {
    id: order.id,
    createdAt: order.createdAt,
    total: order.quote.total,
    currency: order.quote.currency,
    totalFlowers: order.quote.totalFlowers,
    books: order.quote.books,
    deliveryLabel: option?.name ?? "Delivery",
    deliveryDate: formatDate(order.config.deliveryDate),
    deliveryWindow: order.config.deliveryWindow,
    customerName: order.customer.name,
    status: order.status,
    notifications: order.notifications,
    summaryText: order.summaryText,
  };
}
