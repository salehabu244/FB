/** GET /.netlify/functions/admin-orders-csv — export every order (or the current filter). */

import { requireAdmin, unauthorized } from "./_lib/auth";
import { safeHandler } from "./_lib/http";
import { listOrderIndex } from "./_lib/store";


const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default safeHandler(async (req) => {
  const token = await requireAdmin(req);
  if (!token) return unauthorized();

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = url.searchParams.get("status") || "";

  const rows = (await listOrderIndex()).filter((entry) => {
    if (status && entry.status !== status) return false;
    if (q && !`${entry.id} ${entry.name} ${entry.phone}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const header = [
    "Order ID",
    "Created",
    "Customer",
    "Phone",
    "Status",
    "Payment",
    "Delivery",
    "Flowers",
    "Total",
    "Currency",
    "Photo",
    "Notification issue",
  ];

  const body = rows
    .map((e) =>
      [
        csv(e.id),
        csv(e.createdAt),
        csv(e.name),
        csv(e.phone),
        csv(e.status),
        csv(e.paymentStatus),
        csv(e.deliveryType),
        csv(e.totalFlowers),
        csv(e.total),
        csv(e.currency),
        csv(e.hasPhoto ? "yes" : ""),
        csv(e.notificationsFailed ? "yes" : ""),
      ].join(","),
    )
    .join("\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`${header.map(csv).join(",")}\n${body}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="bloom-orders-${stamp}.csv"`,
    },
  });
});
