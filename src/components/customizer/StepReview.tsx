import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Edit3, Loader2, Lock } from "lucide-react";
import { useBouquet } from "../../state/BouquetContext";
import {
  accessoryById,
  deliveryById,
  flowerById,
  formatDate,
  formatMoney,
  wrapColorById,
  wrapStyleById,
} from "../../../shared/pricing";
import { trackPurchase } from "../../lib/analytics";
import StepShell from "./StepShell";

export default function StepReview() {
  const { state, dispatch, quote, submit } = useBouquet();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const catalog = state.catalog!;
  const s = catalog.settings;
  const config = state.config;
  const customer = state.customer;
  const option = deliveryById(catalog, config.deliveryOptionId);
  const localTotal = quote ? formatMoney(s.currency, quote.total) : "—";

  const edit = (step: number) => () => {
    dispatch({ type: "step", step });
    document.getElementById("step-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function placeOrder() {
    setBusy(true);
    const res = await submit();
    setBusy(false);
    if (res) {
      trackPurchase(res.order.id, res.order.total, res.order.currency.code);
      navigate(`/order-success/${res.order.id}`, {
        state: { notifications: res.order.notifications },
      });
    }
  }

  return (
    <StepShell step={7} title="Review your bouquet" hint="Check everything, then place your order.">
      <div className="space-y-3">
        <ReviewRow
          title="Flowers"
          onEdit={edit(1)}
          lines={
            quote && config.flowers.length > 0 ? (
              <ul className="space-y-0.5">
                {config.flowers
                  .filter((f) => f.qty > 0)
                  .map((f) => {
                    const flower = flowerById(catalog, f.flowerId);
                    return (
                      <li key={f.flowerId} className="flex justify-between gap-3 text-sm">
                        <span>
                          {flower?.name} × {f.qty}{" "}
                          <span className="text-xs text-brown-500">({f.color})</span>
                        </span>
                        <span className="tabular-nums">
                          {flower ? formatMoney(s.currency, flower.pricePerStem * f.qty) : ""}
                        </span>
                      </li>
                    );
                  })}
                <li className="pt-1 text-xs text-brown-500">Total: {quote.totalFlowers} flowers</li>
              </ul>
            ) : (
              <span className="text-sm text-amber-700">No flowers selected yet.</span>
            )
          }
        />

        <ReviewRow
          title="Books & gifts"
          onEdit={edit(2)}
          lines={
            <div className="space-y-0.5 text-sm">
              <p>
                Books: <strong>{config.books}</strong>
                {config.bookTitles && <span className="text-xs text-brown-500"> · “{config.bookTitles}”</span>}
              </p>
              {config.gifts.map((g) => {
                const acc = accessoryById(catalog, g.id);
                return acc ? (
                  <p key={g.id}>
                    {acc.name} × {g.qty}{" "}
                    <span className="text-xs text-brown-500">({formatMoney(s.currency, acc.price * g.qty)})</span>
                  </p>
                ) : null;
              })}
              {config.gifts.length === 0 && <p className="text-xs text-brown-500">No extra gifts.</p>}
            </div>
          }
        />

        <ReviewRow
          title="Wrapping"
          onEdit={edit(3)}
          lines={
            <p className="text-sm">
              {wrapColorById(catalog, config.wrapColorId)?.name} paper ·{" "}
              {wrapStyleById(catalog, config.wrapStyleId)?.name}
            </p>
          }
        />

        <ReviewRow
          title="Note"
          onEdit={edit(4)}
          lines={
            <div className="text-sm">
              <p className="text-xs uppercase tracking-wide text-brown-500">
                {config.note.type === "printed" ? "Printed" : "Handwritten"} card
              </p>
              <p className="mt-1 whitespace-pre-wrap font-script text-base text-brown-700">
                {config.note.message || <span className="font-sans text-sm text-amber-700">No message added.</span>}
              </p>
              {(config.note.to || config.note.from) && (
                <p className="mt-1 text-xs text-brown-500">
                  To: {config.note.to || "—"} · From: {config.note.from || "—"}
                </p>
              )}
            </div>
          }
        />

        <ReviewRow
          title="Delivery"
          onEdit={edit(5)}
          lines={
            <div className="space-y-0.5 text-sm">
              <p>{option?.name ?? "No delivery option selected"}</p>
              {config.deliveryDate && (
                <p>
                  {formatDate(config.deliveryDate, s.timezone)} · {config.deliveryWindow}
                </p>
              )}
              <p>{customer.name || <span className="text-amber-700">Name missing</span>} · {customer.phone || <span className="text-amber-700">Phone missing</span>}</p>
              <p className="text-brown-700/90">
                {customer.address || <span className="text-amber-700">Address missing</span>}
                {customer.area ? `, ${customer.area}` : ""}
              </p>
              {customer.email && <p className="text-xs text-brown-500">Confirmation email: {customer.email}</p>}
            </div>
          }
        />

        <ReviewRow
          title="Special requests"
          onEdit={edit(6)}
          lines={
            <div className="text-sm">
              <p className="whitespace-pre-wrap">{state.specialRequest || <span className="text-brown-500">None</span>}</p>
              {state.photoUrl && <p className="mt-1 text-xs text-brown-500">📎 Inspiration photo uploaded</p>}
            </div>
          }
        />
      </div>

      {/* price breakdown */}
      {quote && (
        <div className="mt-7 rounded-2xl border border-brown-200 bg-ivory p-4 sm:p-5">
          <h4 className="font-display text-xl">Price summary</h4>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {quote.lines.map((line) => (
                <tr key={line.label} className="align-top">
                  <td className="py-1 pr-3">
                    {line.label}
                    {line.detail && <span className="block text-[0.7rem] text-brown-500">{line.detail}</span>}
                  </td>
                  <td className="py-1 text-right tabular-nums">
                    {line.amount === 0 ? <span className="text-xs text-sage-700">Included</span> : formatMoney(s.currency, line.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-brown-200">
                <td className="py-1.5 font-semibold">Subtotal</td>
                <td className="py-1.5 text-right tabular-nums">{formatMoney(s.currency, quote.subtotal)}</td>
              </tr>
              <tr>
                <td className="py-0.5">Delivery fee</td>
                <td className="py-0.5 text-right tabular-nums">{formatMoney(s.currency, quote.deliveryFee)}</td>
              </tr>
              {quote.discount > 0 && (
                <tr className="text-sage-700">
                  <td className="py-0.5">
                    Discount ({s.discountPercent}% over {formatMoney(s.currency, s.discountMinSubtotal)})
                  </td>
                  <td className="py-0.5 text-right tabular-nums">-{formatMoney(s.currency, quote.discount)}</td>
                </tr>
              )}
              <tr className="border-t border-brown-200">
                <td className="pt-2 font-display text-lg font-semibold">Total</td>
                <td className="pt-2 text-right font-display text-lg font-semibold tabular-nums text-blush-600">
                  {localTotal}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-[0.7rem] text-brown-500">
            Payment is arranged after your order is confirmed (cash on delivery or bank transfer). Prices are
            re-checked by the shop before the order is accepted.
          </p>
        </div>
      )}

      {state.submitError && (
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {state.submitError}
        </p>
      )}

      {!state.consent && (
        <p className="mt-4 flex items-center gap-2 text-[0.78rem] text-brown-500">
          <Edit3 size={14} /> Please tick the consent box in step 6 before placing your order.
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary mt-6 w-full py-4 text-base"
        disabled={busy || state.submitting}
        onClick={placeOrder}
      >
        {busy || state.submitting ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Placing your order…
          </>
        ) : (
          <>
            <Lock size={16} /> Place My Order · {localTotal}
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.72rem] text-brown-500">
        <CheckCircle2 size={14} className="text-sage-700" /> You'll get an order ID right away, and we'll
        confirm on WhatsApp.
      </p>
    </StepShell>
  );
}

function ReviewRow({
  title,
  lines,
  onEdit,
}: {
  title: string;
  lines: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display text-lg">{title}</h4>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
          <Edit3 size={13} /> Edit
        </button>
      </div>
      <div className="mt-1.5">{lines}</div>
    </section>
  );
}
