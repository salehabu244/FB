/**
 * Notification workflows (e-mail + WhatsApp).
 *
 * These run inside a Netlify Function, so the API keys stay on the server.
 * Every channel reports its REAL result — nothing is ever reported as "sent"
 * when the provider call failed — and the result is stored with the order so
 * the owner can retry from the admin dashboard.
 */

import type { Catalog, Order, OrderNotifications, NotificationState } from "../../../shared/types";
import { buildOrderSummary, deliveryById, formatDate, formatMoney } from "../../../shared/pricing";
import { notifyWhatsApp } from "./whatsapp";

const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function deliveryLabel(order: Order, catalog: Catalog): string {
  return deliveryById(catalog, order.config.deliveryOptionId)?.name ?? "Delivery";
}

export function orderSummaryText(order: Order, catalog: Catalog): string {
  return buildOrderSummary({
    orderId: order.id,
    config: order.config,
    quote: order.quote,
    catalog,
    customer: order.customer,
    address: order.customer.address,
    area: order.customer.area,
    deliveryLabel: deliveryLabel(order, catalog),
    deliveryDate: formatDate(order.config.deliveryDate),
    deliveryWindow: order.config.deliveryWindow,
    specialRequest: order.specialRequest,
  });
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const skipped = (detail: string): NotificationState => ({ status: "skipped", detail, at: new Date().toISOString() });
const sent = (detail?: string): NotificationState => ({
  status: "sent",
  ...(detail ? { detail } : {}),
  at: new Date().toISOString(),
});
const failed = (detail: string): NotificationState => ({
  status: "failed",
  detail: detail.slice(0, 400),
  at: new Date().toISOString(),
});

/* ------------------------------------------------------------------ */
/* E-mail (Resend)                                                     */
/* ------------------------------------------------------------------ */

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<NotificationState> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return skipped("E-mail is not configured yet (RESEND_API_KEY missing).");
  }
  const from =
    process.env.RESEND_FROM?.trim() ||
    "Bloom & Beyond <onboarding@resend.dev>";

  try {
    const res = await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [input.to],
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return failed(`Resend ${res.status}: ${body.slice(0, 200)}`);
    }
    return sent(`E-mail accepted by Resend for ${input.to}`);
  } catch (err) {
    return failed(`E-mail request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function businessEmailHtml(order: Order, catalog: Catalog, adminUrl: string): string {
  const money = (n: number) => formatMoney(order.quote.currency, n);
  const rows = order.quote.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0">${esc(l.label)}${l.detail ? `<br><span style="color:#8a7a70;font-size:12px">${esc(l.detail)}</span>` : ""}</td><td align="right" style="padding:6px 0;white-space:nowrap">${money(l.amount)}</td></tr>`,
    )
    .join("");
  const notif = (n: NotificationState) =>
    n.status === "sent" ? "✅ sent" : n.status === "skipped" ? `⏭ skipped — ${esc(n.detail ?? "")}` : `❌ failed — ${esc(n.detail ?? "")}`;

  return `
  <div style="font-family:Georgia,serif;background:#fbf7f0;padding:24px;color:#3e3028">
    <h2 style="margin:0 0 4px;color:#8e5a6b">🌸 New bouquet order</h2>
    <p style="margin:0 0 16px"><strong>${esc(order.id)}</strong> · ${esc(new Date(order.createdAt).toLocaleString("en-US", { timeZone: catalog.settings.timezone }))}</p>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      <tr><td style="padding:6px 0"><strong>Customer</strong></td><td align="right">${esc(order.customer.name)} · ${esc(order.customer.phone)}</td></tr>
      <tr><td style="padding:6px 0"><strong>WhatsApp</strong></td><td align="right">${esc(order.customer.whatsapp || order.customer.phone)}</td></tr>
      ${order.customer.email ? `<tr><td style="padding:6px 0"><strong>E-mail</strong></td><td align="right">${esc(order.customer.email)}</td></tr>` : ""}
      <tr><td style="padding:6px 0"><strong>Delivery</strong></td><td align="right">${esc(deliveryLabel(order, catalog))}<br>${esc(formatDate(order.config.deliveryDate))} ${esc(order.config.deliveryWindow)}</td></tr>
      <tr><td style="padding:6px 0"><strong>Address</strong></td><td align="right">${esc(order.customer.address)}${order.customer.area ? `<br>${esc(order.customer.area)}` : ""}</td></tr>
    </table>
    <h3 style="margin:20px 0 6px;font-family:Georgia,serif">Bouquet</h3>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows}
      <tr><td style="padding:6px 0"><strong>Subtotal</strong></td><td align="right"><strong>${money(order.quote.subtotal)}</strong></td></tr>
      <tr><td style="padding:6px 0"><strong>Delivery fee</strong></td><td align="right">${money(order.quote.deliveryFee)}</td></tr>
      ${order.quote.discount ? `<tr><td style="padding:6px 0"><strong>Discount</strong></td><td align="right">-${money(order.quote.discount)}</td></tr>` : ""}
      <tr><td style="padding:10px 0;font-size:16px"><strong>ORDER TOTAL</strong></td><td align="right" style="padding:10px 0;font-size:16px"><strong>${money(order.quote.total)}</strong></td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px"><strong>Note:</strong> ${esc(order.config.note.message || "—")}<br>
    <strong>To:</strong> ${esc(order.config.note.to || "—")} · <strong>From:</strong> ${esc(order.config.note.from || "—")}</p>
    <p style="font-family:Arial,sans-serif;font-size:14px"><strong>Special requests:</strong><br>${esc(order.specialRequest || "—").replace(/\n/g, "<br>")}</p>
    ${order.photoKey ? `<p style="font-family:Arial,sans-serif;font-size:14px">📎 Inspiration photo uploaded — view it in the admin dashboard.</p>` : ""}
    <p style="margin-top:24px"><a href="${esc(adminUrl)}" style="background:#8e5a6b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif">Open this order in the dashboard</a></p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#8a7a70">
      Notifications — business e-mail: ${notif(order.notifications.businessEmail)}<br>
      WhatsApp: ${notif(order.notifications.whatsapp)}
    </p>
  </div>`;
}

function customerEmailHtml(order: Order, catalog: Catalog, summary: string): string {
  const money = (n: number) => formatMoney(order.quote.currency, n);
  return `
  <div style="font-family:Georgia,serif;background:#fbf7f0;padding:24px;color:#3e3028">
    <h2 style="margin:0 0 4px;color:#8e5a6b">💐 Thank you, ${esc(order.customer.name)}!</h2>
    <p style="font-family:Arial,sans-serif">We have received your bouquet order <strong>${esc(order.id)}</strong>.
    We will confirm the details with you shortly on WhatsApp.</p>
    <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:13px;background:#fff;border-radius:10px;padding:16px;border:1px solid #eadfd6">${esc(summary)}</pre>
    <p style="font-family:Arial,sans-serif;font-size:14px"><strong>Order total: ${money(order.quote.total)}</strong></p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#8a7a70">${esc(catalog.settings.businessName)} · ${esc(catalog.settings.contactPhone)}</p>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

export async function notifyOrder(
  order: Order,
  catalog: Catalog,
  opts: { channels?: Array<"businessEmail" | "customerEmail" | "whatsapp"> } = {},
): Promise<OrderNotifications> {
  const channels = opts.channels ?? ["businessEmail", "customerEmail", "whatsapp"];
  const siteUrl = (catalog.settings.siteUrl || process.env.URL || "").replace(/\/$/, "");
  const adminUrl = `${siteUrl}/admin`;
  const summary = orderSummaryText(order, catalog);

  const results: OrderNotifications = { ...order.notifications };

  if (channels.includes("businessEmail")) {
    const to = process.env.BUSINESS_EMAIL?.trim() || catalog.settings.businessEmail;
    results.businessEmail = await sendEmail({
      to,
      subject: `🌸 New bouquet order ${order.id} — ${order.customer.name}`,
      html: businessEmailHtml(order, catalog, adminUrl),
      text: summary,
      replyTo: order.customer.email || undefined,
    });
  }

  if (channels.includes("customerEmail")) {
    if (!order.customer.email) {
      results.customerEmail = skipped("Customer did not provide an e-mail address.");
    } else {
      results.customerEmail = await sendEmail({
        to: order.customer.email,
        subject: `Your bouquet order ${order.id} is confirmed 🌷`,
        html: customerEmailHtml(order, catalog, summary),
        text: `Thank you! We received your bouquet order ${order.id}.\n\n${summary}`,
        replyTo: catalog.settings.businessEmail || undefined,
      });
    }
  }

  if (channels.includes("whatsapp")) {
    results.whatsapp = await notifyWhatsApp(order, catalog, summary);
  }

  return results;
}

export { notifyWhatsApp };
