import { useCallback, useEffect, useState } from "react";
import { Download, Image as ImageIcon, Loader2, Mail, MessageCircle, RefreshCw, Search } from "lucide-react";
import { ORDER_STATUSES, type Order, type OrderStatus, type PaymentStatus } from "../../../shared/types";
import { formatDate, formatMoney } from "../../../shared/pricing";
import {
  csvUrl,
  fetchOrder,
  fetchOrders,
  patchOrder,
  resendNotifications,
  photoUrl,
  type AdminOrdersResponse,
} from "./adminApi";
import { ApiError } from "../../lib/api";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-violet-100 text-violet-800",
  ready: "bg-cyan-100 text-cyan-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-sage-100 text-sage-700",
  cancelled: "bg-red-100 text-red-700",
};

const label = (status: string) => status.replace(/_/g, " ");

export default function OrdersTab() {
  const [filters, setFilters] = useState({ q: "", status: "", delivery: "", from: "", to: "" });
  const [data, setData] = useState<AdminOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchOrders(filters)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 220);
    return () => clearTimeout(t);
  }, [load]);

  async function open(id: string) {
    setSelectedLoading(true);
    try {
      const res = await fetchOrder(id);
      setSelected(res.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open that order.");
    } finally {
      setSelectedLoading(false);
    }
  }

  const currency = data?.currency;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div>
        {/* stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Orders today" value={String(data?.stats.today ?? "—")} />
          <Stat label="Pending" value={String(data?.stats.pending ?? "—")} tone="text-amber-600" />
          <Stat
            label="Today's revenue"
            value={currency ? formatMoney(currency, data?.stats.revenueToday ?? 0) : "—"}
            tone="text-sage-700"
          />
          <Stat
            label="Notification issues"
            value={String(data?.stats.failedNotifications ?? "—")}
            tone={data && data.stats.failedNotifications > 0 ? "text-red-600" : ""}
          />
        </div>

        {/* filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[13rem] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
            <input
              className="field pl-9"
              placeholder="Search ID, name or phone…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <select
            className="field w-auto"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="field w-auto"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            aria-label="From date"
          />
          <input
            type="date"
            className="field w-auto"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            aria-label="To date"
          />
          <a className="btn btn-secondary btn-sm" href={csvUrl(filters)} target="_blank" rel="noreferrer">
            <Download size={14} /> CSV
          </a>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        {/* table */}
        <div className="card mt-4 overflow-hidden">
          {loading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="animate-spin text-blush-500" />
            </div>
          ) : !data || data.orders.length === 0 ? (
            <p className="py-14 text-center text-sm text-brown-500">
              No orders match this view yet. Orders placed on the site appear here instantly.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-shell/60 text-left text-[0.68rem] uppercase tracking-wider text-brown-500">
                  <tr>
                    <th className="px-4 py-2.5">Order</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Delivery</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((entry) => (
                    <tr
                      key={entry.id}
                      className="cursor-pointer border-t border-brown-700/5 hover:bg-blush-50/60"
                      onClick={() => open(entry.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold">{entry.id}</p>
                        <p className="text-[0.7rem] text-brown-500">{formatDate(entry.createdAt.slice(0, 10))}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{entry.name}</p>
                        <p className="text-[0.7rem] text-brown-500">{entry.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-[0.78rem]">
                        <p>{label(entry.deliveryType)}</p>
                        <p className="text-[0.7rem] text-brown-500">{entry.totalFlowers} flowers</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${STATUS_STYLE[entry.status] ?? ""}`}>
                          {label(entry.status)}
                        </span>
                        {entry.notificationsFailed && (
                          <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[0.62rem] font-semibold text-red-700">
                            notify
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {data.currency ? formatMoney(data.currency, entry.total) : entry.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* detail drawer */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        {selectedLoading ? (
          <div className="card grid place-items-center py-16">
            <Loader2 className="animate-spin text-blush-500" />
          </div>
        ) : selected ? (
          <OrderDetail
            order={selected}
            onClose={() => setSelected(null)}
            onSaved={(order) => setSelected(order)}
          />
        ) : (
          <div className="card p-6 text-center text-sm text-brown-500">
            <p className="font-display text-lg text-brown-700">Order details</p>
            <p className="mt-2">Select an order to see the full bouquet, customer notes and notifications.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Stat({ label: text, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="card-soft px-4 py-3">
      <p className="text-[0.64rem] uppercase tracking-[0.16em] text-brown-500">{text}</p>
      <p className={`mt-0.5 font-display text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onSaved,
}: {
  order: Order;
  onClose: () => void;
  onSaved: (order: Order) => void;
}) {
  const [notes, setNotes] = useState(order.adminNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNotes(order.adminNotes ?? "");
  }, [order.id, order.adminNotes]);

  async function save(patch: Parameters<typeof patchOrder>[1], success: string) {
    setBusy(true);
    setMessage("");
    try {
      const res = await patchOrder(order.id, patch);
      onSaved(res.order);
      setMessage(success);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Saving failed.");
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    setBusy(true);
    setMessage("");
    try {
      const res = await resendNotifications(order.id);
      onSaved(res.order);
      setMessage(
        res.retried.length ? `Retried: ${res.retried.join(", ")}` : "All notifications were already sent.",
      );
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Retry failed.");
    } finally {
      setBusy(false);
    }
  }

  const cur = order.quote.currency;
  const failedChannels = Object.entries(order.notifications).filter(([, v]) => v.status !== "sent");

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">{order.id}</h3>
          <p className="text-[0.7rem] text-brown-500">
            {new Date(order.createdAt).toLocaleString()} · {order.customer.name} · {order.customer.phone}
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ORDER_STATUSES.map((status: OrderStatus) => (
          <button
            key={status}
            type="button"
            disabled={busy || order.status === status}
            onClick={() => save({ status }, `Status → ${label(status)}`)}
            className={`rounded-full px-2.5 py-1 text-[0.66rem] font-semibold ${
              order.status === status ? "bg-blush-600 text-white" : "bg-shell text-brown-600 hover:bg-blush-100"
            }`}
          >
            {label(status)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-brown-500">Payment</span>
        <select
          className="field w-auto py-1.5 text-xs"
          value={order.paymentStatus}
          onChange={(e) => save({ paymentStatus: e.target.value as PaymentStatus }, "Payment status saved")}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <span className="ml-auto font-display text-lg font-semibold text-blush-600">
          {formatMoney(cur, order.quote.total)}
        </span>
      </div>

      <div className="divider my-4" />

      <h4 className="font-display text-lg">Bouquet</h4>
      <ul className="mt-1 space-y-0.5 text-[0.8rem]">
        {order.config.flowers.map((f) => {
          return (
            <li key={f.flowerId} className="flex justify-between gap-2">
              <span>
                {f.flowerId} × {f.qty} <span className="text-brown-500">({f.color})</span>
              </span>
            </li>
          );
        })}
        <li>Books: {order.config.books}</li>
        <li>
          Wrapping: {order.config.wrapColorId} · {order.config.wrapStyleId}
        </li>
        <li>Note: {order.config.note.type}</li>
        {order.config.gifts.map((g) => (
          <li key={g.id}>
            {g.id} × {g.qty}
          </li>
        ))}
      </ul>

      <p className="mt-3 whitespace-pre-wrap rounded-xl bg-shell/60 p-3 font-mono text-[0.68rem] leading-relaxed">
        {order.summaryText}
      </p>

      <div className="mt-3 text-[0.78rem]">
        <p>
          <strong>Delivery:</strong> {order.customer.address}
          {order.customer.area ? `, ${order.customer.area}` : ""}
        </p>
        <p>
          <strong>When:</strong> {formatDate(order.config.deliveryDate)} · {order.config.deliveryWindow}
        </p>
        {order.customer.email && (
          <p>
            <strong>E-mail:</strong> {order.customer.email}
          </p>
        )}
        {order.customer.instructions && (
          <p>
            <strong>Instructions:</strong> {order.customer.instructions}
          </p>
        )}
      </div>

      {(order.specialRequest || order.photoKey) && (
        <div className="mt-3 rounded-xl border border-brown-200 p-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-brown-500">Special requests</p>
          <p className="mt-1 whitespace-pre-wrap text-[0.8rem]">{order.specialRequest || "—"}</p>
          {order.photoKey && (
            <a
              href={photoUrl(order.photoKey)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm mt-2"
            >
              <ImageIcon size={13} /> View inspiration photo
            </a>
          )}
        </div>
      )}

      <div className="mt-4">
        <label className="label" htmlFor="admin-notes">
          Private notes
        </label>
        <textarea
          id="admin-notes"
          className="field min-h-[70px] text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything your team should know…"
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm mt-2"
          disabled={busy}
          onClick={() => save({ adminNotes: notes }, "Notes saved")}
        >
          Save notes
        </button>
      </div>

      <div className="mt-4 rounded-xl bg-shell/60 p-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-brown-500">Notifications</p>
        <ul className="mt-1 space-y-0.5 text-[0.74rem]">
          <li className="flex items-center gap-1.5">
            <Mail size={12} /> business e-mail: <strong>{order.notifications.businessEmail.status}</strong>
          </li>
          <li className="flex items-center gap-1.5">
            <Mail size={12} /> customer e-mail: <strong>{order.notifications.customerEmail.status}</strong>
          </li>
          <li className="flex items-center gap-1.5">
            <MessageCircle size={12} /> WhatsApp: <strong>{order.notifications.whatsapp.status}</strong>
          </li>
        </ul>
        {failedChannels.map(([key, value]) => (
          <p key={key} className="mt-1 text-[0.68rem] text-amber-700">
            {label(key)}: {value.detail ?? value.status}
          </p>
        ))}
        {failedChannels.length > 0 && (
          <button type="button" className="btn btn-secondary btn-sm mt-2" disabled={busy} onClick={retry}>
            <RefreshCw size={13} /> Retry notifications
          </button>
        )}
      </div>

      {message && <p className="mt-3 text-[0.76rem] font-medium text-sage-700">{message}</p>}
    </div>
  );
}
