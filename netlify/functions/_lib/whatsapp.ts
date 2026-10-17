/**
 * WhatsApp Business Cloud API integration (Meta's official platform).
 *
 * Requires, in the Netlify environment variables:
 *   WHATSAPP_ACCESS_TOKEN       — permanent token from Meta Business Suite
 *   WHATSAPP_PHONE_NUMBER_ID    — the business phone number id
 *   WHATSAPP_MODE               — "template" (production) or "text" (testing)
 *   WHATSAPP_TEMPLATE_NAME       — approved utility template, default
 *                                  "new_bouquet_order" whose first body
 *                                  parameter receives the order id.
 *
 * Nothing is faked: if Meta rejects the request (or the credentials are not
 * configured yet) the order keeps a "failed"/"skipped" state and the owner
 * can retry it from the admin dashboard.
 */

import type { Catalog, Order, NotificationState } from "../../../shared/types";

async function request(path: string, token: string, body: unknown): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(`https://graph.facebook.com/v21.0/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function notifyWhatsApp(
  order: Order,
  catalog: Catalog,
  summary: string,
): Promise<NotificationState> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const mode = (process.env.WHATSAPP_MODE?.trim() || "template").toLowerCase();
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || "new_bouquet_order";

  if (!token || !phoneNumberId) {
    return {
      status: "skipped",
      detail:
        "WhatsApp Cloud API is not configured yet — set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in the Netlify environment variables.",
      at: new Date().toISOString(),
    };
  }

  // The notification always goes to the shop owner's WhatsApp number.
  const to = (catalog.settings.whatsappNumber || "").replace(/\D/g, "");
  if (to.length < 8) {
    return {
      status: "failed",
      detail: "No business WhatsApp number is configured in Settings.",
      at: new Date().toISOString(),
    };
  }

  const money =
    order.quote.currency.position === "before"
      ? `${order.quote.currency.symbol}${order.quote.total}`
      : `${order.quote.total} ${order.quote.currency.symbol}`;

  try {
    let res: Response;

    if (mode === "template") {
      // Official route: Meta only lets a business start a conversation with a
      // pre-approved template. The template's body must start with {{1}}.
      res = await request(phoneNumberId, token, {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.id },
                { type: "text", text: order.customer.name },
                { type: "text", text: order.customer.phone },
                { type: "text", text: `${order.quote.totalFlowers} flowers · ${order.config.books} books` },
                { type: "text", text: money },
              ],
            },
          ],
        },
      });
    } else {
      // "text" mode — only allowed inside an open 24-hour customer service
      // window (useful for testing with your own number).
      res = await request(phoneNumberId, token, {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body: summary.slice(0, 1500) },
      });
    }

    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      return {
        status: "failed",
        detail: `WhatsApp Cloud API ${res.status}: ${body}`,
        at: new Date().toISOString(),
      };
    }

    const data = (await res.json()) as { messages?: unknown[] };
    return {
      status: "sent",
      detail: `WhatsApp message accepted (${data.messages?.[0] ? "id " + JSON.stringify(data.messages[0]) : "no id"})`,
      at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: "failed",
      detail: `WhatsApp request failed: ${err instanceof Error ? err.message : String(err)}`,
      at: new Date().toISOString(),
    };
  }
}
