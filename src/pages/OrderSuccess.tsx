import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, MessageCircle, RefreshCw, XCircle } from "lucide-react";
import { apiGet, FN, type PublicOrderResponse } from "../lib/api";
import type { NotificationState, OrderNotifications } from "../../shared/types";
import { formatMoney } from "../../shared/pricing";
import { LogoMark } from "../components/Header";

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passed = (location.state as { notifications?: OrderNotifications } | null)?.notifications;

  const [order, setOrder] = useState<PublicOrderResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiGet<PublicOrderResponse>(`${FN}/order?id=${encodeURIComponent(id ?? "")}`)
      .then((res) => !cancelled && setOrder(res))
      .catch((err: unknown) => !cancelled && setError(err instanceof Error ? err.message : "Order not found"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const wa = (order?.whatsappNumber || "").replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-shell/60 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-3">
          <LogoMark size={34} />
          <span className="font-display text-2xl">{order?.businessName ?? "Bloom & Beyond"}</span>
        </div>

        <div className="card p-6 sm:p-9">
          {loading ? (
            <div className="grid place-items-center gap-3 py-16 text-center">
              <Loader2 className="animate-spin text-blush-500" />
              <p className="text-sm text-brown-600">Loading your order…</p>
            </div>
          ) : error || !order ? (
            <div className="py-10 text-center">
              <XCircle className="mx-auto text-amber-500" />
              <h1 className="mt-3 font-display text-2xl">We could not find that order</h1>
              <p className="mt-2 text-sm text-brown-700">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/" className="btn btn-primary">
                  Back to the shop
                </Link>
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn btn-secondary">
                    <MessageCircle size={16} /> Message us
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-100">
                  <CheckCircle2 className="text-sage-700" size={30} />
                </span>
                <h1 className="mt-4 font-display text-3xl sm:text-4xl">Thank you, {order.customerName}!</h1>
                <p className="mt-2 text-sm text-brown-700">
                  Your bouquet order has been saved. We'll confirm the details with you shortly.
                </p>
              </div>

              <div className="mt-7 rounded-2xl border border-brown-200 bg-ivory p-5 text-center">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-brown-500">Your order ID</p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-wide">{order.id}</p>
                <p className="mt-1 text-xs text-brown-500">
                  Please keep this ID — message us with it any time.
                </p>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <SummaryTile label="Order total" value={formatMoney(order.currency, order.total)} />
                <SummaryTile label="Bouquet" value={`${order.totalFlowers} flowers · ${order.books} books`} />
                <SummaryTile label="Delivery" value={`${order.deliveryDate}`} sub={order.deliveryWindow} />
              </dl>

              <div className="mt-6 rounded-2xl bg-blush-50 p-4">
                <h2 className="font-display text-lg">What happens next?</h2>
                <ol className="mt-2 space-y-1.5 text-sm text-brown-700">
                  <li>1. We review your design and message.</li>
                  <li>2. We confirm the details and payment on WhatsApp.</li>
                  <li>3. Your bouquet is handcrafted and delivered: {order.deliveryLabel}.</li>
                </ol>
              </div>

              {passed && (
                <div className="mt-4 rounded-2xl border border-brown-200 p-4">
                  <h3 className="font-display text-base">Notification status</h3>
                  <ul className="mt-2 space-y-1 text-[0.78rem]">
                    <StatusLine label="Order e-mail to the shop" state={passed.businessEmail} />
                    <StatusLine label="Confirmation e-mail to you" state={passed.customerEmail} />
                    <StatusLine label="WhatsApp alert to the shop" state={passed.whatsapp} />
                  </ul>
                  <p className="mt-2 text-[0.7rem] text-brown-500">
                    We only report a notification as sent when the provider accepted it. If something failed,
                    your order is still safely saved — the shop can retry it from the dashboard.
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/" className="btn btn-primary">
                  Create another bouquet
                </Link>
                {wa && (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi! I just placed order ${order.id} 🌸`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sage"
                  >
                    <MessageCircle size={16} /> Chat about my order
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-brown-500">
          <Clock size={12} className="mr-1 inline" />
          Ordered outside business hours? We'll respond as soon as the studio opens.
          <RefreshCw size={12} className="ml-1 inline" />
        </p>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-brown-200 bg-white p-4 text-center">
      <dt className="text-[0.66rem] uppercase tracking-[0.18em] text-brown-500">{label}</dt>
      <dd className="mt-1 font-display text-lg font-semibold">{value}</dd>
      {sub && <dd className="text-xs text-brown-500">{sub}</dd>}
    </div>
  );
}

function StatusLine({ label, state }: { label: string; state: NotificationState }) {
  const color =
    state.status === "sent" ? "text-sage-700" : state.status === "failed" ? "text-amber-700" : "text-brown-500";
  const icon =
    state.status === "sent" ? <CheckCircle2 size={13} /> : state.status === "failed" ? <XCircle size={13} /> : <Clock size={13} />;
  return (
    <li className={`flex items-start gap-2 ${color}`}>
      <span className="mt-0.5">{icon}</span>
      <span>
        <strong className="font-semibold">{label}:</strong> {state.status}
        {state.detail && <span className="block text-[0.7rem] opacity-80">{state.detail}</span>}
      </span>
    </li>
  );
}
