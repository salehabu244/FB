/**
 * Tiny API client for the Netlify Functions.
 * Every storefront and admin request goes through here so errors are handled
 * in exactly one place.
 *
 * Netlify serves every function at /.netlify/functions/<file> — this URL is
 * never shadowed by the SPA fallback, so it works identically in local dev
 * and production.
 */

export const FN = "/.netlify/functions";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const payload = data as { error?: string; fields?: Record<string, string> } | null;
    throw new ApiError(
      payload?.error || `Request failed (${res.status}). Please try again.`,
      res.status,
      payload?.fields,
    );
  }
  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return fetch(path, { credentials: "same-origin" }).then((res) => handle<T>(res));
}

export function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  return fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => handle<T>(res));
}

/* ------------------------------ types ------------------------------ */

export type CatalogResponse = {
  catalog: import("../../shared/types").Catalog;
  serverNow: string;
  expressAvailable: boolean;
  expressCutoff: string;
  timezone: string;
};

export type CreateOrderResponse = {
  ok: boolean;
  duplicate?: boolean;
  order: {
    id: string;
    total: number;
    currency: import("../../shared/types").Currency;
    totalFlowers: number;
    books: number;
    deliveryLabel: string;
    deliveryDate: string;
    deliveryWindow: string;
    customerName: string;
    status: string;
    notifications: import("../../shared/types").OrderNotifications;
    summaryText: string;
  };
};

export type PublicOrderResponse = {
  id: string;
  status: string;
  createdAt: string;
  total: number;
  currency: import("../../shared/types").Currency;
  totalFlowers: number;
  books: number;
  deliveryLabel: string;
  deliveryDate: string;
  deliveryWindow: string;
  customerName: string;
  businessName: string;
  whatsappNumber: string;
};
