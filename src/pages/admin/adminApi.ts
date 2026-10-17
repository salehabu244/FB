/** API helpers for the protected admin dashboard. */

import { apiGet, apiSend, FN } from "../../lib/api";
import type { Catalog, Order, OrderIndexEntry, OrderStatus, PaymentStatus } from "../../../shared/types";

export type AdminOrdersResponse = {
  orders: OrderIndexEntry[];
  stats: {
    total: number;
    today: number;
    pending: number;
    active: number;
    revenueToday: number;
    failedNotifications: number;
  };
  currency: Catalog["settings"]["currency"];
  statuses: OrderStatus[];
};

export const checkAuth = () => apiGet<{ authenticated: boolean }>(`${FN}/admin-login`);

export const login = (password: string) =>
  apiSend<{ ok: boolean }>(`${FN}/admin-login`, "POST", { password });

export const logout = () => apiSend<{ ok: boolean }>(`${FN}/admin-logout`, "POST");

export const fetchOrders = (params: Record<string, string>) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => Boolean(value)),
  ).toString();
  return apiGet<AdminOrdersResponse>(`${FN}/admin-orders${query ? `?${query}` : ""}`);
};

export const fetchOrder = (id: string) =>
  apiGet<{ order: Order }>(`${FN}/admin-order?id=${encodeURIComponent(id)}`);

export const patchOrder = (
  id: string,
  patch: { status?: OrderStatus; paymentStatus?: PaymentStatus; adminNotes?: string },
) => apiSend<{ order: Order }>(`${FN}/admin-order?id=${encodeURIComponent(id)}`, "PATCH", patch);

export const resendNotifications = (id: string) =>
  apiSend<{ order: Order; retried: string[] }>(
    `${FN}/admin-order?id=${encodeURIComponent(id)}`,
    "POST",
    { resend: true },
  );

export const fetchCatalog = () =>
  apiGet<{ catalog: Catalog; adminPasswordIsDefault: boolean }>(`${FN}/admin-catalog`);

export const saveCatalog = (patch: Partial<Catalog> & { newPassword?: string }) =>
  apiSend<{ catalog: Catalog }>(`${FN}/admin-catalog`, "PUT", patch);

export const csvUrl = (params: Record<string, string>) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => Boolean(value)),
  ).toString();
  return `${FN}/admin-orders-csv${query ? `?${query}` : ""}`;
};

export const photoUrl = (key: string) => `${FN}/admin-photo?key=${encodeURIComponent(key)}`;
